import { test as base, expect, Page } from '@playwright/test'

/**
 * Test Fixtures and Helpers for Pixlogic E2E Tests
 *
 * This file provides:
 * - Mock API response data
 * - Helper functions for common test actions
 * - Custom test fixtures
 */

// =============================================================================
// Mock Data
// =============================================================================

/**
 * Mock puzzle response from the API
 * This simulates what the LLM would return after generating a puzzle
 */
export const MOCK_PUZZLE_RESPONSE = {
  solution: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  prompt: 'a square',
  gridSize: 5,
}

/**
 * Valid test API key
 * Note: This is a fake key for testing purposes
 */
export const VALID_TEST_API_KEY = 'sk-ant-test-key-1234567890abcdef'

/**
 * Invalid test API keys for validation tests
 */
export const INVALID_API_KEYS = {
  empty: '',
  tooShort: 'sk-ant-123',
  wrongPrefix: 'invalid-key-1234567890',
  whitespaceOnly: '   ',
}

/**
 * Test prompts
 */
export const TEST_PROMPTS = {
  valid: 'a simple square',
  empty: '',
  whitespaceOnly: '   ',
  complex: 'a detailed cat with whiskers and a tail',
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Helper to submit API key
 */
export async function submitApiKey(page: Page, apiKey: string) {
  const input = page.locator('#api-key-input')
  await input.fill(apiKey)
  await page.getByRole('button', { name: 'Validate Key' }).click()
}

/**
 * Helper to submit puzzle prompt
 */
export async function submitPrompt(page: Page, prompt: string) {
  const textarea = page.locator('textarea')
  await textarea.fill(prompt)
  await page.getByRole('button', { name: /generate puzzle/i }).click()
}

/**
 * Helper to wait for puzzle generation to complete
 * Returns true if puzzle was generated, false if there was an error
 */
export async function waitForPuzzleGeneration(page: Page, timeout = 30000): Promise<boolean> {
  try {
    // Wait for loading indicator to appear
    await page.locator('text=Generating your puzzle').waitFor({ timeout: 2000 })

    // Wait for loading indicator to disappear
    await page.locator('text=Generating your puzzle').waitFor({ state: 'hidden', timeout })

    // Check if we have a game board (success) or error message (failure)
    const hasGameBoard = await page.locator('[data-testid="game-board"]').isVisible()
    return hasGameBoard
  } catch (error) {
    // If timeout or error, check for error message
    return false
  }
}

/**
 * Helper to click a cell in the puzzle grid
 */
export async function clickCell(page: Page, row: number, col: number) {
  // Cells are in a grid, we need to find the right cell
  const cell = page.locator(`[data-testid="cell-${row}-${col}"]`)
  await cell.click()
}

/**
 * Helper to get the state of a cell (filled, crossed, empty)
 */
export async function getCellState(page: Page, row: number, col: number): Promise<string> {
  const cell = page.locator(`[data-testid="cell-${row}-${col}"]`)
  const classList = await cell.getAttribute('class')

  if (classList?.includes('bg-gray-900')) return 'filled'
  if (classList?.includes('bg-red-100')) return 'crossed'
  return 'empty'
}

/**
 * Helper to clear localStorage
 * Note: Page must be navigated before calling this
 */
export async function clearStorage(page: Page) {
  // Use context.clearCookies and page.evaluate together
  // First navigate to the page to ensure we have access to localStorage
  try {
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  } catch (error) {
    // If the page hasn't loaded yet, we can ignore this error
    // localStorage will be empty anyway on first load
  }
}

/**
 * Helper to set up a mock API response
 * This intercepts the API call and returns mock data instead
 */
export async function mockPuzzleGeneration(page: Page) {
  await page.route('https://api.anthropic.com/v1/messages', async (route) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Return mock response
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content: [
          {
            type: 'text',
            text: JSON.stringify(MOCK_PUZZLE_RESPONSE),
          },
        ],
      }),
    })
  })
}

/**
 * Helper to mock API error
 */
export async function mockPuzzleGenerationError(page: Page) {
  await page.route('https://api.anthropic.com/v1/messages', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          message: 'Internal server error',
        },
      }),
    })
  })
}

/**
 * Helper to check if completion screen is visible
 */
export async function isCompletionScreenVisible(page: Page): Promise<boolean> {
  return await page.locator('text=Puzzle Complete!').isVisible()
}

/**
 * Helper to get current difficulty level from UI
 */
export async function getCurrentLevel(page: Page): Promise<number> {
  const levelText = await page.locator('text=/Level \\d+\\/10/').textContent()
  const match = levelText?.match(/Level (\d+)/)
  return match ? parseInt(match[1]) : 1
}

/**
 * Helper to get grid size from UI
 */
export async function getGridSize(page: Page): Promise<number> {
  const gridText = await page.locator('text=/Grid: \\d+x\\d+/').textContent()
  const match = gridText?.match(/Grid: (\d+)x/)
  return match ? parseInt(match[1]) : 5
}

// =============================================================================
// Custom Test Fixtures
// =============================================================================

/**
 * Extended test fixture with custom helpers
 */
export const test = base.extend({
  // Fixture that automatically clears storage before each test
  cleanPage: async ({ page }, use) => {
    await clearStorage(page)
    await use(page)
  },
})

export { expect }
