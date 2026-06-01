# AI Loading Indicator Design

**Date:** 2026-05-25
**Status:** Approved
**Author:** Claude Code

## Overview

Add visual feedback when the app calls the Anthropic API using an animated three-star indicator (✨✨✨) that has become the standard for AI interfaces. This provides clear user feedback during API operations and reinforces that AI is generating content.

## Requirements

### Functional Requirements

1. **Visual Indicator**: Display three animated stars (✨✨✨) during Anthropic API calls
2. **Animation Style**: Pulsing animation - gentle fade in/out with scale change, sequential timing
3. **Two Locations**:
   - Puzzle generation loading screen (replace current spinner)
   - Hint button (show during API call, before cooldown starts)
4. **Size Variants**: Large variant for loading screen, small inline variant for button
5. **Accessibility**: Proper ARIA labels and roles for screen readers

### Non-Functional Requirements

1. **Consistency**: Same animation style in all locations
2. **Performance**: Lightweight CSS animation, no JavaScript animation loops
3. **Maintainability**: Single reusable component, not duplicated code
4. **Theme Integration**: Match existing glassmorphism design system

## Design

### Component Architecture

**New Component: `src/components/AiLoadingIndicator.tsx`**

A focused, reusable component that renders the animated star indicator.

**Interface:**
```typescript
interface AiLoadingIndicatorProps {
  size?: 'small' | 'large'  // default: 'large'
  className?: string          // for additional styling
}
```

**Rendering:**
- Container div with flexbox layout
- Three span elements, each containing ✨ emoji
- Each span has staggered animation delay
- ARIA attributes for accessibility

**Size Specifications:**
- **Large** (default):
  - Stars: ~32px font size
  - Gap: 12px between stars
  - Use case: Loading screen
  - Display: center-aligned in container

- **Small**:
  - Stars: ~16px font size
  - Gap: 6px between stars
  - Use case: Inline in hint button
  - Display: inline-flex friendly

### Animation Specification

**CSS Keyframes (`aiPulse`):**
```css
@keyframes aiPulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}
```

**Animation Properties:**
- **Duration**: 1.5s (smooth, not rushed)
- **Easing**: `ease-in-out` (gentle acceleration/deceleration)
- **Iteration**: infinite
- **Delays**:
  - Star 1: 0s
  - Star 2: 0.2s (200ms offset)
  - Star 3: 0.4s (400ms offset)
- **Effect**: Sequential pulsing creates wave-like motion

**Styling Details:**
- Stars use `display: inline-block` to enable transforms
- White color (`text-white` / `#ffffff`) matches glassmorphism theme
- No background or border
- Container uses flexbox with gap for spacing

**Accessibility:**
- Container has `role="status"` for screen reader announcements
- Container has `aria-label="AI is thinking"` for context
- Container has `aria-live="polite"` to announce state changes

### Integration Points

#### Location 1: Puzzle Generation Loading Screen

**File**: `src/App.tsx`

**Current Implementation:**
```tsx
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

**Change:**
Replace the spinner div with:
```tsx
<AiLoadingIndicator size="large" className="mb-4" />
```

**Result:**
- Large animated stars appear instead of spinner
- Text and layout remain the same
- More recognizable as AI activity

#### Location 2: Hint Button

**Files**: `src/hooks/useHints.ts`, `src/components/GameBoard.tsx`

**Current Implementation:**
```tsx
<button onClick={requestHint} disabled={isOnCooldown}>
  {isOnCooldown ? `💡 ${formatCooldown(cooldownRemaining)}` : '💡 Get Hint'}
</button>
```

**Changes Required:**

1. **Add loading state to useHints hook:**
   - New state: `isLoading` (boolean)
   - Set `true` when API call starts
   - Set `false` when hint returns or error occurs
   - Export `isLoading` in hook return value

2. **Update button rendering in GameBoard:**
```tsx
<button
  onClick={requestHint}
  disabled={isOnCooldown || isLoading}
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

**Behavior:**
1. User clicks "Get Hint"
2. Button shows "💡 ✨✨✨" (pulsing animation)
3. When API returns, animation disappears
4. Cooldown countdown begins immediately after

