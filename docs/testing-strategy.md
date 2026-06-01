# Testing Strategy

**Last Updated:** 2026-06-01
**Status:** 🚧 Skeleton - Content to be extracted from existing practices

---

## Overview

Pixlogic follows a comprehensive testing strategy with three layers:
1. **Unit Tests** - Pure functions and hooks
2. **Integration Tests** - Component interactions
3. **End-to-End Tests** - Full user flows

**Philosophy**: Test-Driven Development (TDD) - Write tests first, then implementation.

---

## Test-Driven Development (TDD)

### Why TDD?

[To be filled: Benefits, how it shapes design, reduces bugs]

### TDD Workflow

1. [To be filled: Write failing test]
2. [To be filled: Implement minimal code to pass]
3. [To be filled: Refactor while keeping tests green]
4. [To be filled: Repeat]

### When to Use TDD

[To be filled: Always for new features, bug fixes require test reproduction]

---

## Unit Testing

### What to Test

**Pure Functions (`src/lib/`)**:
- [To be filled: All exported functions, edge cases, error conditions]

**Examples**:
- `clueCalculator.ts`: [To be filled: calculateRowClues, calculateColumnClues]
- `validator.ts`: [To be filled: validateRow, validateColumn, isPuzzleComplete]
- `difficultyEngine.ts`: [To be filled: calculateDifficulty]

### Testing Pure Functions

[To be filled: Input → expected output, no mocks needed, fast execution]

**Example Test Structure**:
```typescript
[To be filled: Example test for calculateRowClues]
```

### Testing React Hooks

[To be filled: @testing-library/react-hooks, renderHook pattern]

**Example Test Structure**:
```typescript
[To be filled: Example test for useGameState]
```

### Test File Organization

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

[To be filled: Co-location strategy, naming conventions]

---

## Integration Testing

### What to Test

**Component Integration**:
- [To be filled: Component + hooks, user interactions, state updates]

**Examples**:
- `GameBoard.tsx` + `useHints`: [To be filled: Hint button → API call → modal display]
- `Cell.tsx` interactions: [To be filled: Click → state update → visual feedback]

### Testing Components

[To be filled: React Testing Library, user-centric queries, testing behavior not implementation]

**Example Test Structure**:
```typescript
[To be filled: Example test for Cell click behavior]
```

### Mocking Strategy

**API Calls**: [To be filled: Mock Anthropic SDK, test success/error paths]

**localStorage**: [To be filled: Mock browser APIs]

**Timers**: [To be filled: Mock for cooldown tests]

---

## End-to-End Testing

### What to Test

**Critical User Flows**:
1. [To be filled: First-time setup → API key → puzzle generation]
2. [To be filled: Puzzle solving → validation → completion]
3. [To be filled: Hint system → cooldown → modal]

### E2E Testing Tools

**Playwright**: [To be filled: Browser automation, cross-browser testing]

### Test Structure

[To be filled: Page objects, test scenarios, setup/teardown]

**Example E2E Test**:
```typescript
[To be filled: Example full user flow test]
```

---

## Coverage Requirements

### Coverage Goals

**Unit Tests**:
- Pure functions: [To be filled: 100% coverage expected]
- Hooks: [To be filled: 90%+ coverage]
- Components: [To be filled: 80%+ coverage for critical paths]

**Integration Tests**:
- [To be filled: Key user interactions, critical flows]

**E2E Tests**:
- [To be filled: Happy paths, major error scenarios]

### What NOT to Test

[To be filled: Third-party libraries, trivial code, external APIs directly]

---

## Test Execution

### Running Tests

```bash
npm test              # Unit and integration tests (Vitest)
npm run test:e2e      # End-to-end tests (Playwright)
npm run build         # Production build verification
npx tsc --noEmit      # TypeScript type checking
```

### Test Speed Expectations

**Unit Tests**: [To be filled: Fast (<100ms per test)]

**Integration Tests**: [To be filled: Moderate (<500ms per test)]

**E2E Tests**: [To be filled: Slow (seconds per test, run less frequently)]

### Continuous Integration

[To be filled: GitHub Actions, when tests run, blocking conditions]

---

## Testing Patterns

### Arrange-Act-Assert (AAA)

[To be filled: Test structure pattern, examples]

### Given-When-Then

[To be filled: BDD-style test structure for complex scenarios]

### Test Data Builders

[To be filled: Creating test puzzles, mock data generation]

---

## Testing Business Logic

### Clue Calculation Tests

[To be filled: Edge cases - empty rows, full rows, various patterns]

### Validation Tests

[To be filled: Correct/incorrect grids, partial completion, edge cases]

### Difficulty Calculation Tests

[To be filled: Various puzzle complexities, difficulty bounds]

---

## Testing State Management

### Hook Testing Strategy

[To be filled: Initial state, state transitions, side effects]

**`useGameState` Tests**:
- [To be filled: Cell state changes, grid updates, immutability]

**`useHints` Tests**:
- [To be filled: Hint requests, cooldown logic, error handling]

**`usePuzzleGenerator` Tests**:
- [To be filled: Generation flow, validation, retry logic]

---

## Testing UI Components

### Component Testing Strategy

[To be filled: Props-based testing, user events, accessibility]

### Visual Regression Testing

[To be filled: Future consideration, snapshot tests]

### Accessibility Testing

[To be filled: ARIA labels, keyboard navigation, screen reader support]

---

## Testing API Integration

### Mocking Anthropic API

[To be filled: Success responses, error responses, rate limits]

### Testing Error Handling

[To be filled: 401, 429, 500 errors, network failures]

### Testing Response Parsing

[To be filled: Valid JSON, malformed JSON, missing fields]

---

## Testing Error Scenarios

### User Error Scenarios

- [To be filled: Missing API key, invalid prompt, network issues]

### System Error Scenarios

- [To be filled: API failures, validation errors, unexpected states]

### Recovery Testing

[To be filled: Retry logic, fallback behavior, user messaging]

---

## Performance Testing

### Rendering Performance

[To be filled: Re-render counts, memoization verification]

### API Response Time

[To be filled: Expected response times, timeout handling]

---

## Verification Before Completion

### Pre-Commit Checklist

- [ ] All unit tests pass (`npm test`)
- [ ] Production build succeeds (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] E2E tests pass (`npm run test:e2e`) - optional for minor changes
- [ ] No console.log statements in source
- [ ] No TODO comments (implement or create issue)
- [ ] No `any` types (use specific types)

### Pre-Release Checklist

- [ ] Full test suite passes
- [ ] E2E tests pass across browsers
- [ ] Manual smoke testing on mobile
- [ ] API error scenarios tested
- [ ] Performance acceptable
- [ ] Accessibility checked

---

## Debugging Failed Tests

### Common Issues

[To be filled: Async timing, mock configuration, stale state]

### Debugging Strategies

[To be filled: Isolate failing test, add logging, check test data]

---

## Test Maintenance

### When to Update Tests

- [To be filled: Feature changes, bug fixes, refactoring]

### When to Remove Tests

- [To be filled: Obsolete features, replaced functionality]

### Keeping Tests Green

[To be filled: Fix broken tests immediately, don't commit failing tests]

---

## Future Testing Considerations

### Visual Regression Testing

[To be filled: Screenshot comparison, when to implement]

### Performance Benchmarking

[To be filled: Automated performance tests]

### Load Testing

[To be filled: API rate limit testing, concurrent users]

---

## Cross-References

- **Product requirements**: See [Product Specification](product-specification.md)
- **Architecture to test**: See [Architecture](architecture.md)
- **API testing details**: See [API Integration](api-integration.md)
