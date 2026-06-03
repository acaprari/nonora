import { test, expect } from '@playwright/test'
import { submitApiKey, clearStorage, VALID_TEST_API_KEY, INVALID_API_KEYS } from './fixtures'

/**
 * API Key Validation Tests
 *
 * Tests the API key input validation and submission process
 */

test.describe('API Key Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate first, then clear storage
    await page.goto('/')
    await clearStorage(page)
    await page.reload()
  })

  test('should display API key input on first load', async ({ page }) => {
    // Check header is visible
    await expect(page.getByRole('heading', { name: 'nonora' })).toBeVisible()

    // Check API key input is visible
    const apiKeyInput = page.locator('#api-key-input')
    await expect(apiKeyInput).toBeVisible()

    // Check label text
    await expect(page.locator('label[for="api-key-input"]')).toHaveText('Anthropic API Key')

    // Check placeholder
    await expect(apiKeyInput).toHaveAttribute('placeholder', 'sk-ant-...')

    // Check validate button is visible
    await expect(page.getByRole('button', { name: 'Validate Key' })).toBeVisible()
  })

  test('should show/hide API key when clicking toggle button', async ({ page }) => {
    const apiKeyInput = page.locator('#api-key-input')
    const toggleButton = page.getByRole('button', { name: /show api key/i })

    // Initially should be password type (hidden)
    await expect(apiKeyInput).toHaveAttribute('type', 'password')

    // Click show button
    await toggleButton.click()

    // Should now be text type (visible)
    await expect(apiKeyInput).toHaveAttribute('type', 'text')
    await expect(page.getByRole('button', { name: /hide api key/i })).toBeVisible()

    // Click hide button
    await page.getByRole('button', { name: /hide api key/i }).click()

    // Should be password type again
    await expect(apiKeyInput).toHaveAttribute('type', 'password')
  })

  test('should reject empty API key', async ({ page }) => {
    const input = page.locator('#api-key-input')
    const submitButton = page.getByRole('button', { name: 'Validate Key' })

    // Try to submit empty key
    await submitButton.click()

    // Should show error message
    await expect(page.locator('[role="alert"]')).toBeVisible()
    await expect(page.locator('[role="alert"]')).toHaveText('API Key is required')

    // Input should have error styling (aria-invalid)
    await expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  test('should reject whitespace-only API key', async ({ page }) => {
    const input = page.locator('#api-key-input')

    // Fill with whitespace
    await input.fill(INVALID_API_KEYS.whitespaceOnly)
    await page.getByRole('button', { name: 'Validate Key' }).click()

    // Should show error message
    await expect(page.locator('[role="alert"]')).toHaveText('API Key is required')
  })

  test('should reject API key with wrong prefix', async ({ page }) => {
    const input = page.locator('#api-key-input')

    // Fill with key that doesn't start with sk-ant-
    await input.fill(INVALID_API_KEYS.wrongPrefix)
    await page.getByRole('button', { name: 'Validate Key' }).click()

    // Should show error message
    await expect(page.locator('[role="alert"]')).toHaveText('API Key must start with "sk-ant-"')
  })

  test('should reject API key that is too short', async ({ page }) => {
    const input = page.locator('#api-key-input')

    // Fill with key that's too short
    await input.fill(INVALID_API_KEYS.tooShort)
    await page.getByRole('button', { name: 'Validate Key' }).click()

    // Should show error message
    await expect(page.locator('[role="alert"]')).toHaveText(
      'API Key must be at least 20 characters'
    )
  })

  test('should clear error when user starts typing', async ({ page }) => {
    const input = page.locator('#api-key-input')

    // Submit empty key to show error
    await page.getByRole('button', { name: 'Validate Key' }).click()
    await expect(page.locator('[role="alert"]')).toBeVisible()

    // Start typing
    await input.fill('s')

    // Error should be cleared
    await expect(page.locator('[role="alert"]')).not.toBeVisible()
  })

  test('should accept valid API key and proceed to prompt screen', async ({ page }) => {
    const input = page.locator('#api-key-input')

    // Fill with valid key
    await input.fill(VALID_TEST_API_KEY)
    await page.getByRole('button', { name: 'Validate Key' }).click()

    // Should navigate to prompt screen
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.getByRole('button', { name: /generate puzzle/i })).toBeVisible()

    // API key input should no longer be visible
    await expect(input).not.toBeVisible()

    // Should show difficulty level and grid size
    await expect(page.locator('text=/Level \\d+\\/10/')).toBeVisible()
    await expect(page.locator('text=/Grid: \\d+x\\d+/')).toBeVisible()
  })

  test('should accept valid API key with Enter key', async ({ page }) => {
    const input = page.locator('#api-key-input')

    // Fill with valid key
    await input.fill(VALID_TEST_API_KEY)

    // Press Enter
    await input.press('Enter')

    // Should navigate to prompt screen
    await expect(page.locator('textarea')).toBeVisible()
  })

  test('should persist API key after page reload', async ({ page }) => {
    // Submit valid API key
    await submitApiKey(page, VALID_TEST_API_KEY)

    // Verify we're on prompt screen
    await expect(page.locator('textarea')).toBeVisible()

    // Reload page
    await page.reload()

    // Should still be on prompt screen (API key persisted)
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.locator('#api-key-input')).not.toBeVisible()
  })

  test('should handle validation state correctly', async ({ page }) => {
    const input = page.locator('#api-key-input')
    const submitButton = page.getByRole('button', { name: 'Validate Key' })

    // Button should be enabled initially
    await expect(submitButton).toBeEnabled()

    // Input should be enabled
    await expect(input).toBeEnabled()

    // After filling and submitting valid key, should proceed (tested above)
    // This test focuses on the UI state during the process
    await input.fill(VALID_TEST_API_KEY)
    await expect(input).toHaveValue(VALID_TEST_API_KEY)
  })
})
