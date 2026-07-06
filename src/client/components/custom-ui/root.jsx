/**
 * ObsidianSSH root. Mirrors electerm's main/index.jsx: an ErrorBoundary around
 * the bootstrap, so a crash during store init shows the error page instead of a
 * blank window.
 */
import ErrorBoundary from '../main/error-wrapper'
import CustomBootstrap from './bootstrap.jsx'

export default function CustomRoot () {
  return (
    <ErrorBoundary>
      <CustomBootstrap />
    </ErrorBoundary>
  )
}
