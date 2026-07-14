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

export function startNativeFileDrag (paths, origins) {
  window.api.startFileDrag({ files: paths, origins })
}

export async function resolveNativeDragOrigins (paths) {
  if (!paths.length || !window.api?.resolveFileDragOrigins) return null
  return window.api.resolveFileDragOrigins(paths)
}
