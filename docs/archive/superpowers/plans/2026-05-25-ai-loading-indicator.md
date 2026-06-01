# AI Loading Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add animated three-star (✨✨✨) indicator to show Anthropic API activity during puzzle generation and hint requests.

**Architecture:** Single reusable `AiLoadingIndicator` component with size variants (small/large), integrated into loading screen and hint button. CSS animation for performance, ARIA attributes for accessibility.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vitest

---

## File Structure

**New Files:**
- `src/components/AiLoadingIndicator.tsx` - Main component with pulsing star animation
- `src/components/__tests__/AiLoadingIndicator.test.tsx` - Component tests

**Modified Files:**
- `tailwind.config.js` - Add custom animation keyframes and delay utilities
- `src/hooks/useHints.ts` - Add isLoading state for API calls
- `src/App.tsx` - Replace spinner with indicator in loading screen
- `src/components/GameBoard.tsx` - Update hint button to show indicator

---

## Task 1: Add Tailwind Animation Configuration

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Add ai-pulse keyframes and animation to Tailwind config**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5a85be',
        'cell-filled': '#4CAF50',
        'cell-border': '#e0e0e0',
        error: '#f44336',
        success: '#4CAF50',
      },
      backdropBlur: {
        xs: '2px',
      },
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
  plugins: [],
}
```

- [ ] **Step 2: Add animation delay utilities to global CSS**

Create or modify `src/index.css` to add animation delay utilities:

```css
/* Animation delay utilities for staggered animations */
.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}
```

- [ ] **Step 3: Verify Tailwind config is valid**

Run: `npm run build`
Expected: Build completes successfully without errors

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js src/index.css
git commit -m "feat: add AI pulse animation to Tailwind config

- Add ai-pulse keyframes (opacity + scale animation)
- Add animate-ai-pulse utility class
- Add animation delay utilities for staggered effects"
```

---

## Task 2: Create AiLoadingIndicator Component (TDD)

**Files:**
- Create: `src/components/AiLoadingIndicator.tsx`
- Create: `src/components/__tests__/AiLoadingIndicator.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/__tests__/AiLoadingIndicator.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AiLoadingIndicator } from '../AiLoadingIndicator'

describe('AiLoadingIndicator', () => {
  it('renders three star emojis', () => {
    const { container } = render(<AiLoadingIndicator />)
    const stars = container.querySelectorAll('span')
    expect(stars.length).toBe(3)
    expect(stars[0].textContent).toBe('✨')
    expect(stars[1].textContent).toBe('✨')
    expect(stars[2].textContent).toBe('✨')
  })

  it('applies large size classes by default', () => {
    const { container } = render(<AiLoadingIndicator />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('text-4xl')
    expect(wrapper.className).toContain('gap-3')
  })

  it('applies small size classes when size="small"', () => {
    const { container } = render(<AiLoadingIndicator size="small" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('text-base')
    expect(wrapper.className).toContain('gap-1.5')
  })

  it('accepts and applies custom className', () => {
    const { container } = render(<AiLoadingIndicator className="custom-class" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('custom-class')
  })

  it('has correct ARIA attributes', () => {
    render(<AiLoadingIndicator />)
    const indicator = screen.getByRole('status')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveAttribute('aria-label', 'AI is thinking')
    expect(indicator).toHaveAttribute('aria-live', 'polite')
  })

  it('applies animation class to all stars', () => {
    const { container } = render(<AiLoadingIndicator />)
    const stars = container.querySelectorAll('span')
    stars.forEach(star => {
      expect(star.className).toContain('animate-ai-pulse')
    })
  })

  it('applies staggered animation delays', () => {
    const { container } = render(<AiLoadingIndicator />)
    const stars = container.querySelectorAll('span')

    // First star has no delay class
    expect(stars[0].className).not.toContain('animation-delay')

    // Second star has 200ms delay
    expect(stars[1].className).toContain('animation-delay-200')

    // Third star has 400ms delay
    expect(stars[2].className).toContain('animation-delay-400')
  })

  it('displays stars inline-block for transform support', () => {
    const { container } = render(<AiLoadingIndicator />)
    const stars = container.querySelectorAll('span')
    stars.forEach(star => {
      expect(star.className).toContain('inline-block')
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test src/components/__tests__/AiLoadingIndicator.test.tsx`
Expected: All tests FAIL with "Cannot find module '../AiLoadingIndicator'"

