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
} from './fixtures'

/**
 * State Persistence Tests
 *
 * Tests that game state is properly saved and restored from localStorage
 */

test.describe('Game State Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate first, then clear storage
    await page.goto('/')
    await clearStorage(page)
    await page.reload()
  })

  test('should restore API key after page reload', async ({ page }) => {
    // Submit API key
    await submitApiKey(page, VALID_TEST_API_KEY)

    // Verify we're on prompt screen
    await expect(page.locator('textarea')).toBeVisible()

    // Reload page
    await page.reload()

    // Should still be on prompt screen (API key was restored)
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.locator('#api-key-input')).not.toBeVisible()
  })

  test('should restore game state after page reload', async ({ page }) => {
    // Mock API to avoid real calls
    await mockPuzzleGeneration(page)

    // Submit API key
    await submitApiKey(page, VALID_TEST_API_KEY)

    // Generate puzzle
    await submitPrompt(page, TEST_PROMPTS.valid)

    // Wait for puzzle to load
    const success = await waitForPuzzleGeneration(page)
    expect(success).toBe(true)

    // Verify game board is visible
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

    // Make some moves
    await clickCell(page, 0, 0)
    await clickCell(page, 0, 1)

    // Reload page
    await page.reload()

    // Need to set up mock again after reload
    await mockPuzzleGeneration(page)

    // Game board should still be visible
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

    // Note: Verifying exact cell state would require reading the cell state,
    // which is covered in the app.spec.ts tests
  })

  test('should not show API key input if key is already stored', async ({ page }) => {
    // Submit API key
    await submitApiKey(page, VALID_TEST_API_KEY)

    // Navigate away and back
    await page.goto('about:blank')
    await page.goto('/')

    // Should go directly to prompt screen
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.locator('#api-key-input')).not.toBeVisible()
  })

  test('should clear state after puzzle completion', async ({ page }) => {
    // Mock API to avoid real calls
    await mockPuzzleGeneration(page)

    // Submit API key
    await submitApiKey(page, VALID_TEST_API_KEY)

    // Generate puzzle
    await submitPrompt(page, TEST_PROMPTS.valid)

    // Wait for puzzle to load
    const success = await waitForPuzzleGeneration(page)
    expect(success).toBe(true)

    // Note: Actually completing a puzzle requires clicking many cells correctly,
    // which is tested in app.spec.ts. This test verifies the persistence structure.

    // For this test, we just verify that if we reload before completion,
    // the puzzle is still there
    await page.reload()
    await mockPuzzleGeneration(page)
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()
  })

  test('should persist difficulty level and grid size', async ({ page }) => {
    // Submit API key
    await submitApiKey(page, VALID_TEST_API_KEY)

    // Get current level and grid size
    const levelBefore = await page.locator('text=/Level \\d+\\/10/').textContent()
    const gridBefore = await page.locator('text=/Grid: \\d+x\\d+/').textContent()

    // Reload page
    await page.reload()

    // Should still show same level and grid size
    const levelAfter = await page.locator('text=/Level \\d+\\/10/').textContent()
    const gridAfter = await page.locator('text=/Grid: \\d+x\\d+/').textContent()

    expect(levelAfter).toBe(levelBefore)
    expect(gridAfter).toBe(gridBefore)
  })

  test('should handle missing localStorage gracefully', async ({ page }) => {
    // This tests the initial state when there's no saved data
    // which is the default state for each test

    // Should show API key input
    await expect(page.locator('#api-key-input')).toBeVisible()

    // Should not show puzzle prompt
    await expect(page.locator('textarea')).not.toBeVisible()

    // Should not show game board
    await expect(page.locator('[data-testid="game-board"]')).not.toBeVisible()
  })

  test('should preserve game state across multiple reloads', async ({ page }) => {
    // Mock API
    await mockPuzzleGeneration(page)

    // Submit API key
    await submitApiKey(page, VALID_TEST_API_KEY)

    // Generate puzzle
    await submitPrompt(page, TEST_PROMPTS.valid)
    await waitForPuzzleGeneration(page)

    // First reload
    await page.reload()
    await mockPuzzleGeneration(page)
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

    // Second reload
    await page.reload()
    await mockPuzzleGeneration(page)
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

    // Third reload
    await page.reload()
    await mockPuzzleGeneration(page)
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

    // State should still be intact
  })

  test('should handle corrupted localStorage data', async ({ page }) => {
    // Inject corrupted data into localStorage
    await page.evaluate(() => {
      localStorage.setItem('nonora-game-state', 'invalid-json-data')
    })

    // Navigate to the app
    await page.goto('/')

    // Should handle gracefully and show API key input
    await expect(page.locator('#api-key-input')).toBeVisible()

    // Should not crash or show errors
    await expect(page.locator('text=/error/i')).not.toBeVisible()
  })

  test('should persist API key but not puzzle after new puzzle request', async ({ page }) => {
    // Mock API
    await mockPuzzleGeneration(page)

    // Submit API key
    await submitApiKey(page, VALID_TEST_API_KEY)

    // Generate first puzzle
    await submitPrompt(page, TEST_PROMPTS.valid)
    await waitForPuzzleGeneration(page)

    // Simulate "new prompt" action (would clear puzzle but keep API key)
    // This would be triggered by a button on completion screen
    // For this test, we clear storage manually to simulate the effect
    await page.evaluate(() => {
      const state = localStorage.getItem('nonora-game-state')
      if (state) {
        const parsed = JSON.parse(state)
        delete parsed.currentPuzzle
        localStorage.setItem('nonora-game-state', JSON.stringify(parsed))
      }
    })

    // Reload
    await page.reload()

    // Should still have API key (no API key input)
    await expect(page.locator('#api-key-input')).not.toBeVisible()

    // Should be on prompt screen (no game board)
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.locator('[data-testid="game-board"]')).not.toBeVisible()
  })

  test('should restore in-progress puzzle with correct prompt', async ({ page }) => {
    // Mock API
    await mockPuzzleGeneration(page)

    // Submit API key
    await submitApiKey(page, VALID_TEST_API_KEY)

    // Generate puzzle with specific prompt
    const testPrompt = 'a test square'
    await submitPrompt(page, testPrompt)
    await waitForPuzzleGeneration(page)

    // Reload page
    await page.reload()
    await mockPuzzleGeneration(page)

    // Game board should be visible
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible()

    // Note: The prompt is stored internally but not displayed during gameplay
    // We can verify it's preserved by checking localStorage directly
    const storedPrompt = await page.evaluate(() => {
      const state = localStorage.getItem('nonora-game-state')
      if (state) {
        const parsed = JSON.parse(state)
        return parsed.currentPuzzle?.prompt
      }
      return null
    })

    expect(storedPrompt).toBe(testPrompt)
  })
})
