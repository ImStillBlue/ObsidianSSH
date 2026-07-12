/**
 * quick command list render
 */

import List from '../setting-panel/list'
import { PlusOutlined, CopyOutlined, FolderOutlined, FolderOpenOutlined, InboxOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import classnames from 'classnames'
import highlight from '../common/highlight'
import QmTransport from './quick-command-transport'
import onDrop from './on-drop'
import copy from 'json-deep-copy'
import uid from '../../common/uid'
import './qm.styl'

const e = window.translate
const allFolders = '__all_folders__'
const unfiled = '__unfiled__'

export default class QuickCommandsList extends List {
  del = (item, e) => {
    e.stopPropagation()
    this.props.store.delQuickCommand(item)
  }

  onClickItem = (item) => {
    this.props.onClickItem(item)
  }

  handleChangeLabel = v => {
    this.setState({
      labels: v === allFolders ? [] : [v]
    })
  }

  getLabels = () => {
    return this.props.store.quickCommandTags
  }

  handleCreateFolder = () => {
    const name = (this.state.folderDraft || '').trim()
    if (!name) return
    this.props.store.setSettingItem({
      id: '',
      name: 'New macro',
      labels: [name]
    })
    this.setState({ folderDraft: '' })
  }

  handleDragOver = e => {
    e.preventDefault()
  }

  handleDragStart = e => {
    const dragElement = e.target.closest('.item-list-unit')
    if (dragElement) {
      e.dataTransfer.setData('idDragged', dragElement.getAttribute('data-id'))
    }
  }

  handleDragEnter = e => {
    e.target.closest('.item-list-unit').classList.add('qm-field-dragover')
  }

  handleDragLeave = e => {
    e.target.closest('.item-list-unit').classList.remove('qm-field-dragover')
  }

  handleDrop = e => {
    onDrop(e, '.item-list-unit')
  }

  duplicateItem = (e, item) => {
    e.stopPropagation()
    const { store } = window
    const newCommand = copy(item)
    newCommand.id = uid()
    const baseName = item.name.replace(/\(\d+\)$/, '')
    const sameNameCount = store.currentQuickCommands.filter(
      cmd => cmd.name && cmd.name.replace(/\(\d+\)$/, '').includes(baseName)
    ).length
    const duplicateIndex = sameNameCount > 0 ? sameNameCount : 1
    newCommand.name = baseName + '(' + duplicateIndex + ')'
    store.addQuickCommand(newCommand)
  }

  renderDuplicateBtn = (item) => {
    if (!item.id) {
      return null
    }
    return (
      <CopyOutlined
        title={e('duplicate')}
        className='pointer list-item-duplicate'
        onClick={(e) => this.duplicateItem(e, item)}
      />
    )
  }

  renderItem = (item, i) => {
    if (!item) {
      return null
    }
    const { activeItemId } = this.props
    const { name, id } = item
    const cls = classnames(
      'item-list-unit',
      {
        active: activeItemId === id
      }
    )
    let title = name
    title = highlight(
      title,
      this.state.keyword
    )
    return (
      <div
        key={id}
        className={cls}
        onClick={() => this.onClickItem(item)}
        data-id={id}
        draggable
        onDragOver={this.handleDragOver}
        onDragStart={this.handleDragStart}
        onDrop={this.handleDrop}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
      >
        <div className='elli pd1y pd2x' title={name}>
          {
            !id
              ? <PlusOutlined className='mg1r' />
              : null
          }
          {id ? title : 'New macro'}
        </div>
        {this.renderDuplicateBtn(item)}
        {this.renderDelBtn(item)}
      </div>
    )
  }

  renderTransport = () => {
    return (
      <QmTransport
        store={this.props.store}
      />
    )
  }

  renderLabels = () => {
    const arr = this.getLabels()
    const selected = this.state.labels[0] || allFolders
    const count = folder => (this.props.list || []).filter(item => {
      const folders = item.labels || []
      return folder === allFolders || (folder === unfiled ? !folders.length : folders.includes(folder))
    }).length
    const folders = [
      { id: allFolders, name: 'All macros', icon: <FolderOpenOutlined /> },
      ...arr.map(name => ({ id: name, name, icon: <FolderOutlined /> })),
      { id: unfiled, name: 'Unfiled', icon: <InboxOutlined /> }
    ]
    return (
      <div className='macro-folders'>
        <div className='macro-folders-heading'>Folders</div>
        <div className='macro-folder-create'>
          <Input
            size='small'
            value={this.state.folderDraft || ''}
            placeholder='New folder + macro'
            onChange={event => this.setState({ folderDraft: event.target.value })}
            onPressEnter={this.handleCreateFolder}
          />
          <button type='button' onClick={this.handleCreateFolder} title='Create a folder with a new macro'>
            <PlusOutlined />
          </button>
        </div>
        {folders.map(folder => (
          <button
            type='button'
            key={folder.id}
            className={classnames('macro-folder', { active: selected === folder.id })}
            onClick={() => this.handleChangeLabel(folder.id)}
          >
            <span className='macro-folder-name'>{folder.icon}{folder.name}</span>
            <span className='macro-folder-count'>{count(folder.id)}</span>
          </button>
        ))}
      </div>
    )
  }

  filter = list => {
    const { keyword, labels } = this.state
    const f = keyword
      ? list.filter((item) => {
        const n = (item.name || '').toLowerCase()
        const k = keyword.toLowerCase()

        // Check if item has commands array
        if (item.commands && Array.isArray(item.commands)) {
          // Search in each command in the commands array
          return n.includes(k) || item.commands.some(cmd =>
            (cmd.command || '').toLowerCase().includes(k)
          )
        } else {
          // Fallback to the old behavior for backward compatibility
          const c = (item.command || '').toLowerCase()
          return n.includes(k) || c.includes(k)
        }
      })
      : list
    return labels.length
      ? f.filter(d => {
        return labels.some(label => {
          if (label === unfiled) {
            return !(d.labels || []).length
          }
          return (d.labels || []).includes(label)
        })
      })
      : f
  }
}
