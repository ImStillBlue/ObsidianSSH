import { auto } from 'manate/react'
import { Tooltip } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'

export default auto(function RailRight (props) {
  const { store } = props

  const toggleSidebar = () => {
    store.storeAssign({ cuSidebarOpen: !store.cuSidebarOpen })
  }

  return (
    <div className='cu-rail cu-rail-r'>
      <div className='cu-rail-top'>
        <Tooltip title='Files & macros — hover to peek, click to lock' placement='left' mouseEnterDelay={0.3}>
          <button
            className={store.cuSidebarOpen ? 'cu-edge-handle active' : 'cu-edge-handle'}
            onClick={toggleSidebar}
          >
            {store.cuSidebarOpen ? <RightOutlined /> : <LeftOutlined />}
          </button>
        </Tooltip>
      </div>
    </div>
  )
})
