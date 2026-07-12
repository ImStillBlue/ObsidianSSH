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
  killSession: (pid, name) => runCmd(pid, `tmux kill-session -t ${quote(name)}`),
  createWindow: (pid, session, name, cwd) => runCmd(pid, `tmux new-window -d -t ${quote(session)}${name ? ` -n ${quote(name)}` : ''}${cwd ? ` -c ${quote(cwd)}` : ''}`),
  renameWindow: (pid, target, name) => runCmd(pid, `tmux rename-window -t ${quote(target)} ${quote(name)}`),
  killWindow: (pid, target) => runCmd(pid, `tmux kill-window -t ${quote(target)}`),
  selectWindow: (pid, target) => runCmd(pid, `tmux select-window -t ${quote(target)}`),
  selectPane: (pid, target) => runCmd(pid, `tmux select-pane -t ${quote(target)}`)
}

function keySequence (key) {
  if (!key || key === 'None') return ''
  if (key.length === 1) return key
  if (key === 'Space') return ' '
  if (key === 'Enter') return '\r'
  if (key === 'Escape') return '\x1b'
  if (key === 'C-Space' || key === 'C-@') return '\x00'
  if (key === 'C-?') return '\x7f'
  if (key.startsWith('M-')) {
    return '\x1b' + keySequence(key.slice(2))
  }
  if (key.startsWith('C-') && key.length === 3) {
    return String.fromCharCode(key.charCodeAt(2) & 31)
  }
  return ''
}

export async function getDetachSequence (pid) {
  const query = "printf '%s\\t' \"$(tmux show-options -gv prefix)\"; tmux list-keys -T prefix | awk '$5 == \"detach-client\" { print $4; exit }'"
  const [prefix, detachKey] = (await runCmd(pid, query)).trim().split('\t')
  const sequence = keySequence(prefix) + keySequence(detachKey)
  if (!sequence) {
    throw new Error('Could not determine the tmux detach shortcut')
  }
  return sequence
}

export function attachCommand (session) {
  return `tmux attach-session -t ${quote(session)}`
}
