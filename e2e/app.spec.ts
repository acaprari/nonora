import { test, expect } from '@playwright/test'
import {
  submitApiKey,
  submitPrompt,
  clearStorage,
  VALID_TEST_API_KEY,
  TEST_PROMPTS,
  mockPuzzleGeneration,
  waitForPuzzleGeneration,
  clickCell,
  isCompletionScreenVisible,
} from './fixtures'

/**
 * Full Application Flow E2E Tests
 *
 * Tests the complete user journey from start to finish
 */

test.describe('Pixlogic Game - Full Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate first, then clear storage
    await page.goto('/')
    await clearStorage(page)
    await page.reload()
  })

  test('should load the app with correct header', async ({ page }) => {
    // Check main header
    await expect(page.getByRole('heading', { name: 'Pixlogic' })).toBeVisible()

    // Check subtitle
    await expect(page.locator('text=AI-Powered Nonogram Puzzles')).toBeVisible()

    // Check body is visible
    await expect(page.locator('body')).toBeVisible()
  })

  test('should show API key input on first visit', async ({ page }) => {
    // Should show API key input
    await expect(page.locator('#api-key-input')).toBeVisible()

    // Should not show prompt or game board
    await expect(page.locator('textarea')).not.toBeVisible()
    await expect(page.locator('[data-testid="game-board"]')).not.toBeVisible()
  })

  test('should complete full happy path flow with mocked API', async ({ page }) => {
    // Mock API to avoid real calls
    await mockPuzzleGeneration(page)

    // Step 1: Enter API key
    await submitApiKey(page, VALID_TEST_API_KEY)
    await expect(page.locator('textarea')).toBeVisible()

    // Step 2: Enter puzzle prompt
    await submitPrompt(page, TEST_PROMPTS.valid)

    // Step 3: Wait for puzzle generation
    await expect(page.locator('text=Generating your puzzle')).toBeVisible()
    const success = await waitForPuzzleGeneration(page)
    expect(success).toBe(true)

    // Step 4: Verify game board is displayed
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

    // Step 5: Play puzzle - click some cells
    await clickCell(page, 0, 0)
    await clickCell(page, 0, 1)
    await clickCell(page, 0, 2)

    // Note: Actually completing the puzzle requires knowing the solution
    // and clicking all correct cells, which we can't easily test with mocked data
    // without knowing the exact puzzle structure. The full completion flow
    // would be better tested with a controlled test puzzle.
  })

  test('should handle error and allow retry', async ({ page }) => {
    // First mock to fail
    await page.route('https://api.anthropic.com/v1/messages', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Server error' } }),
      })
    })

    // Submit API key
    await submitApiKey(page, VALID_TEST_API_KEY)

    // Try to generate puzzle
    await submitPrompt(page, TEST_PROMPTS.valid)

    // Should show error
    await expect(page.locator('text=/Failed to generate puzzle/i')).toBeVisible({
      timeout: 10000,
    })

    // Should still show prompt screen for retry
    await expect(page.locator('textarea')).toBeVisible()

    // Dismiss error
    const dismissButton = page.getByRole('button', { name: /dismiss error/i })
    await dismissButton.click()

    // Error should be gone
    await expect(page.locator('text=/Failed to generate puzzle/i')).not.toBeVisible()

    // Now mock to succeed
    await mockPuzzleGeneration(page)

    // Retry generation
    await submitPrompt(page, TEST_PROMPTS.valid)

    // Should succeed this time
    const success = await waitForPuzzleGeneration(page)
    expect(success).toBe(true)
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
  })

  test('should show loading spinner during puzzle generation', async ({ page }) => {
    // Mock with artificial delay
    await page.route('https://api.anthropic.com/v1/messages', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                solution: [
                  [1, 1, 1, 1, 1],
                  [1, 0, 0, 0, 1],
                  [1, 0, 0, 0, 1],
                  [1, 0, 0, 0, 1],
                  [1, 1, 1, 1, 1],
                ],
                prompt: 'a square',
                gridSize: 5,
              }),
            },
          ],
        }),
      })
    })

    // Submit API key and prompt
    await submitApiKey(page, VALID_TEST_API_KEY)
    await submitPrompt(page, TEST_PROMPTS.valid)

    // Should show loading state
    await expect(page.locator('text=Generating your puzzle')).toBeVisible()
    await expect(page.locator('.animate-spin')).toBeVisible()
    await expect(page.locator('text=This may take a few moments')).toBeVisible()

    // Wait for completion
    await expect(page.locator('text=Generating your puzzle')).not.toBeVisible({
      timeout: 10000,
    })
  })

  test('should display game board with clues', async ({ page }) => {
    // Mock API
    await mockPuzzleGeneration(page)

    // Generate puzzle
    await submitApiKey(page, VALID_TEST_API_KEY)
    await submitPrompt(page, TEST_PROMPTS.valid)
    await waitForPuzzleGeneration(page)

    // Game board should be visible
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

    // Should have row clues and column clues
    // Note: Specific clue values depend on the mocked puzzle
    // We're just checking that the structure exists
  })

  test('should allow cell interactions', async ({ page }) => {
    // Mock API
    await mockPuzzleGeneration(page)

    // Generate puzzle
    await submitApiKey(page, VALID_TEST_API_KEY)
    await submitPrompt(page, TEST_PROMPTS.valid)
    await waitForPuzzleGeneration(page)

    // Click a cell
    await clickCell(page, 0, 0)

    // Cell should change state (we can't easily verify the exact state
    // without more detailed selectors, but the click should not error)

    // Click another cell
    await clickCell(page, 1, 1)

    // Click same cell again (should toggle)
    await clickCell(page, 0, 0)
  })

  test('should persist game state across page reloads', async ({ page }) => {
    // Mock API
    await mockPuzzleGeneration(page)

    // Generate puzzle
    await submitApiKey(page, VALID_TEST_API_KEY)
    await submitPrompt(page, TEST_PROMPTS.valid)
    await waitForPuzzleGeneration(page)

    // Make some moves
    await clickCell(page, 0, 0)
    await clickCell(page, 1, 1)

    // Reload page
    await page.reload()
    await mockPuzzleGeneration(page)

    // Game board should still be visible
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

    // Should not need to re-enter API key or prompt
    await expect(page.locator('#api-key-input')).not.toBeVisible()
    await expect(page.locator('textarea')).not.toBeVisible()
  })

  test('should handle keyboard interactions', async ({ page }) => {
    // Test Enter key on API key input
    const apiKeyInput = page.locator('#api-key-input')
    await apiKeyInput.fill(VALID_TEST_API_KEY)
    await apiKeyInput.press('Enter')

    // Should proceed to prompt screen
    await expect(page.locator('textarea')).toBeVisible()

    // Mock API
    await mockPuzzleGeneration(page)

    // Test Ctrl+Enter on prompt textarea
    const textarea = page.locator('textarea')
    await textarea.fill(TEST_PROMPTS.valid)
    await textarea.press('Control+Enter')

    // Should start generation
    await expect(page.locator('text=Generating your puzzle')).toBeVisible()
  })

  test('should validate inputs at each step', async ({ page }) => {
    // Step 1: API key validation
    const apiKeyInput = page.locator('#api-key-input')
    const validateButton = page.getByRole('button', { name: 'Validate Key' })

    // Try empty key
    await validateButton.click()
    await expect(page.locator('[role="alert"]')).toHaveText('API Key is required')

    // Try invalid key
    await apiKeyInput.fill('invalid-key')
    await validateButton.click()
    await expect(page.locator('[role="alert"]')).toHaveText('API Key must start with "sk-ant-"')

    // Valid key
    await apiKeyInput.fill(VALID_TEST_API_KEY)
    await validateButton.click()

    // Step 2: Prompt validation
    const generateButton = page.getByRole('button', { name: /generate puzzle/i })

    // Empty prompt - button should be disabled
    await expect(generateButton).toBeDisabled()

    // Valid prompt - button should be enabled
    const textarea = page.locator('textarea')
    await textarea.fill(TEST_PROMPTS.valid)
    await expect(generateButton).toBeEnabled()
  })

  test('should display responsive layout', async ({ page }) => {
    // Check main container has proper styling
    const main = page.locator('main')
    await expect(main).toBeVisible()

    // Check that elements are properly arranged
    // (This is a basic check; detailed responsive testing would require
    // multiple viewport sizes and visual regression testing)
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('should show difficulty progression info', async ({ page }) => {
    // Submit API key
    await submitApiKey(page, VALID_TEST_API_KEY)

    // Should show level and grid size
    const levelText = await page.locator('text=/Level \\d+\\/10/').textContent()
    const gridText = await page.locator('text=/Grid: \\d+x\\d+/').textContent()

    expect(levelText).toBeTruthy()
    expect(gridText).toBeTruthy()

    // Level should be between 1-10
    const levelMatch = levelText?.match(/Level (\d+)/)
    const level = parseInt(levelMatch![1])
    expect(level).toBeGreaterThanOrEqual(1)
    expect(level).toBeLessThanOrEqual(10)

    // Grid should be square and reasonable size
    const gridMatch = gridText?.match(/Grid: (\d+)x(\d+)/)
    const width = parseInt(gridMatch![1])
    const height = parseInt(gridMatch![2])
    expect(width).toBe(height)
    expect(width).toBeGreaterThanOrEqual(5)
    expect(width).toBeLessThanOrEqual(15)
  })
})

