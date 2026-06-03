# Architecture

**Last Updated:** 2026-06-01
**Status:** ✅ Complete

---

## Overview

nonora follows a **functional-reactive architecture** with clear separation between business logic, state management, and presentation.

**Philosophy**: Components are thin presentational layers. Hooks own domain logic and state. Pure functions handle computation. Clear separation for testability.

**Key Principles**:
- Pure functions for all game logic (deterministic, no side effects)
- Immutable state updates throughout
- React hooks for state management and side effects
- Presentational components (props in, JSX out)
- No business logic in UI components

---

## Architectural Patterns

### Functional Core, Imperative Shell

**Pattern**: Pure business logic in the center, side effects at the boundaries.

**Core (Pure Functions)**:
- Located in `src/lib/`
- No side effects (no API calls, no localStorage, no random values)
- Fully deterministic and testable
- Examples: `clueCalculator.ts`, `validator.ts`, `difficultyEngine.ts`

**Shell (Side Effects)**:
- Located in `src/hooks/` and `src/App.tsx`
- Handles I/O: API calls, localStorage, timers, browser APIs
- Coordinates pure functions with external world
- Examples: `useHints.ts` (calls API), `useGamePersistence.ts` (localStorage)

**Why**: Pure functions are easy to test, reason about, and reuse. Side effects isolated to hooks make testing and debugging simpler.

### Unidirectional Data Flow

**Pattern**: Data flows down (via props), events flow up (via callbacks).

```
State (in hooks)
    ↓ props
Components (render)
    ↓ user interaction
Event handlers
    ↓ callbacks
State updates (in hooks)
    ↓ re-render
Components (updated)
```

**No circular dependencies**: Components never directly modify state. Hooks never render UI.

### Separation of Concerns

**Three layers, each with single responsibility**:

1. **Business Logic** (`src/lib/`) - "What should happen?"
   - Calculate clues from matrix
   - Validate grid against clues
   - Determine difficulty adjustment

2. **State Management** (`src/hooks/`) - "When should it happen?"
   - Manage puzzle state
   - Coordinate API calls
   - Handle persistence

3. **Presentation** (`src/components/`) - "How should it look?"
   - Render UI based on props
   - Handle user interactions
   - Display visual feedback

**No overlap**: Logic never renders. Components never compute. Hooks coordinate but don't render.

---

## Code Organization Philosophy

### Three-Layer Architecture

**Layer 1: Pure Functions (`src/lib/`)**
- No side effects, fully testable
- Input → deterministic output
- Game logic, calculations, validations
- Examples: `validator.ts` (check grid), `clueCalculator.ts` (compute clues), `difficultyEngine.ts` (calculate next difficulty)

**Layer 2: State Management (`src/hooks/`)**
- React hooks coordinating state and effects
- Side effects: API calls, localStorage, timers
- Orchestrate pure functions with external world
- Examples: `usePuzzle.ts` (puzzle state), `useHints.ts` (AI hints + cooldown), `useDifficulty.ts` (adaptive difficulty)

**Layer 3: Presentation (`src/components/`)**
- Visual components, props-based
- No business logic, only rendering and event handling
- Thin layer over hooks
- Examples: `Cell.tsx` (render cell), `GameBoard.tsx` (coordinate grid + clues), `HintDisplay.tsx` (show hint modal)

### Why This Structure?

**Testability**:
- Pure functions: Test with simple inputs/outputs, no mocking
- Hooks: Test state changes and side effects in isolation
- Components: Test rendering and user interactions

**Maintainability**:
- Clear boundaries: Know where to find/change logic
- Single responsibility: Each file has one job
- Minimal coupling: Changes in one layer rarely affect others

**Refactoring Ease**:
- Swap UI framework? Only rewrite components
- Change state management? Only rewrite hooks
- Fix logic bug? Only edit pure functions

**Clarity**:
- New developers immediately understand structure
- Debugging: Know which layer to check
- Code reviews: Violations of pattern are obvious

---

## Component Structure

### Component Types

