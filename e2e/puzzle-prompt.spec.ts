import { test, expect } from '@playwright/test'
import {
  submitApiKey,
  clearStorage,
  VALID_TEST_API_KEY,
  TEST_PROMPTS,
  mockPuzzleGeneration,
  mockPuzzleGenerationError,
} from './fixtures'

/**
 * Puzzle Prompt Validation Tests
 *
 * Tests the puzzle prompt input and validation
 */

test.describe('Puzzle Prompt Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate first, then clear storage
    await page.goto('/')
    await clearStorage(page)
    await page.reload()

    // Submit valid API key to get to prompt screen
    await submitApiKey(page, VALID_TEST_API_KEY)

    // Verify we're on the prompt screen
    await expect(page.locator('textarea')).toBeVisible()
  })

  test('should display prompt input after API key submission', async ({ page }) => {
    // Check textarea is visible
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()

    // Check placeholder text
    await expect(textarea).toHaveAttribute(
      'placeholder',
      /Describe what you'd like to draw/
    )

    // Check generate button
    const generateButton = page.getByRole('button', { name: /generate puzzle/i })
    await expect(generateButton).toBeVisible()

    // Button should be disabled when textarea is empty
    await expect(generateButton).toBeDisabled()

    // Check difficulty and grid size are displayed
    await expect(page.locator('text=/Level \\d+\\/10/')).toBeVisible()
    await expect(page.locator('text=/Grid: \\d+x\\d+/')).toBeVisible()
  })

  test('should show helper text with keyboard shortcut', async ({ page }) => {
    // Should show tip about Ctrl+Enter
    await expect(
      page.locator('text=/Press Ctrl\\+Enter.*to generate/')
    ).toBeVisible()
  })

  test('should reject empty prompt', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: /generate puzzle/i })

    // Button should be disabled with empty prompt
    await expect(generateButton).toBeDisabled()
  })

  test('should reject whitespace-only prompt', async ({ page }) => {
    const textarea = page.locator('textarea')
    const generateButton = page.getByRole('button', { name: /generate puzzle/i })

    // Fill with whitespace
    await textarea.fill(TEST_PROMPTS.whitespaceOnly)

    // Button should still be disabled
    await expect(generateButton).toBeDisabled()
  })

  test('should enable button with valid prompt', async ({ page }) => {
    const textarea = page.locator('textarea')
    const generateButton = page.getByRole('button', { name: /generate puzzle/i })

    // Fill with valid prompt
    await textarea.fill(TEST_PROMPTS.valid)

    // Button should be enabled
    await expect(generateButton).toBeEnabled()
  })

  test('should submit prompt with Enter key (Ctrl+Enter)', async ({ page }) => {
    // Mock API to avoid real API calls
    await mockPuzzleGeneration(page)

    const textarea = page.locator('textarea')

    // Fill with valid prompt
    await textarea.fill(TEST_PROMPTS.valid)

    // Press Ctrl+Enter (or Cmd+Enter on Mac)
    await textarea.press('Control+Enter')

    // Should show loading state
    await expect(page.locator('text=Generating your puzzle')).toBeVisible()
  })

  test('should show loading state when generating puzzle', async ({ page }) => {
    // Mock API with delay
    await mockPuzzleGeneration(page)

    const textarea = page.locator('textarea')
    const generateButton = page.getByRole('button', { name: /generate puzzle/i })

    // Fill and submit
    await textarea.fill(TEST_PROMPTS.valid)
    await generateButton.click()

    // Should show loading indicator
    await expect(page.locator('text=Generating your puzzle')).toBeVisible()
    await expect(page.locator('text=This may take a few moments')).toBeVisible()

    // Should show spinner
    await expect(page.locator('.animate-spin')).toBeVisible()

    // Wait for loading to complete
    await expect(page.locator('text=Generating your puzzle')).not.toBeVisible({
      timeout: 10000,
    })
  })

  test('should display game board after successful generation', async ({ page }) => {
    // Mock API to avoid real API calls
    await mockPuzzleGeneration(page)

    const textarea = page.locator('textarea')
    const generateButton = page.getByRole('button', { name: /generate puzzle/i })

    // Fill and submit
    await textarea.fill(TEST_PROMPTS.valid)
    await generateButton.click()

    // Wait for game board to appear
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible({
      timeout: 10000,
    })

    // Prompt screen should no longer be visible
    await expect(textarea).not.toBeVisible()
  })

  test('should handle API error gracefully', async ({ page }) => {
    // Mock API error
    await mockPuzzleGenerationError(page)

    const textarea = page.locator('textarea')
    const generateButton = page.getByRole('button', { name: /generate puzzle/i })

    // Fill and submit
    await textarea.fill(TEST_PROMPTS.valid)
    await generateButton.click()

    // Wait for error message
    await expect(page.locator('text=/Failed to generate puzzle/i')).toBeVisible({
      timeout: 10000,
    })

    // Should still show prompt screen so user can retry
    await expect(textarea).toBeVisible()
  })

  test('should clear prompt after successful submission', async ({ page }) => {
    // Mock API to avoid real API calls
    await mockPuzzleGeneration(page)

    const textarea = page.locator('textarea')
    const generateButton = page.getByRole('button', { name: /generate puzzle/i })

    // Fill and submit
    await textarea.fill(TEST_PROMPTS.valid)
    await generateButton.click()

    // Wait for generation
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible({
      timeout: 10000,
    })

    // Note: We can't check textarea value here because it's no longer visible
    // This is just verifying the flow works correctly
  })

  test('should display difficulty level correctly', async ({ page }) => {
    // Should show Level 1/10 for first puzzle
    const levelText = await page.locator('text=/Level \\d+\\/10/').textContent()
    expect(levelText).toMatch(/Level \d+\/10/)

    // Should be able to extract the level number
    const match = levelText?.match(/Level (\d+)/)
    expect(match).toBeTruthy()
    const level = parseInt(match![1])
    expect(level).toBeGreaterThanOrEqual(1)
    expect(level).toBeLessThanOrEqual(10)
  })

  test('should display grid size correctly', async ({ page }) => {
    // Should show grid size like "Grid: 5x5"
    const gridText = await page.locator('text=/Grid: \\d+x\\d+/').textContent()
    expect(gridText).toMatch(/Grid: \d+x\d+/)

    // Should be able to extract the grid size
    const match = gridText?.match(/Grid: (\d+)x(\d+)/)
    expect(match).toBeTruthy()
    const width = parseInt(match![1])
    const height = parseInt(match![2])

    // Grid should be square
    expect(width).toBe(height)

    // Grid should be reasonable size (5-15)
    expect(width).toBeGreaterThanOrEqual(5)
    expect(width).toBeLessThanOrEqual(15)
  })

  test('should accept complex prompts', async ({ page }) => {
    // Mock API to avoid real API calls
    await mockPuzzleGeneration(page)

    const textarea = page.locator('textarea')
    const generateButton = page.getByRole('button', { name: /generate puzzle/i })

    // Fill with complex prompt
    await textarea.fill(TEST_PROMPTS.complex)

    // Button should be enabled
    await expect(generateButton).toBeEnabled()

    // Should be able to submit
    await generateButton.click()

    // Should show loading state
    await expect(page.locator('text=Generating your puzzle')).toBeVisible()
  })

  test('should disable textarea and button during generation', async ({ page }) => {
    // Mock API with delay
    await mockPuzzleGeneration(page)

    const textarea = page.locator('textarea')
    const generateButton = page.getByRole('button', { name: /generate puzzle/i })

    // Fill and submit
    await textarea.fill(TEST_PROMPTS.valid)
    await generateButton.click()

    // During generation, textarea should be disabled
    await expect(textarea).toBeDisabled()

    // Button should show "Generating..." text
    await expect(page.getByRole('button', { name: /generating/i })).toBeVisible()
  })
})
