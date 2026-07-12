import { auto } from 'manate/react'
import { Tooltip } from 'antd'
import {
  CloudServerOutlined,
  CodeOutlined,
  SettingOutlined,
  PlusOutlined
} from '@ant-design/icons'
import addLocalTab from './add-local-tab.js'

const addTab = () => addLocalTab()

export default auto(function Rail (props) {
  const { store } = props

  const toggleBookmarks = () => {
    store.storeAssign({ cuBookmarksOpen: !store.cuBookmarksOpen })
  }
  const openSettings = () => store.openSetting()
  const openMacros = () => store.handleOpenQuickCommandsSetting()

  return (
    <div className='cu-rail'>
      <div className='cu-rail-top'>
        <Tooltip title='Bookmarks — click to lock open or closed, hover to peek' placement='right' mouseEnterDelay={0.3}>
          <button
            className={store.cuBookmarksOpen ? 'cu-rail-btn active' : 'cu-rail-btn'}
            onClick={toggleBookmarks}
          >
            <CloudServerOutlined />
          </button>
        </Tooltip>
        <Tooltip title='New tab' placement='right' mouseEnterDelay={0.3}>
          <button className='cu-rail-btn' onClick={addTab}>
            <PlusOutlined />
          </button>
        </Tooltip>
      </div>
      <div className='cu-rail-bottom'>
        <Tooltip title='Macro settings' placement='right' mouseEnterDelay={0.3}>
          <button className='cu-rail-btn' onClick={openMacros} aria-label='Open macro settings'>
            <CodeOutlined />
          </button>
        </Tooltip>
        <Tooltip title='Settings' placement='right' mouseEnterDelay={0.3}>
          <button className='cu-rail-btn' onClick={openSettings} aria-label='Open settings'>
            <SettingOutlined />
          </button>
        </Tooltip>
      </div>
    </div>
  )
})