**Presentational Components** (majority):
- Receive all data via props
- Render UI based on props
- Call prop callbacks for interactions
- No internal state (except UI-only state like hover)
- No business logic
- Examples: `Cell`, `Clues`, `HintDisplay`, `AiLoadingIndicator`

**Container Components** (few):
- Manage state via custom hooks
- Coordinate data flow between hooks and presentational components
- Handle complex interactions
- Examples: `App` (screen routing), `GameBoard` (coordinates game state + validation + hints)

### Component Organization

Key components and their responsibilities:

**`App.tsx`** (Container):
- Routes between screens based on game state
- Shows `ApiKeyInput` if no API key
- Shows `PuzzlePrompt` for puzzle generation
- Shows `GameBoard` during play
- Shows `CompletionScreen` on puzzle completion

**Layout pattern:**
- Persistent header with title ("nonora") and subtitle ("ai-powered nonogram puzzles")
- Subtitle uses `whitespace-nowrap` to prevent line wrapping
- Header visible across all screens (consistent branding)
- Screen components render below header without duplicating title/subtitle
- Settings button in top-right corner

**`GameBoard.tsx`** (Container):
- Coordinates grid, clues, hints, timer
- Uses `usePuzzle`, `useValidation`, `useHints` hooks
- Handles cell click events
- Displays hint button with cooldown
- Shows timer

**`Cell.tsx`** (Presentational):
- Renders single grid cell
- Props: `state` (empty/filled/marked), `validationState`, `onClick`
- Visual feedback on interaction (pulse animation)

**`Clues.tsx`** (Presentational):
- Displays row or column clue numbers
- Props: `clues` (array of numbers), `orientation` (row/column), `validationState`
- Shows validation colors (green/red/normal)

**`HintDisplay.tsx`** (Presentational):
- Modal showing hint text
- Props: `hint` (guidance or specific), `onDismiss`
- Highlights suggested cell for specific hints

**`CompletionScreen.tsx`** (Presentational):
- Shows completion stats and next difficulty message
- Props: `stats` (time, hints, errors), `nextDifficulty`, `onNextPuzzle`

**`PuzzlePrompt.tsx`** (Presentational):
- Puzzle prompt input and generation button
- Props: `onGenerate`, `isLoading`
- Note: Does not include title/subtitle (rendered at App.tsx level)

**`ApiKeyInput.tsx`** (Presentational):
- API key input and validation
- Props: `onSave`, `error`

**`AiLoadingIndicator.tsx`** (Presentational):
- Animated loading indicator for AI operations
- Props: `size` (small/medium/large)

### Composition Pattern

Components compose hierarchically:

```
App
├── ApiKeyInput (if no key)
├── PuzzlePrompt (if no puzzle)
│   └── AiLoadingIndicator (during generation)
├── GameBoard (during play)
│   ├── Clues (rows + columns)
│   ├── Cell (100 instances for 10×10 grid)
│   ├── HintDisplay (modal)
│   └── AiLoadingIndicator (during hint request)
└── CompletionScreen (on success)
```

**Props flow down**: Data and callbacks passed as props
**Events bubble up**: onClick → handler in container → state update → re-render

---

## State Management

### State Architecture

**Global State** (minimal):
- Current puzzle (grid, solution, clues, metadata)
- Difficulty profile (level, recent performance)
- API key
- Managed via custom hooks, not Context (hooks sufficient for this app size)

**Local State**:
- UI-only state (highlighted clue, timer display, loading states)
- Managed with `useState` in components
- Never persisted

**Derived State**:
- Computed on every render from source state
- Examples: Validation results (derived from currentGrid + solution), completion status, formatted timer
- Use `useMemo` for expensive computations
- Don't store derived state in useState (causes sync issues)

### State Shape

Key state structures (examples, not exhaustive):

