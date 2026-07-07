import { Component } from 'manate/react/class-components'
import { refsStatic, refs } from '../common/ref'
import SuggestionItem from './cmd-item'
import { aiSuggestionsCache } from '../../common/cache'
import uid from '../../common/uid'
import classnames from 'classnames'
import {
  LoadingOutlined
} from '@ant-design/icons'

export default class TerminalCmdSuggestions extends Component {
  state = {
    cursorPosition: {},
    showSuggestions: false,
    loadingAiSuggestions: false,
    aiSuggestions: [],
    cmdIsDescription: false,
    reverse: false,
    cmd: '',
    passwordMode: false,
    selectedIndex: -1,
    rawCursorPosition: null
  }

  componentDidMount () {
    refsStatic.add('terminal-suggestions', this)
  }

  componentWillUnmount () {
    refsStatic.remove('terminal-suggestions')
  }

  parseAiSuggestions = (aiResponse) => {
    try {
      return JSON.parse(aiResponse.response).map(d => {
        return {
          command: d,
          type: 'AI'
        }
      })
    } catch (e) {
      console.log('parseAiSuggestions error:', e)
      return []
    }
  }

  getAiSuggestions = async (event) => {
    event.stopPropagation()
    const { cmd } = this.state
    if (window.store.aiConfigMissing()) {
      window.store.toggleAIConfig()
    }
    this.setState({
      loadingAiSuggestions: true
    })
    const {
      config
    } = window.store
    const prompt = `give me max 5 command suggestions for user input: "${cmd}", return pure json format result only, no extra words, no markdown format, follow this format: ["command1","command2"...]`
    const cached = aiSuggestionsCache.get(cmd)
    if (cached) {
      this.setState({
        loadingAiSuggestions: false,
        aiSuggestions: cached
      })
      return
    }

    const aiResponse = aiSuggestionsCache.get(prompt) || await window.pre.runGlobalAsync(
      'AIchat',
      prompt,
      config.modelAI,
      config.roleAI,
      config.baseURLAI,
      config.apiPathAI,
      config.apiKeyAI,
      false,
      config.authHeaderNameAI
    ).catch(
      window.store.onError
    )
    if (cmd !== this.state.cmd) {
      this.setState({
        loadingAiSuggestions: false
      })
      return
    }
    if (aiResponse && aiResponse.error) {
      this.setState({
        loadingAiSuggestions: false
      })
      return window.store.onError(
        new Error(aiResponse.error)
      )
    }
    this.setState({
      loadingAiSuggestions: false,
      aiSuggestions: this.parseAiSuggestions(aiResponse, cmd)
    })
  }

  openSuggestions = (cursorPosition, cmd) => {
    if (this.state.passwordMode) {
      return
    }
    if (!this.state.showSuggestions) {
      document.addEventListener('click', this.handleClickOutside)
      document.addEventListener('keydown', this.handleKeyDown, true)
    }

    const {
      left,
      top,
      cellHeight
    } = cursorPosition
    const w = window.innerWidth
    const h = window.innerHeight

    const position = {}
    const reverse = top > h / 2

    // Use right position if close to right edge
    if (left > w / 2) {
      position.right = w - left
    } else {
      position.left = left
    }

    // Use bottom position if close to bottom edge
    if (reverse) {
      position.bottom = h - top + cellHeight * 1.5
    } else {
      position.top = top + cellHeight
    }
    this.setState({
      showSuggestions: true,
      cursorPosition: position,
      cmd,
      reverse,
      passwordMode: false,
      selectedIndex: -1,
      rawCursorPosition: { left, top, cellHeight }
    })
  }

  openPasswordSuggestions = (cursorPosition) => {
    if (!this.state.showSuggestions) {
      document.addEventListener('click', this.handleClickOutside)
      document.addEventListener('keydown', this.handleKeyDown, true)
    }

    const {
      left,
      top,
      cellHeight
    } = cursorPosition
    const w = window.innerWidth
    const h = window.innerHeight

    const position = {}
    const reverse = top > h / 2

    if (left > w / 2) {
      position.right = w - left
    } else {
      position.left = left
    }

    if (reverse) {
      position.bottom = h - top + cellHeight * 1.5
    } else {
      position.top = top + cellHeight
    }
    this.setState({
      showSuggestions: true,
      cursorPosition: position,
      cmd: '',
      reverse,
      passwordMode: true
    })
  }

