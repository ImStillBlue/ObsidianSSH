import { auto } from 'manate/react'
import { useState } from 'react'
import { Input } from 'antd'

export default auto(function MacrosPanel (props) {
  const { store } = props
  const [kw, setKw] = useState('')
  const all = store.currentQuickCommands || []
  const k = kw.trim().toLowerCase()
  const list = k
    ? all.filter(m => (m.name || '').toLowerCase().includes(k))
    : all

  const run = id => store.runQuickCommandItem(id)

  return (
    <div className='cu-macros'>
      <div className='cu-macros-head'>
        <span className='cu-macros-title'>Macros</span>
        <Input
          value={kw}
          onChange={ev => setKw(ev.target.value)}
          placeholder='Filter…'
          size='small'
          allowClear
          className='cu-macros-search'
        />
      </div>
      <div className='cu-macros-list'>
        {list.length === 0 && (
          <div className='cu-macros-empty'>
            No macros yet. Add quick commands in electerm settings.
          </div>
        )}
        {list.map(m => (
          <button
            key={m.id}
            className='cu-macro'
            onClick={() => run(m.id)}
            title={(m.commands || []).map(c => c.command).join(' ; ')}
          >
            <span className='cu-macro-name'>{m.name}</span>
            {m.labels && m.labels.length > 0 && (
              <span className='cu-macro-labels'>{m.labels.join(' · ')}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
})
