import { auto } from 'manate/react'
import { useState } from 'react'
import SessionHost from './session-host.jsx'
import Sidebar from './sidebar.jsx'
import BookmarksSidebar from './bookmarks-sidebar.jsx'
import Rail from './rail.jsx'
import RailRight from './rail-right.jsx'

export default auto(function Workspace (props) {
  const { store } = props
  const [cwds, setCwds] = useState({})
  const [hoverLeft, setHoverLeft] = useState(false)
  const [hoverRight, setHoverRight] = useState(false)

  const setCwd = (tabId, cwd) => {
    setCwds(prev => (prev[tabId] === cwd ? prev : { ...prev, [tabId]: cwd }))
  }

  const panelCls = (side, open, hover) => {
    const base = `cu-panel cu-panel-${side}`
    if (open) {
      return `${base} cu-docked`
    }
    return hover ? `${base} cu-flyout cu-flyout-open` : `${base} cu-flyout`
  }

  const leftCls = panelCls('left', store.cuBookmarksOpen, hoverLeft)
  const rightCls = panelCls('right', store.cuSidebarOpen, hoverRight)
  const rightDockCls = store.cuSidebarOpen
    ? 'cu-dock cu-dock-right cu-dock-open'
    : 'cu-dock cu-dock-right'

  return (
    <div className='cu-main'>
      <div
        className='cu-dock cu-dock-left'
        onMouseEnter={() => setHoverLeft(true)}
        onMouseLeave={() => setHoverLeft(false)}
      >
        <Rail store={store} />
        <div className={leftCls}>
          <BookmarksSidebar store={store} />
        </div>
      </div>
      <SessionHost store={store} setCwd={setCwd} />
      <div
        className={rightDockCls}
        onMouseEnter={() => setHoverRight(true)}
        onMouseLeave={() => setHoverRight(false)}
      >
        <div className={rightCls}>
          <Sidebar store={store} cwds={cwds} />
        </div>
        <RailRight store={store} />
      </div>
    </div>
  )
})
