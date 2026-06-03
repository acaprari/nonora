# Testing Strategy

**Last Updated:** 2026-06-01
**Status:** ✅ Complete

---

## Overview

nonora follows a comprehensive testing strategy with three layers:
1. **Unit Tests** - Pure functions and hooks (fast, isolated)
2. **Integration Tests** - Component interactions (moderate speed)
3. **End-to-End Tests** - Full user flows (slow, high confidence)

**Philosophy**: Test-Driven Development (TDD) - Write tests first, then implementation.

**Testing Stack**:
- **Vitest**: Unit and component tests
- **React Testing Library**: Component testing
- **@testing-library/react-hooks**: Hook testing
- **Playwright**: E2E tests
- **MSW (Mock Service Worker)**: API mocking

---

## Test-Driven Development (TDD)

### Why TDD?

**Benefits**:
- **Better design**: Tests force you to think about interfaces first
- **Fewer bugs**: Code is testable by design
- **Confidence**: Refactor without fear
- **Documentation**: Tests show how code should be used
- **Regression prevention**: Changes can't break existing functionality

**How it shapes design**:
- Forces pure functions (easier to test)
- Encourages small, focused modules
- Makes dependencies explicit

### TDD Workflow

1. **Write failing test**: Define expected behavior, watch it fail (red)
2. **Implement minimal code**: Just enough to pass the test (green)
3. **Refactor**: Clean up code while keeping tests green
4. **Repeat**: Next test, next feature

**Example cycle**:
```typescript
// 1. Write failing test
test('calculates clues for row with two groups', () => {
  const row = [true, true, false, true];
  expect(calculateRowClues([row])).toEqual([[2, 1]]);
});
// Test fails: function doesn't exist yet

// 2. Implement
export function calculateRowClues(matrix: boolean[][]): number[][] {
  // Minimal implementation to pass
  return matrix.map(row => { /* ... */ });
}
// Test passes

// 3. Refactor (if needed)
// Clean up, extract helpers, improve naming
```

### When to Use TDD

**Always for**:
- New features (write test describing feature, then implement)
- Bug fixes (write test reproducing bug, then fix)
- Pure functions (especially business logic)

**Optional for**:
- Simple UI components (visual testing may be sufficient)
- Exploratory prototyping (tests can come after spike)

**Rule**: If you're not sure, use TDD. It catches more bugs upfront.

---

## Unit Testing

### What to Test

**Pure Functions (`src/lib/`)**:
- All exported functions
- Happy path (normal inputs)
- Edge cases (empty, single element, maximum size)
- Error conditions (invalid inputs)

**Examples to test**:
- `clueCalculator.ts`: calculateRowClues, calculateColumnClues
- `validator.ts`: validateRow, validateColumn, isPuzzleComplete
- `difficultyEngine.ts`: calculateNextDifficulty

### Testing Pure Functions

**Approach**: Simple input → expected output, no mocks needed, very fast

**Example Test Structure**:
```typescript
// src/lib/__tests__/clueCalculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRowClues } from '../clueCalculator';

describe('calculateRowClues', () => {
  it('calculates clues for simple row', () => {
    const row = [true, true, false, true, false];
    expect(calculateRowClues([row])).toEqual([[2, 1]]);
  });

  it('returns empty array for empty row', () => {
    const row = [false, false, false];
    expect(calculateRowClues([row])).toEqual([[]]);
  });

  it('handles single filled cell', () => {
    const row = [false, true, false];
    expect(calculateRowClues([row])).toEqual([[1]]);
  });

  it('handles fully filled row', () => {
    const row = [true, true, true, true];
    expect(calculateRowClues([row])).toEqual([[4]]);
  });
});
```

**Key points**:
- No setup/teardown needed (pure functions)
- Test edge cases (empty, single, full)
- Fast execution (<1ms per test)

### Testing React Hooks

**Approach**: Use `@testing-library/react-hooks` for isolated hook testing

**Example Test Structure**:
```typescript
// src/hooks/__tests__/useGameState.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useGameState } from '../useGameState';

describe('useGameState', () => {
  it('toggles cell state through cycle', () => {
    const { result } = renderHook(() => useGameState(mockPuzzle));

    // Initially empty
    expect(result.current.puzzle.currentGrid[0][0]).toBe('empty');

    // Tap 1: empty → filled
    act(() => result.current.toggleCell(0, 0));
    expect(result.current.puzzle.currentGrid[0][0]).toBe('filled');

    // Tap 2: filled → marked
    act(() => result.current.toggleCell(0, 0));
    expect(result.current.puzzle.currentGrid[0][0]).toBe('marked');

    // Tap 3: marked → empty
    act(() => result.current.toggleCell(0, 0));
    expect(result.current.puzzle.currentGrid[0][0]).toBe('empty');
  });

  it('increments error count on validation error', () => {
    const { result } = renderHook(() => useGameState(mockPuzzle));

    // Fill cells to trigger validation error
    act(() => {
      // ... fill too many cells in a row
    });

    expect(result.current.puzzle.errors).toBeGreaterThan(0);
  });
});
```

