# Pixlogic - AI-Powered Nonogram Puzzle Game

**Design Specification**
Date: 2026-05-24
Status: Approved

## Overview

Pixlogic is a browser-based nonogram puzzle game where users enter text prompts (e.g., "a cat") and Claude AI generates pixel art puzzles to solve. The game features adaptive difficulty, an AI hint system, and is optimized for mobile play.

**Key features:**
- AI-generated 10x10 puzzles from user prompts via Anthropic API
- Real-time validation with visual feedback
- Adaptive hint system (gentle guidance → specific moves)
- Adaptive difficulty based on performance metrics
- Mobile-first design with touch-optimized interactions
- Full persistence across sessions (current puzzle + difficulty profile)

**Tech stack:**
- React + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Vitest + React Testing Library (testing)
- Playwright (E2E testing)
- Anthropic API (puzzle generation + hints)

**Deployment:**
- Static GitHub Pages deployment
- Users provide their own Anthropic API key (stored locally)
- No backend required (can add rate-limited backend later)

---

## Architecture

### Approach: Component + Custom Hooks

**Philosophy:**
- Components are thin presentational layers
- Hooks own domain logic and state
- Pure functions in `lib/` handle computation
- Clear separation of concerns for testability

### File Structure

```
pixlogic/
├── src/
│   ├── components/
│   │   ├── App.tsx                 # Root component, screen routing
│   │   ├── PuzzlePrompt.tsx        # Text input for puzzle generation
│   │   ├── GameBoard.tsx           # Main game grid + clues + controls
│   │   ├── Cell.tsx                # Individual grid cell
│   │   ├── Clues.tsx               # Row/column clues with highlighting
│   │   ├── CompletionScreen.tsx    # Success message + stats + next difficulty
│   │   └── ApiKeyInput.tsx         # API key entry component
│   │
│   ├── hooks/
│   │   ├── usePuzzle.ts            # Manages puzzle state (grid, solution, clues)
│   │   ├── useDifficulty.ts        # Tracks performance, calculates next difficulty
│   │   ├── useHints.ts             # Handles AI hint requests (gentle → specific)
│   │   ├── useValidation.ts        # Real-time validation logic
│   │   └── useGamePersistence.ts   # localStorage read/write for state + difficulty
│   │
│   ├── lib/
│   │   ├── api.ts                  # Anthropic API calls (generate puzzle, get hints)
│   │   ├── puzzleGenerator.ts      # Validates generated matrix, retries if needed
│   │   ├── clueCalculator.ts       # Computes row/column clues from binary matrix
│   │   ├── validator.ts            # Check if current grid violates clues
│   │   └── difficultyEngine.ts     # Analyzes performance, suggests next difficulty
│   │
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   │
│   └── main.tsx                    # Vite entry point
│
├── e2e/
│   └── game-flow.spec.ts           # Playwright E2E tests
│
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-05-24-pixlogic-design.md
│
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

### Component Responsibilities

**App.tsx:**
- Routes between screens based on game state
- Shows `ApiKeyInput` if no key stored
- Shows `PuzzlePrompt` if no active puzzle
- Shows `GameBoard` during play
- Shows `CompletionScreen` on success

**GameBoard.tsx:**
- Orchestrates grid, clues, hint button, timer
- Uses `usePuzzle`, `useValidation`, `useHints`
- Displays timer (MM:SS format)

**Cell.tsx:**
- Renders single grid cell with current state
- Handles tap interaction (triple-tap cycle: empty → filled → marked → empty)
- Shows visual feedback (pulse animation on tap)

**Clues.tsx:**
- Displays row/column clue numbers
- Highlights corresponding clues when cell selected (contextual highlighting)
- Shows validation state (red for errors, green for completed rows/columns)

**CompletionScreen.tsx:**
- Shows completion stats (time, hints, accuracy)
- Displays difficulty change preview
- "Next Puzzle" button to generate new puzzle

**ApiKeyInput.tsx:**
- Input field for Anthropic API key
- Validates key format
- Saves to localStorage
- Shows security message ("Key stored locally, never shared")

### Hook Responsibilities

**usePuzzle.ts:**
- Manages current puzzle state (solution matrix, current grid, clues, metadata)
- Provides `toggleCell(row, col)` to cycle cell states
- Tracks puzzle start time, hints used, errors made

**useDifficulty.ts:**
- Maintains difficulty profile (level 1-10, recent performance history)
- Records performance after each completion
- Calculates next difficulty level based on metrics
- Provides difficulty adjustment preview message

**useHints.ts:**
- Manages hint cooldown (30 seconds between hints)
- Tracks hint escalation (gentle guidance first, specific if requested again within 2 minutes)
- Calls AI to generate hints based on current grid state
- Increments hint counter on each use

**useValidation.ts:**
- Real-time validation of current grid against target clues
- Returns validation state for each row/column (valid, over-filled, in-progress)
- Detects puzzle completion (all cells filled + all clues match)
- Tracks error count when violations occur

**useGamePersistence.ts:**
- Loads state from localStorage on mount
- Saves current puzzle, difficulty profile, API key after changes
- Implements debounced saves (don't save on every cell toggle, batch updates)
- Handles localStorage quota errors gracefully

---

## Data Model

### TypeScript Types

```typescript
// Cell states
type CellState = 'empty' | 'filled' | 'marked';

