# Product Specification

**Last Updated:** 2026-06-02
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

**Win Condition**: All row AND column clues are satisfied (marked green) - traditional nonogram logic

**Important**: Victory is determined by **clue matching**, not by matching the AI's exact pixel solution. This is the correct and fairest behavior for nonograms - players solve based on logical deduction from clues alone.

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

### 3. Debounced Validation

**Description**: Continuous checking of player's grid against target clues with deliberate, non-intrusive visual feedback.

**Validation States**:

**In-Progress** (default):
- Current filled cells could still lead to solution
- Example: Clue is [2 3], currently 2 filled → valid so far
- Visual: Normal display, no special indicators

**Error** (overfilled or impossible):
- Filled cells make target clues unreachable
- Example: Clue is [2], but 3 cells filled → error
- Visual: Red text on clue, red border on row/column
- No error counter - mistakes make puzzle naturally harder

**Valid** (complete and correct):
- Row/column matches target clues exactly
- Visual: Enhanced green background (green-700) with white text for improved contrast
- Shown immediately (no debounce) for instant positive feedback
- No further action needed

**Puzzle Completion Logic** (Critical Design Decision):

The puzzle is considered solved when **all rows AND all columns are marked 'valid'** (green).

**How validation works:**
1. Player fills cells in their grid
2. System calculates clues from player's filled cells
3. System compares calculated clues to target clues (derived from AI solution)
4. If clues match exactly → row/column marked valid (green)

**Key Point**: The system **never compares player's cells directly to the AI's solution matrix**. It only validates that the player's pattern produces the same clues.

**Why this matters:**
- **Multiple valid solutions possible**: If clues are ambiguous (rare), different cell patterns could satisfy them
- **Traditional nonogram fairness**: Players solve purely through logical deduction from clues
- **No "intended solution" bias**: The AI's specific pixel arrangement is just one way to satisfy the clues
- **True puzzle solving**: Victory means "I satisfied all the constraints" not "I guessed what the AI drew"

**Example where cells differ but both win:**
```
AI Solution:     Player Solution:   Both satisfy clues [1,1] and [2]
■ □ ■            ■ ■ □              Row 1: Two groups (1 and 1)
■ ■ □            ■ □ ■              Row 2: One group (2)
```

This is the mathematically correct and fairest approach for nonogram puzzles.

**Validation Timing**:
- **Valid states (green)**: Shown immediately for instant positive feedback
- **Error states (red)**: Debounced by 1.5 seconds to prevent annoying flashing
- **In-progress**: No delay, shown as normal

**Visual Feedback**:
- Green (valid) states appear immediately for instant satisfaction
- Errors appear 1.5 seconds after player stops clicking
- Allows experimentation without constant red flashing
- Relaxing, zen-like solving experience

**Design Philosophy - No Error Tracking**:
- No error counter displayed or tracked
- Competition is against time and puzzle complexity
- Mistakes naturally make puzzle harder (self-correcting)
- Focus on relaxing, methodical logical deduction
- Only time + hints tracked as performance metrics

### 4. Adaptive Difficulty

**Description**: Difficulty automatically adjusts (1-10 scale) based on performance metrics.

**Metrics Tracked**:
- Solve time
- Hints used

**Adjustment Rules**:
- **Increase difficulty**: Fast solve (<3 min) + minimal hints (≤1)
- **Decrease difficulty**: Slow solve (>10 min) OR many hints (>3)
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

**Display During Gameplay**:
- Current level shown in game header (top-left) as glass badge
- Badge format: "Level X" with grid size (e.g., "Level 5  9×9")
- Elapsed timer shown next to level badge (e.g., "3:27")
- Glass morphism styling (semi-transparent background, white text)
- Always visible during active gameplay and celebration phases
- Helps users track progression and understand current challenge level
- Grid size + timer provide immediate feedback on complexity and performance

### 5. Timer

**Description**: Tracks elapsed time during puzzle solving, displayed in MM:SS format.