- [ ] **Step 3: Create minimal component implementation**

Create `src/components/AiLoadingIndicator.tsx`:

```typescript
export interface AiLoadingIndicatorProps {
  size?: 'small' | 'large'
  className?: string
}

export function AiLoadingIndicator({
  size = 'large',
  className = ''
}: AiLoadingIndicatorProps) {
  const sizeClasses = size === 'small'
    ? 'text-base gap-1.5'   // 16px font, 6px gap
    : 'text-4xl gap-3'       // 36px font, 12px gap

  return (
    <div
      className={`flex items-center justify-center ${sizeClasses} ${className}`}
      role="status"
      aria-label="AI is thinking"
      aria-live="polite"
    >
      <span className="inline-block animate-ai-pulse">✨</span>
      <span className="inline-block animate-ai-pulse animation-delay-200">✨</span>
      <span className="inline-block animate-ai-pulse animation-delay-400">✨</span>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/components/__tests__/AiLoadingIndicator.test.tsx`
Expected: All 8 tests PASS

- [ ] **Step 5: Verify component renders in dev mode**

Run: `npm run dev` (if not already running)
Then manually import and render in a test location to verify animation works visually

- [ ] **Step 6: Commit**

```bash
git add src/components/AiLoadingIndicator.tsx src/components/__tests__/AiLoadingIndicator.test.tsx
git commit -m "feat: create AiLoadingIndicator component

- Add reusable component with pulsing star animation
- Support small/large size variants
- Include ARIA attributes for accessibility
- Staggered animation delays for sequential effect
- Full test coverage (8 tests)"
```

---

## Task 3: Add Loading State to useHints Hook

**Files:**
- Modify: `src/hooks/useHints.ts`

- [ ] **Step 1: Read current useHints implementation**

Run: `cat src/hooks/useHints.ts` to understand current structure

- [ ] **Step 2: Add isLoading state and update requestHint function**

Modify `src/hooks/useHints.ts`:

```typescript
import { useState, useCallback } from 'react'
import type { Hint } from '@/types'
import type { ApiClient } from '@/lib/api'

interface UseHintsReturn {
  currentHint: Hint | null
  isOnCooldown: boolean
  cooldownRemaining: number
  isLoading: boolean  // NEW
  requestHint: () => Promise<void>
  dismissHint: () => void
  error: string | null
}

export function useHints(
  apiClient: ApiClient | null,
  currentGrid: string[][],
  rowClues: number[][],
  columnClues: number[][],
  onHintUsed: () => void
): UseHintsReturn {
  const [currentHint, setCurrentHint] = useState<Hint | null>(null)
  const [lastHintTime, setLastHintTime] = useState<number>(0)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)  // NEW

  const COOLDOWN_MS = 30000 // 30 seconds
  const ESCALATION_THRESHOLD_MS = 120000 // 2 minutes

  const isOnCooldown = cooldownRemaining > 0

  const requestHint = useCallback(async () => {
    if (!apiClient) {
      setError('API client not initialized')
      return
    }

    // Check cooldown
    const now = Date.now()
    const timeSinceLastHint = now - lastHintTime
    if (timeSinceLastHint < COOLDOWN_MS) {
      return // Still on cooldown
    }

    // Determine hint type based on escalation logic
    const hintType: 'guidance' | 'specific' =
      timeSinceLastHint < ESCALATION_THRESHOLD_MS ? 'specific' : 'guidance'

    setIsLoading(true)  // NEW: Start loading indicator

    try {
      setError(null)
      const hint = await apiClient.getHint(hintType, currentGrid, rowClues, columnClues)
      setCurrentHint(hint)
      setLastHintTime(now)

      // Start cooldown countdown
      setCooldownRemaining(COOLDOWN_MS)
      const countdown = setInterval(() => {
        setCooldownRemaining(prev => {
          const next = prev - 1000
          if (next <= 0) {
            clearInterval(countdown)
            return 0
          }
          return next
        })
      }, 1000)

      // Increment hint counter
      onHintUsed()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get hint')
      console.error('Hint request error:', err)
    } finally {
      setIsLoading(false)  // NEW: Stop loading indicator
    }
  }, [apiClient, currentGrid, rowClues, columnClues, lastHintTime, onHintUsed])

  const dismissHint = useCallback(() => {
    setCurrentHint(null)
    setError(null)
  }, [])

  return {
    currentHint,
    isOnCooldown,
    cooldownRemaining,
    isLoading,  // NEW: Export loading state
    requestHint,
    dismissHint,
    error
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no type errors

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useHints.ts
git commit -m "feat: add loading state to useHints hook

- Add isLoading boolean state
- Set true when API call starts
- Set false when hint returns or error occurs
- Export in hook return value for UI integration"
```

