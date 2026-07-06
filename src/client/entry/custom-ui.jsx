/**
 * Custom UI entry point.
 *
 * Loaded instead of electerm.jsx when CUSTOM_UI=1 (see basic.js). Mounts into
 * the same #container node, so it fully replaces the stock electerm interface
 * while keeping the backend/bridge intact.
 */
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css'
import '@fontsource/maple-mono/index.css'
import store from '../store'
import '../common/fs.js'
import CustomRoot from '../components/custom-ui/root.jsx'

// Load-bearing: electerm's terminal/sftp/quick-command tree reads window.store.
window.store = store

const rootElement = createRoot(document.getElementById('container'))
rootElement.render(
  <CustomRoot />
)