### Test File Organization

**Co-location strategy**: Tests live next to the code they test

```
src/
├── lib/
│   ├── clueCalculator.ts
│   └── __tests__/
│       └── clueCalculator.test.ts
├── hooks/
│   ├── useGameState.ts
│   └── __tests__/
│       └── useGameState.test.ts
└── components/
    ├── Cell.tsx
    └── __tests__/
        └── Cell.test.tsx
```

**Naming conventions**:
- Test files: `*.test.ts` or `*.test.tsx`
- Test directories: `__tests__/` (co-located with source)
- Test descriptions: Sentence case ("calculates clues for simple row")

---

## Integration Testing

### What to Test

**Component Integration**:
- Component + hooks working together
- User interactions triggering state changes
- State changes causing UI updates
- Data flow between components

**Examples**:
- `GameBoard` + `useHints`: Hint button → API call → modal display
- `Cell` + `useGameState`: Click → state update → visual feedback
- `GameBoard` + `useValidation`: Cell change → validation → color feedback

### Testing Components

**Approach**: React Testing Library - test behavior, not implementation

**User-centric queries** (in order of preference):
1. `getByRole` (button, textbox, etc.)
2. `getByLabelText` (form elements)
3. `getByText` (visible text)
4. `getByTestId` (last resort)

**Example Test Structure**:
```typescript
// src/components/__tests__/Cell.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Cell } from '../Cell';

describe('Cell', () => {
  it('renders empty state', () => {
    render(<Cell state="empty" onToggle={() => {}} />);
    const cell = screen.getByRole('button');
    expect(cell).toHaveStyle({ background: '#ffffff' });
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(<Cell state="empty" onToggle={onToggle} />);

    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows X symbol when marked', () => {
    render(<Cell state="marked" onToggle={() => {}} />);
    expect(screen.getByText('×')).toBeInTheDocument();
  });

  it('applies error styling when validation fails', () => {
    render(<Cell state="filled" validationState="error" onToggle={() => {}} />);
    const cell = screen.getByRole('button');
    expect(cell).toHaveClass('border-error');
  });
});
```

**Key principles**:
- Test user-visible behavior (not internal state)
- Use real user interactions (`userEvent.click`)
- Query by role/label (not class names or internals)
- Assert on rendered output (not implementation details)

### Mocking Strategy

**API Calls**: Mock Anthropic SDK using Vitest mocks

```typescript
import { vi } from 'vitest';
import { ApiClient } from '@/lib/api';

// Mock successful puzzle generation
vi.mock('@/lib/api', () => ({
  ApiClient: vi.fn().mockImplementation(() => ({
    generatePuzzle: vi.fn().mockResolvedValue(mockPuzzleMatrix),
    getHint: vi.fn().mockResolvedValue(mockHint)
  }))
}));
```

**localStorage**: Mock with in-memory implementation

```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

global.localStorage = localStorageMock as any;
```

**Timers**: Use `vi.useFakeTimers()` for cooldown tests

```typescript
it('disables hint button during cooldown', () => {
  vi.useFakeTimers();
  // ... request hint ...
  expect(hintButton).toBeDisabled();

  // Fast-forward 30 seconds
  vi.advanceTimersByTime(30000);
  expect(hintButton).not.toBeDisabled();

  vi.useRealTimers();
});
```

---

## End-to-End Testing

### What to Test

**Critical User Flows**:
1. First-time user: API key setup → puzzle generation → gameplay
2. Puzzle solving: Cell interactions → validation → completion
3. Hint system: Request hint → display → cooldown
4. Persistence: Start puzzle → refresh → resume from same state

### E2E Testing Tools

**Playwright**: Browser automation, cross-browser testing (Chrome, Firefox, Safari)

**Why Playwright**:
- Reliable (auto-waits for elements)
- Fast (parallel execution)
- Good debugging tools

### Test Structure

**Example E2E Test**:
```typescript
// e2e/game-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('nonora Game Flow', () => {
  test('complete puzzle from start to finish', async ({ page }) => {
    await page.goto('/');

    // Enter API key
    await page.fill('[data-testid="api-key-input"]', 'sk-ant-test-key');
    await page.click('[data-testid="save-key"]');

    // Enter puzzle prompt
    await page.fill('[data-testid="prompt-input"]', 'a cat');
    await page.click('[data-testid="generate-button"]');

    // Wait for puzzle
    await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });

    // Verify grid rendered
    const cells = await page.locator('[role="button"]').count();
    expect(cells).toBe(100); // 10×10 grid

    // Request hint
    await page.click('[data-testid="hint-button"]');
    await expect(page.locator('[data-testid="hint-message"]')).toBeVisible();
  });

  test('persistence: resume after refresh', async ({ page }) => {
    // ... start puzzle, fill some cells ...
    await page.reload();

    // Verify state restored
    const filledCells = await page.locator('[data-state="filled"]').count();
    expect(filledCells).toBeGreaterThan(0);
  });
});
```