**Puzzle State**:
```typescript
interface Puzzle {
  id: string;                    // Unique identifier
  prompt: string;                // User's prompt ("a cat")
  solution: boolean[][];         // NxN boolean matrix (true = filled)
  rowClues: number[][];          // Clue arrays per row
  columnClues: number[][];       // Clue arrays per column
  currentGrid: CellState[][];    // Player's progress
  startTime: number;             // Timestamp (ms) when puzzle started
  endTime?: number;              // Timestamp (ms) when puzzle completed (freezes timer)
  hintsUsed: number;             // Counter
}

type CellState = 'empty' | 'filled' | 'marked';
```

**Note on Timer Implementation:**
- `startTime`: Set when puzzle generation completes
- `endTime`: Set when puzzle is first completed (all clues satisfied)
- Timer calculation: Uses `endTime` if present (frozen), otherwise `Date.now() - startTime` (live)
- This prevents timer inflation when refreshing page on completion/stats screens

**Validation Result**:
```typescript
interface ValidationResult {
  rows: ValidationState[];       // One per row
  columns: ValidationState[];    // One per column
  isComplete: boolean;           // All filled + all valid
  isValid: boolean;              // All match clues
}

type ValidationState = 'valid' | 'error' | 'in-progress';
```

**Hint**:
```typescript
interface Hint {
  type: 'guidance' | 'specific';
  message: string;
  cell?: { row: number; col: number }; // Only for specific hints
}
```

### State Updates

**Immutability Pattern**: Never mutate state directly. Always create new objects/arrays.

**Example** (cell state update):
```typescript
// ❌ BAD: Mutation
currentGrid[row][col] = 'filled';

// ✅ GOOD: Immutable update
const newGrid = currentGrid.map((r, rIdx) =>
  r.map((cell, cIdx) =>
    rIdx === row && cIdx === col ? 'filled' : cell
  )
);
```

**Strategies**:
- Array: Use `.map()`, `.filter()`, spread operator `[...arr, newItem]`
- Object: Use spread operator `{ ...obj, field: newValue }`
- Nested updates: Update outer levels first, then inner

**Why**: React detects changes by reference. Mutations don't trigger re-renders. Immutability ensures predictable updates.

### Custom Hooks

**`usePuzzle`**:
- Purpose: Manages current puzzle state and cell interactions
- Provides: `puzzle`, `setPuzzle`, `toggleCell(row, col)`, `incrementHints()`
- Side effects: None (pure state management)
- Used by: `App`, `GameBoard`

**`useHints`**:
- Purpose: Manages hint requests, cooldown, and API calls
- Provides: `currentHint`, `requestHint()`, `dismissHint()`, `isOnCooldown`, `cooldownRemaining`
- Side effects: API calls to Anthropic, 30s cooldown timer
- Used by: `GameBoard`

**`useDifficulty`**:
- Purpose: Manages adaptive difficulty levels based on player performance
- Provides: `currentLevel`, `currentGridSize`, `recordCompletion()`, `restoreProfile()`, `resetToLevelOne()`
- Side effects: None (pure state management)
- Used by: `App`
- Notes: `resetToLevelOne()` resets the difficulty profile to level 1 (5×5 grid) while preserving the current prompt

**Note on puzzle generation**: Puzzle generation is handled by `lib/puzzleGenerator.ts` (direct function call), not a hook. App.tsx calls `generatePuzzle()` directly with loading/error state managed locally.

**`useValidation`**:
- Purpose: Real-time validation of grid against clues
- Provides: `validationResult` (rows, columns, completion status)
- Side effects: None (pure computation via validator.ts)
- Used by: `GameBoard`

**`useGamePersistence`**:
- Purpose: localStorage read/write for puzzle + difficulty
- Storage key: `nonora-game-state` (migrated from `pixlogic-game-state`)
- Provides: `loadState()`, `saveState()`, `clearState()`
- Side effects: localStorage reads/writes, debounced saves
- Used by: `App`, hooks that modify persisted state

**Migration Strategy:**
- On first load, checks for new key (`nonora-game-state`)
- If not found, attempts to load from old key (`pixlogic-game-state`)
- If old key exists: copies data to new key, deletes old key
- Migration is automatic and transparent to users (preserves all game data)