// A single puzzle
interface Puzzle {
  id: string;                    // Unique ID (timestamp-based)
  prompt: string;                // User's original prompt ("a cat")
  solution: boolean[][];         // 10x10 binary matrix (true = filled)
  rowClues: number[][];          // Array of clue arrays for each row
  columnClues: number[][];       // Array of clue arrays for each column
  currentGrid: CellState[][];    // Player's current progress
  startTime: number;             // Timestamp when puzzle started (ms)
  hintsUsed: number;             // Count of hints requested
  errors: number;                // Count of validation violations
}

// Difficulty tracking
interface DifficultyProfile {
  level: number;                 // 1-10 scale (starts at 1)
  gridSize: number;              // Currently 10, can scale up later
  recentPerformance: PerformanceMetrics[]; // Last 5 puzzles
}

// Performance metrics per puzzle
interface PerformanceMetrics {
  solveTime: number;        // Seconds to complete
  hintsUsed: number;        // Count of hints requested
  errors: number;           // Count of validation violations
  struggled: boolean;       // Derived: hintsUsed > 2 OR errors > 5 (for display/analytics)
}

// Hint response from AI
interface Hint {
  type: 'guidance' | 'specific'; // Gentle or exact
  message: string;               // Human-readable hint
  cell?: { row: number; col: number }; // Only for specific hints
}

// Persisted state in localStorage
interface GameState {
  apiKey?: string;
  currentPuzzle?: Puzzle;
  difficultyProfile: DifficultyProfile;
}

// Validation state for a row/column
type ValidationState = 'valid' | 'error' | 'in-progress';

interface ValidationResult {
  rows: ValidationState[];
  columns: ValidationState[];
  isComplete: boolean;
  isValid: boolean;
}
```

### State Flow

1. **Puzzle Generation:**
   - User enters prompt → API call → Matrix generated → Clues calculated → `Puzzle` created with empty `currentGrid`

2. **Gameplay:**
   - Player taps cell → `currentGrid` updates → `useValidation` checks → Visual feedback
   - Validation errors → increment error counter → highlight affected row/column
   - Player requests hint → cooldown check → AI call → hint displayed → increment hint counter

3. **Completion:**
   - Grid fully filled + all clues valid → Completion detected
   - Stats calculated (solve time, hints, errors)
   - Difficulty profile updated with new metrics
   - `CompletionScreen` shown with next difficulty preview

4. **Persistence:**
   - After each cell toggle → debounced save to localStorage
   - After completion → immediate save with updated difficulty profile
   - On app load → restore from localStorage if available

---

## AI Integration

### Puzzle Generation

**Flow:**
1. User enters prompt (e.g., "a cat")
2. Call Anthropic API with structured generation request
3. Validate response
4. Retry if needed (up to 3 attempts)
5. Create puzzle and start game

**API Prompt Template:**

```
Generate a {size}x{size} nonogram puzzle representing "{userPrompt}" as pixel art.

Requirements:
- Return a JSON object with a "matrix" field containing a 2D boolean array
- true = filled cell, false = empty cell
- Create a recognizable shape that works as pixel art
- Ensure the puzzle has clear, unambiguous clues
- Difficulty level: {difficultyLevel}/10 (1=very simple shapes, 10=expert complexity)
- The puzzle should be solvable using logic alone (no guessing required)

