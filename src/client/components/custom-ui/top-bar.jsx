/**
 * Custom UI top bar: drag region + window controls (minimize / maximize / close).
 *
 * The window is frameless + transparent on Linux/Windows (see create-window.js),
 * so the UI must draw its own controls. Backend calls reuse the same bridge the
 * stock UI uses:
 *   window.pre.runGlobalAsync('minimize' | 'maximize' | 'unmaximize')
 *   window.pre.runSync('isMaximized')
 * Dragging on Linux/Mac uses the CSS `-webkit-app-region: drag` region; electerm
 * only falls back to manual windowMove IPC on Windows, so we don't need it here.
 */
import { useState } from 'react'
import { auto } from 'manate/react'

const isMac = window.pre?.platform === 'darwin'

function MinIcon () {
  return (
    <svg width='10' height='10' viewBox='0 0 10 10'>
      <rect x='0' y='4.5' width='10' height='1' fill='currentColor' />
    </svg>
  )
}

function MaxIcon () {
  return (
    <svg width='10' height='10' viewBox='0 0 10 10'>
      <rect x='0.5' y='0.5' width='9' height='9' fill='none' stroke='currentColor' />
    </svg>
  )
}

function RestoreIcon () {
  return (
    <svg width='10' height='10' viewBox='0 0 10 10'>
      <rect x='0.5' y='2.5' width='7' height='7' fill='none' stroke='currentColor' />
      <path d='M2.5 2.5 V0.5 H9.5 V7.5 H7.5' fill='none' stroke='currentColor' />
    </svg>
  )
}

function CloseIcon () {
  return (
    <svg width='10' height='10' viewBox='0 0 10 10'>
      <path d='M0.5 0.5 L9.5 9.5 M9.5 0.5 L0.5 9.5' stroke='currentColor' strokeWidth='1.1' />
    </svg>
  )
}

function BrandMark () {
  return (
    <svg className='cu-brand-mark' viewBox='0 0 24 24' fill='none'>
      <defs>
        <linearGradient id='cu-obs-grad' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#7289da' />
          <stop offset='0.5' stopColor='#5865f2' />
          <stop offset='1' stopColor='#8b5fbf' />
        </linearGradient>
      </defs>
      <path d='M12 1.5 L19.5 8 L15 22.5 L9 22.5 L4.5 8 Z' fill='url(#cu-obs-grad)' />
      <path
        d='M12 1.5 L12 22.5 M4.5 8 L12 11 L19.5 8 M9 22.5 L12 11 L15 22.5'
        stroke='rgba(255, 255, 255, 0.28)'
        strokeWidth='0.6'
        fill='none'
      />
    </svg>
  )
}

export default auto(function TopBar () {
  const [maximized, setMaximized] = useState(() => {
    try {
      return !!window.pre?.runSync('isMaximized')
    } catch (e) {
      return false
    }
  })

  const minimize = () => window.pre.runGlobalAsync('minimize')
  const close = () => window.store.exit()
  const toggleMax = () => {
    if (maximized) {
      window.pre.runGlobalAsync('unmaximize')
      setMaximized(false)
    } else {
      window.pre.runGlobalAsync('maximize')
      setMaximized(true)
    }
  }

  const controls = isMac
    ? null
    : (
      <div className='cu-window-controls'>
        <button className='cu-wc' onClick={minimize} title='Minimize'>
          <MinIcon />
        </button>
        <button className='cu-wc' onClick={toggleMax} title={maximized ? 'Restore' : 'Maximize'}>
          {maximized ? <RestoreIcon /> : <MaxIcon />}
        </button>
        <button className='cu-wc cu-wc-close' onClick={close} title='Close'>
          <CloseIcon />
        </button>
      </div>
      )

  return (
    <div className='cu-topbar'>
      <div className='cu-brand'>
        <BrandMark />
        <span className='cu-brand-name'>
          <span className='obs'>Obsidian</span><span className='ssh'>SSH</span>
        </span>
        <span className='cu-brand-version' title='version / build commit'>
          v{window.et.version.split('-')[0]}{window.et.commit ? ` (${window.et.commit})` : ''}
        </span>
      </div>
      {controls}
    </div>
  )
})
