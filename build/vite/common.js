import { config as conf } from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createRequire } from 'module'

conf()

const require = createRequire(import.meta.url)

export const cwd = process.cwd()
export const env = process.env
export const isProd = env.NODE_ENV === 'production'
const packPath = resolve(cwd, '../../package.json')
export const pack = JSON.parse(readFileSync(packPath).toString())
export const version = pack.version
// Shared with the Electron main process (src/app/common/app-name.js).
export const { appName } = require('../../src/app/common/app-name.js')
export const viewPath = resolve(cwd, '../../src/client/views')
export const staticPaths = [
  {
    dir: resolve(cwd, '../../src/app/branding'),
    path: '/images'
  },
  {
    dir: resolve(cwd, '../../node_modules/electerm-icons/icons'),
    path: '/icons'
  },
  {
    dir: resolve(cwd, '../../node_modules/@electerm/electerm-resource/tray-icons'),
    path: '/images'
  },
  {
    dir: resolve(cwd, '../../node_modules/@electerm/electerm-resource/res/imgs'),
    path: '/images'
  },
  {
    dir: resolve(cwd, '../../src/client/entry'),
    path: '/'
  }
]