Return ONLY valid JSON, no other text.

Example format:
{
  "matrix": [
    [false, true, true, false, ...],
    [true, true, true, true, ...],
    ...
  ]
}
```

**Validation After Generation:**
- Parse JSON response
- Verify matrix is 10x10 (or requested size)
- Check no entirely empty rows/columns (invalid puzzle)
- Calculate clues using `clueCalculator.ts`
- Verify reasonable clue distribution (heuristic: largest clue ≤ 70% of row size)
- If validation fails → retry with adjusted prompt: "Previous attempt was invalid. Ensure the puzzle has a clear recognizable shape."

**Error Handling:**
- Network errors → Show user-friendly message, allow retry
- Invalid API key → Show error, prompt to re-enter key
- Rate limits → Show message: "API rate limit reached. Please wait a moment."
- Malformed responses → Retry up to 3 times, then show error: "Failed to generate puzzle. Please try a different prompt."
- Timeout (>30s) → Show error, allow retry

### Hint System

**Flow:**
1. Player taps "Get Hint" button
2. Check cooldown (30 seconds between hints)
3. Determine hint type (guidance vs specific based on recent hint timing)
4. Call AI with current grid state
5. Display hint
6. Increment hint counter

**Gentle Guidance Prompt (first hint or >2 minutes since last hint):**

```
You are helping someone solve a nonogram puzzle. Current state:

Row clues: {rowClues as array}
Column clues: {columnClues as array}
Current grid state: {visual representation of currentGrid}

Provide strategic guidance about which row or column to focus on next.
Don't give exact cell coordinates - help them think through the logic.
Keep it brief (1-2 sentences).

Example good hint: "Look at row 5 - with a clue of '8', you can deduce several cells must be filled."
Example bad hint: "Fill cell (3, 4)."
```

**Specific Hint Prompt (second hint within 2 minutes):**

```
You are helping someone solve a nonogram puzzle. Current state:

Row clues: {rowClues as array}
Column clues: {columnClues as array}
Current grid state: {visual representation of currentGrid}

Analyze the grid and provide the next logical cell to fill or mark.

Return ONLY valid JSON in this format:
{
  "row": <number 0-9>,
  "col": <number 0-9>,
  "action": "fill" | "mark",
  "reasoning": "<brief explanation why this cell is the next logical move>"
}
```

**Hint Display:**
- Guidance hints: Show as toast/modal with message
- Specific hints: Highlight the suggested cell + show reasoning
- Hint cooldown: Show countdown timer on hint button when on cooldown

**Escalation Logic:**
```typescript
const timeSinceLastHint = now - lastHintTime;
const hintType = timeSinceLastHint < 120000 ? 'specific' : 'guidance'; // 2 minutes
```

### API Security

**Approach:** User provides their own API key

**Implementation:**
- API key input on first launch
- Stored in `localStorage` under key `pixlogic_api_key`
- Never sent to any server except Anthropic's API
- All API calls made client-side from browser
- Clear messaging: "Your API key is stored locally and only used to generate puzzles. It never leaves your device except to communicate with Anthropic."

**Key validation:**
- Check format (starts with `sk-ant-`)
- Test with simple API call before saving
- Show error if invalid

**Future backend option:**
- Add serverless function (Cloudflare Workers) with rate limiting
- Provide demo mode with limited free puzzles per day
- Users can still use their own key for unlimited play

---

## Game Mechanics & Interactions

### Cell Interaction (Mobile-Optimized)

**Triple-tap cycle:**
1. **Tap 1:** `empty` → `filled` (green background #4CAF50)
2. **Tap 2:** `filled` → `marked` (white background with gray X symbol)
3. **Tap 3:** `marked` → `empty` (white background)

**Visual feedback:**
- **Filled:** Green background, rounded corners (4px)
- **Marked:** White background, gray X (✕) centered
- **Empty:** White background, light gray border (#e0e0e0)
- **Active (just tapped):** Subtle pulse animation (scale 1.05, 200ms)

**Touch targets:**
- Minimum 44x44px per Apple/Google accessibility guidelines
- Cells scale responsively to fit screen
- Grid gap: 2-3px for visual separation

**Purpose of marked cells (X):**
- Strategic tool for players to mark cells they've deduced must be empty
- Helps visualize "negative space"
- Prevents accidental filling of known-empty cells
- Optional - casual players can ignore and just use empty/filled

### Real-Time Validation

**Validation logic:**

For each row and column:
1. Calculate current clues from filled cells in `currentGrid`
2. Compare to target clues

**States:**
- **In-progress:** Current clues could still lead to target (e.g., "2" filled so far, target is "2 3")
- **Error:** Impossible to reach target (e.g., "3" filled in a row, target is "2")
- **Valid:** Exact match (row/column is complete and correct)

**Visual indicators:**
- **Error state:**
  - Row clue: Red text + red left border on affected row
  - Column clue: Red text + red top border on affected column
  - Increment error counter

- **Valid state:**
  - Row/column clue: Green text + subtle green checkmark
  - No further changes needed in that row/column

- **In-progress:**
  - Normal display (white text, slightly dimmed)

**Validation timing:**
- Check on every cell state change
- Debounce visual updates (50ms) to prevent flashing

### Clue Highlighting (Contextual Display)

**Default state:**
- All clues visible but dimmed (60% opacity, `rgba(255,255,255,0.6)`)

**On cell tap:**
- Highlight corresponding row AND column clues
- 100% opacity + green background (`rgba(76,175,80,0.2)`)
- Bold text

**Highlight persistence:**
- Remains for 2 seconds after last cell interaction
- Fade out transition (300ms)

**Error override:**
- If row/column has validation error, red error styling overrides highlight

**Implementation:**
```typescript
const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
const [highlightedCol, setHighlightedCol] = useState<number | null>(null);

