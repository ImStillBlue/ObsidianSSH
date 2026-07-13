import { Component } from 'manate/react/class-components'
import { refsStatic, refs } from '../common/ref'
import SuggestionItem from './cmd-item'
import classnames from 'classnames'

export default class TerminalCmdSuggestions extends Component {
  state = {
    cursorPosition: {},
    showSuggestions: false,
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
    document.removeEventListener('click', this.handleClickOutside)
    document.removeEventListener('keydown', this.handleKeyDown, true)
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
    this._suggestionsCache = null
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
    this._suggestionsCache = null
    this.setState({
      showSuggestions: false,
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

  handlePasswordKeyDown = (event, suggestions) => {
    const len = suggestions.length

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

  handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      this.closeSuggestions()
      return
    }

    const { passwordMode } = this.state
    if (passwordMode) {
      return this.handlePasswordKeyDown(event, this.getPasswordSuggestions())
    }

    const suggestions = this.getSuggestions()
    if (!suggestions.length) {
      // Nothing to pick from: leave every key (including Tab) to the shell
      return
    }

    if (event.key === 'Tab') {
      // Tab cycles through matching suggestions, inserting each one
      event.preventDefault()
      event.stopPropagation()
      this.cycleSuggestion(event.shiftKey ? -1 : 1, suggestions)
      return
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      // Arrows belong to the shell (history cycling): close the
      // dropdown and let the event through untouched
      this.closeSuggestions()
    }
  }

  cycleSuggestion = (dir, suggestions) => {
    const len = suggestions.length
    let idx = this.state.selectedIndex + dir
    if (idx >= len) {
      idx = 0
    }
    if (idx < 0) {
      idx = len - 1
    }
    this.insertSuggestion(suggestions[idx])
    this.setState({
      selectedIndex: idx
    }, this.scrollSelectedIntoView)
  }

  insertSuggestion = (item) => {
    const { activeTabId } = window.store
    const terminal = refs.get('term-' + activeTabId)
    if (!terminal) {
      return false
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
    return true
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

    this.insertSuggestion(item)
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
            // Use stable key to avoid React re-mounting items on every render
            id: type + ':' + command,
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
          id: 'PW:' + b.password,
          command: b.password,
          type: 'PW',
          hint: [b.username, [b.host, b.port].filter(Boolean).join(':')].filter(Boolean).join('@')
        })
      }
    }
    return this.state.reverse ? res.reverse() : res
  }

  _suggestionsCache = null
  _suggestionsCacheKey = ''

  getSuggestions = () => {
    // Memoize: only recompute when cmd, reverse, or props change
    const { cmd, reverse } = this.state
    const { suggestions } = this.props
    const cacheKey = cmd + '|' + reverse + '|' + (suggestions?.history?.length || 0) + '|' + (suggestions?.batch?.length || 0) + '|' + (suggestions?.quick?.length || 0)
    if (this._suggestionsCache && this._suggestionsCacheKey === cacheKey) {
      return this._suggestionsCache
    }
    const uniqueCommands = new Set()
    const {
      history = [],
      batch = [],
      quick = []
    } = suggestions || {}
    const res = []
    this.processCommands(history, 'H', uniqueCommands, res)
    this.processCommands(batch, 'B', uniqueCommands, res)
    this.processCommands(quick, 'Q', uniqueCommands, res)
    const finalRes = reverse ? res.reverse() : res
    this._suggestionsCache = finalRes
    this._suggestionsCacheKey = cacheKey
    return finalRes
  }

  getGhostText (suggestions) {
    const { rawCursorPosition, passwordMode, cmd, selectedIndex } = this.state
    if (!rawCursorPosition || passwordMode || !cmd) return null
    // Once the user starts cycling with Tab the suggestion is already
    // inserted into the terminal, so a ghost preview would be stale
    if (selectedIndex >= 0) return null
    const top = suggestions[0]
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

  render () {
    const { showSuggestions, cursorPosition, reverse, passwordMode } = this.state
    if (!showSuggestions) {
      return null
    }
    const suggestions = passwordMode
      ? this.getPasswordSuggestions()
      : this.getSuggestions()
    if (!suggestions.length) {
      return null
    }
    const ghostText = passwordMode ? null : this.getGhostText(suggestions)
    const cls = classnames('terminal-suggestions-wrap', {
      reverse
    })
    return (
      <>
        {this.renderGhostText(ghostText)}
        <div className={cls} style={cursorPosition}>
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
        </div>
      </>
    )
  }
}
