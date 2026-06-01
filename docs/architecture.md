# Architecture

**Last Updated:** 2026-06-01
**Status:** 🚧 Skeleton - Content to be extracted from existing specs

---

## Overview

Pixlogic follows a functional-reactive architecture with clear separation between business logic, state management, and presentation.

**Key Principles**:
- Pure functions for all game logic
- Immutable state updates
- React hooks for state management
- Presentational components
- No business logic in UI components

---

## Architectural Patterns

### Functional Core, Imperative Shell

[To be filled: Pure functions in lib/, side effects at boundaries]

### Unidirectional Data Flow

[To be filled: State flows down, events flow up, no circular dependencies]

### Separation of Concerns

[To be filled: Business logic vs state vs presentation]

---

## Code Organization Philosophy

### Three-Layer Architecture

**Layer 1: Pure Functions (`src/lib/`)**
- [To be filled: No side effects, fully testable, game logic]
- Examples: `validator.ts`, `clueCalculator.ts`, `difficultyEngine.ts`

**Layer 2: State Management (`src/hooks/`)**
- [To be filled: React hooks, side effects, API calls]
- Examples: `useGameState.ts`, `useHints.ts`, `usePuzzleGenerator.ts`

**Layer 3: Presentation (`src/components/`)**
- [To be filled: Visual components, props-based, no business logic]
- Examples: `Cell.tsx`, `GameBoard.tsx`, `HintDisplay.tsx`

### Why This Structure?

[To be filled: Testability, maintainability, clarity, refactoring ease]

---

## Component Structure

### Component Types

**Presentational Components**:
[To be filled: Receive props, render UI, no state/logic]

**Container Components**:
[To be filled: Manage state via hooks, coordinate data flow]

### Component Organization

```
src/components/
├── Cell.tsx              [To be filled: Purpose, props, behavior]
├── Clues.tsx             [To be filled]
├── GameBoard.tsx         [To be filled]
├── HintDisplay.tsx       [To be filled]
├── ApiKeySetup.tsx       [To be filled]
├── StartScreen.tsx       [To be filled]
├── CompletionScreen.tsx  [To be filled]
├── AiLoadingIndicator.tsx [To be filled]
└── ...
```

[To be filled: Component responsibilities, prop interfaces, composition patterns]

---

## State Management

### State Architecture