**Data-testid attributes**: Use for E2E selectors (not in production rendering)

---

## Coverage Requirements

### Coverage Goals

**Unit Tests**:
- Pure functions (`lib/`): **100%** coverage (achievable, no excuses)
- Hooks: **90%+** coverage
- Components: **80%+** for critical paths

**Integration Tests**:
- Key user interactions covered
- All critical flows tested

**E2E Tests**:
- Happy paths: 100% covered
- Major error scenarios: Covered

### What NOT to Test

- Third-party libraries (Anthropic SDK, React internals)
- Trivial getters/setters
- External APIs directly (use mocks)
- Build configuration files
- Type definitions alone (TypeScript compiler checks these)

---

## Test Execution

### Running Tests

```bash
npm test                    # Unit + integration (Vitest)
npm run test:ui             # Vitest UI mode (visual)
npm run test:coverage       # Coverage report
npm run test:e2e            # E2E (Playwright)
npm run test:e2e:headed     # E2E with browser visible
npm run build               # Build verification
npx tsc --noEmit            # Type checking
```

### Test Speed Expectations

**Unit Tests**: <100ms per test (aim for <10ms)
**Integration Tests**: <500ms per test
**E2E Tests**: Seconds per test (run less frequently)

**Full test suite**: Should complete in <30 seconds (unit + integration)

### Continuous Integration

**GitHub Actions**:
- Unit tests: Run on every commit
- Integration tests: Run on every PR
- E2E tests: Run before deployment
- Type check: Run on every commit

**Blocking conditions**:
- Any failing test blocks PR merge
- Coverage drop blocks PR merge (enforce minimum coverage)

---

## Testing Patterns

### Arrange-Act-Assert (AAA)

Standard test structure:

```typescript
it('increases difficulty on fast solve', () => {
  // Arrange: Set up test data
  const currentLevel = 5;
  const metrics = { solveTime: 120, hintsUsed: 0, errors: 0 };

  // Act: Execute the function
  const newLevel = calculateNextDifficulty(currentLevel, metrics);

  // Assert: Verify the result
  expect(newLevel).toBe(6);
});
```

### Test Data Builders

Helper functions to create test data:

```typescript
function createMockPuzzle(overrides?: Partial<Puzzle>): Puzzle {
  return {
    id: '123',
    prompt: 'test',
    solution: Array(10).fill(Array(10).fill(false)),
    rowClues: [],
    columnClues: [],
    currentGrid: Array(10).fill(Array(10).fill('empty')),
    startTime: Date.now(),
    hintsUsed: 0,
    errors: 0,
    ...overrides
  };
}
```

---

## Verification Before Completion

### Pre-Commit Checklist

Must pass before committing:

- ✅ All unit tests pass (`npm test`)
- ✅ Production build succeeds (`npm run build`)
- ✅ No TypeScript errors (`npx tsc --noEmit`)
- ✅ No console.log statements in `src/` (except explicit logging)
- ✅ No TODO comments (implement or create issue)
- ✅ No `any` types (use specific types or `unknown`)

Optional for minor changes:
- ⚪ E2E tests pass (`npm run test:e2e`)

### Pre-Release Checklist

Before deploying to production:

- ✅ Full test suite passes (unit + integration + E2E)
- ✅ E2E tests pass in multiple browsers (Chrome, Firefox, Safari)
- ✅ Manual smoke test on mobile device
- ✅ Test all API error scenarios (401, 429, 500, timeout)
- ✅ Performance acceptable (generation <10s, hints <5s)
- ✅ Accessibility checked (keyboard nav, screen reader, contrast)
- ✅ Coverage meets targets (100% for lib/, 90% for hooks, 80% for components)

### Verification Command

```bash
# Run all verifications at once
npm test && npm run build && npx tsc --noEmit && npm run test:e2e
```

If this passes, code is ready to commit/deploy.

---

## Test Maintenance

### When to Update Tests

- Feature changes: Update tests to match new behavior
- Bug fixes: Add test reproducing bug, then fix
- Refactoring: Tests should pass without changes (testing behavior, not implementation)

### When to Remove Tests

- Obsolete features removed
- Replaced functionality (ensure new tests cover it)
- Duplicate tests (keep the clearest one)

### Keeping Tests Green

**Rules**:
- Never commit failing tests
- Fix broken tests immediately (within same session)
- If test is flaky, fix it or delete it (no "sometimes fails" allowed)
- Update tests alongside code changes

---

## Cross-References

- **Product requirements**: See [Product Specification](product-specification.md)
- **Architecture to test**: See [Architecture](architecture.md)
- **API testing details**: See [API Integration](api-integration.md)
