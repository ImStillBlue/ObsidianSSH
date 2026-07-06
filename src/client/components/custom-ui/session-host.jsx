import { auto } from 'manate/react'
import { useEffect, useRef, useState } from 'react'
import copy from 'json-deep-copy'
import Term from '../terminal/terminal.jsx'
import {
  paneMap,
  terminalRdpType,
  terminalVncType,
  terminalWebType,
  terminalTelnetType,
  terminalFtpType,
  terminalSpiceType
} from '../../common/constants'
import sanitizeFilename from '../../common/sanitize-filename.js'

const noTermTypes = new Set([
  terminalRdpType,
  terminalVncType,
  terminalWebType,
  terminalTelnetType,
  terminalFtpType,
  terminalSpiceType
])

export default auto(function SessionHost (props) {
  const { store, setCwd } = props
  const boxRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = boxRef.current
    if (!el) {
      return undefined
    }
    const measure = () => {
      setSize({ width: el.clientWidth, height: el.clientHeight })
      window.store.triggerResize()
    }
    const ro = new window.ResizeObserver(measure)
    ro.observe(el)
    measure()
    return () => ro.disconnect()
  }, [])

  const activeId = store.activeTabId
  const { width, height } = size
  const termTabs = store.tabs.filter(tab => !noTermTypes.has(tab.type))

  return (
    <div className='cu-workspace' ref={boxRef}>
      {width > 0 && termTabs.map(tab => {
        const active = tab.id === activeId
        const termTab = {
          ...tab,
          pane: paneMap.terminal
        }
        const logName = sanitizeFilename(
          `${tab.title ? tab.title + '_' : ''}${tab.host ? tab.host + '_' : ''}${tab.id}`
        )
        const termProps = {
          tab: termTab,
          activeTabId: store.activeTabId,
          currentBatchTabId: activeId,
          batch: 0,
          pane: paneMap.terminal,
          config: store.config,
          themeConfig: copy(store.getThemeConfig()),
          sessionOptions: null,
          sftpPathFollowSsh: true,
          broadcastInput: false,
          setCwd: cwd => setCwd(tab.id, cwd),
          editTab: (id, up) => store.updateTab(id, up),
          delTab: id => store.delTab(id),
          reloadTab: nextTab => {
            store.updateTab(nextTab.id, nextTab)
            store.reloadTab(nextTab.id)
          },
          width,
          height,
          left: 0,
          top: 0,
          logName
        }
        return (
          <div
            key={tab.id}
            className={active ? 'cu-term-pane' : 'cu-term-pane hide'}
            style={{ width, height }}
          >
            <Term {...termProps} />
          </div>
        )
      })}
    </div>
  )
})