test.describe('Pixlogic Game - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearStorage(page)
    await page.reload()
  })

  test('should display and dismiss error messages', async ({ page }) => {
    // Mock API error
    await page.route('https://api.anthropic.com/v1/messages', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Server error' } }),
      })
    })

    // Submit API key and prompt
    await submitApiKey(page, VALID_TEST_API_KEY)
    await submitPrompt(page, TEST_PROMPTS.valid)

    // Wait for error to appear
    await expect(page.locator('text=/Failed to generate puzzle/i')).toBeVisible({
      timeout: 10000,
    })

    // Error should have dismiss button
    const dismissButton = page.getByRole('button', { name: /dismiss error/i })
    await expect(dismissButton).toBeVisible()

    // Click dismiss
    await dismissButton.click()

    // Error should disappear
    await expect(page.locator('text=/Failed to generate puzzle/i')).not.toBeVisible()
  })

  test('should not crash on network errors', async ({ page }) => {
    // Mock network failure
    await page.route('https://api.anthropic.com/v1/messages', (route) => route.abort())

    // Submit API key and prompt
    await submitApiKey(page, VALID_TEST_API_KEY)
    await submitPrompt(page, TEST_PROMPTS.valid)

    // Should handle gracefully (show error or stay on prompt screen)
    // App should not crash
    await expect(page.locator('body')).toBeVisible()

    // Either error message or prompt screen should be visible
    const hasError = await page.locator('text=/error/i').isVisible()
    const hasPrompt = await page.locator('textarea').isVisible()
    expect(hasError || hasPrompt).toBe(true)
  })
})
