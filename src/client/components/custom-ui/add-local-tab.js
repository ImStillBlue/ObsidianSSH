import newTerm from '../../common/new-terminal.js'
import { isMac, isWin } from '../../common/constants'

function shellName (config) {
  const executable = isWin
    ? config.execWindows
    : isMac
      ? config.execMac
      : config.execLinux
  return (executable || '')
    .split(/[\\/]/)
    .pop()
    .replace(/\.exe$/i, '')
}

export default function addLocalTab () {
  const { store } = window
  const tab = newTerm()
  tab.title = shellName(store.config) || tab.title
  store.addTab(tab, undefined, 0)
}
