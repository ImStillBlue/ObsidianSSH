/**
 * Custom UI entry point.
 *
 * Loaded instead of electerm.jsx when CUSTOM_UI=1 (see basic.js). Mounts into
 * the same #container node, so it fully replaces the stock electerm interface
 * while keeping the backend/bridge intact.
 */
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css'
import CustomApp from '../components/custom-ui/app.jsx'

const rootElement = createRoot(document.getElementById('container'))
rootElement.render(
  <CustomApp />
)
