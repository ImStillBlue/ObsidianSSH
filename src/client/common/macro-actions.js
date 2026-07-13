export const openRemoteFilePrefix = '__electerm_open_remote_file__:'
export const changeDirectoryPrefix = '__electerm_change_directory__:'

export function encodeOpenRemoteFile (path) {
  return openRemoteFilePrefix + path
}

export function decodeOpenRemoteFile (command = '') {
  return command.startsWith(openRemoteFilePrefix)
    ? command.slice(openRemoteFilePrefix.length)
    : ''
}

export function encodeChangeDirectory (path) {
  return changeDirectoryPrefix + path
}

export function decodeChangeDirectory (command = '') {
  return command.startsWith(changeDirectoryPrefix)
    ? command.slice(changeDirectoryPrefix.length)
    : ''
}
