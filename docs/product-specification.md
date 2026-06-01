# Product Specification

**Last Updated:** 2026-06-01
**Status:** ✅ Complete

---

## Overview

Pixlogic is a browser-based nonogram puzzle game where users enter text prompts (e.g., "a cat") and Claude AI generates pixel art puzzles to solve.

**Key Innovation**: AI-generated puzzles from natural language + adaptive hints that understand current player state.

**Core Experience**:
- Enter a text prompt → Get a custom pixel art puzzle → Solve using logic → See your creation revealed
- Mobile-first design with touch-optimized interactions
- Adaptive difficulty that learns from your performance

---

## Game Mechanics

### What are Nonograms?

Nonograms (also called Picross or Griddlers) are logic puzzles where you fill in a grid to reveal a picture.

**How it works:**
- Grid starts empty (all cells white)
- Numbers on the side indicate consecutive filled cells in that row/column
- Use logic to deduce which cells must be filled

**Example:**
```
Clue [2 1] means: "This row has a group of 2 filled cells, then (at least 1 gap), then 1 filled cell"

Valid:   ■■·■·
Valid:   ■■··■
Invalid: ■■■·· (wrong: this is 3, not 2-1)
```

### Core Gameplay Loop

1. **Setup**: Enter text prompt → AI generates puzzle → Timer starts
2. **Play**: Tap cells to fill/mark → Real-time validation feedback → Request hints if stuck
3. **Solve**: Complete when all cells correct → See stats → Difficulty adjusts → Generate next puzzle

**Win Condition**: Grid fully filled AND all row/column clues match exactly

### Cell States

Three states per cell (cycle through by tapping):

1. **Empty** (white background)
   - Default state
   - Unknown if cell should be filled or not

2. **Filled** (green background)
   - Player believes this cell is part of the picture
   - Counts toward row/column clues

3. **Marked** (white background with × symbol)
   - Player has deduced this cell must be empty
   - Strategic tool to visualize "negative space"
   - Optional - casual players can ignore

**Cycle**: Empty → Filled → Marked → Empty (tap to advance)

---

## Features

### 1. AI-Powered Puzzle Generation

**Description**: Generate custom 10×10 nonogram puzzles from any text prompt using Claude AI.

**User Flow**:
1. User enters prompt (e.g., "a cat", "mountain landscape", "coffee cup")
2. Click "Generate Puzzle"
3. AI generates pixel art matrix
4. Clues calculated from solution
5. Puzzle appears, timer starts

**Requirements**:
- User provides own Anthropic API key (stored in localStorage)
- API key validated on first use (format check + test call)
- Retry logic (up to 3 attempts) if generation fails
- Validation ensures no empty rows/columns (invalid puzzles)
- User-friendly error messages for network/API issues

**Error Handling**:
- Invalid API key → "Please check your API key"
- Rate limit → "API rate limit reached. Please wait."
- Generation failure → "Failed to generate puzzle. Try a different prompt."
- Network error → "Connection issue. Please try again."

### 2. Adaptive Hint System

**Description**: Two-tier AI hint system that escalates based on player need. Cooldown prevents hint spam.

**Types**:

**Guidance Hints** (gentle, strategic):
- Suggests which row/column to focus on
- No exact cell coordinates
- Helps player think through logic
- Example: "Look at row 5 - with a clue of '8', you can deduce several cells must be filled."

**Specific Hints** (precise, when struggling):
- Suggests exact cell to fill/mark with reasoning
- Triggered if player requests second hint within 2 minutes
- Example: "Fill row 3, column 4. The clue [2 3] means this section must be filled."

**User Flow**:
1. Player taps "Get Hint" button
2. If on cooldown → Show countdown timer
3. If available → Call AI with current grid state
4. Display hint in modal
5. Start 30-second cooldown
6. Increment hint counter (affects difficulty)

**Cooldown**: 30 seconds between hints

**Escalation Logic**:
- First hint OR >2 minutes since last hint → Guidance
- Second hint within 2 minutes → Specific