const handleCellTap = (row: number, col: number) => {
  setHighlightedRow(row);
  setHighlightedCol(col);

  // Clear highlight after 2 seconds
  setTimeout(() => {
    setHighlightedRow(null);
    setHighlightedCol(null);
  }, 2000);
};
```

### Completion Detection

**Check on every cell change:**
1. Is grid fully filled? (no `empty` cells)
2. Do all row clues match exactly?
3. Do all column clues match exactly?

**Success trigger:**
```typescript
const isComplete =
  !currentGrid.flat().includes('empty') &&
  allRowsValid &&
  allColumnsValid;

if (isComplete) {
  const solveTime = (Date.now() - puzzle.startTime) / 1000; // seconds
  const metrics = {
    solveTime,
    hintsUsed: puzzle.hintsUsed,
    errors: puzzle.errors,
    struggled: puzzle.hintsUsed > 2 || puzzle.errors > 5
  };

  updateDifficultyProfile(metrics);
  showCompletionScreen(metrics);
}
```

### Timer

**Implementation:**
- Start when puzzle loads (puzzle.startTime)
- Display in header: MM:SS format
- Update every second
- Pause when app goes to background (Page Visibility API)
- Stop on completion
- Resume from saved time if puzzle loaded from localStorage

```typescript
const [elapsedTime, setElapsedTime] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    if (!document.hidden) {
      setElapsedTime(Date.now() - puzzle.startTime);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [puzzle.startTime]);

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

---

## Adaptive Difficulty System

### Performance Metrics

**Tracked per puzzle:**
```typescript
interface PerformanceMetrics {
  solveTime: number;        // Seconds to complete
  hintsUsed: number;        // Count of hints requested
  errors: number;           // Count of validation violations
  struggled: boolean;       // Derived: hintsUsed > 2 OR errors > 5 (for display/analytics)
}
```

### Difficulty Adjustment Algorithm

**After each puzzle completion:**
1. Record performance metrics
2. Add to `recentPerformance` array (keep last 5 puzzles, FIFO)
3. Calculate difficulty adjustment

**Adjustment logic:**
```typescript
function calculateNextDifficulty(
  currentLevel: number,
  metrics: PerformanceMetrics
): number {
  let newLevel = currentLevel;

  // Clean solve: fast + minimal hints + few errors
  if (
    metrics.solveTime < 180 &&  // < 3 minutes
    metrics.hintsUsed <= 1 &&
    metrics.errors <= 2
  ) {
    newLevel += 1; // Increase difficulty
  }

  // Struggled: slow OR many hints OR many errors
  else if (
    metrics.solveTime > 600 ||  // > 10 minutes
    metrics.hintsUsed > 3 ||
    metrics.errors > 8
  ) {
    newLevel -= 1; // Decrease difficulty
  }

  // Otherwise: keep same difficulty

  // Clamp to valid range
  return Math.max(1, Math.min(10, newLevel));
}
```

