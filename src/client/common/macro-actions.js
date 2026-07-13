export const openRemoteFilePrefix = '__electerm_open_remote_file__:'

export function encodeOpenRemoteFile (path) {
  return openRemoteFilePrefix + path
}

export function decodeOpenRemoteFile (command = '') {
  return command.startsWith(openRemoteFilePrefix)
    ? command.slice(openRemoteFilePrefix.length)
    : ''
}
