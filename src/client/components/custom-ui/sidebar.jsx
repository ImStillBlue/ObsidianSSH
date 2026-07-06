import { auto } from 'manate/react'
import { useEffect, useRef, useState } from 'react'
import Sftp from '../sftp/sftp-entry'
import MacrosPanel from './macros-panel.jsx'
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

  return (
    <div className='cu-sidebar'>
      <div className='cu-sidebar-sftp' ref={boxRef}>
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
                sftpPathFollowSsh
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
      </div>
      <div className='cu-sidebar-macros'>
        <MacrosPanel store={store} />
      </div>
    </div>
  )
})
