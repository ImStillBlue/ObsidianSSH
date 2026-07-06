/**
 * ObsidianSSH shell — the custom layout wrapper.
 *
 * Phase 0: proves the store is bootstrapped (top bar + engine status). Phase 1
 * replaces the status body with the tab strip + ObsidianSessionHost (terminal),
 * and Phase 2 adds the SFTP + macros sidebar.
 */
import { auto } from 'manate/react'
import { ConfigProvider } from 'antd'
import { pick } from 'lodash-es'
import deepCopy from 'json-deep-copy'
import { NotificationContainer } from '../common/notification'
import InputContextMenu from '../common/input-context-menu'
import ShortcutControl from '../shortcuts/shortcut-control.jsx'
import TerminalInteractive from '../terminal/terminal-interactive'
import TermSearch from '../terminal/term-search'
import TerminalCmdSuggestions from '../terminal/terminal-command-dropdown'
import FileInfoModal from '../sftp/file-info-modal'
import ConfirmModalStore from '../file-transfer/conflict-resolve.jsx'
import TransportsActionStore from '../file-transfer/transports-action-store.jsx'
import Remote2RemoteHandlers from '../file-transfer/remote2remote-handlers.jsx'
import TransferQueue from '../file-transfer/transfer-queue'
import TopBar from './top-bar.jsx'
import TabStrip from './tab-strip.jsx'
import Workspace from './workspace.jsx'
import './custom-ui.css'

export default auto(function CustomShell (props) {
  const { store } = props
  const { config, fileTransfers, transferToConfirm } = store
  const copiedTransfer = deepCopy(fileTransfers)
  const conflictStoreProps = {
    fileTransferChanged: JSON.stringify(copiedTransfer),
    fileTransfers: copiedTransfer
  }
  const currentTab = store.tabs.find(tab => tab.id === store.activeTabId)
  const termProps = {
    currentTab,
    config,
    ...pick(store, [
      'activeTabId',
      'termSearchOpen',
      'termSearch',
      'termSearchOptions',
      'termSearchMatchCount',
      'termSearchMatchIndex'
    ])
  }
  const cmdSuggestionsProps = {
    suggestions: store.terminalCommandSuggestions
  }
  return (
    <ConfigProvider theme={store.uiThemeConfig}>
      <div className='cu-root'>
        <TopBar />
        <TabStrip store={store} />
        <Workspace store={store} />
        <InputContextMenu />
        <ShortcutControl config={store.config} />
        <TerminalInteractive />
        <FileInfoModal />
        <TermSearch {...termProps} />
        <ConfirmModalStore
          transferToConfirm={transferToConfirm}
        />
        <TransportsActionStore
          {...conflictStoreProps}
          config={config}
        />
        <Remote2RemoteHandlers />
        <TerminalCmdSuggestions {...cmdSuggestionsProps} />
        <TransferQueue />
        <NotificationContainer />
      </div>
    </ConfigProvider>
  )
})
