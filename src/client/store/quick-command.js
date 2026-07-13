/**
 * quick command related functions
 */

import {
  settingMap,
  qmSortByFrequencyKey,
  isWin
} from '../common/constants'
import delay from '../common/wait'
import generate from '../common/uid'
import * as ls from '../common/safe-local-storage'
import { debounce } from 'lodash-es'
import { refs } from '../components/common/ref'
import templates from '../components/quick-commands/templates'
import { readClipboardAsync } from '../common/clipboard'
import sanitizeFilename from '../common/sanitize-filename'
import normalizeRemotePath from '../common/normalize-remote-path'
import {
  decodeChangeDirectory,
  decodeOpenRemoteFile
} from '../common/macro-actions'

const externalMacroEditors = new Map()

// Function to parse templates in command string
async function parseTemplates (cmd) {
  if (typeof cmd !== 'string') return ''
  if (!cmd.includes('{{')) return cmd

  // Process each template from templates.js
  for (const template of templates) {
    const placeholder = `{{${template}}}`
    if (cmd.includes(placeholder)) {
      let replacement = ''

      // Handle each supported template using if-else
      if (template === 'clipboard') {
        replacement = await readClipboardAsync()
      } else if (template === 'time') {
        replacement = Date.now()
      } else if (template === 'date') {
        replacement = new Date().toLocaleDateString()
      }
      // Add more conditions for any new templates as needed

      cmd = cmd.replaceAll(placeholder, replacement)
    }
  }

  return cmd
}

export default Store => {
  Store.prototype.addQuickCommand = function (
    qm
  ) {
    window.store.addItem(qm, settingMap.quickCommands)
  }

  Store.prototype.editQuickCommand = function (id, update) {
    window.store.editItem(id, update, settingMap.quickCommands)
  }

  Store.prototype.delQuickCommand = function ({ id }) {
    window.store.delItem({ id }, settingMap.quickCommands)
  }

  Store.prototype.runQuickCommand = function (cmd, inputOnly = false, tabId) {
    const tid = tabId || window.store.activeTabId
    refs.get('term-' + tid)?.runQuickCommand(cmd, inputOnly)
  }

  Store.prototype.cdTerminal = function (path, tabId) {
    const tid = tabId || window.store.activeTabId
    refs.get('term-' + tid)?.cd(path)
  }

  Store.prototype.openRemoteFileInSystemEditor = async function (remotePath, tabId) {
    const tid = tabId || window.store.activeTabId
    const sftp = refs.get('sftp-' + tid)?.sftp
    if (!sftp) {
      throw new Error('SFTP is not ready for the active terminal')
    }
    const stat = await sftp.stat(remotePath)
    const text = await sftp.readFile(remotePath)
    const safeName = sanitizeFilename(window.pre.basename(remotePath))
    const tempPath = window.pre.resolve(
      window.pre.tempDir,
      `electerm-macro-${generate()}-${safeName}`
    )
    if (!tempPath.startsWith(window.pre.tempDir + window.pre.sep)) {
      throw new Error('Invalid temporary file path')
    }
    const editorKey = `${tid}:${remotePath}`
    const previous = externalMacroEditors.get(editorKey)
    if (previous) {
      window.pre.ipcOffEvent('file-change', previous.handler)
      await window.pre.runGlobalAsync('unwatchFile', previous.tempPath)
      window.fs.unlink(previous.tempPath).catch(console.log)
    }
    await window.fs.writeFile(tempPath, text)
    const handler = (event, updatedText, changedPath) => {
      if (changedPath !== tempPath) return
      sftp.writeFile(remotePath, updatedText, stat.mode)
        .catch(window.store.onError)
    }
    externalMacroEditors.set(editorKey, { handler, tempPath })
    window.pre.ipcOnEvent('file-change', handler)
    await window.pre.runGlobalAsync('watchFile', tempPath)
    await window.fs.openFile(tempPath)
  }

  Store.prototype.runQuickCommandItem = debounce(async (id) => {
    const {
      store
    } = window

    const qm = store.currentQuickCommands.find(
      a => a.id === id
    )
    const { runQuickCommand } = store
    const qms = qm && qm.commands
      ? qm.commands
      : (qm && qm.command
          ? [
              {
                command: qm.command,
                id: generate(),
                delay: 100
              }
            ]
          : []
        )
    let currentDirectory = qm?.startDirectory || ''
    if (currentDirectory) {
      store.cdTerminal(qm.startDirectory)
      await delay(150)
    }
    for (const q of qms) {
      if (typeof q?.command !== 'string' || !q.command.trim()) {
        continue
      }
      const directory = decodeChangeDirectory(q.command)
      if (directory) {
        await delay(q.delay || 100)
        store.cdTerminal(directory)
        currentDirectory = directory.startsWith('/') || !currentDirectory
          ? normalizeRemotePath(directory)
          : normalizeRemotePath(`${currentDirectory}/${directory}`)
        continue
      }
      const remoteFile = decodeOpenRemoteFile(q.command)
      if (remoteFile) {
        const remotePath = remoteFile.startsWith('/') || !currentDirectory
          ? remoteFile
          : normalizeRemotePath(`${currentDirectory}/${remoteFile}`)
        await delay(q.delay || 100)
        await store.openRemoteFileInSystemEditor(remotePath)
        continue
      }
      let realCmd = isWin
        ? q.command.replace(/\n/g, '\n\r')
        : q.command

      // Parse templates
      realCmd = await parseTemplates(realCmd)

      await delay(q.delay || 100)
      runQuickCommand(realCmd, qm.inputOnly)
      store.editQuickCommand(qm.id, {
        clickCount: ((qm.clickCount || 0) + 1)
      })
    }
  }, 200)

  Store.prototype.setQmSortByFrequency = function (v) {
    window.store.qmSortByFrequency = v
    ls.setItem(qmSortByFrequencyKey, v ? 'yes' : 'no')
  }

  Store.prototype.handleSortByFrequency = function () {
    window.store.setQmSortByFrequency(!window.store.qmSortByFrequency)
  }
}
