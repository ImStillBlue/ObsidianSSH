const { exec } = require('shelljs')
const os = require('os')
const platform = os.platform()
console.log('platform:', platform)
let cmd = platform.startsWith('win')
  ? 'node_modules\\.bin\\cross-env NODE_ENV=development node_modules\\.bin\\electron  -r dotenv/config src\\app\\app'
  : 'node_modules/.bin/cross-env NODE_ENV=development node_modules/.bin/electron -r dotenv/config src/app/app'
// On Wayland sessions the app relaunches itself with --ozone-platform=x11
// (native Wayland can't restore window position), which detaches it from
// this terminal. Pass the flag up front in dev so no relaunch happens.
if (
  platform === 'linux' &&
  process.env.WAYLAND_DISPLAY &&
  process.env.DISPLAY &&
  !process.env.ELECTRON_OZONE_PLATFORM_HINT
) {
  cmd += ' --ozone-platform=x11'
}
exec(cmd)
