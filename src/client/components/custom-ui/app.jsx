/**
 * Custom UI root component.
 *
 * The electerm backend (ssh/sftp/telnet/serial/etc), the IPC bridge and the
 * websocket worker are already wired up before this renders, so you have full
 * access to:
 *
 *   window.pre    - bridge to the electron main process (see src/client/common/pre.js)
 *   window.et     - injected globals (version, isDev, platform flags, customUI)
 *   window.worker - websocket worker used to talk to the backend server
 *   window.getLang / window.translate - i18n helpers
 *
 * Build your UI by extending the body below.
 */
import './custom-ui.css'
import TopBar from './top-bar.jsx'

export default function CustomApp () {
  const version = window.et?.version || window.pre?.packInfo?.version || '?'
  const platform = window.pre?.platform || 'unknown'
  return (
    <div className='cu-root'>
      <TopBar />
      <div className='cu-body'>
        <div className='cu-body-title'>Custom UI</div>
        <div className='cu-body-sub'>
          electerm v{version} · {platform} · bridge {window.pre ? 'ready' : 'missing'}
        </div>
        <div className='cu-body-hint'>
          Top bar is live — drag it to move the window, and use the buttons to minimize / maximize / close.
        </div>
      </div>
    </div>
  )
}
