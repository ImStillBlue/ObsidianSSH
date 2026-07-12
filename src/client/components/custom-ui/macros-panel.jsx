import { auto } from 'manate/react'
import { useMemo, useState } from 'react'
import { Input } from 'antd'
import {
  ArrowLeftOutlined,
  FolderOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'

const UNLABELED = '__unlabeled__'
const ALL = '__all__'

export default auto(function MacrosPanel (props) {
  const { store } = props
  const [folder, setFolder] = useState(null)
  const [kw, setKw] = useState('')
  const all = store.currentQuickCommands || []

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
        <Input
          value={kw}
          onChange={ev => setKw(ev.target.value)}
          placeholder={folder === null ? 'Filter folders…' : 'Filter macros…'}
          size='small'
          allowClear
          className='cu-macros-search'
        />
      </div>
      <div className='cu-macros-list'>
        {folder === null
          ? (
            <>
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
