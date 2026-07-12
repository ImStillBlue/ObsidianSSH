const { _electron: electron } = require('@playwright/test')
const { test: it, expect } = require('@playwright/test')
const { describe } = it
const delay = require('./common/wait')
const appOptions = require('./common/app-options')
const extendClient = require('./common/client-extend')

describe('Terminal Suggestions Dropdown', function () {
  let electronApp
  let client
  it.beforeEach(async () => {
    electronApp = await electron.launch(appOptions)
    client = await electronApp.firstWindow()
    extendClient(client, electronApp)
    await delay(4500)
    await client.evaluate(() => {
      return window.store.setConfig({
        showCmdSuggestions: true
      })
    })
  })
  it.afterAll(async () => {
    await client.evaluate(() => {
      return window.store.setConfig({
        showCmdSuggestions: false
      })
    })
    await electronApp.close()
  })

  it('should show suggestions based on command history and close on arrow keys', async function () {
    await delay(1500)
    const suggestionElement = await client.locator('.terminal-suggestions-wrap').first()

    // Run a command so it lands in history
    const uniqueCommand = 'test-unique-command-' + Date.now()
    await client.keyboard.type(uniqueCommand)
    await delay(300)
    await client.keyboard.press('Enter')
    await delay(1000)

    // Type the partial command again - history suggestion should appear
    await client.keyboard.type('test-unique')
    await delay(500)
    await expect(suggestionElement).toBeVisible()
    const count = await client.locator('.suggestion-item').count()
    expect(count).toBeGreaterThan(0)

    // Arrow keys are passed to the shell (history cycling) and close the dropdown
    await client.keyboard.press('ArrowUp')
    await delay(300)
    await expect(suggestionElement).toBeHidden()

    // Clear the line
    await client.keyboard.press('Control+C')
    await delay(500)

    // Type partial again, Enter should close the dropdown too
    await client.keyboard.type('test-unique')
    await delay(500)
    await expect(suggestionElement).toBeVisible()
    await client.keyboard.press('Enter')
    await expect(suggestionElement).toBeHidden()
  })

  it('should complete command with Tab', async function () {
    await delay(1500)
    const suggestionElement = await client.locator('.terminal-suggestions-wrap').first()

    // Seed history directly
    await client.evaluate(() => {
      window.store.addCmdHistory('echo tab-complete-test')
    })
    await delay(300)

    await client.keyboard.type('echo tab-c')
    await delay(500)
    await expect(suggestionElement).toBeVisible()

    // Tab inserts the highlighted suggestion into the terminal
    await client.keyboard.press('Tab')
    await delay(300)
    const selected = await client.locator('.suggestion-item.selected').count()
    expect(selected).toBe(1)
  })
})