**Difficulty level effects (1-10 scale):**

Communicated to AI via prompt parameter:

- **Level 1-3:** "Very simple shapes with high contrast. Obvious patterns. Example: basic heart, smiley face."
- **Level 4-6:** "Moderate detail. Some ambiguity requiring logic. Example: cat silhouette, house."
- **Level 7-10:** "Complex shapes with fine details. Advanced solving techniques needed. Example: detailed portrait, intricate object."

The AI uses this context to generate appropriately complex matrices.

### Completion Screen Feedback

**Display format:**

```
🎉 Puzzle Complete!

[Pixel art preview of completed puzzle]

Time: 4:32
Hints used: 1
Accuracy: 96% (2 errors)

─────────────────

Next puzzle: Same difficulty
You're doing well! Let's see how you handle another at this level.

[Generate Next Puzzle →]
```

**Difficulty change messages:**

- **Increase:** "Next puzzle: Harder ↑ — Great solve! Time to challenge yourself more."
- **Decrease:** "Next puzzle: Easier ↓ — Let's dial it back to keep it fun."
- **Same:** "Next puzzle: Same difficulty — You're doing well! Keep practicing at this level."

**Edge cases:**
- Difficulty cannot go below 1 or above 10 (clamped in calculation)
- First puzzle always starts at level 1

---

## Visual Design & Styling

### Design System

**Color palette:**
```javascript
// tailwind.config.js
colors: {
  primary: '#0d47a1',        // Dark blue background
  'cell-filled': '#4CAF50',  // Green filled cells
  'cell-border': '#e0e0e0',  // Light gray borders
  error: '#f44336',          // Red error state
  success: '#4CAF50',        // Green success state
  white: '#ffffff',
  // ... Tailwind defaults
}
```

**Typography:**
- **Title:** 1.8rem, font-weight 500, letter-spacing 2px, "PIXLOGIC ✨"
- **Clues:** 9-10px, monospace for alignment, white text
- **Buttons:** 0.95rem, font-weight 600
- **Body text:** 1rem, default system font stack

**Component styles:**

**Background:**
- Main app background: `#0d47a1` (dark blue)
- WCAG AAA contrast with white text: 11.4:1

**Grid container:**
- Background: white
- Padding: 1rem
- Border-radius: 8px
- Box-shadow: `0 4px 12px rgba(0,0,0,0.3)`

**Cells:**
- Size: 28-32px (responsive, scales down on small screens)
- Border: 2px solid `#e0e0e0`
- Border-radius: 4px
- Gap: 2-3px
- **Filled:** Background `#4CAF50`
- **Marked:** White background, gray ✕ symbol (font-size: 1.2rem, color: `#666`)
- **Empty:** White background
- **Active:** Scale 1.05, transition 200ms

**Buttons:**
- Primary (New Puzzle): Background `#4CAF50`, white text, rounded 8px, shadow
- Secondary (Get Hint): White background, gray text, 2px border, rounded 8px

**Clues:**
- Font-size: 9px
- Color: `rgba(255,255,255,0.6)` (dimmed)
- Highlighted: `rgba(76,175,80,0.2)` background, 100% opacity
- Error: Red text `#f44336`, red border on row/column
- Valid: Green text `#4CAF50`, checkmark icon

### Responsive Design

**Breakpoints:**
```javascript
// tailwind.config.js
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet portrait
  'lg': '1024px',  // Desktop
}
```

**Mobile-first (default, 320px - 640px):**
- Grid cells: 26-28px
- Full-width layout with padding
- Clues: 9px font
- Title: 1.5rem

**Tablet (640px - 1024px):**
- Grid cells: 32px
- More spacing around grid
- Clues: 10px font
- Title: 1.8rem

**Desktop (1024px+):**
- Max-width: 600px, centered
- Grid cells: 36px
- Generous spacing
- Optional keyboard navigation hints

### Accessibility

**Contrast:**
- All text meets WCAG AAA (contrast ≥ 7:1)
- Primary: white on `#0d47a1` = 11.4:1 ✓
- Error: red `#f44336` on white = 4.5:1 ✓ (AA, sufficient for large text)