  closeSuggestions = () => {
    document.removeEventListener('click', this.handleClickOutside)
    document.removeEventListener('keydown', this.handleKeyDown, true)
    const {
      aiSuggestions
    } = this.state
    if (aiSuggestions.length) {
      aiSuggestionsCache.set(this.state.cmd, aiSuggestions)
      aiSuggestions.forEach(item => {
        window.store.addCmdHistory(item.command, 'aiCmdHistory')
      })
    }
    this.setState({
      showSuggestions: false,
      aiSuggestions: [],
      passwordMode: false,
      selectedIndex: -1,
      rawCursorPosition: null
    })
  }

  handleClickOutside = (event) => {
    const suggestionElement = document.querySelector('.terminal-suggestions-wrap')
    if (suggestionElement && !suggestionElement.contains(event.target)) {
      this.closeSuggestions()
    }
  }

  scrollSelectedIntoView = () => {
    const el = document.querySelector('.suggestion-item.selected')
    if (el) {
      el.scrollIntoView({ block: 'nearest' })
    }
  }

  handleKeyDown = (event) => {
    const { passwordMode } = this.state
    const suggestions = passwordMode ? this.getPasswordSuggestions() : this.getSuggestions()
    const len = suggestions.length

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      this.closeSuggestions()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      this.setState(prev => ({
        selectedIndex: prev.selectedIndex < len - 1 ? prev.selectedIndex + 1 : 0
      }), this.scrollSelectedIntoView)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      this.setState(prev => ({
        selectedIndex: prev.selectedIndex > 0 ? prev.selectedIndex - 1 : len - 1
      }), this.scrollSelectedIntoView)
      return
    }

