import { auto } from 'manate/react'
import { useState } from 'react'
import SessionHost from './session-host.jsx'
import Sidebar from './sidebar.jsx'

export default auto(function Workspace (props) {
  const { store } = props
  const [cwds, setCwds] = useState({})

  const setCwd = (tabId, cwd) => {
    setCwds(prev => (prev[tabId] === cwd ? prev : { ...prev, [tabId]: cwd }))
  }

  return (
    <div className='cu-main'>
      <SessionHost store={store} setCwd={setCwd} />
      <Sidebar store={store} cwds={cwds} />
    </div>
  )
})