**Touch targets:**
- Minimum 44x44px per Apple/Google guidelines
- Cells are 44px or larger on mobile
- Buttons: minimum 44px height

**Keyboard navigation:**
- Arrow keys move between cells
- Space bar toggles cell state
- Tab navigation for buttons
- Enter to submit/confirm actions

**Screen readers:**
- Semantic HTML elements (`<button>`, `<main>`, `<section>`)
- ARIA labels on grid cells: "Row 3, Column 5, filled"
- ARIA live regions for validation feedback
- Alt text for completed pixel art

**Visual feedback:**
- Not reliant on color alone (errors have text + borders, not just red)
- Animations respect `prefers-reduced-motion`

### Animations

**Cell tap:**
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```
Duration: 200ms, easing: ease-out

**Clue highlight:**
- Fade in: 150ms
- Fade out: 300ms
- Background color transition

**Completion:**
- Confetti or subtle celebration animation
- Fade in completion screen: 400ms

**Reduced motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Testing Strategy

### Overview

Full test coverage (unit + component + E2E) to ensure reliability and catch regressions.

**Testing stack:**
- **Vitest:** Unit and component tests
- **React Testing Library:** Component testing
- **@testing-library/react-hooks:** Hook testing
- **Playwright:** E2E tests
- **MSW (Mock Service Worker):** API mocking

### 1. Unit Tests (Pure Logic)

**Location:** `src/lib/__tests__/`

**Coverage:**

**clueCalculator.test.ts:**
```typescript
describe('calculateRowClues', () => {
  it('calculates clues for simple row', () => {
    const row = [true, true, false, true, false];
    expect(calculateRowClues([row])).toEqual([[2, 1]]);
  });

  it('returns empty array for empty row', () => {
    const row = [false, false, false];
    // Empty row = [] not [0], per nonogram convention
    expect(calculateRowClues([row])).toEqual([[]]);
  });

  it('handles single filled cell', () => {
    const row = [false, true, false];
    expect(calculateRowClues([row])).toEqual([[1]]);
  });
});
```

**validator.test.ts:**
```typescript
describe('validateGrid', () => {
  it('detects overfilled row', () => {
    const currentGrid = [
      ['filled', 'filled', 'filled', 'empty', 'empty']
    ];
    const targetClues = [[2]]; // Should only have 2 filled
    const result = validateRow(currentGrid[0], targetClues[0]);
    expect(result).toBe('error');
  });

  it('marks valid completed row', () => {
    const currentGrid = [
      ['filled', 'filled', 'empty', 'filled', 'empty']
    ];
    const targetClues = [[2, 1]];
    const result = validateRow(currentGrid[0], targetClues[0]);
    expect(result).toBe('valid');
  });
});
```

**difficultyEngine.test.ts:**
```typescript
describe('calculateNextDifficulty', () => {
  it('increases difficulty on fast clean solve', () => {
    const metrics = { solveTime: 120, hintsUsed: 0, errors: 0 };
    expect(calculateNextDifficulty(5, metrics)).toBe(6);
  });

  it('decreases difficulty on struggle', () => {
    const metrics = { solveTime: 700, hintsUsed: 5, errors: 10 };
    expect(calculateNextDifficulty(5, metrics)).toBe(4);
  });

  it('clamps difficulty to valid range', () => {
    const metrics = { solveTime: 120, hintsUsed: 0, errors: 0 };
    expect(calculateNextDifficulty(10, metrics)).toBe(10); // Can't go above 10
  });
});
```

### 2. Hook Tests

**Location:** `src/hooks/__tests__/`

**Coverage:**

**usePuzzle.test.ts:**
```typescript
import { renderHook, act } from '@testing-library/react-hooks';

