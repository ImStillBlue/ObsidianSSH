import { useRef, useState } from 'react'
import { CloudUploadOutlined } from '@ant-design/icons'
import { getDropFileList } from '../../common/file-drop-utils'
import { getLocalFileInfo } from '../sftp/file-read'
import { typeMap } from '../../common/constants'
import createTitle from '../../common/create-title'
import findParent from '../../common/find-parent'
import resolve from '../../common/resolve'
import sanitizeFilename from '../../common/sanitize-filename'
import generate from '../../common/uid'

const isOsFileDrag = e => {
  const types = e.dataTransfer?.types
  return !!types && Array.from(types).includes('Files')
}

export default function SftpDropZone (props) {
  const { activeTabId, children } = props
  // dragenter/dragleave fire for every child node; count them so the
  // overlay only clears when the pointer truly leaves the zone
  const depthRef = useRef(0)
  const [dragging, setDragging] = useState(false)

  const getTarget = () => {
    const inst = window.refs.get('sftp-' + activeTabId)
    if (!inst) {
      return null
    }
    const type = inst.shouldRenderRemote() ? typeMap.remote : typeMap.local
    const path = inst.state[type + 'Path']
    if (!path) {
      return null
    }
    return { inst, type, path }
  }

  const onDragEnter = e => {
    if (!isOsFileDrag(e)) {
      return
    }
    e.preventDefault()
    depthRef.current += 1
    setDragging(true)
  }

  const onDragOver = e => {
    if (!isOsFileDrag(e)) {
      return
    }
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const onDragLeave = e => {
    if (!isOsFileDrag(e)) {
      return
    }
    depthRef.current -= 1
    if (depthRef.current <= 0) {
      depthRef.current = 0
      setDragging(false)
    }
  }

  const onDrop = async e => {
    if (!isOsFileDrag(e)) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    depthRef.current = 0
    setDragging(false)
    // a drop landing on a file row bubbles here after the stock
    // file-item handler already queued the transfer — don't duplicate it
    if (findParent(e.target, '.sftp-item')) {
      return
    }
    const target = getTarget()
    if (!target) {
      return
    }
    const dropped = getDropFileList(e.dataTransfer)
    if (!dropped || !dropped.length) {
      return
    }
    const { inst, type, path } = target
    const { tab } = inst.props
    const list = []
    for (const f of dropped) {
      const fromPath = resolve(f.path, f.name)
      const info = await getLocalFileInfo(fromPath).catch(console.log)
      if (!info) {
        continue
      }
      list.push({
        host: tab?.host,
        tabType: tab?.type,
        typeFrom: typeMap.local,
        typeTo: type,
        fromPath,
        toPath: resolve(path, sanitizeFilename(f.name)),
        fromFile: info,
        id: generate(),
        title: createTitle(tab, false),
        tabId: tab.id,
        // dropping onto the local pane of a local tab is a plain copy,
        // not an upload
        operation: type === typeMap.local ? 'cp' : ''
      })
    }
    // ignore no-op copies of a file onto its own folder
    const real = list.filter(t => t.fromPath !== t.toPath)
    if (real.length) {
      window.store.addTransferList(real)
    }
  }

  const target = dragging ? getTarget() : null

  return (
    <div
      className='cu-drop-zone'
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
      {dragging && target && (
        <div className='cu-drop-overlay'>
          <div className='cu-drop-overlay-inner'>
            <CloudUploadOutlined className='cu-drop-icon' />
            <div className='cu-drop-title'>
              {target.type === typeMap.remote ? 'Drop to upload' : 'Drop to copy'}
            </div>
            <div className='cu-drop-path'>{target.path}</div>
          </div>
        </div>
      )}
    </div>
  )
}