**Markdown Support**:
- Hints may contain markdown formatting (bold, lists, code blocks) to improve readability
- All markdown is sanitized using DOMPurify to prevent XSS attacks before rendering
- Allowed formatting: bold, italic, lists, paragraphs, code blocks
- No arbitrary HTML or JavaScript execution allowed

### 3. Real-Time Validation

**Description**: Continuous checking of player's grid against target clues with instant visual feedback.

**Validation States**:

**In-Progress** (default):
- Current filled cells could still lead to solution
- Example: Clue is [2 3], currently 2 filled → valid so far
- Visual: Normal display, no special indicators

**Error** (overfilled or impossible):
- Filled cells make target clues unreachable
- Example: Clue is [2], but 3 cells filled → error
- Visual: Red text on clue, red border on row/column
- Increments error counter

**Valid** (complete and correct):
- Row/column matches target clues exactly
- Visual: Green text, subtle checkmark
- No further action needed

**Validation Timing**: Checked on every cell state change

**Visual Feedback**:
- Errors highlighted immediately
- Red borders on affected rows/columns
- Green checkmarks on completed rows/columns

### 4. Adaptive Difficulty

**Description**: Difficulty automatically adjusts (1-10 scale) based on performance metrics.

**Metrics Tracked**:
- Solve time
- Hints used
- Errors made

**Adjustment Rules**:
- **Increase difficulty**: Fast solve (<3 min) + minimal hints (≤1) + few errors (≤2)
- **Decrease difficulty**: Slow solve (>10 min) OR many hints (>3) OR many errors (>8)
- **Keep same**: Moderate performance between these ranges

**User Feedback**:
After completion, show message:
- "Next puzzle: Harder ↑ — Great solve! Time to challenge yourself more."
- "Next puzzle: Easier ↓ — Let's dial it back to keep it fun."
- "Next puzzle: Same difficulty — You're doing well! Keep practicing."

**Difficulty Levels** (communicated to AI):
- Levels 1-3: "Very simple shapes (heart, smiley)"
- Levels 4-6: "Moderate detail (cat, house)"
- Levels 7-10: "Complex shapes (detailed portrait, intricate object)"

### 5. Timer

**Description**: Tracks time spent on puzzle, displayed in MM:SS format.

**Behavior**:
- Starts when puzzle loads
- Updates every second
- Pauses when tab goes to background (Page Visibility API)
- Stops on completion
- Persists across page refreshes (saved to localStorage)

**Display**: Header of game board, always visible

### 6. Persistence

**Description**: Current puzzle and difficulty profile saved automatically to localStorage.

**What's Saved**:
- Current puzzle (grid state, solution, clues, prompt)
- Difficulty profile (level, recent performance history)
- API key
- Timer state

