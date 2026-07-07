import React, { useRef, useEffect, useState } from 'react'
import {
  ArrowUpOutlined,
  EyeInvisibleFilled,
  EyeFilled,
  ReloadOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
  HomeOutlined,
  PlusOutlined,
  EditOutlined
} from '@ant-design/icons'
import {
  Input,
  Tooltip
} from 'antd'
import {
  typeMap
} from '../../common/constants'
import classnames from 'classnames'
import AddrBookmark from './address-bookmark'
import KeywordFilter from './keyword-filter'

const e = window.translate

function renderAddonBefore (props, realPath) {
  const {
    type,
    host
  } = props
  const isShow = props[`${type}ShowHiddenFile`]
  const title = `${isShow ? e('hide') : e('show')} ${e('hfd')}`
  const Icon = isShow ? EyeFilled : EyeInvisibleFilled
  const keywordProps = {
    keyword: props[`${type}Keyword`],
    type,
    updateKeyword: props.updateKeyword
  }
  return (
    <>
      <Tooltip
        title={title}
        placement='topLeft'
        arrow={{ pointAtCenter: true }}
      >
        <Icon
          type='eye'
          className='mg1r'
          onClick={() => props.toggleShowHiddenFile(type)}
        />
      </Tooltip>
      <Tooltip
        title={e('goParent')}
        arrow={{ pointAtCenter: true }}
        placement='topLeft'
      >
        <ArrowUpOutlined
          onClick={() => props.goParent(type)}
          className='mg1r'
        />
      </Tooltip>
      <HomeOutlined
        onClick={() => props.gotoHome(type)}
        className='mg1r'
      />
      <KeywordFilter {...keywordProps} />
      <AddrBookmark
        store={window.store}
        realPath={realPath}
        host={host}
        type={type}
        className='mg1r'
        onClickHistory={props.onClickHistory}
      />
    </>
  )
}

function renderAddonAfter (isLoadingRemote, onGoto, GoIcon, type, handleUploadFromBrowser) {
  const handleClick = (e) => {
    e.stopPropagation()
    if (!isLoadingRemote) {
      onGoto(type)
    }
  }
  return (
    <>
      {
        type === typeMap.local && window.et.isWebApp
          ? (
            <PlusOutlined
              className='mg1r'
              title={e('uploadFromBrowser')}
              onClick={(e) => {
                e.stopPropagation()
                handleUploadFromBrowser()
              }}
            />
            )
          : null
      }
      <GoIcon
        onClick={handleClick}
      />
    </>
  )
}

function renderHistory (props, type) {
  const currentPath = props[type + 'Path']
  const options = props[type + 'PathHistory']
    .filter(o => o !== currentPath)
  const focused = props[type + 'InputFocus']
  if (!options.length) {
    return null
  }
  const cls = classnames(
    'sftp-history',
    `sftp-history-${type}`,
    { focused }
  )
  return (
    <div
      className={cls}
    >
      {
        options.map(o => {
          return (
            <div
              key={o}
              className='sftp-history-item'
              onClick={() => props.onClickHistory(type, o)}
            >
              {o}
            </div>
          )
        })
      }
    </div>
  )
}

function parseCrumbs (cwd) {
  if (!cwd) {
    return []
  }
  const isWin = /^[a-zA-Z]:[\\/]/.test(cwd)
  if (isWin) {
    const parts = cwd.replace(/\//g, '\\').split('\\').filter(Boolean)
    let acc = ''
    return parts.map((p, i) => {
      acc = i === 0 ? p + '\\' : acc.replace(/\\$/, '') + '\\' + p
      return { label: p, path: acc, root: i === 0 }
    })
  }
  const parts = cwd.split('/').filter(Boolean)
  const crumbs = [{ label: '', path: '/', root: true }]
  let acc = ''
  for (const p of parts) {
    acc += '/' + p
    crumbs.push({ label: p, path: acc, root: false })
  }
  return crumbs
}

function renderBreadcrumbBar (props, type, realPath, extra) {
  const { isLoadingRemote, onGoto, GoIcon, onEdit } = extra
  const crumbs = parseCrumbs(realPath)
  const last = crumbs.length - 1
  return (
    <div className='pd1y sftp-title-wrap'>
      <div className='sftp-title sftp-bc'>
        <span className='sftp-bc-prefix'>
          {renderAddonBefore(props, realPath)}
        </span>
        <div className='sftp-bc-path'>
          {crumbs.map((c, i) => (
            <span className='sftp-bc-seg-wrap' key={c.path}>
              {i > 0 && <span className='sftp-bc-sep'>/</span>}
              <button
                className={i === last ? 'sftp-bc-seg sftp-bc-current' : 'sftp-bc-seg'}
                title={c.path}
                onClick={() => props.onClickHistory(type, c.path)}
              >
                {c.root ? <HomeOutlined /> : c.label}
              </button>
            </span>
          ))}
          <button
            className='sftp-bc-edit'
            title={e('edit')}
            onClick={onEdit}
          >
            <EditOutlined />
          </button>
        </div>
        <span className='sftp-bc-suffix'>
          {renderAddonAfter(isLoadingRemote, onGoto, GoIcon, type, props.handleUploadFromBrowser)}
        </span>
      </div>
    </div>
  )
}

export default function AddressBar (props) {
  const {
    loadingSftp,
    type,
    onGoto
  } = props
  const n = `${type}PathTemp`
  const path = props[n]
  const realPath = props[`${type}Path`]
  const isLoadingRemote = type === typeMap.remote && loadingSftp
  const GoIcon = isLoadingRemote
    ? LoadingOutlined
    : (realPath === path ? ReloadOutlined : ArrowRightOutlined)
  const inputRef = useRef(null)
  const [editing, setEditing] = useState(false)
  const cu = window.et?.customUI

  useEffect(() => {
    const wrapEl = inputRef.current
    if (!wrapEl) return
    const inputEl = wrapEl.querySelector('input')
    if (!inputEl) return
    const handler = () => props.onInputFocus(type)
    inputEl.addEventListener('click', handler)
    return () => {
      inputEl.removeEventListener('click', handler)
    }
  }, [type, editing])

  if (cu && !editing) {
    return renderBreadcrumbBar(props, type, realPath, {
      isLoadingRemote,
      onGoto,
      GoIcon,
      onEdit: () => setEditing(true)
    })
  }

  return (
    <div className='pd1y sftp-title-wrap'>
      <div className='sftp-title' ref={inputRef}>
        <Input
          value={path}
          autoFocus={cu}
          onChange={e => props.onChange(e, n)}
          onPressEnter={e => {
            props.onGoto(type, e)
            if (cu) setEditing(false)
          }}
          prefix={renderAddonBefore(props, realPath)}
          onBlur={() => {
            props.onInputBlur(type)
            if (cu) setEditing(false)
          }}
          disabled={loadingSftp}
          suffix={
            renderAddonAfter(isLoadingRemote, onGoto, GoIcon, type, props.handleUploadFromBrowser)
          }
        />
        {renderHistory(props, type)}
      </div>
    </div>
  )
}
