import { runCmd } from '../terminal/terminal-apis'

const fields = [
  'session_name',
  'session_attached',
  'session_windows',
  'window_index',
  'window_name',
  'window_active',
  'pane_index',
  'pane_id',
  'pane_active',
  'pane_current_command',
  'pane_current_path',
  'pane_title'
]

const format = fields.map(name => `#{${name}}`).join('\t')

function quote (value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`
}

export function parseTmuxRows (text = '') {
  return text.trim().split('\n').filter(Boolean).map(line => {
    const values = line.split('\t')
    return fields.reduce((row, field, index) => {
      row[field] = values[index] || ''
      return row
    }, {})
  })
}

export async function inspectTmux (pid) {
  const version = (await runCmd(pid, 'command -v tmux >/dev/null 2>&1 && tmux -V || printf __NO_TMUX__')).trim()
  if (!version || version === '__NO_TMUX__') {
    return { available: false, version: '', sessions: [] }
  }
  const output = await runCmd(pid, `tmux list-panes -a -F ${quote(format)} 2>/dev/null || true`)
  const rows = parseTmuxRows(output)
  const sessions = []
  for (const row of rows) {
    let session = sessions.find(item => item.name === row.session_name)
    if (!session) {
      session = {
        name: row.session_name,
        attached: Number(row.session_attached || 0),
        windowCount: Number(row.session_windows || 0),
        windows: []
      }
      sessions.push(session)
    }
    let window = session.windows.find(item => item.index === row.window_index)
    if (!window) {
      window = {
        index: row.window_index,
        name: row.window_name,
        active: row.window_active === '1',
        panes: []
      }
      session.windows.push(window)
    }
    window.panes.push({
      index: row.pane_index,
      id: row.pane_id,
      active: row.pane_active === '1',
      command: row.pane_current_command,
      path: row.pane_current_path,
      title: row.pane_title
    })
  }
  return { available: true, version, sessions }
}

export const tmuxCommand = {
  createSession: (pid, name, cwd) => runCmd(pid, `tmux new-session -d -s ${quote(name)}${cwd ? ` -c ${quote(cwd)}` : ''}`),
  renameSession: (pid, target, name) => runCmd(pid, `tmux rename-session -t ${quote(target)} ${quote(name)}`),
  detachSession: (pid, name) => runCmd(pid, `tmux detach-client -s ${quote(name)}`),
  killSession: (pid, name) => runCmd(pid, `tmux kill-session -t ${quote(name)}`),
  createWindow: (pid, session, name, cwd) => runCmd(pid, `tmux new-window -d -t ${quote(session)}${name ? ` -n ${quote(name)}` : ''}${cwd ? ` -c ${quote(cwd)}` : ''}`),
  renameWindow: (pid, target, name) => runCmd(pid, `tmux rename-window -t ${quote(target)} ${quote(name)}`),
  killWindow: (pid, target) => runCmd(pid, `tmux kill-window -t ${quote(target)}`),
  selectWindow: (pid, target) => runCmd(pid, `tmux select-window -t ${quote(target)}`),
  selectPane: (pid, target) => runCmd(pid, `tmux select-pane -t ${quote(target)}`)
}

export function attachCommand (session) {
  return `tmux attach-session -t ${quote(session)}`
}
