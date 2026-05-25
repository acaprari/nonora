# E2E Testing with Playwright - Pixlogic

## Overview

This document describes the End-to-End (E2E) testing setup for the Pixlogic nonogram game using Playwright.

## Installation

Playwright is already installed and configured. To install the browsers:

```bash
npx playwright install chromium
```

## Running E2E Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in headed mode (see the browser)
```bash
npm run test:e2e:headed
```

### Run tests with Playwright UI (interactive mode)
```bash
npx playwright test --ui
```

### Run a specific test file
```bash
npx playwright test e2e/api-key.spec.ts
```

### Run a specific test by line number
```bash
npx playwright test e2e/api-key.spec.ts:18
```

## Test Structure

The E2E tests are organized in the `/e2e` directory:

```
e2e/
├── fixtures.ts          # Test helpers, mock data, and utility functions
├── api-key.spec.ts      # API key validation tests (11 tests)
├── app.spec.ts          # Main application flow tests (15 tests)
├── persistence.spec.ts  # State persistence tests (10 tests)
└── puzzle-prompt.spec.ts # Puzzle prompt validation tests (13 tests)
```

### Test Files

#### `/e2e/fixtures.ts` (167 lines)
Contains:
- Mock API responses for puzzle generation
- Test data constants (API keys, prompts)
- Helper functions (`submitApiKey`, `submitPrompt`, `mockPuzzleGeneration`, etc.)
- Utility functions for common test actions

#### `/e2e/api-key.spec.ts` (182 lines)
Tests for API key input validation:
- Display and UI elements
- Show/hide toggle functionality
- Empty and whitespace validation
- Prefix validation (must start with "sk-ant-")
- Length validation (minimum 20 characters)
- Error clearing on input
- Valid key acceptance and navigation
- Enter key submission
- State persistence after reload

#### `/e2e/app.spec.ts` (371 lines)
Tests for complete application flow:
- App loading and header display
- API key input on first visit
- Full happy path flow with mocked API
- Error handling and retry logic
- Loading spinner during generation
- Game board display
- Cell interactions
- State persistence across reloads
- Keyboard interactions (Enter, Ctrl+Enter)
- Input validation at each step
- Responsive layout
- Difficulty progression display
- Error message display and dismissal
- Network error handling

#### `/e2e/persistence.spec.ts` (252 lines)
Tests for localStorage persistence:
- API key restoration after reload
- Game state restoration during gameplay
- API key persistence across navigation
- State clearing after puzzle completion
- Difficulty level and grid size persistence
- Graceful handling of missing storage
- Multiple reload preservation
- Corrupted data handling
- Partial state persistence (API key without puzzle)
- In-progress puzzle restoration with prompt

#### `/e2e/puzzle-prompt.spec.ts` (261 lines)
Tests for puzzle prompt input:
- Prompt input display after API key
- Helper text and keyboard shortcuts
- Empty and whitespace rejection
- Button state (enabled/disabled)
- Enter key submission (Ctrl+Enter)
- Loading state during generation
- Game board display after generation
- API error handling
- Prompt clearing after submission
- Difficulty level display
- Grid size display
- Complex prompt acceptance
- UI state during generation (disabled inputs)

## Test Configuration

The Playwright configuration is in `/playwright.config.ts`:

- **Test Directory**: `./e2e`
- **Timeout**: 30 seconds per test
- **Expect Timeout**: 5 seconds for assertions
- **Base URL**: `http://localhost:5173`
- **Browsers**: Chromium (Firefox and WebKit commented out for speed)
- **Auto-start Dev Server**: Yes (automatically runs `npm run dev`)
- **Retries on CI**: 2
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Reporters**: HTML report + list

## Test Coverage

### Total Tests: 49

#### By Category:
- **API Key Validation**: 11 tests
- **Application Flow**: 15 tests
- **State Persistence**: 10 tests
- **Puzzle Prompt Validation**: 13 tests

#### Test Results (Current):
- **Passing**: 8 tests (16%)
- **Failing**: 41 tests (84%)

### Passing Tests:
1. ✓ Show/hide API key toggle
2. ✓ Accept API key with Enter key
3. ✓ Load app with correct header
4. ✓ Show API key input on first visit
5. ✓ Handle keyboard interactions
6. ✓ Display responsive layout
7. ✓ Handle missing localStorage gracefully
8. ✓ Handle corrupted localStorage data

