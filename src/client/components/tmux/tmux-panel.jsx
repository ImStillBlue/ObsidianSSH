import { auto } from 'manate/react'
import { useCallback, useEffect, useState } from 'react'
import { Spin, Tooltip } from 'antd'
import {
  CaretRightOutlined,
  CloseOutlined,
  DisconnectOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
  ReloadOutlined,
  SelectOutlined
} from '@ant-design/icons'
import { attachCommand, inspectTmux, tmuxCommand } from './tmux-api'

export default auto(function TmuxPanel ({ store, cwd }) {
  const pid = store.activeTabId
  const [state, setState] = useState({ loading: true, available: true, version: '', sessions: [] })
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState({})

  const refresh = useCallback(async (quiet = false) => {
    if (!pid) return
    if (!quiet) setState(prev => ({ ...prev, loading: true }))
    try {
      const next = await inspectTmux(pid)
      setState({ ...next, loading: false })
      setError('')
    } catch (err) {
      setState(prev => ({ ...prev, loading: false }))
      setError(err.message || 'Unable to query tmux')
    }
  }, [pid])

  useEffect(() => {
    refresh()
    const timer = setInterval(() => refresh(true), 2500)
    return () => clearInterval(timer)
  }, [refresh])

  const act = async action => {
    try {
      await action()
      await refresh(true)
    } catch (err) {
      setError(err.message || 'tmux command failed')
    }
  }
  const ask = (title, initial = '') => window.prompt(title, initial)?.trim()
  const createSession = () => {
    const name = ask('New tmux session name')
    if (name) act(() => tmuxCommand.createSession(pid, name, cwd))
  }
  const attach = name => store.runQuickCommand(attachCommand(name))
  const openInTab = async (session, target) => {
    if (target) {
      await tmuxCommand.selectPane(pid, target)
    }
    store.openTmuxTab(pid, session, attachCommand(session))
  }
  const renameSession = session => {
    const name = ask('Rename tmux session', session.name)
    if (name && name !== session.name) act(() => tmuxCommand.renameSession(pid, session.name, name))
  }
  const killSession = session => {
    if (window.confirm(`Kill tmux session “${session.name}”?`)) {
      act(() => tmuxCommand.killSession(pid, session.name))
    }
  }
  const detachSession = session => {
    act(() => tmuxCommand.detachSession(pid, session.name))
  }
  const createWindow = session => {
    const name = ask(`New window in ${session.name} (optional name)`)
    if (name !== undefined) act(() => tmuxCommand.createWindow(pid, session.name, name, cwd))
  }
  const renameWindow = (session, window) => {
    const name = ask('Rename tmux window', window.name)
    if (name && name !== window.name) {
      act(() => tmuxCommand.renameWindow(pid, `${session.name}:${window.index}`, name))
    }
  }
  const killWindow = (session, windowItem) => {
    if (window.confirm(`Kill tmux window “${windowItem.name}”?`)) {
      act(() => tmuxCommand.killWindow(pid, `${session.name}:${windowItem.index}`))
    }
  }
  const toggle = key => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className='cu-tmux'>
      <div className='cu-tmux-head'>
        <span>TMUX</span>
        {state.version && <small>{state.version}</small>}
        <Tooltip title='Refresh tmux'>
          <button onClick={() => refresh()}><ReloadOutlined spin={state.loading} /></button>
        </Tooltip>
        <Tooltip title='New tmux session'>
          <button onClick={createSession}><PlusOutlined /></button>
        </Tooltip>
      </div>
      {error && <div className='cu-tmux-error'>{error}</div>}
      {state.loading && !state.version
        ? <div className='cu-tmux-empty'><Spin size='small' /></div>
        : !state.available
            ? <div className='cu-tmux-empty'>tmux is not installed on this host.</div>
            : state.sessions.length === 0
              ? <div className='cu-tmux-empty'>No tmux sessions. Create one with +.</div>
              : (
                <div className='cu-tmux-tree'>
                  {state.sessions.map(session => {
                    const sessionKey = `s:${session.name}`
                    return (
                      <div className='cu-tmux-session' key={session.name}>
                        <div className='cu-tmux-row session'>
                          <button className='cu-tmux-expand' onClick={() => toggle(sessionKey)}>
                            <CaretRightOutlined rotate={expanded[sessionKey] ? 90 : 0} />
                          </button>
                          <button className='cu-tmux-main' onClick={() => attach(session.name)} title='Attach session'>
                            <b>{session.name}</b>
                            <span>{session.attached ? `${session.attached} attached` : 'detached'}</span>
                          </button>
                          <button onClick={() => openInTab(session.name)} title='Open in new Electerm tab'><ExportOutlined /></button>
                          <button onClick={() => createWindow(session)} title='New window'><PlusOutlined /></button>
                          <button
                            onClick={() => detachSession(session)}
                            title='Detach clients and keep session running'
                            disabled={!session.attached}
                          >
                            <DisconnectOutlined />
                          </button>
                          <button onClick={() => renameSession(session)} title='Rename session'><EditOutlined /></button>
                          <button onClick={() => killSession(session)} title='Kill session'><CloseOutlined /></button>
                        </div>
                        {expanded[sessionKey] && session.windows.map(windowItem => {
                          const windowKey = `${sessionKey}:w:${windowItem.index}`
                          const target = `${session.name}:${windowItem.index}`
                          return (
                            <div className='cu-tmux-window' key={windowKey}>
                              <div className={`cu-tmux-row window${windowItem.active ? ' active' : ''}`}>
                                <button className='cu-tmux-expand' onClick={() => toggle(windowKey)}>
                                  <CaretRightOutlined rotate={expanded[windowKey] ? 90 : 0} />
                                </button>
                                <button className='cu-tmux-main' onClick={() => act(() => tmuxCommand.selectWindow(pid, target))}>
                                  <b>{windowItem.index}: {windowItem.name}</b>
                                  <span>{windowItem.panes.length} pane{windowItem.panes.length === 1 ? '' : 's'}</span>
                                </button>
                                <button onClick={() => renameWindow(session, windowItem)} title='Rename window'><EditOutlined /></button>
                                <button onClick={() => killWindow(session, windowItem)} title='Kill window'><CloseOutlined /></button>
                              </div>
                              {expanded[windowKey] && windowItem.panes.map(pane => (
                                <button
                                  className={`cu-tmux-pane${pane.active ? ' active' : ''}`}
                                  key={pane.id}
                                  onClick={() => act(() => tmuxCommand.selectPane(pid, pane.id))}
                                  title={pane.path}
                                >
                                  <SelectOutlined />
                                  <span><b>{pane.index}: {pane.title || pane.command}</b><small>{pane.command} · {pane.path}</small></span>
                                  <ExportOutlined
                                    onClick={event => {
                                      event.stopPropagation()
                                      openInTab(session.name, pane.id)
                                    }}
                                  />
                                </button>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
                )}
    </div>
  )
})
