/**
 * ObsidianSSH bootstrap.
 *
 * Replicates electerm's store bootstrap — normally done by auth/login.jsx +
 * main/main.jsx — inside our custom shell, WITHOUT rendering electerm's
 * <Main>/<Layout> (those create stock sessions/refs that would collide with our
 * own layout). We reuse the real `store.initData()` path, then render
 * <CustomShell> once the config is loaded.
 */
import { auto } from 'manate/react'
import { useEffect, useRef, useState } from 'react'
import store from '../../store'
import { splitMap } from '../../common/constants'
import CustomShell from './shell.jsx'

function preventDefault (e) {
  e.preventDefault()
  e.stopPropagation()
}

export default auto(function CustomBootstrap () {
  const [logined, setLogined] = useState(!window.pre.requireAuth)
  const [pass, setPass] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (window.pre.requireAuth) {
      window.pre.runGlobalAsync('init').then(globs => {
        window.et.globs = globs
      })
    }
  }, [])

  useEffect(() => {
    if (!logined || started.current) {
      return
    }
    started.current = true
    // The same runtime side effects electerm's <Main> sets up on mount.
    window.addEventListener('resize', store.onResize)
    setTimeout(store.triggerResize, 200)
    const { ipcOnEvent } = window.pre
    ipcOnEvent('checkupdate', store.onCheckUpdate)
    ipcOnEvent('open-about', store.openAbout)
    ipcOnEvent('new-ssh', store.onNewSsh)
    ipcOnEvent('add-tab-from-command-line', store.addTabFromCommandLine)
    ipcOnEvent('open-tab', (e, parsed) => store.ipcOpenTab(parsed))
    ipcOnEvent('openSettings', store.openSetting)
    ipcOnEvent('selectall', store.selectall)
    ipcOnEvent('focused', store.focus)
    ipcOnEvent('blur', store.onBlur)
    ipcOnEvent('zoom-reset', store.onZoomReset)
    ipcOnEvent('zoomin', store.onZoomIn)
    ipcOnEvent('zoomout', store.onZoomout)
    ipcOnEvent('confirm-exit', store.beforeExitApp)
    document.addEventListener('drop', preventDefault)
    document.addEventListener('dragover', preventDefault)
    window.addEventListener('offline', store.setOffline)
    store.isSecondInstance = window.pre.runSync('isSecondInstance')
    store.layout = splitMap.c1
    store.prevLayout = splitMap.c1
    store.currentLayoutBatch = 0
    store.initData()
    store.checkForDbUpgrade()
    store.handleGetSerials()
    store.checkPendingDeepLink()
  }, [logined])

  const handleLogin = async () => {
    if (!pass || submitting) {
      return
    }
    setSubmitting(true)
    const r = await window.pre.runGlobalAsync('checkPassword', pass)
    if (r) {
      setLogined(true)
    }
    setSubmitting(false)
  }

  if (!logined) {
    return (
      <div className='cu-root'>
        <div className='cu-body'>
          <div className='cu-title'>ObsidianSSH</div>
          <input
            type='password'
            value={pass}
            autoFocus
            placeholder='Password'
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #2a2d38',
              background: '#1a1d26',
              color: '#fff',
              outline: 'none'
            }}
          />
        </div>
      </div>
    )
  }

  if (!store.configLoaded) {
    return (
      <div className='cu-root'>
        <div className='cu-body'>
          <div className='cu-sub'>Loading ObsidianSSH…</div>
        </div>
      </div>
    )
  }

  return <CustomShell store={store} />
})