---

## File Structure

### Directory Layout

```
nonora/
├── src/
│   ├── components/        # React UI components (presentational)
│   │   ├── Cell.tsx
│   │   ├── Clues.tsx
│   │   ├── GameBoard.tsx
│   │   ├── HintDisplay.tsx
│   │   ├── CompletionScreen.tsx
│   │   ├── PuzzlePrompt.tsx
│   │   ├── ApiKeyInput.tsx
│   │   └── AiLoadingIndicator.tsx
│   │
│   ├── hooks/             # Custom React hooks (state management)
│   │   ├── usePuzzle.ts
│   │   ├── useHints.ts
│   │   ├── useValidation.ts
│   │   ├── useDifficulty.ts
│   │   └── useGamePersistence.ts
│   │
│   ├── lib/               # Pure functions (business logic)
│   │   ├── clueCalculator.ts      # Calculate row/column clues from matrix
│   │   ├── validator.ts           # Validate grid against clues
│   │   ├── difficultyEngine.ts    # Analyze performance, suggest next difficulty
│   │   ├── api.ts                 # Anthropic API client (see api-integration.md)
│   │   └── puzzleGenerator.ts     # Wrapper around API with validation/retry
│   │
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # All shared types
│   │
│   ├── App.tsx            # Main application component (screen routing)
│   └── main.tsx           # Application entry point
│
├── docs/                  # Specifications
├── CLAUDE.md              # AI development guidelines
├── vite.config.ts         # Build configuration
├── tailwind.config.js     # Styling configuration
└── tsconfig.json          # TypeScript configuration
```

### File Responsibilities

**`lib/clueCalculator.ts`**:
- Exported functions: `calculateRowClues(matrix)`, `calculateColumnClues(matrix)`
- Input: 2D boolean matrix
- Output: Array of clue arrays
- Example: `[[true, true, false, true]] → [[2, 1]]`

**`lib/validator.ts`**:
- Exported functions: `validateRow(grid, clues)`, `validateColumn(grid, clues)`, `isPuzzleComplete(grid, solution)`
- Input: Current grid + target clues or solution
- Output: ValidationState or boolean
- Logic: Compare current filled cells to target clues

**`lib/difficultyEngine.ts`**:
- Exported functions: `calculateNextDifficulty(currentLevel, metrics)`
- Input: Current difficulty + performance metrics (time, hints, errors)
- Output: New difficulty (1-10, clamped)
- Logic: Increase if fast clean solve, decrease if struggled, else stay same

**`lib/api.ts`**:
- See [API Integration](api-integration.md) for complete details
- Exported class: `ApiClient` with `generatePuzzle()`, `getHint()` methods

**`lib/puzzleGenerator.ts`**:
- Exported function: `generatePuzzleWithRetry(apiClient, prompt, difficulty, size)`
- Wraps API call with validation and retry logic
- Validates no empty rows/columns
- Retries up to 3 times on validation failure

---

## Type System

### TypeScript Philosophy

- **Strict mode enabled**: Catch errors at compile time
- **No `any` types**: Use specific types or `unknown` if truly unknown
- **Explicit over implicit**: Annotate function signatures, export types
- **DRY**: Shared types in `types/index.ts`

### Core Types

Located in `src/types/index.ts`:

```typescript
type CellState = 'empty' | 'filled' | 'marked';
type ValidationState = 'valid' | 'error' | 'in-progress';

interface Puzzle {
  id: string;
  prompt: string;
  solution: boolean[][];
  rowClues: number[][];
  columnClues: number[][];
  currentGrid: CellState[][];
  startTime: number;
  endTime?: number;              // Set when completed, freezes timer
  hintsUsed: number;
}

interface Hint {
  type: 'guidance' | 'specific';
  message: string;
  cell?: { row: number; col: number };
}

interface ValidationResult {
  rows: ValidationState[];
  columns: ValidationState[];
  isComplete: boolean;
  isValid: boolean;
}
```