    if (event.key === 'Tab') {
      event.preventDefault()
      event.stopPropagation()
      const idx = this.state.selectedIndex >= 0 ? this.state.selectedIndex : 0
      if (suggestions[idx]) {
        this.handleSelect(suggestions[idx])
      }
    }
  }

  handleDelete = (item) => {
    window.store.deleteCmdHistory(item.command)
  }

  handleSelect = (item) => {
    const { activeTabId } = window.store
    const terminal = refs.get('term-' + activeTabId)
    if (!terminal) {
      console.log('No active terminal found')
      this.closeSuggestions()
      return
    }

    if (item.type === 'PW') {
      try {
        // Send password + Enter directly, no backspace needed
        terminal.attachAddon._sendData(item.command + '\r')
        terminal.attachAddon._passwordPromptDetected = false
        terminal.attachAddon._lastOutputLine = ''
      } catch (e) {
        console.error('Failed to send password:', e)
      }
      terminal.term.focus()
      this.closeSuggestions()
      return
    }

    const { command } = item
    // Read current input from buffer directly to avoid stale state
    // (onData fires before echo, so this.state.cmd may lag behind)
    const currentInput = terminal.getCurrentInput() || ''
    let txt = ''
    if (currentInput && command.startsWith(currentInput)) {
      txt = command.slice(currentInput.length)
    } else {
      const pre = '\b'.repeat(currentInput.length)
      txt = pre + command
    }
    terminal.attachAddon._sendData(txt)
    // Update the terminal's currentInput to reflect the full command
    terminal.setCurrentInput(command)
    terminal.term.focus()
    this.closeSuggestions()
  }

  processCommands = (commands = [], type, uniqueCommands, res) => {
    const { cmd } = this.state
    commands
      .filter(command => command && command.startsWith(cmd))
      .forEach(command => {
        if (!uniqueCommands.has(command)) {
          uniqueCommands.add(command)
          res.push({
            id: uid(),
            command,
            type
          })
        }
      })
  }

  getPasswordSuggestions = () => {
    const bookmarks = window.store.bookmarks || []
    const seen = new Set()
    const res = []
    for (const b of bookmarks) {
      if (b.password && !seen.has(b.password)) {
        seen.add(b.password)
        res.push({
          id: uid(),
          command: b.password,
          type: 'PW',
          hint: [b.username, [b.host, b.port].filter(Boolean).join(':')].filter(Boolean).join('@')
        })
      }
    }
    return this.state.reverse ? res.reverse() : res
  }

  getSuggestions = () => {
    const uniqueCommands = new Set()
    const {
      history = [],
      batch = [],
      quick = []
    } = this.props.suggestions || {}
    const res = []
    this.state.aiSuggestions
      .forEach(item => {
        if (!uniqueCommands.has(item.command)) {
          uniqueCommands.add(item.command)
        }
        res.push({
          id: uid(),
          ...item
        })
      })
    this.processCommands(history, 'H', uniqueCommands, res)
    this.processCommands(batch, 'B', uniqueCommands, res)
    this.processCommands(quick, 'Q', uniqueCommands, res)
    return this.state.reverse ? res.reverse() : res
  }

  getGhostText () {
    const { rawCursorPosition, passwordMode, cmd, selectedIndex } = this.state
    if (!rawCursorPosition || passwordMode || !cmd) return null
    const suggestions = this.getSuggestions()
    const idx = selectedIndex >= 0 ? selectedIndex : 0
    const top = suggestions[idx]
    if (!top || !top.command.startsWith(cmd)) return null
    return top.command.slice(cmd.length)
  }

  renderGhostText (ghostText) {
    const { rawCursorPosition } = this.state
    if (!ghostText || !rawCursorPosition) return null
    const { left, top, cellHeight } = rawCursorPosition
    const config = window.store?.config || {}
    const style = {
      position: 'fixed',
      left,
      top: top - cellHeight,
      height: cellHeight,
      lineHeight: cellHeight + 'px',
      fontSize: (config.fontSize || 14) + 'px',
      fontFamily: config.fontFamily || 'monospace',
      letterSpacing: (config.letterSpacing || 0) + 'px',
      pointerEvents: 'none',
      color: 'rgba(180,180,200,0.4)',
      whiteSpace: 'pre',
      zIndex: 99
    }
    return <div className='terminal-ghost-text' style={style}>{ghostText}</div>
  }

  renderAIIcon () {
    const e = window.translate
    const {
      loadingAiSuggestions
    } = this.state
    if (loadingAiSuggestions) {
      return (
        <>
          <LoadingOutlined /> {e('getAiSuggestions')}
        </>
      )
    }
    const aiProps = {
      onClick: this.getAiSuggestions,
      className: 'pointer'
    }
    return (
      <div {...aiProps}>
        {e('getAiSuggestions')}
      </div>
    )
  }

  renderSticky (pos) {
    const {
      reverse
    } = this.state
    if (
      (pos === 'top' && !reverse) ||
      (pos === 'bottom' && reverse)
    ) {
      return null
    }
    return (
      <div className='terminal-suggestions-sticky'>
        {this.renderAIIcon()}
      </div>
    )
  }

  render () {
    const { showSuggestions, cursorPosition, reverse, passwordMode } = this.state
    const ghostText = this.getGhostText()
    if (!showSuggestions) {
      return this.renderGhostText(ghostText)
    }
    const suggestions = passwordMode
      ? this.getPasswordSuggestions()
      : this.getSuggestions()
    const cls = classnames('terminal-suggestions-wrap', {
      reverse
    })
    return (
      <>
        {this.renderGhostText(ghostText)}
        <div className={cls} style={cursorPosition}>
          {!passwordMode && this.renderSticky('top')}
          <div className='terminal-suggestions-list'>
            {
              suggestions.map((item, index) => {
                return (
                  <SuggestionItem
                    key={item.id}
                    item={item}
                    onSelect={this.handleSelect}
                    onDelete={this.handleDelete}
                    selected={index === this.state.selectedIndex}
                  />
                )
              })
            }
          </div>
          {!passwordMode && this.renderSticky('bottom')}
        </div>
      </>
    )
  }
}