describe('usePuzzle', () => {
  it('toggles cell state through cycle', () => {
    const { result } = renderHook(() => usePuzzle(mockPuzzle));

    act(() => result.current.toggleCell(0, 0));
    expect(result.current.puzzle.currentGrid[0][0]).toBe('filled');

    act(() => result.current.toggleCell(0, 0));
    expect(result.current.puzzle.currentGrid[0][0]).toBe('marked');

    act(() => result.current.toggleCell(0, 0));
    expect(result.current.puzzle.currentGrid[0][0]).toBe('empty');
  });

  it('increments error count on validation error', () => {
    const { result } = renderHook(() => usePuzzle(mockPuzzle));
    // ... fill cells to trigger error
    expect(result.current.puzzle.errors).toBeGreaterThan(0);
  });
});
```

**useValidation.test.ts:**
```typescript
describe('useValidation', () => {
  it('detects completion when grid valid and full', () => {
    const { result } = renderHook(() =>
      useValidation(fullyFilledValidGrid, targetClues)
    );
    expect(result.current.isComplete).toBe(true);
  });

  it('marks row as error when overfilled', () => {
    const { result } = renderHook(() =>
      useValidation(overfilled Grid, targetClues)
    );
    expect(result.current.rows[0]).toBe('error');
  });
});
```

**useGamePersistence.test.ts:**
```typescript
describe('useGamePersistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads state from localStorage on mount', () => {
    const savedState = { currentPuzzle: mockPuzzle, difficultyProfile: mockProfile };
    localStorage.setItem('pixlogic_state', JSON.stringify(savedState));

    const { result } = renderHook(() => useGamePersistence());
    expect(result.current.currentPuzzle).toEqual(mockPuzzle);
  });

  it('saves state to localStorage on update', () => {
    const { result } = renderHook(() => useGamePersistence());

    act(() => result.current.saveState(newState));

    const saved = JSON.parse(localStorage.getItem('pixlogic_state'));
    expect(saved).toEqual(newState);
  });
});
```

### 3. Component Tests

**Location:** `src/components/__tests__/`

**Coverage:**

**Cell.test.tsx:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
    expect(screen.getByText('✕')).toBeInTheDocument();
  });
});
```

**GameBoard.test.tsx:**
```typescript
describe('GameBoard', () => {
  it('renders grid with correct dimensions', () => {
    render(<GameBoard puzzle={mockPuzzle} />);
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(100); // 10x10
  });

  it('displays timer', () => {
    render(<GameBoard puzzle={mockPuzzle} />);
    expect(screen.getByText(/\d:\d{2}/)).toBeInTheDocument();
  });

  it('shows hint button', () => {
    render(<GameBoard puzzle={mockPuzzle} />);
    expect(screen.getByRole('button', { name: /hint/i })).toBeInTheDocument();
  });
});
```

**CompletionScreen.test.tsx:**
```typescript
describe('CompletionScreen', () => {
  it('displays stats correctly', () => {
    const metrics = { solveTime: 245, hintsUsed: 2, errors: 3 };
    render(<CompletionScreen metrics={metrics} nextDifficulty={5} />);

    expect(screen.getByText(/4:05/)).toBeInTheDocument(); // Time formatted
    expect(screen.getByText(/hints.*2/i)).toBeInTheDocument();
    expect(screen.getByText(/3.*error/i)).toBeInTheDocument();
  });

  it('shows difficulty increase message', () => {
    render(<CompletionScreen nextDifficulty={6} currentDifficulty={5} />);
    expect(screen.getByText(/harder/i)).toBeInTheDocument();
  });
});
```

### 4. E2E Tests (Playwright)

**Location:** `e2e/game-flow.spec.ts`

