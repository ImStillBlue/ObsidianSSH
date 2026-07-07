import { auto } from 'manate/react'
import { Tooltip } from 'antd'
import {
  CloudServerOutlined,
  SettingOutlined,
  PlusOutlined
} from '@ant-design/icons'

const addTab = () => window.store.addTab(undefined, undefined, 0)

export default auto(function Rail (props) {
  const { store } = props

  const toggleBookmarks = () => {
    store.storeAssign({ cuBookmarksOpen: !store.cuBookmarksOpen })
  }
  const openSettings = () => store.openSetting()

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
        <Tooltip title='Settings' placement='right' mouseEnterDelay={0.3}>
          <button className='cu-rail-btn' onClick={openSettings}>
            <SettingOutlined />
          </button>
        </Tooltip>
      </div>
    </div>
  )
})
