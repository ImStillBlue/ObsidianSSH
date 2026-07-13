const fs = require('original-fs')
const globalState = require('./glob-state')
const _ = require('./lodash.js')

const watchers = new Map()

exports.watchFile = (path) => {
  if (watchers.has(path)) return
  const onWatch = _.debounce(() => {
    try {
      const win = globalState.get('win')
      if (fs.existsSync(path)) {
        const text = fs.readFileSync(path, 'utf8')
        win?.webContents.send('file-change', text, path)
      } else {
        win?.webContents.send('file-deleted', path)
      }
    } catch (error) {
      globalState.get('win')?.webContents.send('file-read-error', error.message, path)
    }
  }, 300, { leading: false, trailing: true })
  watchers.set(path, onWatch)
  fs.watchFile(path, onWatch)
}

exports.unwatchFile = (path) => {
  const onWatch = watchers.get(path)
  if (!onWatch) return
  fs.unwatchFile(path, onWatch)
  onWatch.cancel?.()
  watchers.delete(path)
}

exports.cleanWatchFile = () => {
  for (const [path, onWatch] of watchers) {
    fs.unwatchFile(path, onWatch)
    onWatch.cancel?.()
  }
  watchers.clear()
}

process.on('exit', exports.cleanWatchFile)
