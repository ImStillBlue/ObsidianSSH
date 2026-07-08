/**
 * Safe storage wrapper using Electron's safeStorage API.
 * Provides OS-level encryption:
 *   - macOS:   Keychain
 *   - Windows: DPAPI (Data Protection API, bound to current user account)
 *   - Linux:   libsecret / gnome-keyring / kwallet (falls back to an internal key)
 *
 * Encrypted values are stored as base64 strings prefixed with SAFE_PREFIX so
 * they can be distinguished from plain-text or legacy-encrypted values.
 */

const SAFE_PREFIX = 'v2:safe:'

let _ss = null
let _available = null

function getSS () {
  if (_ss === null) {
    try {
      const { safeStorage } = require('electron')
      _ss = safeStorage
    } catch (_) {
      _ss = undefined
    }
  }
  return _ss
}

// isEncryptionAvailable probes the OS keyring (kwallet/libsecret) over dbus.
// Check once and warn once, instead of letting every encrypt/decrypt call
// throw and spam the console when the keyring service is disabled.
function encryptionAvailable () {
  const ss = getSS()
  if (!ss) return false
  if (_available === null) {
    try {
      _available = ss.isEncryptionAvailable()
    } catch (_) {
      _available = false
    }
    if (!_available) {
      const backend = ss.getSelectedStorageBackend
        ? ss.getSelectedStorageBackend()
        : 'unknown'
      console.warn(
        `[safe-storage] OS keyring not available (backend: ${backend}). ` +
        'Is the keyring service (KWallet/gnome-keyring) enabled and running? ' +
        'Encrypted data cannot be read and new data is stored unencrypted until it is.'
      )
    }
  }
  return _available
}

/**
 * Encrypt a string using the OS-level secure storage.
 * Returns the original string unchanged when safeStorage is unavailable.
 * @param {string} str
 * @returns {string}
 */
exports.safeEncrypt = function (str) {
  if (typeof str !== 'string' || !str) return str
  if (!encryptionAvailable()) return str
  try {
    const buf = getSS().encryptString(str)
    return SAFE_PREFIX + buf.toString('base64')
  } catch (e) {
    console.error('[safe-storage] encrypt error:', e.message)
    return str
  }
}

/**
 * Decrypt a string that was encrypted with safeEncrypt.
 * Returns the original string unchanged when it was not produced by safeEncrypt.
 * Returns null when the value is encrypted but decryption is unavailable, so
 * callers can tell "cannot read" apart from "plain text".
 * @param {string} str
 * @returns {string|null}
 */
exports.safeDecrypt = function (str) {
  if (typeof str !== 'string' || !str) return str
  if (!str.startsWith(SAFE_PREFIX)) return str
  if (!encryptionAvailable()) return null
  try {
    const base64 = str.slice(SAFE_PREFIX.length)
    const buf = Buffer.from(base64, 'base64')
    return getSS().decryptString(buf)
  } catch (e) {
    console.error('[safe-storage] decrypt error:', e.message)
    return null
  }
}
