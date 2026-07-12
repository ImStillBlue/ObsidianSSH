import {
  Button,
  Switch,
  Form,
  Select,
  Input
} from 'antd'
import message from '../common/message'
import { useState } from 'react'
import generate from '../../common/uid'
import InputAutoFocus from '../common/input-auto-focus'
import renderQm from './quick-commands-list-form'
import ShortcutEdit from '../shortcuts/shortcut-editor'
import { getKeysTakenData } from '../shortcuts/shortcut-utils'
import deepCopy from 'json-deep-copy'
import templates from './templates'
import HelpIcon from '../common/help-icon'
import { PlusOutlined } from '@ant-design/icons'

const FormItem = Form.Item
const { Option } = Select
const e = window.translate

export default function QuickCommandForm (props) {
  const [form] = Form.useForm()
  const { store, formData } = props
  const { quickCommandTags = [] } = store
  const [shortcut, setShortcut] = useState(formData.shortcut || '')
  const [newFolder, setNewFolder] = useState('')
  const uid = formData.id || generate()
  const updateConfig = (name, value) => {
    form.setFieldsValue({
      shortcut: value
    })
    setShortcut(value)
  }
  const handleClear = () => {
    form.setFieldsValue({
      shortcut: ''
    })
    setShortcut('')
  }
  const getKeysTaken = () => {
    const keysTaken = getKeysTakenData()

    // Exclude current shortcut if editing existing command
    if (formData.shortcut) {
      delete keysTaken[formData.shortcut]
    }

    return keysTaken
  }

  async function handleSubmit (res) {
    const { formData } = props
    const {
      name,
      commands,
      inputOnly,
      labels,
      startDirectory,
      shortcut
    } = res
    const update = deepCopy({
      name,
      commands,
      inputOnly,
      labels,
      startDirectory,
      shortcut
    })
    const update1 = {
      ...update,
      id: uid
    }
    if (formData.id) {
      store.editQuickCommand(formData.id, update)
    } else {
      store.addQuickCommand(update1)
      store.setSettingItem({
        id: '',
        name: e('newQuickCommand')
      })
    }
    message.success(e('saved'))
  }
  const initialValues = formData
  if (!initialValues.labels) {
    initialValues.labels = []
  }
  if (!initialValues.commands) {
    initialValues.commands = [{
      command: initialValues.command || '',
      id: generate(),
      delay: 100
    }]
  }
  const editorProps = {
    data: {
      name: uid,
      shortcut
    },
    keysTaken: getKeysTaken(),
    store,
    updateConfig,
    handleClear,
    renderClear: true
  }
  const templatesStr = templates.map(t => {
    return `{{${t}}}`
  }).join(', ')
  const wiki = 'https://github.com/electerm/electerm/wiki/quick-command-templates'
  const createFolder = () => {
    const folder = newFolder.trim()
    if (!folder) return
    const selected = form.getFieldValue('labels') || []
    form.setFieldValue('labels', [...new Set([...selected, folder])])
    setNewFolder('')
  }
  return (
    <div className='macro-editor'>
      <div className='macro-editor-header'>
        <div>
          <h2>{formData.id ? 'Edit macro' : 'Create a macro'}</h2>
          <p>Build a reusable sequence of terminal commands.</p>
        </div>
      </div>
      <Form
        form={form}
        onFinish={handleSubmit}
        className='form-wrap pd2l'
        layout='vertical'
        initialValues={initialValues}
      >
        <FormItem
          label='Macro name'
          rules={[{
            max: 60, message: '60 chars max'
          }, {
            required: true, message: 'Name required'
          }]}
          hasFeedback
          name='name'
        >
          <InputAutoFocus />
        </FormItem>
        {renderQm(form)}
        <FormItem
          name='startDirectory'
          label='Start directory'
          extra='The terminal changes to this directory before running the first step.'
        >
          <Input placeholder='/path/to/project (optional)' />
        </FormItem>
        <FormItem
          label='Folders'
          extra='Choose where this macro appears. Type a new name to create a folder.'
        >
          <FormItem name='labels' noStyle>
            <Select
              mode='tags'
              placeholder='Choose or create folders'
            >
              {
                quickCommandTags.map(q => {
                  return (
                    <Option value={q} key={'qmt-' + q}>
                      {q}
                    </Option>
                  )
                })
              }
            </Select>
          </FormItem>
          <div className='macro-form-create-folder'>
            <Input
              value={newFolder}
              onChange={event => setNewFolder(event.target.value)}
              onPressEnter={event => {
                event.preventDefault()
                createFolder()
              }}
              placeholder='Create and assign a folder'
            />
            <Button onClick={createFolder} icon={<PlusOutlined />}>Create</Button>
          </div>
        </FormItem>
        <FormItem
          label={e('settingShortcuts')}
          name='shortcut'
        >
          <div>
            <Input className='hide' />
            <ShortcutEdit
              {...editorProps}
            />
          </div>
        </FormItem>
        <FormItem
          label={e('inputOnly')}
          name='inputOnly'
          valuePropName='checked'
        >
          <Switch />
        </FormItem>
        <FormItem>
          <p>
            <Button
              type='primary'
              htmlType='submit'
            >{formData.id ? 'Save changes' : 'Create macro'}
            </Button>
          </p>
        </FormItem>
        <p>
          <b className='mg1r'>{e('templates')}:</b>
          <span className='mg1r'>{templatesStr}</span>
          <HelpIcon
            link={wiki}
          />
        </p>
      </Form>
    </div>
  )
}