---

## Task 4: Integrate Indicator into Puzzle Loading Screen

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Import AiLoadingIndicator component**

Add to imports in `src/App.tsx`:

```typescript
import { AiLoadingIndicator } from '@/components/AiLoadingIndicator'
```

- [ ] **Step 2: Replace spinner with AiLoadingIndicator**

Find the loading screen section (around line 233) and replace:

**Before:**
```tsx
{/* Loading Indicator */}
{isGenerating && (
  <div className="glass-card rounded-2xl p-8 text-center shadow-2xl">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
    <p className="text-white text-xl font-semibold">Generating your puzzle...</p>
    {currentPrompt && (
      <p className="text-white/90 mt-3 font-medium">
        Prompt: "{currentPrompt}"
      </p>
    )}
    <p className="text-white/80 mt-2">This may take a few moments</p>
  </div>
)}
```

**After:**
```tsx
{/* Loading Indicator */}
{isGenerating && (
  <div className="glass-card rounded-2xl p-8 text-center shadow-2xl">
    <AiLoadingIndicator size="large" className="mb-4" />
    <p className="text-white text-xl font-semibold">Generating your puzzle...</p>
    {currentPrompt && (
      <p className="text-white/90 mt-3 font-medium">
        Prompt: "{currentPrompt}"
      </p>
    )}
    <p className="text-white/80 mt-2">This may take a few moments</p>
  </div>
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Test loading screen visually**

Run: `npm run dev`
Steps to test:
1. Enter API key
2. Enter a prompt (e.g., "a cat")
3. Click "Generate Puzzle"
4. Verify: Three pulsing stars appear instead of spinner
5. Verify: Stars pulse sequentially
6. Verify: Text and layout unchanged

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate AI indicator into puzzle loading screen

- Replace spinner with AiLoadingIndicator (large variant)
- Maintain existing text and layout
- Stars provide clear AI activity feedback"
```

---

## Task 5: Integrate Indicator into Hint Button

**Files:**
- Modify: `src/components/GameBoard.tsx`

- [ ] **Step 1: Import AiLoadingIndicator component**

Add to imports in `src/components/GameBoard.tsx`:

```typescript
import { AiLoadingIndicator } from './AiLoadingIndicator'
```

- [ ] **Step 2: Destructure isLoading from useHints hook**

Find the useHints hook call and add `isLoading` to destructured values:

**Before:**
```typescript
const {
  currentHint,
  isOnCooldown,
  cooldownRemaining,
  requestHint,
  dismissHint,
  error: hintError
} = useHints(
  apiClient,
  puzzle.currentGrid,
  puzzle.rowClues,
  puzzle.columnClues,
  onHintUsed
)
```

**After:**
```typescript
const {
  currentHint,
  isOnCooldown,
  cooldownRemaining,
  isLoading,  // NEW
  requestHint,
  dismissHint,
  error: hintError
} = useHints(
  apiClient,
  puzzle.currentGrid,
  puzzle.rowClues,
  puzzle.columnClues,
  onHintUsed
)
```

- [ ] **Step 3: Update hint button to show loading indicator**