**Save Trigger**:
- Debounced save after cell changes (don't save every click)
- Immediate save on puzzle completion

**Load Behavior**:
- On app start, check localStorage
- If puzzle exists → Resume where left off
- If no puzzle → Show prompt screen

### 7. Settings Menu

**Description**: Configuration menu accessible during gameplay to modify app settings.

**Access**:
- ⚙️ Gear icon button in top-right corner of screen
- Always visible during gameplay
- Click/tap to open dropdown menu

**Menu Options**:
1. **"New Prompt"** - Abandon current puzzle and return to prompt entry screen
   - Shows confirmation dialog: "Are you sure? Current puzzle will be lost."
   - Confirm → Clear current puzzle, navigate to prompt screen
   - Cancel → Close dialog, stay on current screen

2. **"Change API Key"** - Return to API key setup screen
   - Shows confirmation dialog: "This will restart the app. Continue?"
   - Confirm → Clear session, navigate to API key input
   - Cancel → Close dialog, stay on current screen

**UX Behavior**:
- **Glass morphism styling** - Consistent with other UI components (translucent background, blur effect)
- **Click outside to close** - Backdrop dismisses dropdown when clicking outside menu
- **Keyboard accessible** - Escape key closes dropdown
- **Mobile-friendly** - Touch-optimized targets (44px minimum)

**Visual Design**:
- Dropdown appears below gear icon
- Rounded corners (8px border-radius)
- Shadow for depth
- Options appear as list items with hover/tap states
- Confirmation dialogs use modal overlay pattern

---

## Difficulty Levels

**Scale**: 1-10 (starts at 1, adjusts based on performance)

**Level Characteristics**:
- **1-3 (Beginner)**: Very simple shapes, high contrast, obvious patterns (heart, smiley face)
- **4-6 (Intermediate)**: Moderate detail, some ambiguity requiring logic (cat silhouette, house)
- **7-10 (Advanced)**: Complex shapes with fine details, advanced techniques needed (detailed portrait, intricate object)

**Implementation**: Communicated to AI via prompt parameter to influence puzzle generation complexity.

---

## Grid Sizes

**Current**: 10×10 (fixed)

**Rationale**:
- Mobile-optimized (fits on screen without scrolling)
- Solvable in 3-10 minutes (good session length)
- Enough complexity for interesting puzzles

**Future Consideration**: 15×15 and 20×20 sizes (out of scope for initial release)

---

## User Flows

### First-Time User Flow

1. **Landing** → App loads, checks localStorage
2. **API Key Setup** → Shows API key input screen
   - User enters Anthropic API key
   - Key validated (format + test call)
   - Key saved to localStorage
3. **Prompt Entry** → Shows puzzle prompt screen
   - User enters text prompt
   - Selects grid size (currently only 10×10)
   - Clicks "Generate Puzzle"
4. **Puzzle Generation** → AI generates puzzle
   - Loading indicator shown
   - Retry if generation fails
   - Error message if all retries fail
5. **Gameplay** → Puzzle appears, timer starts
6. **Continue** → Proceed to solving

### Returning User Flow

**With saved puzzle**:
1. App loads → Detects saved puzzle in localStorage
2. Resumes puzzle immediately (same grid state, timer continues)

**Without saved puzzle**:
1. App loads → Shows prompt screen
2. User enters new prompt
3. Generates puzzle
4. Starts solving

### Puzzle Solving Flow

1. **Tap cell** → Cycles state (empty → filled → marked → empty)
2. **Validation** → Checks row/column clues
   - If error → Red highlight on row/column
   - If valid → Green checkmark
3. **Request hint** (optional) → See Hint Request Flow
4. **Completion Detection** → Grid fully filled + all clues match
5. **Puzzle Reveal** → Celebration moment showing completed puzzle
   - Grid remains visible with all cells in final state
   - Celebration animation (confetti, success indicator)
   - "Continue" button appears overlaid on grid
   - User must tap button to proceed to stats
   - No auto-advance - user controls when to move on
6. **Stats screen** → Shows time, hints, errors, next difficulty
7. **Next puzzle** → Return to prompt screen

### Hint Request Flow

1. **Tap "Get Hint" button**
2. **Cooldown check**
   - If on cooldown → Show countdown timer, button disabled
   - If available → Proceed
3. **Determine hint type**
   - If first hint OR >2 min since last → Guidance
   - If within 2 min → Specific
4. **AI processing** → Call API with current grid state
   - Show loading indicator
   - Handle errors gracefully
5. **Display hint** → Show in modal
   - Guidance: Text advice
   - Specific: Highlighted cell + reasoning
6. **Start cooldown** → 30 seconds, button disabled with countdown
7. **Increment counter** → Affects difficulty adjustment

---

## Design System

### Color Palette

**Primary Colors**:
- **Primary Blue**: `#0d47a1` - App background, branding
- **Success Green**: `#4CAF50` - Filled cells, valid states, primary actions
- **Error Red**: `#f44336` - Error states, validation failures
- **White**: `#ffffff` - Grid background, empty cells, text

**UI Colors**:
- **Cell Border**: `#e0e0e0` (light gray)
- **Mark Symbol**: `#666666` (gray) - X symbol on marked cells
- **Text on Dark**: White with high contrast (11.4:1 ratio)

**Contrast Requirements**:
- All text meets WCAG AAA standard (≥7:1 contrast ratio)
- Primary blue on white text: 11.4:1 ✓
- Error indicators use text + borders (not color alone)

### Typography

**Title**:
- Size: 1.8rem (desktop), 1.5rem (mobile)
- Weight: 500 (medium)
- Letter-spacing: 2px
- Text: "PIXLOGIC ✨"

**Clues**:
- Size: 9-10px
- Font: Monospace (for alignment)
- Color: White with 60% opacity (dimmed)
- Highlighted: 100% opacity + green background

**Buttons**:
- Size: 0.95rem
- Weight: 600 (semi-bold)

**Body Text**:
- Size: 1rem
- Font: System font stack

### Layout Principles

**Mobile-First**:
- Default design for 320px-640px screens
- Progressive enhancement for larger screens
- Touch-optimized controls
- Full-width layout with padding

**Touch-Friendly**:
- Minimum touch targets: 44×44px (Apple/Google guidelines)
- Grid cells: 26-28px on mobile, scale up on desktop
- Buttons: Minimum 44px height
- Grid gap: 2-3px for visual separation

**Responsive Breakpoints**:
- **Mobile**: 320px - 640px (default, smallest cells)
- **Tablet**: 640px - 1024px (medium cells)
- **Desktop**: 1024px+ (largest cells, max-width 600px centered)

### Component Patterns

**Grid Container**:
- Background: White
- Padding: 1rem
- Border-radius: 8px
- Box-shadow: `0 4px 12px rgba(0,0,0,0.3)`

**Cells**:
- Border: 2px solid `#e0e0e0`
- Border-radius: 4px
- **Filled**: Background `#4CAF50` (green)
- **Marked**: White background + gray × symbol (font-size: 1.2rem)
- **Empty**: White background
- **Active tap**: Scale 1.05, transition 200ms

**Buttons**:
- **Primary** (New Puzzle): Green background, white text, rounded 8px, shadow
- **Secondary** (Get Hint): White background, gray text, 2px border, rounded 8px
- **Disabled**: 50% opacity, not clickable

**Clues**:
- **Default**: Dimmed (60% opacity)
- **Highlighted** (after cell tap): Green background, 100% opacity, bold, fades after 2 seconds
- **Error**: Red text + red border on row/column
- **Valid**: Green text + checkmark icon

**Animations**:
- Cell tap: Pulse animation (scale 1.05, 200ms)
- Clue highlight: Fade in 150ms, fade out 300ms
- **Reduced motion**: All animations < 10ms if `prefers-reduced-motion`

**Completion Celebration**:
- **Trigger**: When puzzle becomes complete (all rows and columns valid)
- **Visual**: Completed grid remains visible with all cells in final state
- **Animation**: Confetti or success particles (plays once, 2-3s duration)
- **Button**: "Continue" button appears overlaid on grid (glass morphism style)
- **User Action Required**: User must tap button to proceed to stats screen
- **No auto-advance**: User can enjoy completed puzzle as long as they want
- **Purpose**: Let user appreciate their completed pixel art at their own pace
- **Mobile**: Large touch target for Continue button (minimum 44px height)

---

## UX Requirements

### Performance

**Puzzle Generation**:
- Expected time: 3-10 seconds
- Show loading indicator during generation
- Show progress (not just spinner): "Generating puzzle...", "Calculating clues..."
- Timeout after 30 seconds → show error

**Hint Generation**:
- Expected time: 2-5 seconds
- Show loading indicator: "Thinking..." or AI animation
- Timeout after 15 seconds → show error

**UI Responsiveness**:
- Cell taps: Immediate visual feedback (<50ms)
- Validation: Update within 100ms of cell change
- Grid rendering: Smooth, no jank on mobile
- Animations: 60fps or respect reduced motion preference

### Mobile Experience

**Touch Gestures**:
- Single tap: Cycle cell state (empty → filled → marked → empty)
- No multi-touch required
- No right-click needed (mobile doesn't have it)

**Grid Sizing**:
- Automatically scales to fit screen
- Maintains aspect ratio
- Readable clues on smallest screens (320px wide)

**Viewport**:
- Grid + clues fit on screen without scrolling
- Vertical layout for mobile (clues above/beside grid)
- Full viewport usage, minimal chrome

**Interaction Feedback**:
- Visual pulse on tap (not just state change)
- Haptic feedback on cell tap (if supported)
- Clear visual distinction between states

### Error Handling

**User-Friendly Messages**:
- No technical jargon in error messages
- Clear next steps: "Please try again" or "Check your API key"
- Avoid blame: "Connection issue" not "You lost connection"

**Recovery Paths**:
- All errors have a "Retry" or "Try Again" button
- API key errors → redirect to API key input
- Generation failures → return to prompt screen
- Network errors → allow retry without losing state

**API Error Handling**:
- 401 (Invalid key) → "Invalid API key. Please check your key and try again."
- 429 (Rate limit) → "API rate limit reached. Please wait a moment."
- 500+ (Server error) → "Service temporarily unavailable. Please try again later."
- Timeout → "Generation took too long. Please try a simpler prompt."

### Accessibility

**Keyboard Navigation**:
- Arrow keys: Move between cells
- Space bar: Toggle cell state
- Tab: Navigate buttons
- Enter: Activate focused button

**Screen Readers**:
- Semantic HTML (`<button>`, `<main>`, `<section>`)
- ARIA labels on cells: "Row 3, Column 5, filled"
- ARIA live regions for validation feedback
- Alt text for completed pixel art

**Visual Feedback**:
- Not color-dependent (errors have text + borders, not just red)
- Sufficient contrast on all text
- Focus indicators on keyboard navigation

---

## Constraints & Limitations

### Technical Constraints

- **Client-side only**: No backend server, all logic in browser
- **API key management**: User provides own key, stored in localStorage
- **Anthropic API limits**: Subject to rate limiting, costs borne by user
- **Browser storage**: localStorage has ~5-10MB limit
- **Browser compatibility**: Modern browsers only (ES6+, no IE11 support)

### Design Constraints

- **Grid size**: Fixed 10×10 (mobile screen size limit)
- **Puzzle complexity**: Limited by AI generation capabilities and prompt clarity
- **Prompt length**: Max 200 characters
- **Performance**: Complex animations may lag on older mobile devices
- **Offline**: Requires internet for puzzle generation and hints (no offline mode)

### Security Constraints

- **API key exposure**: Stored in localStorage (visible in dev tools)
- **No authentication**: Anyone with link can use app
- **No rate limiting**: User's API key limits apply

---

## Success Criteria

**User can:**
- ✅ Generate puzzles from any text prompt
- ✅ Solve puzzles with clear visual feedback
- ✅ Request hints when stuck
- ✅ Play on mobile and desktop devices
- ✅ Use the app without signing up or creating an account
- ✅ Resume puzzles after closing browser
- ✅ Receive adaptive difficulty adjustments

**System must:**
- ✅ Generate valid, solvable puzzles (no empty rows/columns)
- ✅ Provide accurate hints based on current state
- ✅ Handle API errors gracefully with user-friendly messages
- ✅ Validate grid in real-time with <100ms latency
- ✅ Persist state across browser sessions
- ✅ Work on screens as small as 320px wide

**Quality bars:**
- ✅ Puzzle generation success rate >95%
- ✅ Hint accuracy >95% (suggests correct move)
- ✅ Mobile usability score >80 (no zoom needed)
- ✅ Accessibility: WCAG AAA compliance

---

## Out of Scope (Current Version)

These features are explicitly NOT included in the initial release:

**User Features**:
- ❌ User accounts / authentication
- ❌ Puzzle history / past puzzles
- ❌ Social features / multiplayer
- ❌ Puzzle sharing (export/import)
- ❌ Leaderboards / achievements
- ❌ Tutorial mode

**Technical Features**:
- ❌ Multiple grid sizes (15×15, 20×20)
- ❌ Color nonograms (multi-color cells)
- ❌ Undo/redo functionality
- ❌ Solution solver/checker
- ❌ Backend API with rate limiting
- ❌ PWA / offline support
- ❌ Multiple AI providers (OpenAI, etc.)
- ❌ Custom puzzle upload

**Focus**: Simple, working, well-tested core experience first. Features can be added later based on user feedback.

---

## Cross-References

- **Implementation details**: See [Architecture](architecture.md)
- **AI features**: See [API Integration](api-integration.md)
- **Testing approach**: See [Testing Strategy](testing-strategy.md)
