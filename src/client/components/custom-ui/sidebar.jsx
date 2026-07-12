import { auto } from 'manate/react'
import { useEffect, useRef, useState } from 'react'
import { Tooltip } from 'antd'
import { ArrowRightOutlined, CodeOutlined, FolderOutlined } from '@ant-design/icons'
import Sftp from '../sftp/sftp-entry'
import MacrosPanel from './macros-panel.jsx'
import SftpDropZone from './sftp-drop-zone.jsx'
import {
  paneMap,
  terminalFtpType,
  terminalLocalType
} from '../../common/constants'

const hasSftpPane = tab => tab.type === terminalFtpType ||
  tab.authType ||
  tab.type === terminalLocalType ||
  !tab.type

export default auto(function Sidebar (props) {
  const { store, cwds } = props
  const boxRef = useRef(null)
  const sftpPathsRef = useRef({})
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = boxRef.current
    if (!el) {
      return undefined
    }
    const measure = () => {
      setSize({ width: el.clientWidth, height: el.clientHeight })
    }
    const ro = new window.ResizeObserver(measure)
    ro.observe(el)
    measure()
    return () => ro.disconnect()
  }, [])

  const activeId = store.activeTabId
  const { width, height } = size
  const sftpTabs = store.tabs.filter(hasSftpPane)
  const followTerm = store.cuSftpFollowTerminal
  const followSftp = store.cuTerminalFollowSftp

  const toggleFollowTerm = () => store.storeAssign({
    cuSftpFollowTerminal: !followTerm,
    cuTerminalFollowSftp: false
  })
  const toggleFollowSftp = () => {
    const next = !followSftp
    store.storeAssign({
      cuTerminalFollowSftp: next,
      cuSftpFollowTerminal: false
    })
    const path = sftpPathsRef.current[activeId]
    if (next && path) {
      store.cdTerminal(path, activeId)
    }
  }

  return (
    <div className='cu-sidebar'>
      <div className='cu-sftp-toolbar'>
        <Tooltip
          title='SFTP follows terminal — when you cd in the terminal, this file browser follows'
          placement='bottom'
          mouseEnterDelay={0.3}
        >
          <button
            className={followTerm ? 'cu-follow-btn active' : 'cu-follow-btn'}
            onClick={toggleFollowTerm}
            aria-label='Files follow terminal toggle'
          >
            <CodeOutlined />
            <ArrowRightOutlined className='cu-follow-arrow' />
            <FolderOutlined />
          </button>
        </Tooltip>
        <Tooltip
          title="Terminal follows SFTP — when you browse a folder here, the terminal cd's to match"
          placement='bottom'
          mouseEnterDelay={0.3}
        >
          <button
            className={followSftp ? 'cu-follow-btn active' : 'cu-follow-btn'}
            onClick={toggleFollowSftp}
            aria-label='Terminal follows files toggle'
          >
            <FolderOutlined />
            <ArrowRightOutlined className='cu-follow-arrow' />
            <CodeOutlined />
          </button>
        </Tooltip>
      </div>
      <div className='cu-sidebar-sftp' ref={boxRef}>
        <SftpDropZone activeTabId={activeId}>
          {width > 0 && sftpTabs.map(tab => {
            const active = tab.id === activeId
            return (
              <div
                key={tab.id}
                className={active ? 'cu-sftp-pane' : 'cu-sftp-pane hide'}
              >
                <Sftp
                  tab={tab}
                  config={store.config}
                  pane={tab.pane || paneMap.terminal}
                  cwd={cwds[tab.id] || ''}
                  pid={tab.id}
                  sessionOptions={null}
                  isFtp={tab.type === terminalFtpType}
                  sftpPathFollowSsh={followTerm}
                  onSftpPathChange={path => {
                    sftpPathsRef.current[tab.id] = path
                    if (active && store.cuTerminalFollowSftp) {
                      store.cdTerminal(path, tab.id)
                    }
                  }}
                  sshSftpSplitView
                  currentBatchTabId={activeId}
                  fileOperation={store.fileOperation}
                  width={width}
                  height={height}
                  editTab={(id, up) => store.updateTab(id, up)}
                />
              </div>
            )
          })}
        </SftpDropZone>
      </div>
      <div className='cu-sidebar-macros'>
        <MacrosPanel store={store} cwd={cwds[activeId] || ''} />
      </div>
    </div>
  )
})