**Global State**: [To be filled: What's global, why, how managed]

**Local State**: [To be filled: What's local, when to use hooks vs props]

**Derived State**: [To be filled: Computed values, memoization strategy]

### State Shape

[To be filled: Key state structures - Puzzle, GameState, ValidationResult, etc.]

**Example: Puzzle State**
```typescript
[To be filled: Puzzle interface structure]
```

### State Updates

[To be filled: Immutability patterns, update strategies, avoiding mutations]

### Custom Hooks

[To be filled: Hook responsibilities and usage]

**`useGameState`**: [To be filled: Manages puzzle state, cell interactions]

**`useHints`**: [To be filled: Manages hint requests, cooldown, API calls]

**`usePuzzleGenerator`**: [To be filled: Manages puzzle generation, validation, retries]

**`useApiKey`**: [To be filled: Manages API key storage, validation]

---

## File Structure

### Directory Layout

```
pixlogic/
├── src/
│   ├── components/        # React UI components (presentational)
│   ├── hooks/             # Custom React hooks (state management)
│   ├── lib/               # Pure functions (business logic)
│   │   ├── clueCalculator.ts      [To be filled]
│   │   ├── validator.ts           [To be filled]
│   │   ├── difficultyEngine.ts    [To be filled]
│   │   ├── api.ts                 [To be filled]
│   │   └── puzzleGenerator.ts     [To be filled]
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       [To be filled]
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── docs/                  # Specifications
├── CLAUDE.md              # AI development guidelines
└── [build config files]
```

### File Responsibilities

[To be filled: Each file's purpose, what belongs where]

---

## Type System

### TypeScript Philosophy

[To be filled: Type safety approach, avoiding `any`, strict mode]

### Core Types

[To be filled: Key type definitions]

**`CellState`**: [To be filled: 'empty' | 'filled' | 'marked']

**`ValidationState`**: [To be filled: 'valid' | 'error' | 'in-progress']

**`Puzzle`**: [To be filled: Complete puzzle structure]

**`Hint`**: [To be filled: Guidance vs Specific hint types]

### Type Organization

[To be filled: Where types live, how they're exported, naming conventions]

---

## Data Flow

### Puzzle Generation Flow

[To be filled: User input → API call → validation → state update → render]

### Gameplay Flow

[To be filled: User click → state update → validation → render feedback]

### Hint Request Flow

[To be filled: Button click → cooldown check → API call → modal display]

---

## Business Logic Modules

### Clue Calculator (`lib/clueCalculator.ts`)

**Purpose**: [To be filled: Generate row/column clues from solution matrix]

**Key Functions**: [To be filled]

### Validator (`lib/validator.ts`)

**Purpose**: [To be filled: Check puzzle correctness, validate rows/columns]

**Key Functions**: [To be filled]

### Difficulty Engine (`lib/difficultyEngine.ts`)

**Purpose**: [To be filled: Analyze puzzle difficulty]

**Key Functions**: [To be filled]

### Puzzle Generator (`lib/puzzleGenerator.ts`)

**Purpose**: [To be filled: Wrapper around API, retry logic, validation]

**Key Functions**: [To be filled]

### API Client (`lib/api.ts`)

**Purpose**: [To be filled: Anthropic API integration]

**See**: [API Integration](api-integration.md) for complete details

---

## Design Patterns Used

### Pure Functions

[To be filled: Why, examples, benefits]

### Immutability

[To be filled: How state is never mutated, spread operators, array methods]

### Composition

[To be filled: Component composition, hook composition]

### Single Responsibility

[To be filled: Each module has one job]

---

## Dependency Management

### Technology Stack

**Core**:
- React 18
- TypeScript
- Vite (build tool)

**Styling**:
- Tailwind CSS

**Testing**:
- Vitest
- React Testing Library
- Playwright (E2E)

**API**:
- @anthropic-ai/sdk

### Why These Choices?

[To be filled: Rationale for each technology]

---

## Build & Deployment

### Build Configuration

**Vite**: [To be filled: Configuration approach, base path for GitHub Pages]

**TypeScript**: [To be filled: tsconfig settings, strict mode]

**Tailwind**: [To be filled: Configuration, custom theme]

### Deployment

**GitHub Pages**: [To be filled: Automatic deployment via GitHub Actions]

**Base Path**: `/pixlogic/` [To be filled: Why needed for GH Pages]

---

## Performance Considerations

### Bundle Size

[To be filled: Code splitting strategy, lazy loading]

### Rendering Optimization

[To be filled: Memoization, avoiding unnecessary re-renders]

### API Call Optimization

[To be filled: Caching strategy, rate limiting]

---

## Security Considerations

### Client-Side Security

**API Key Storage**: [To be filled: localStorage, never exposed to external servers]

**Prompt Injection**: See [API Integration](api-integration.md#security-architecture)

**XSS Prevention**: [To be filled: React's built-in protections, safe rendering]

---

## Accessibility

[To be filled: Keyboard navigation, ARIA labels, color contrast, touch targets]

---

## Error Handling Architecture

### Error Categories

**API Errors**: [To be filled: Rate limits, auth errors, server errors]

**Validation Errors**: [To be filled: Invalid puzzles, malformed responses]

**User Errors**: [To be filled: Invalid input, missing API key]

### Error Recovery

[To be filled: Retry strategies, fallbacks, user messaging]

---

## Future Architectural Considerations

### Scalability

[To be filled: What happens if we add features X, Y, Z]

### Extensibility

[To be filled: How to add new AI providers, puzzle types, game modes]

### Refactoring Guidelines

[To be filled: When to split modules, how to maintain architecture]

---

## Cross-References

- **Product features**: See [Product Specification](product-specification.md)
- **AI integration details**: See [API Integration](api-integration.md)
- **Testing approach**: See [Testing Strategy](testing-strategy.md)
