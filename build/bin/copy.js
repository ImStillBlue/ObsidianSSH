const { resolve } = require('path')
const { cp, mkdir, rm, test } = require('shelljs')
const from = resolve(
  __dirname,
  '../../node_modules/@electerm/electerm-resource/tray-icons/*'
)
const from0 = resolve(
  __dirname,
  '../../node_modules/electerm-icons/icons'
)
const obsidianLogo = resolve(
  __dirname,
  '../../src/app/branding/obsidian-256.png'
)
// packaged runtime-constants iconPath (window + drag icon) expects this
// exact file under assets/images
const roundIcon = resolve(
  __dirname,
  '../../node_modules/@electerm/electerm-resource/res/imgs/electerm-round-128x128.png'
)
const to1 = resolve(
  __dirname,
  '../../work/app/assets/images/'
)
const to2 = resolve(
  __dirname,
  '../../work/app/assets/icons'
)
// a previous cp into the missing images dir leaves a stray file named
// "images"; clear it and make sure the real directory exists, otherwise
// tray/drag icons silently never reach the packaged app
if (test('-f', to1.replace(/\/$/, ''))) {
  rm(to1.replace(/\/$/, ''))
}
mkdir('-p', to1)

const arr = [
  {
    from,
    to: to1,
    file: true
  }, {
    from: obsidianLogo,
    to: to1,
    file: true
  }, {
    from: roundIcon,
    to: to1,
    file: true
  }, {
    from: from0,
    to: to2
  }
]

for (const obj of arr) {
  const {
    file, from, to
  } = obj
  if (file) {
    cp(from, to)
  } else {
    cp('-r', from, to)
  }
}
