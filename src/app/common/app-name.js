/**
 * Single source of truth for the UI-visible product name — the string shown in
 * the OS window title / taskbar, the tray notification, the macOS app menu and
 * the HTML <title>. Consumed by the Electron main process (create-window, ipc,
 * init-app, menu) and by the build scripts that render index.pug (pug.js,
 * common.js -> dev-server.js).
 *
 * This is DISPLAY-ONLY. The backend identity is intentionally left as
 * packInfo.name ('electerm'): the Electron app name still drives the userData
 * dir (~/.config/electerm), the single-instance socket, the electerm:// deep
 * link protocol and the electerm-* asset paths, so nothing backend-facing
 * changes and the custom skin keeps sharing the stock config.
 *
 * Gated on CUSTOM_UI so the stock electerm build is untouched, matching the
 * existing icon/bundle branding toggle (create-window.js, pug.js, dev-server.js).
 */
const isCustomUI = require('./custom-ui-flag')
const appName = isCustomUI ? 'ObsidianSSH' : 'electerm'

module.exports = { appName }
