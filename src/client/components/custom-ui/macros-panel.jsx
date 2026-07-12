import { auto } from 'manate/react'
import { useMemo, useState } from 'react'
import { Input, Select } from 'antd'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  FolderAddOutlined,
  FolderOutlined,
  HistoryOutlined,
  PlusOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'
import generate from '../../common/uid'

const UNLABELED = '__unlabeled__'
const ALL = '__all__'

export default auto(function MacrosPanel (props) {
  const { store, cwd } = props
  const [folder, setFolder] = useState(null)
  const [kw, setKw] = useState('')
  const [creating, setCreating] = useState(false)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [name, setName] = useState('')
  const [macroFolder, setMacroFolder] = useState('')
  const [useCwd, setUseCwd] = useState(Boolean(cwd))
  const [commands, setCommands] = useState([])
  const [command, setCommand] = useState('')
  const all = store.currentQuickCommands || []
  const recent = (store.terminalCommandHistory || [])
    .slice()
    .sort((a, b) => new Date(b.lastUseTime) - new Date(a.lastUseTime))
    .slice(0, 8)

  const folders = useMemo(() => {
    const counts = new Map()
    let unlabeled = 0
    for (const m of all) {
      const labels = m.labels || []
      if (labels.length === 0) {
        unlabeled++
        continue
      }
      for (const label of labels) {
        counts.set(label, (counts.get(label) || 0) + 1)
      }
    }
    const entries = [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ id: name, name, count }))
    if (unlabeled > 0) {
      entries.push({ id: UNLABELED, name: 'Unlabeled', count: unlabeled })
    }
    return entries
  }, [all])

  const k = kw.trim().toLowerCase()

  const macrosInFolder = useMemo(() => {
    if (folder === null) return []
    if (folder === ALL) return all
    if (folder === UNLABELED) {
      return all.filter(m => !m.labels || m.labels.length === 0)
    }
    return all.filter(m => (m.labels || []).includes(folder))
  }, [all, folder])

  const visibleFolders = k
    ? folders.filter(f => f.name.toLowerCase().includes(k))
    : folders

  const visibleMacros = k
    ? macrosInFolder.filter(m => (m.name || '').toLowerCase().includes(k))
    : macrosInFolder

  const run = id => store.runQuickCommandItem(id)
  const commandText = macro => {
    const commands = macro.commands || (macro.command
      ? [{ command: macro.command }]
      : [])
    return commands
      .map(item => item.command)
      .filter(Boolean)
      .join(' ; ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  const openFolder = id => {
    setFolder(id)
    setKw('')
  }
  const back = () => {
    setFolder(null)
    setKw('')
  }

  const openCreator = () => {
    setName('')
    setMacroFolder(folder && ![ALL, UNLABELED].includes(folder) ? folder : '')
    setUseCwd(Boolean(cwd))
    setCommands([])
    setCommand('')
    setCreating(true)
  }
  const addCommand = cmd => {
    const value = cmd.trim()
    if (!value) return
    setCommands(prev => [...prev, value])
    setCommand('')
  }
  const saveMacro = () => {
    if (!name.trim() || commands.length === 0) return
    store.addQuickCommand({
      id: generate(),
      name: name.trim(),
      labels: macroFolder.trim() ? [macroFolder.trim()] : [],
      startDirectory: useCwd ? cwd : '',
      commands: commands.map(cmd => ({
        id: generate(),
        command: cmd,
        delay: 100
      }))
    })
    setCreating(false)
  }
  const saveFolder = () => {
    const value = folderName.trim()
    if (!value) return
    setMacroFolder(value)
    setCreating(true)
    setFolderName('')
    setCreatingFolder(false)
  }

  const folderLabel = folder === ALL
    ? 'All Macros'
    : folder === UNLABELED
      ? 'Unlabeled'
      : folder

  return (
    <div className='cu-macros'>
      <div className='cu-macros-head'>
        {folder === null
          ? <span className='cu-macros-title'>Macros</span>
          : (
            <button
              className='cu-macros-back'
              onClick={back}
              title='Back to folders'
            >
              <ArrowLeftOutlined />
              <span className='cu-macros-crumb'>{folderLabel}</span>
            </button>
            )}
        {!creating && (
          <>
            <Input
              value={kw}
              onChange={ev => setKw(ev.target.value)}
              placeholder={folder === null ? 'Filter folders…' : 'Filter macros…'}
              size='small'
              allowClear
              className='cu-macros-search'
            />
            <button className='cu-macro-add' onClick={openCreator} title='Create macro'>
              <PlusOutlined />
            </button>
            {folder === null && (
              <button className='cu-macro-add' onClick={() => setCreatingFolder(true)} title='Create folder'>
                <FolderAddOutlined />
              </button>
            )}
          </>
        )}
      </div>
      <div className='cu-macros-list'>
        {creating
          ? (
            <div className='cu-macro-maker'>
              <div className='cu-macro-maker-title'>Quick macro</div>
              <Input
                value={name}
                onChange={ev => setName(ev.target.value)}
                placeholder='Macro name'
                autoFocus
              />
              <Select
                mode='tags'
                value={macroFolder ? [macroFolder] : []}
                onChange={values => setMacroFolder(values.at(-1) || '')}
                options={folders
                  .filter(item => item.id !== UNLABELED)
                  .map(item => ({ label: item.name, value: item.id }))}
                placeholder='Choose or create a folder'
                maxCount={1}
                allowClear
                showSearch
                className='cu-macro-folder-select'
              />
              {cwd && (
                <label className='cu-macro-cwd'>
                  <input
                    type='checkbox'
                    checked={useCwd}
                    onChange={ev => setUseCwd(ev.target.checked)}
                  />
                  <span><b>Start in current directory</b><small>{cwd}</small></span>
                </label>
              )}
              <div className='cu-macro-maker-label'>Steps</div>
              {commands.map((cmd, index) => (
                <div className='cu-macro-draft-step' key={`${cmd}-${index}`}>
                  <code>{cmd}</code>
                  <button onClick={() => setCommands(prev => prev.filter((_, i) => i !== index))}>
                    <CloseOutlined />
                  </button>
                </div>
              ))}
              <div className='cu-macro-command-add'>
                <Input.TextArea
                  value={command}
                  onChange={ev => setCommand(ev.target.value)}
                  onPressEnter={ev => {
                    if (!ev.shiftKey) {
                      ev.preventDefault()
                      addCommand(command)
                    }
                  }}
                  placeholder='Type a command…'
                  autoSize={{ minRows: 1, maxRows: 3 }}
                />
                <button onClick={() => addCommand(command)} title='Add command'><PlusOutlined /></button>
              </div>
              {recent.length > 0 && (
                <div className='cu-macro-history'>
                  <div className='cu-macro-maker-label'><HistoryOutlined /> Recent commands</div>
                  {recent.map(item => (
                    <button key={item.id || item.cmd} onClick={() => addCommand(item.cmd)} title='Add as a step'>
                      <PlusOutlined /><code>{item.cmd}</code>
                    </button>
                  ))}
                </div>
              )}
              <div className='cu-macro-maker-actions'>
                <button onClick={() => setCreating(false)}>Cancel</button>
                <button className='primary' disabled={!name.trim() || commands.length === 0} onClick={saveMacro}>
                  <CheckOutlined /> Save macro
                </button>
              </div>
            </div>
            )
          : folder === null
            ? (
              <>
                {creatingFolder && (
                  <div className='cu-folder-create'>
                    <Input
                      value={folderName}
                      onChange={event => setFolderName(event.target.value)}
                      onPressEnter={saveFolder}
                      placeholder='New folder name'
                      size='small'
                      autoFocus
                    />
                    <button onClick={saveFolder}><CheckOutlined /></button>
                    <button onClick={() => setCreatingFolder(false)}><CloseOutlined /></button>
                  </div>
                )}
                {all.length > 0 && (
                  <button
                    className='cu-folder'
                    onClick={() => openFolder(ALL)}
                  >
                    <FolderOutlined className='cu-folder-icon' />
                    <span className='cu-folder-name'>All Macros</span>
                    <span className='cu-folder-count'>{all.length}</span>
                  </button>
                )}
                {visibleFolders.length === 0 && all.length === 0 && (
                  <div className='cu-macros-empty'>
                    No macros yet. Create one in {window.et?.siteName || 'ObsidianSSH'} settings.
                  </div>
                )}
                {visibleFolders.map(f => (
                  <button
                    key={f.id}
                    className='cu-folder'
                    onClick={() => openFolder(f.id)}
                  >
                    <FolderOutlined className='cu-folder-icon' />
                    <span className='cu-folder-name'>{f.name}</span>
                    <span className='cu-folder-count'>{f.count}</span>
                  </button>
                ))}
              </>
              )
            : (
              <>
                {visibleMacros.length === 0 && (
                  <div className='cu-macros-empty'>
                    {macrosInFolder.length === 0 ? 'No macros here.' : 'No matches.'}
                  </div>
                )}
                {visibleMacros.map(m => (
                  <button
                    key={m.id}
                    className='cu-macro'
                    onClick={() => run(m.id)}
                    title={commandText(m)}
                  >
                    <PlayCircleOutlined className='cu-macro-run' />
                    <span className='cu-macro-content'>
                      <span className='cu-macro-name'>{m.name}</span>
                      {commandText(m) && (
                        <span className='cu-macro-command'>{commandText(m)}</span>
                      )}
                    </span>
                    {m.labels && m.labels.length > 0 && (
                      <span className='cu-macro-labels'>{m.labels.join(', ')}</span>
                    )}
                  </button>
                ))}
              </>
              )}
      </div>
    </div>
  )
})
