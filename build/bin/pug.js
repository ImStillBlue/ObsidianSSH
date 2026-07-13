// build html
/**
 * build common files with react module in it
 */
const fs = require('fs')
const pug = require('pug')
const { resolve } = require('path')
const { execSync } = require('child_process')
const pack = require('../../package.json')
const deepCopy = require('json-deep-copy')
const { appName } = require('../../src/app/common/app-name')

// Bake the git commit into the page so the About dialog can show
// exactly which commit a build came from. Empty outside a git checkout
// (e.g. building from a release tarball).
let commit = ''
try {
  commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
} catch (e) {}

const entryPug = resolve(
  __dirname,
  '../../src/client/views/index.pug'
)
const targetFilePath = resolve(
  __dirname,
  '../../work/app/assets/index.html'
)
const pugContent = fs.readFileSync(entryPug, 'utf-8')
const defaultAIPreset = {
  baseURLAI: 'https://ai.electerm.org/api/ai',
  apiPathAI: '/chat/completions',
  modelAI: 'mistral-small-latest',
  authHeaderNameAI: 'Authorization: Bearer',
  id: 'ai.electerm.org',
  nameAI: 'ai.electerm.org(default free)'
}

const data = {
  version: pack.version,
  commit,
  siteName: appName,
  isDev: false,
  customUI: process.env.CUSTOM_UI !== '0',
  defaultAIPreset
}
const htmlContent = pug.render(pugContent, {
  filename: entryPug,
  ...data,
  _global: deepCopy(data)
})
fs.writeFileSync(targetFilePath, htmlContent, 'utf8')