**Naming Conventions**:
- Types/Interfaces: PascalCase (`Puzzle`, `CellState`)
- Type values: lowercase with hyphens (`'empty'`, `'in-progress'`)

---

## Build Configuration

### Vite Configuration

**File**: `vite.config.ts`

**Key Settings**:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/nonora/',           // Base path for GitHub Pages deployment
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),   // Import alias: @/components
    },
  },
  test: {
    globals: true,               // Enable global test APIs (describe, it, expect)
    environment: 'jsdom',        // Browser-like environment for component tests
    setupFiles: './src/test/setup.ts',
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})
```

**Path Alias Usage**:
```typescript
// Instead of: import { Puzzle } from '../../../types'
import { Puzzle } from '@/types'

// Instead of: import { validateGrid } from '../../lib/validator'
import { validateGrid } from '@/lib/validator'
```

**Why `/nonora/` base path**:
- GitHub Pages serves projects at `username.github.io/repo-name/`
- Without this, asset paths would break in production
- Local dev uses root `/`, production uses `/nonora/`

### Tailwind Configuration

**File**: `tailwind.config.js`

**Custom Theme Extensions**:

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom color palette
      colors: {
        primary: '#5a85be',          // Desaturated blue (app background)
        'cell-filled': '#4CAF50',    // Green for filled cells
        'cell-border': '#e0e0e0',    // Light gray for cell borders
        error: '#f44336',            // Red for validation errors
        success: '#4CAF50',          // Green for success states
      },

      // Custom animations for AI loading indicator
      keyframes: {
        'ai-pulse': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' }
        }
      },
      animation: {
        'ai-pulse': 'ai-pulse 1.5s ease-in-out infinite'
      }
    },
  },

  // Custom utility classes for animation delays
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-200': { 'animation-delay': '200ms' },
        '.animation-delay-400': { 'animation-delay': '400ms' }
      }
      addUtilities(newUtilities)
    }
  ],
}
```

**Glass Morphism Utilities**:

Defined in `src/index.css`:

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.glass-input {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}
```

**Usage Examples**:

```tsx
// Glass morphism button
<button className="glass rounded-lg px-4 py-2">
  Get Hint
</button>

// Glass morphism card
<div className="glass-card rounded-2xl p-6 shadow-2xl">
  {/* Content */}
</div>

// AI loading with staggered animation
<div className="flex gap-3">
  <span className="animate-ai-pulse">✨</span>
  <span className="animate-ai-pulse animation-delay-200">✨</span>
  <span className="animate-ai-pulse animation-delay-400">✨</span>