### Component Implementation Details

**File Structure:**
```
src/
  components/
    AiLoadingIndicator.tsx  (new)
    __tests__/
      AiLoadingIndicator.test.tsx  (new)
```

**Component Code Structure:**
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
    ? 'text-base gap-1.5'  // 16px font, 6px gap
    : 'text-4xl gap-3'      // 36px font, 12px gap

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

**CSS (in Tailwind config or component styles):**
- Add custom animation to `tailwind.config.js` OR
- Use inline styles with CSS module

**Tailwind Config Approach:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'ai-pulse': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' }
        }
      },
      animation: {
        'ai-pulse': 'ai-pulse 1.5s ease-in-out infinite'
      }
    }
  }
}
```

**Animation Delay Utilities (if not in Tailwind):**
```css
.animation-delay-200 {
  animation-delay: 0.2s;
}
.animation-delay-400 {
  animation-delay: 0.4s;
}
```

## Testing Requirements

### Unit Tests

**File**: `src/components/__tests__/AiLoadingIndicator.test.tsx`

Test cases:
1. Renders three star emojis
2. Applies large size classes by default
3. Applies small size classes when size="small"
4. Accepts and applies custom className
5. Has correct ARIA attributes (role, aria-label, aria-live)
6. Each star has animation class applied
7. Stars have correct animation delays

### Visual Testing

Manual verification:
1. Loading screen shows large pulsing stars during puzzle generation
2. Hint button shows small inline pulsing stars during API call
3. Animation is smooth and sequential (not simultaneous)
4. Stars don't cause layout shift
5. Works on mobile viewport (stars don't wrap)

### Integration Testing

Verify API loading states:
1. **Puzzle Generation**:
   - Stars appear when "Generate Puzzle" clicked
   - Stars disappear when puzzle loads
   - Stars disappear if API error occurs

2. **Hint Request**:
   - Stars appear when "Get Hint" clicked
   - Button is disabled during loading
   - Stars disappear when hint arrives
   - Cooldown timer appears immediately after stars disappear
   - Stars disappear if API error occurs

## Implementation Notes

### State Management

**useHints Hook Changes:**
```typescript
// Add to existing state
const [isLoading, setIsLoading] = useState(false)

// Update requestHint function
const requestHint = useCallback(async () => {
  if (!apiClient || isOnCooldown) return

  setIsLoading(true)  // Start loading indicator

  try {
    setError(null)
    const hint = await apiClient.getHint(...)
    setCurrentHint(hint)
    setLastHintTime(now)
    // Start cooldown...
    onHintUsed()
  } catch (err) {
    setError(...)
  } finally {
    setIsLoading(false)  // Stop loading indicator
  }
}, [...])

// Add to return value
return {
  // ...existing
  isLoading  // NEW
}
```

### Error Handling

If API call fails:
- Loading indicator disappears
- Error state is shown via existing error handling
- Button returns to enabled state
- No cooldown is triggered

### Performance Considerations

- CSS animations are GPU-accelerated (transform, opacity)
- No JavaScript intervals or requestAnimationFrame
- Component is lightweight (< 100 lines)
- Animation runs only when component is mounted

### Browser Compatibility

- CSS animations supported in all modern browsers
- Emoji rendering may vary by OS/browser (acceptable)
- Fallback: Stars still visible even without animation
- Transform/opacity widely supported

## Future Enhancements

Possible additions (not in initial scope):
1. Add `aria-live` region that announces when loading completes
2. Add subtle glow effect on stars
3. Configurable animation speed via prop
4. Alternative icons for users who prefer not to see emojis
5. Reduced motion support via `prefers-reduced-motion` media query

## Open Questions

None - design is approved and ready for implementation.

## Summary

This design adds a modern, recognizable AI loading indicator using the three-star pattern (✨✨✨) with a gentle pulsing animation. A single reusable component serves both the large loading screen and small inline button contexts. The implementation is lightweight, accessible, and consistent with the existing glassmorphism design system.
