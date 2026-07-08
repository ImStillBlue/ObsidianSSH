const {
  BrowserWindow
} = require('electron')
const { resolve } = require('path')
const {
  isDev, packInfo, iconPath, isMac,
  minWindowWidth, minWindowHeight
} = require('../common/runtime-constants')
const { appName } = require('../common/app-name')
const defaults = require('../common/default-setting')
const {
  getWindowState,
  saveWindowState
} = require('./window-control')
const { onClose } = require('./on-close')
const { initIpc, initAppServer } = require('./ipc')
const { disableShortCuts } = require('./key-bind')
const _ = require('./lodash.js')
const getPort = require('./get-port')
const globalState = require('./glob-state')
const webviewHandler = require('./webview-handler')

exports.createWindow = async function (userConfig) {
  globalState.set('closeAction', 'closeApp')
  globalState.set('requireAuth', !!userConfig.hashedPassword)
  const { width, height, x, y, isMaximized } = await getWindowState()
  const { useSystemTitleBar = defaults.useSystemTitleBar } = userConfig
  const win = new BrowserWindow({
    width,
    height,
    x,
    y,
    show: false,
    fullscreenable: true,
    minWidth: minWindowWidth,
    minHeight: minWindowHeight,
    title: appName,
    frame: useSystemTitleBar,
    transparent: !useSystemTitleBar,
    backgroundColor: '#333333',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      preload: resolve(__dirname, '../preload/preload.js'),
      webviewTag: true,
      devTools: !userConfig.disableDeveloperTool,
      spellcheck: false
    },
    titleBarStyle: useSystemTitleBar ? 'default' : 'hidden',
    icon: process.env.CUSTOM_UI === '1'
      ? resolve(__dirname, '../branding/obsidian.png')
      : iconPath
  })
  // hides the traffic lights
  if (isMac) {
    win.setWindowButtonVisibility(true)
  }

  win.webContents.session.setSpellCheckerDictionaryDownloadURL('https://00.00/')

  webviewHandler.init(win)

  globalState.set('win', win)

  await initAppServer()
  initIpc()
  const port = isDev
    ? process.env.devPort || 5570
    : await getPort()
  const opts = `http://127.0.0.1:${port}/index.html?v=${packInfo.version}`
  // If loading the URL fails (e.g. proxy/firewall interference), show error page
  win.webContents.once('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load app URL:', errorCode, errorDescription)
    const htmlContent = require('./error-page')(port)
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
    win.loadURL(dataUrl)
  })
  win.once('ready-to-show', () => {
    if (isMaximized) {
      win.maximize()
    }
    win.show()
    if (!isMaximized) {
      // some window managers (e.g. KWin) discard the position requested at
      // creation when the window is shown; re-apply it after placement settles
      setTimeout(() => {
        if (!win.isDestroyed() && !win.isMaximized()) {
          win.setBounds({ x, y, width, height })
        }
      }, 150)
    }
  })
  win.loadURL(opts)
  win.webContents.once('dom-ready', () => {
    if (isDev && !userConfig.disableDeveloperTool) {
      win.webContents.openDevTools()
    }
    const saveState = _.debounce(() => saveWindowState(win), 300)
    win.on('resize', saveState)
    win.on('move', saveState)
    win.on('maximize', saveState)
    win.on('unmaximize', saveState)

    win.on('focus', () => {
      win.webContents.send('focused', null)
    })
    win.on('blur', () => {
      win.webContents.send('blur', null)
    })
    disableShortCuts(win)
  })
  win.on('close', () => saveWindowState(win))
  win.on('close', onClose)
}