Find the hint button (around line 49-60) and update:

**Before:**
```tsx
<button
  onClick={requestHint}
  disabled={isOnCooldown}
  className={`glass py-2 px-4 rounded-lg font-semibold transition-all ${
    isOnCooldown
      ? 'opacity-50 cursor-not-allowed text-white/50'
      : 'text-white hover:bg-white/20'
  }`}
  data-testid="hint-button"
>
  {isOnCooldown ? `💡 ${formatCooldown(cooldownRemaining)}` : '💡 Get Hint'}
</button>
```

**After:**
```tsx
<button
  onClick={requestHint}
  disabled={isOnCooldown || isLoading}
  className={`glass py-2 px-4 rounded-lg font-semibold transition-all ${
    isOnCooldown || isLoading
      ? 'opacity-50 cursor-not-allowed text-white/50'
      : 'text-white hover:bg-white/20'
  }`}
  data-testid="hint-button"
>
  {isLoading ? (
    <span className="flex items-center gap-2">
      💡 <AiLoadingIndicator size="small" />
    </span>
  ) : isOnCooldown ? (
    `💡 ${formatCooldown(cooldownRemaining)}`
  ) : (
    '💡 Get Hint'
  )}
</button>
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 5: Test hint button visually**

Run: `npm run dev`
Steps to test:
1. Generate a puzzle
2. Click "Get Hint" button
3. Verify: Button shows "💡 ✨✨✨" (pulsing)
4. Verify: Button is disabled during loading
5. Verify: Stars disappear when hint arrives
6. Verify: Cooldown countdown appears immediately after
7. Test error case: Disconnect network, click hint, verify stars disappear on error

- [ ] **Step 6: Commit**

```bash
git add src/components/GameBoard.tsx
git commit -m "feat: integrate AI indicator into hint button

- Show small pulsing stars during hint API call
- Disable button while loading
- Maintain lightbulb icon
- Stars appear before cooldown countdown begins"
```

---

## Task 6: Update Tests for Integration Changes

**Files:**
- Modify: `src/components/__tests__/GameBoard.test.tsx`

- [ ] **Step 1: Add test for hint button loading state**

Add test to `src/components/__tests__/GameBoard.test.tsx`:

```typescript
it('shows loading indicator in hint button while requesting hint', async () => {
  const mockApiClient = {
    getHint: vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)))
  }

  const puzzle = createMockPuzzle(5)
  const validation = createMockValidation(5)

  render(
    <GameBoard
      puzzle={puzzle}
      validationResult={validation}
      onCellClick={() => {}}
      apiClient={mockApiClient as any}
      onHintUsed={vi.fn()}
    />
  )

  const hintButton = screen.getByTestId('hint-button')

  // Before click: shows "Get Hint"
  expect(hintButton.textContent).toContain('Get Hint')

  // Click button
  fireEvent.click(hintButton)

  // During loading: button is disabled and shows indicator
  await waitFor(() => {
    expect(hintButton).toBeDisabled()
    // AiLoadingIndicator renders stars
    expect(hintButton.textContent).toContain('✨')
  })
})
```

- [ ] **Step 2: Run tests to verify hint button test passes**

Run: `npm test src/components/__tests__/GameBoard.test.tsx`
Expected: New test and all existing tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/__tests__/GameBoard.test.tsx
git commit -m "test: add loading state test for hint button

- Verify button shows loading indicator during API call
- Verify button is disabled while loading
- Ensure existing tests still pass"
```

---

## Task 7: Manual Testing and Verification

**Files:**
- None (manual testing only)

- [ ] **Step 1: Build production version**

Run: `npm run build`
Expected: Build completes successfully

- [ ] **Step 2: Test puzzle generation loading**

Steps:
1. Start dev server: `npm run dev`
2. Open browser to app
3. Enter valid API key
4. Enter prompt: "a heart"
5. Click "Generate Puzzle"
6. Verify: Large pulsing stars appear (✨✨✨)
7. Verify: Stars pulse sequentially (not simultaneously)
8. Verify: Stars disappear when puzzle loads
9. Verify: No console errors