### Common Failure Pattern:
Most failing tests timeout waiting for the "Validate Key" button to be found. This appears to be a timing issue with the test setup where the button is not immediately available after page reload when localStorage is cleared.

## Key Features Tested

### 1. API Key Management
- Input validation (format, length, required)
- Show/hide password toggle
- Error messages
- Keyboard submission (Enter key)
- Persistence across page reloads

### 2. Puzzle Generation Flow
- Prompt input and validation
- API mocking to avoid real API calls
- Loading states and spinners
- Error handling and retry logic
- Navigation between phases

### 3. Game State Persistence
- localStorage integration
- API key restoration
- Active puzzle restoration
- Difficulty progression tracking
- Corrupted data handling

### 4. User Interactions
- Cell clicking (planned - requires game board interaction)
- Keyboard shortcuts (Ctrl+Enter for submission)
- Button state management
- Form validation

## Mocking Strategy

To avoid making real API calls and ensure test reliability, the tests use Playwright's network mocking:

```typescript
await page.route('https://api.anthropic.com/v1/messages', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      content: [{ type: 'text', text: JSON.stringify(mockPuzzle) }]
    })
  })
})
```

This allows tests to:
- Run without a valid API key
- Execute quickly without network latency
- Test error scenarios consistently
- Run in CI/CD environments

## Known Issues

### Test Stability
Some tests are experiencing timing issues where the "Validate Key" button is not found immediately after page reload. This is likely due to:
1. The beforeEach hook pattern of goto → clearStorage → reload
2. Potential race condition between React hydration and Playwright selectors
3. Need for more explicit wait conditions

### Recommended Fixes
1. Add explicit wait for button visibility before attempting to interact
2. Consider using Playwright's `waitForLoadState('networkidle')` after reload
3. Simplify the beforeEach pattern to avoid unnecessary reloads
4. Add data-testid attributes to critical UI elements for more reliable selection

## Future Enhancements

### Test Coverage Expansion
- [ ] Full puzzle completion flow (requires solving a mocked puzzle)
- [ ] Completion screen metrics verification
- [ ] Level-up scenarios and difficulty progression
- [ ] Multiple browser testing (Firefox, WebKit)
- [ ] Mobile viewport testing
- [ ] Accessibility testing (ARIA labels, keyboard navigation)

### Test Infrastructure
- [ ] Visual regression testing for UI consistency
- [ ] Performance testing (puzzle generation time)
- [ ] CI/CD integration (GitHub Actions)
- [ ] Test data factories for generating varied test scenarios
- [ ] Custom Playwright fixtures for common setups

### API Testing
- [ ] Real API integration tests (with valid key in CI only)
- [ ] API rate limiting handling
- [ ] Network timeout scenarios
- [ ] Malformed API response handling

## Debugging Tests

### View Test Report
After running tests:
```bash
npx playwright show-report
```

### Run with UI Mode
For interactive debugging:
```bash
npx playwright test --ui
```

### Debug Specific Test
```bash
npx playwright test e2e/api-key.spec.ts:18 --debug
```

### View Screenshots and Videos
Failed tests automatically capture screenshots and videos in:
```
test-results/
├── [test-name]/
│   ├── test-failed-1.png
│   ├── video.webm
│   └── error-context.md
```

## Best Practices

### 1. Test Independence
- Each test should be able to run independently
- Use beforeEach hooks to set up clean state
- Clear localStorage between tests
- Don't rely on test execution order

### 2. Selectors
- Prefer semantic selectors (getByRole, getByLabel)
- Use data-testid for elements without good ARIA labels
- Avoid CSS class selectors that may change with styling
- Keep selectors specific but not brittle

### 3. Assertions
- Use appropriate Playwright matchers (toBeVisible, toHaveText)
- Add helpful error messages for complex assertions
- Test user-visible behavior, not implementation details
- Verify both positive and negative cases

### 4. Test Data
- Use constants from fixtures.ts for consistency
- Mock external dependencies (API calls)
- Use realistic but deterministic test data
- Keep test data minimal and focused

### 5. Performance
- Mock network requests to speed up tests
- Use appropriate timeouts (don't set too high)
- Run tests in parallel when possible
- Skip expensive operations when not necessary

## Contributing

When adding new E2E tests:

1. Follow the existing test structure and naming conventions
2. Add helper functions to `fixtures.ts` if they'll be reused
3. Use descriptive test names that explain what is being tested
4. Include comments for complex test logic
5. Ensure tests pass locally before committing
6. Update this README if adding new test categories

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles/) (for inspiration)
