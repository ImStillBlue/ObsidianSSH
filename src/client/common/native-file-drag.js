const remoteDragCache = new Map()
const cacheTtl = 30 * 60 * 1000

function expireEntry (key, entry) {
  setTimeout(() => {
    if (remoteDragCache.get(key) !== entry) return
    remoteDragCache.delete(key)
    if (entry.cleanupRoot) {
      window.fs.rmrf(entry.cleanupRoot).catch(console.log)
    }
  }, cacheTtl)
}

export function getRemoteDragCacheKey (files, tabId) {
  return `${tabId}:` + files.map(file => [
    file.path,
    file.name,
    file.size,
    file.modifyTime || '',
    file.isDirectory ? 'd' : 'f'
  ].join(':')).join('|')
}

// Read-only peek: lets dragstart check for already-staged files without
// kicking off a download for what may be a purely internal drag
export function getPreparedRemoteDrag (key) {
  const cached = remoteDragCache.get(key)
  return cached?.status === 'ready' ? cached : null
}

export function prepareRemoteNativeDrag (key, stage) {
  const cached = remoteDragCache.get(key)
  if (cached && cached.status !== 'error') {
    return cached
  }
  const entry = {
    status: 'pending',
    paths: [],
    progress: null,
    progressListeners: new Set()
  }
  entry.subscribeProgress = listener => {
    entry.progressListeners.add(listener)
    if (entry.progress) listener(entry.progress)
    return () => entry.progressListeners.delete(listener)
  }
  entry.promise = stage(progress => {
    entry.progress = progress
    entry.progressListeners.forEach(listener => listener(progress))
  })
    .then(result => {
      entry.status = 'ready'
      entry.paths = result.paths
      entry.cleanupRoot = result.cleanupRoot
      entry.progressListeners.clear()
      expireEntry(key, entry)
      return entry.paths
    })
    .catch(error => {
      entry.status = 'error'
      entry.error = error
      entry.progressListeners.clear()
      remoteDragCache.delete(key)
      throw error
    })
  entry.promise.catch(() => {})
  remoteDragCache.set(key, entry)
  return entry
}

// Attach dropped-file data that external apps understand. Qt/GTK file
// managers consume text/uri-list; Electron's startDrag is rejected by the
// XWayland bridge on Linux (forbidden-drop cursor), so the uri-list rides
// along the normal HTML5 drag there instead. Internal drops are unaffected:
// they read the fromFile payload first.
export function attachNativeDragPayload (dataTransfer, paths, fileName) {
  const fileUrls = paths.map(window.api.pathToFileUrl)
  const uriList = fileUrls.join('\r\n')
  // copyMove keeps internal same-pane move drops working while still
  // offering external targets a copy
  dataTransfer.effectAllowed = 'copyMove'
  dataTransfer.setData('text/uri-list', uriList)
  dataTransfer.setData('text/plain', uriList)
  if (fileUrls.length === 1 && fileName) {
    dataTransfer.setData(
      'DownloadURL',
      `application/octet-stream:${fileName}:${fileUrls[0]}`
    )
  }
}