- [ ] **Step 3: Test hint button - successful hint**

Steps:
1. With puzzle loaded, click "Get Hint" button
2. Verify: Small pulsing stars appear next to 💡
3. Verify: Button is disabled during loading
4. Verify: Stars disappear when hint modal appears
5. Verify: Cooldown countdown (30s, 29s...) starts after stars
6. Verify: No console errors

- [ ] **Step 4: Test hint button - escalation behavior**

Steps:
1. Get first hint (guidance)
2. Dismiss hint modal
3. Immediately click "Get Hint" again (within 2 minutes)
4. Verify: Stars appear during loading
5. Verify: Second hint is specific (shows cell coordinates)
6. Verify: Loading indicator behaves correctly

- [ ] **Step 5: Test hint button - error handling**

Steps:
1. Open browser DevTools Network tab
2. Set network to "Offline" mode
3. Click "Get Hint"
4. Verify: Stars appear
5. Verify: Stars disappear when error occurs
6. Verify: Error message shows in modal
7. Verify: Button returns to enabled state
8. Verify: No cooldown triggered on error

- [ ] **Step 6: Test accessibility**

Steps:
1. Open browser accessibility inspector
2. Check loading screen indicator:
   - Has `role="status"`
   - Has `aria-label="AI is thinking"`
   - Has `aria-live="polite"`
3. Enable screen reader (VoiceOver/NVDA)
4. Trigger loading states
5. Verify: Screen reader announces loading status

- [ ] **Step 7: Test responsive design**

Steps:
1. Resize browser to mobile width (375px)
2. Test puzzle generation loading
3. Verify: Stars don't overflow or wrap
4. Test hint button
5. Verify: Stars fit in button without breaking layout

- [ ] **Step 8: Document test results**

Create checklist summary:
```
✅ Puzzle generation shows large pulsing stars
✅ Stars pulse sequentially
✅ Hint button shows small pulsing stars
✅ Button disabled during loading
✅ Loading stops on success
✅ Loading stops on error
✅ No cooldown on error
✅ ARIA attributes present
✅ Screen reader announces status
✅ Mobile layout intact
✅ No console errors
```

- [ ] **Step 9: Final commit**

```bash
git commit --allow-empty -m "test: verify AI loading indicator manual testing

All manual test cases passed:
- Large indicator on puzzle loading screen
- Small indicator in hint button
- Sequential pulsing animation
- Error handling
- Accessibility
- Responsive design"
```

---

## Self-Review Checklist

**Spec Coverage:**
- ✅ Visual indicator with three stars
- ✅ Pulsing animation (sequential)
- ✅ Puzzle loading screen integration
- ✅ Hint button integration
- ✅ Size variants (small/large)
- ✅ Accessibility (ARIA attributes)
- ✅ Performance (CSS animation)
- ✅ Maintainability (single component)
- ✅ Theme integration (Tailwind classes)

**Placeholder Check:**
- ✅ No TBD or TODO items
- ✅ All code blocks complete
- ✅ All test cases written
- ✅ All expected outputs specified
- ✅ All file paths exact

**Type Consistency:**
- ✅ `AiLoadingIndicator` component name consistent
- ✅ `size` prop ('small' | 'large') consistent
- ✅ `isLoading` state name consistent
- ✅ ARIA attribute values consistent

**Completeness:**
- ✅ All tasks have commit steps
- ✅ All tasks have verification steps
- ✅ Build verification included
- ✅ Manual testing documented
- ✅ Error cases covered

---

## Summary

This plan implements the AI loading indicator in 7 tasks following TDD principles:

1. **Task 1**: Add Tailwind animation config (keyframes + delays)
2. **Task 2**: Create AiLoadingIndicator component with full tests
3. **Task 3**: Add loading state to useHints hook
4. **Task 4**: Replace spinner in puzzle loading screen
5. **Task 5**: Add indicator to hint button
6. **Task 6**: Update integration tests
7. **Task 7**: Manual testing and verification

Each task produces working, tested code with frequent commits. The component is reusable, accessible, and matches the existing design system.