**Behavior**:
- Starts when puzzle loads (puzzle.startTime)
- Updates every second via setInterval
- Continues running during gameplay
- Final time captured at exact moment of completion
- Used for difficulty adjustment (key metric)

**Display**:
- Shown in GameBoard header as a glass badge next to Level badge
- Format: M:SS (e.g., "0:45", "3:27", "12:03")
- Always visible during active gameplay
- Updates in real-time every second
- Helps players track performance against difficulty thresholds:
  - Fast solve: <3 minutes (may increase difficulty)
  - Slow solve: >10 minutes (may decrease difficulty)

**Implementation**:
- Real-time countdown updated via React useEffect hook
- Calculates elapsed seconds from puzzle.startTime
- No pause on tab background (intentional - time continues)
- Completion time frozen at moment of victory for stats display

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
- If saved state exists → Restore all saved data:
  - API key (no need to re-enter)
  - Difficulty profile (level, grid size, recent performance)
  - Current puzzle (if exists) → Resume where left off with same grid state
- If no saved state → Show API key setup
- If saved state but no active puzzle → Show prompt screen at saved difficulty level

### 7. Settings Menu

**Description**: Configuration menu accessible during gameplay to modify app settings.

**Access**:
- Gear icon button (SVG icon) in top-right corner of screen
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
- **Glass morphism styling** - Enhanced opacity (less transparent, more prominent background) with blur effect
- **Click outside to close** - Backdrop dismisses dropdown when clicking outside menu
- **Keyboard accessible** - Escape key closes dropdown
- **Mobile-friendly** - Touch-optimized targets (44px minimum)
- **Clean design** - No footer labels, minimal UI

**Visual Design**:
- Dropdown appears below gear icon
- Rounded corners (8px border-radius)
- Shadow for depth
- Enhanced glass effect with reduced transparency for better readability
- Options appear as list items with hover/tap states
- Confirmation dialogs use modal overlay pattern

---

## Difficulty Levels

**Scale**: 1-10 (starts at 1, adjusts based on performance)

**Grid Size Progression**: Each level has its own grid size for gradual difficulty increase
- Level 1: 5×5 (25 cells)
- Level 2: 6×6 (36 cells)
- Level 3: 7×7 (49 cells)
- Level 4: 8×8 (64 cells)
- Level 5: 9×9 (81 cells)
- Level 6: 10×10 (100 cells)
- Level 7: 11×11 (121 cells)
- Level 8: 12×12 (144 cells)
- Level 9: 13×13 (169 cells)
- Level 10: 14×14 (196 cells)

**Formula**: `gridSize = level + 4`

**Level Characteristics** (communicated to AI):
- **1-3 (Beginner)**: Very simple shapes, high contrast, obvious patterns (heart, smiley face)
- **4-6 (Intermediate)**: Moderate detail, some ambiguity requiring logic (cat silhouette, house)
- **7-10 (Advanced)**: Complex shapes with fine details, advanced techniques needed (detailed portrait, intricate object)

**Rationale for Linear Progression**:
- Each level feels distinct with its own grid size
- Smoother learning curve with smaller incremental steps
- More variety in puzzle dimensions
- Clearer sense of advancement as grid visibly grows

---

## Grid Sizes

**System**: Progressive sizing tied to difficulty level (5×5 to 14×14)

**Implementation**: Grid size determined by formula `gridSize = level + 4`
- Starts small (5×5 at level 1) for new players
- Grows incrementally with each level
- Reaches maximum complexity at 14×14 (level 10)

**Technical Constraints**:
- Minimum: 5×5 (API supports 5-20)
- Maximum: 14×14 (chosen for mobile usability)
- All sizes render dynamically via CSS Grid
- Cell sizes scale based on viewport to maintain usability

**Mobile Considerations**:
- Lower levels (5×5 to 8×8) - Large, easy-to-tap cells
- Mid levels (9×9 to 11×11) - Comfortable on most screens
- High levels (12×12 to 14×14) - Smaller cells, may require zoom on small devices
- Responsive design ensures puzzles remain playable across device sizes

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
   - Grid size automatically determined by current difficulty level
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
- Valid state: Enhanced contrast with darker green background (`#2e7d32`) for improved visibility

