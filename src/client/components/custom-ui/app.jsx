/**
 * Custom UI starter component.
 *
 * This is your blank canvas. The electerm backend (ssh/sftp/telnet/serial/etc),
 * the IPC bridge and the websocket worker are already wired up before this
 * renders, so you have full access to:
 *
 *   window.pre    - bridge to the electron main process (see src/client/common/pre.js)
 *   window.et     - injected globals (version, isDev, platform flags, customUI)
 *   window.worker - websocket worker used to talk to the backend server
 *   window.getLang / window.translate - i18n helpers
 *
 * Replace everything below with your own UI.
 */

const panelStyle = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 12,
  background: '#0b0b0f',
  color: '#e6e6e6',
  fontFamily: 'system-ui, sans-serif'
}

export default function CustomApp () {
  const version = window.et?.version || window.pre?.packInfo?.version || '?'
  const platform = window.pre?.platform || 'unknown'
  return (
    <div style={panelStyle}>
      <div style={{ fontSize: 22, fontWeight: 600 }}>Custom UI loaded</div>
      <div style={{ opacity: 0.7 }}>
        electerm v{version} · {platform} · bridge {window.pre ? 'ready' : 'missing'}
      </div>
      <div style={{ opacity: 0.5, fontSize: 13 }}>
        Edit src/client/components/custom-ui/app.jsx to build your UI.
      </div>
    </div>
  )
}
