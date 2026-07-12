import { auto } from 'manate/react'
import { PlusOutlined } from '@ant-design/icons'
import Tab from '../tabs/tab.jsx'
import addLocalTab from './add-local-tab.js'

const addTab = () => addLocalTab()

export default auto(function TabStrip (props) {
  const { store } = props
  const tabs = store.tabs
  const currentBatchTabId = store.activeTabId
  return (
    <div className='cu-tabstrip'>
      <div className='cu-tabs'>
        {tabs.map((tab, i) => (
          <Tab
            key={tab.id}
            tab={tab}
            batch={0}
            tabs={tabs}
            tabIndex={i}
            isLast={i === tabs.length - 1}
            currentBatchTabId={currentBatchTabId}
            config={store.config}
            addTab={addTab}
          />
        ))}
      </div>
      <div className='cu-tab-add' onClick={addTab} title='New tab'>
        <PlusOutlined />
      </div>
    </div>
  )
})