</div>
```

### TypeScript Configuration

**File**: `tsconfig.json`

**Strict Mode**: Enabled for maximum type safety

**Path Mapping**: `@/*` maps to `src/*` (matches Vite alias)

### Deployment

**Platform**: GitHub Pages

**Deployment Flow**:
1. Push to `main` branch
2. GitHub Actions runs build: `npm run build`
3. Build output (dist/) deployed to `gh-pages` branch
4. Available at: `https://username.github.io/nonora/`

**Manual Deployment**: `npm run deploy` (uses `gh-pages` package)

**Build Commands**:
- `npm run build` - Production build (dist/)
- `npm run preview` - Preview production build locally
- `npm run deploy` - Build + deploy to GitHub Pages

---

## Data Flow

**Puzzle Generation Flow**:
```
User enters prompt
    ↓
PuzzlePrompt → App.tsx handleGenerate()
    ↓
lib/puzzleGenerator.ts generatePuzzle()
    ↓
API call (lib/api.ts)
    ↓
Validation (lib/puzzleGenerator.ts)
    ↓
Calculate clues (lib/clueCalculator.ts)
    ↓
Create Puzzle object → usePuzzle.setPuzzle()
    ↓
GameBoard renders
```

**Gameplay Flow**:
```
User taps cell
    ↓
Cell component → onClick callback
    ↓
GameBoard → usePuzzle.toggleCell()
    ↓
Update currentGrid (immutable)
    ↓
useValidation → lib/validator.ts
    ↓
Return ValidationResult
    ↓
GameBoard re-renders with feedback
```

**Hint Request Flow**:
```
User taps "Get Hint"
    ↓
GameBoard → useHints.requestHint()
    ↓
Cooldown check (if active, abort)
    ↓
Determine type (guidance vs specific)
    ↓
API call with current grid state
    ↓
Display hint in modal
    ↓
Start 30s cooldown
```

---

## Business Logic Modules

### Clue Calculator (`lib/clueCalculator.ts`)

**Purpose**: Calculate row and column clues from solution matrix

**Key Functions**:
- `calculateRowClues(matrix: boolean[][]): number[][]`
- `calculateColumnClues(matrix: boolean[][]): number[][]`

**Logic**: Count consecutive `true` values, return array of counts

### Validator (`lib/validator.ts`)

**Purpose**: Validate current grid against target clues

**Key Functions**:
- `validateRow(row: CellState[], clues: number[]): ValidationState`
- `validateColumn(column: CellState[], clues: number[]): ValidationState`
- `isPuzzleComplete(grid: CellState[][], solution: boolean[][]): boolean`

**Logic**: Compare filled cells to clues, detect errors/completion

### Difficulty Engine (`lib/difficultyEngine.ts`)

**Purpose**: Analyze performance and suggest next difficulty

**Key Functions**:
- `calculateNextDifficulty(currentLevel: number, metrics: PerformanceMetrics): number`

**Logic**: Increase if fast solve, decrease if struggled, else keep same

### Puzzle Generator (`lib/puzzleGenerator.ts`)

**Purpose**: Wrap API calls with validation and retry

**Key Functions**:
- `generatePuzzleWithRetry(apiClient, prompt, difficulty, size): Promise<Puzzle>`

**Logic**: Call API → validate → retry if invalid → create Puzzle object

### API Client (`lib/api.ts`)

**See**: [API Integration](api-integration.md) for complete details

---

## Design Patterns Used

**Pure Functions**: All `lib/` modules export pure functions (no side effects)

**Immutability**: State never mutated, always new objects/arrays created

**Composition**: Components compose hierarchically, hooks compose functionality

**Single Responsibility**: Each file/function has one clear purpose

**Dependency Injection**: Hooks receive dependencies (apiClient) as parameters, not hardcoded

---

## Dependency Management

### Technology Stack

**Core**: React 18, TypeScript, Vite
**Styling**: Tailwind CSS
**Testing**: Vitest, React Testing Library, Playwright
**API**: @anthropic-ai/sdk

**Why These Choices**:
- **React**: Component model fits game UI well
- **TypeScript**: Type safety for complex state
- **Vite**: Fast builds, modern tooling
- **Tailwind**: Rapid styling, mobile-first
- **Vitest**: Fast unit tests, Jest-compatible API
- **Playwright**: Reliable E2E testing

---

## Build & Deployment

**Vite**: Configured with base path `/nonora/` for GitHub Pages

**TypeScript**: Strict mode, path aliases (`@/components`)

**Tailwind**: Custom colors in `tailwind.config.js`

**GitHub Pages**: Automatic deployment on push to `main`

---

## Performance Considerations

**Bundle Size**: Single-page app, minimal dependencies

**Rendering**: `useMemo` for expensive validations, pure components prevent unnecessary re-renders

**API**: No caching currently (each puzzle unique)

---

## Security Considerations

**API Key**: Stored in localStorage, only sent to Anthropic

**Prompt Injection**: See [API Integration](api-integration.md#security-architecture)

**XSS**: React escapes user input by default

---

## Accessibility

Keyboard navigation (arrow keys, space bar), ARIA labels on cells, WCAG AAA contrast, 44px touch targets

---

## Cross-References

- **Product features**: See [Product Specification](product-specification.md)
- **AI integration details**: See [API Integration](api-integration.md)
- **Testing approach**: See [Testing Strategy](testing-strategy.md)