**Coverage:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Pixlogic Game Flow', () => {
  test('complete puzzle from start to finish', async ({ page }) => {
    await page.goto('/');

    // Enter API key
    await page.fill('[data-testid="api-key-input"]', 'sk-ant-test-key');
    await page.click('[data-testid="save-key"]');

    // Enter puzzle prompt
    await page.fill('[data-testid="prompt-input"]', 'a cat');
    await page.click('[data-testid="generate-button"]');

    // Wait for puzzle generation
    await page.waitForSelector('[data-testid="game-board"]', { timeout: 10000 });

    // Solve puzzle (mock known solution)
    // ... click cells in solution pattern ...

    // Verify completion screen
    await expect(page.locator('[data-testid="completion-screen"]')).toBeVisible();
    await expect(page.locator('text=/time/i')).toBeVisible();
  });

  test('persistence: resume puzzle after refresh', async ({ page }) => {
    await page.goto('/');

    // ... start puzzle, fill some cells ...

    await page.reload();

    // Verify puzzle state restored
    const filledCells = await page.locator('[data-state="filled"]').count();
    expect(filledCells).toBeGreaterThan(0);
  });

  test('hint system works', async ({ page }) => {
    await page.goto('/');
    // ... generate puzzle ...

    // Request hint
    await page.click('[data-testid="hint-button"]');
    await expect(page.locator('[data-testid="hint-message"]')).toBeVisible();

    // Verify cooldown
    await expect(page.locator('[data-testid="hint-button"]')).toBeDisabled();
  });

  test('validation shows errors', async ({ page }) => {
    await page.goto('/');
    // ... generate puzzle ...

    // Fill cells incorrectly (overfill a row)
    // ... click cells to violate clue ...

    // Verify error indicators
    await expect(page.locator('[data-validation="error"]')).toBeVisible();
  });

  test('mobile viewport works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');

    // ... verify all interactions work on small screen ...
  });
});
```

### Test Organization

**Run commands:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

**CI/CD:**
- Unit tests: Run on every commit (GitHub Actions)
- Component tests: Run on every PR
- E2E tests: Run before deployment to GitHub Pages
- Coverage target: 80% for logic (lib/), 70% for components

**Mock strategy:**
- Mock Anthropic API in all tests using MSW
- Use fixtures for API responses (`fixtures/puzzles.json`, `fixtures/hints.json`)
- Mock localStorage with custom implementation for tests
- Mock timers using Vitest's `vi.useFakeTimers()` for cooldown/timer tests

---

## Implementation Notes

### Initial Setup

**1. Project scaffolding:**
```bash
npm create vite@latest pixlogic -- --template react-ts
cd pixlogic
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install @anthropic-ai/sdk
npm install -D vitest @testing-library/react @testing-library/react-hooks
npm install -D @playwright/test
```

**2. Tailwind configuration:**
- Add custom colors (primary, cell-filled, etc.)
- Configure content paths
- Add custom animations

**3. TypeScript configuration:**
- Strict mode enabled
- Path aliases for clean imports: `@/components`, `@/hooks`, `@/lib`

**4. Git setup:**
```
.gitignore additions:
.superpowers/
dist/
coverage/
playwright-report/
```

### Development Workflow

**Phase 1: Core puzzle logic**
- Implement clue calculator
- Implement validator
- Write unit tests
- Pure functions, no React

**Phase 2: Hooks**
- Implement usePuzzle (state management)
- Implement useValidation
- Write hook tests
- Integration with pure functions

**Phase 3: Basic UI**
- Cell component
- GameBoard layout
- Grid rendering
- Clues display
- Component tests

**Phase 4: AI integration**
- API client
- Puzzle generator with validation/retry
- Test with mock API responses

**Phase 5: Polish**
- Hint system
- Difficulty engine
- Persistence
- Completion screen
- Animations

**Phase 6: E2E testing**
- Full game flow tests
- Edge case coverage

**Phase 7: Deployment**
- GitHub Pages setup
- Build optimization
- README with setup instructions

### Future Enhancements (Out of Scope)

These are explicitly NOT part of the initial implementation:

- Multiple grid sizes (15x15, 20x20)
- Color nonograms (multi-color cells)
- Puzzle sharing (export/import)
- Leaderboards or social features
- Undo/redo functionality
- Solution solver/checker
- Backend for rate limiting
- PWA/offline support
- Tutorial mode

Focus: Simple, working, well-tested core experience first.

---

## Summary

Pixlogic is a browser-based AI-powered nonogram puzzle game optimized for mobile. It uses a component + custom hooks architecture for clean separation of concerns and testability. The adaptive difficulty system provides personalized challenge progression, while the AI hint system helps players when stuck. Full test coverage ensures reliability. Users provide their own Anthropic API key for a simple, backend-free deployment to GitHub Pages.

**Key design decisions:**
- User provides API key (no backend needed initially)
- Component + hooks architecture (testability + simplicity)
- Triple-tap cell interaction (mobile-optimized)
- Contextual clue highlighting (option D from design exploration)
- Real-time validation with visual feedback
- Adaptive difficulty based on comprehensive metrics (time + hints + errors)
- Full test coverage (unit + component + E2E)
- Mobile-first responsive design
- WCAG AAA accessibility compliance

**Success criteria:**
- Users can generate and solve AI-created nonogram puzzles
- Game works smoothly on mobile devices
- Difficulty adapts to player skill over time
- All tests pass with >75% coverage
- Deployed to GitHub Pages and playable publicly
