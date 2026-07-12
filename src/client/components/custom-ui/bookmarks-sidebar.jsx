import { auto } from 'manate/react'
import { PlusOutlined } from '@ant-design/icons'
import TreeList from '../tree-list/tree-list'
import getInitItem from '../../common/init-setting-item'
import { settingMap } from '../../common/constants'
import TmuxPanel from '../tmux/tmux-panel.jsx'

export default auto(function BookmarksSidebar (props) {
  const { store, cwds } = props
  const {
    listStyle,
    leftSidebarWidth,
    expandedKeys,
    bookmarks,
    bookmarksMap,
    initLoadingData
  } = store

  const onClickItem = (item) => {
    store.onSelectBookmark(item.id)
  }

  const newBookmark = () => {
    store.openBookmarkEdit(getInitItem([], settingMap.bookmarks))
  }

  const treeProps = {
    bookmarks: bookmarks || [],
    type: 'bookmarks',
    onClickItem,
    listStyle,
    staticList: true,
    shouldConfirmDel: true,
    bookmarksMap,
    bookmarkGroups: store.getBookmarkGroupsTotal(),
    expandedKeys,
    leftSidebarWidth,
    bookmarkGroupTree: store.bookmarkGroupTree,
    initLoadingData
  }

  return (
    <div className='cu-bookmarks'>
      <div className='cu-bookmarks-head'>
        <span className='cu-bookmarks-title'>Bookmarks</span>
        <button
          className='cu-bookmarks-new'
          onClick={newBookmark}
          title='New bookmark'
        >
          <PlusOutlined />
        </button>
      </div>
      <div className='cu-bookmarks-tree'>
        <TreeList {...treeProps} />
      </div>
      <div className='cu-bookmarks-tmux'>
        <TmuxPanel
          store={store}
          cwd={cwds[store.activeTabId] || ''}
        />
      </div>
    </div>
  )
})