**Buttons**:
- Size: 0.95rem
- Weight: 600 (semi-bold)

**Body Text**:
- Size: 1rem
- Font: System font stack

### Icon System

**Format**: Flat monochrome SVG sprite system

**Icons**:
- **settings**: Gear icon for settings menu
- **refresh**: Circular arrow for "New Prompt" action
- **key**: Key icon for API key management
- **close**: X icon for dismissing modals
- **lightbulb**: Hint icon (guidance hints)
- **target**: Bullseye icon (specific hints)
- **trophy**: Achievement icon for puzzle completion (replaces celebration emoji)

**Design Principles**:
- Flat design with 1.5px stroke width
- Rounded linecaps for smooth appearance
- 24×24 viewBox, scalable via size prop
- Uses `currentColor` for automatic color inheritance
- Consistent stroke-based style across all icons
- No fill, outline-only for clean appearance

**Trophy Icon** (Completion):
- Simple trophy silhouette with cup and base
- Clearly recognizable at all sizes (16px-64px)
- Conveys achievement and success
- More universally understood than ta-da gesture emoji

### Favicon

**Design**: Simple 2×2 grid representing a nonogram puzzle

**Structure**:
- 2×2 grid of cells (4 cells total)
- Shows both filled (green) and empty (white) cells
- Demonstrates the core game mechanic at smallest scale
- Pattern: diagonal filled cells (top-left and bottom-right green, others white)

**Colors**:
- **Filled cells**: `#4CAF50` (success green)
- **Empty cells**: `#ffffff` (white)
- **Cell borders**: `#e0e0e0` (light gray)
- **External border**: Thicker than internal borders for definition

**Sizes**:
- Cell borders: 1px
- External border: 2-3px (thicker for clear boundary)
- Background: Transparent or white
- Viewbox: 32×32 or 64×64 (scalable SVG)

**Format**: SVG for crisp scaling at all sizes

**Rationale**:
- Previous 5×5 heart design too complex/unclear at favicon size
- 2×2 grid instantly recognizable as puzzle grid
- Simple enough to understand at 16×16px
- Uses game colors for brand consistency

### Layout Principles

**Mobile-First**:
- Default design for 320px-640px screens
- Progressive enhancement for larger screens
- Touch-optimized controls
- Full-width layout with padding

**Touch-Friendly**:
- Minimum touch targets: 44×44px (Apple/Google guidelines)
- Grid cells: 26-28px on mobile, smaller on desktop (optimized for screen real estate)
- Buttons: Minimum 44px height
- Grid gap: 2-3px for visual separation
- Mobile scrolling: Horizontal/vertical scroll enabled for large grids (12×12+) to maintain playable cell sizes

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
- **Marked**: White background + gray × symbol (font-size: 1.2rem, fixed size to prevent cell expansion)
- **Empty**: White background
- **Active tap**: Scale 1.05, transition 200ms
- **Desktop sizing**: Smaller cells (max 32px) to optimize screen usage
- **Mobile sizing**: Touch-optimized cells (26-28px) with scroll support for large grids

**Buttons**:
- **Primary** (New Puzzle): Green background, white text, rounded 8px, shadow
- **Secondary** (Get Hint): White background, gray text, 2px border, rounded 8px
- **Disabled**: 50% opacity, not clickable

**Clues**:
- **Default**: Dimmed (60% opacity)
- **Highlighted** (after cell tap): Green background, 100% opacity, bold, fades after 2 seconds
- **Error**: Red text + red border on row/column
- **Valid**: Enhanced green background (`#2e7d32`) with white text for improved contrast and visibility

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
- ❌ Manual grid size selection (size is tied to difficulty level)
- ❌ Grid sizes beyond 14×14 (15×15, 20×20 not supported)
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
