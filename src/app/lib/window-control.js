/**
 * manage window state (bounds + maximized) save/restore
 */

const lastStateManager = require('./last-state')
const {
  minWindowWidth,
  minWindowHeight
} = require('../common/runtime-constants')
const globalState = require('./glob-state')

const WINDOW_STATE_KEY = 'windowState'

exports.getScreenCurrent = () => {
  const rect = globalState.get('win')
    ? globalState.get('win').getBounds()
    : {
        x: 0,
        y: 0,
        height: minWindowHeight,
        width: minWindowWidth
      }
  const { screen } = require('electron')
  return screen.getDisplayMatching(rect)
}

exports.getScreenSize = () => {
  const screen = exports.getScreenCurrent()
  return {
    ...screen.workAreaSize,
    x: screen.workArea.x,
    y: screen.workArea.y
  }
}

exports.maximize = () => {
  globalState.get('win').maximize()
}

exports.unmaximize = () => {
  globalState.get('win').unmaximize()
}

// A saved position is only reusable if it is still visible on some
// currently-connected display (monitors get unplugged, resolutions change)
function boundsVisibleOnSomeDisplay (bounds) {
  const { screen } = require('electron')
  return screen.getAllDisplays().some(display => {
    const area = display.workArea
    // require a reasonable overlap, not just a 1px touch
    const overlapW = Math.min(bounds.x + bounds.width, area.x + area.width) -
      Math.max(bounds.x, area.x)
    const overlapH = Math.min(bounds.y + bounds.height, area.y + area.height) -
      Math.max(bounds.y, area.y)
    return overlapW >= 100 && overlapH >= 100
  })
}

function defaultWindowState () {
  const { screen } = require('electron')
  const { workArea } = screen.getPrimaryDisplay()
  const width = Math.min(1440, workArea.width)
  const height = Math.min(900, workArea.height)
  return {
    width,
    height,
    x: workArea.x + Math.floor((workArea.width - width) / 2),
    y: workArea.y + Math.floor((workArea.height - height) / 2),
    isMaximized: false
  }
}

exports.getWindowState = async () => {
  const saved = await lastStateManager.get(WINDOW_STATE_KEY)
  if (
    !saved ||
    typeof saved.width !== 'number' ||
    typeof saved.height !== 'number' ||
    typeof saved.x !== 'number' ||
    typeof saved.y !== 'number'
  ) {
    return defaultWindowState()
  }
  const state = {
    width: Math.max(minWindowWidth, Math.round(saved.width)),
    height: Math.max(minWindowHeight, Math.round(saved.height)),
    x: Math.round(saved.x),
    y: Math.round(saved.y),
    isMaximized: !!saved.isMaximized
  }
  if (!boundsVisibleOnSomeDisplay(state)) {
    const def = defaultWindowState()
    def.isMaximized = state.isMaximized
    return def
  }
  return state
}

exports.saveWindowState = (win) => {
  if (!win || win.isDestroyed() || win.isMinimized() || win.isFullScreen()) {
    return
  }
  // getNormalBounds returns the un-maximized bounds even while maximized,
  // so restoring from maximized keeps the previous normal size too
  const bounds = win.getNormalBounds()
  return lastStateManager.set(WINDOW_STATE_KEY, {
    ...bounds,
    isMaximized: win.isMaximized()
  })
}
