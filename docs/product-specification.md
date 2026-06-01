# Product Specification

**Last Updated:** 2026-06-01
**Status:** 🚧 Skeleton - Content to be extracted from existing specs

---

## Overview

Pixlogic is an AI-powered nonogram puzzle game that combines classic logic puzzles with generative AI technology.

**Key Innovation**: Players can generate custom puzzles from text prompts using Claude AI, and receive intelligent hints that adapt to their current progress.

---

## Game Mechanics

### What are Nonograms?

[To be filled: Explanation of nonogram rules, how to play, grid/clue system]

### Core Gameplay Loop

[To be filled: Setup → Play → Solve flow, win conditions, validation]

### Cell States

[To be filled: Empty, Filled, Marked states and their meanings]

---

## Features

### 1. AI-Powered Puzzle Generation

**Description**: [To be filled: Generate puzzles from text prompts]

**User Flow**: [To be filled: Prompt entry → size selection → difficulty → generation]

**Requirements**: [To be filled: API key management, error handling, retry logic]

### 2. Manual Puzzle Entry

**Description**: [To be filled: Enter predefined puzzles manually]

**User Flow**: [To be filled]

### 3. Adaptive Hint System

**Description**: [To be filled: Two-tier hint system with cooldown]

**Types**:
- **Guidance Hints**: [To be filled: Strategic hints without coordinates]
- **Specific Hints**: [To be filled: Exact cell suggestions with reasoning]

**User Flow**: [To be filled: Hint button → cooldown → modal display]

### 4. Real-Time Validation

**Description**: [To be filled: Visual feedback on correctness]

**Validation Modes**: [To be filled: Per-row, per-column, per-cell]

---

## Difficulty Levels

[To be filled: 1-10 scale, what each level means, puzzle characteristics]

---

## Grid Sizes

[To be filled: Supported sizes (5x5 to 20x20), default (10x10), mobile considerations]

---

## User Flows

### First-Time User Flow

[To be filled: Landing → API setup → first puzzle generation]

### Returning User Flow

[To be filled: Direct to puzzle selection/generation]

### Puzzle Solving Flow

[To be filled: Cell interaction (click/right-click), validation feedback, completion]

### Hint Request Flow

[To be filled: Request hint → AI processing → modal display → cooldown]

---

## Design System

### Color Palette

**Primary Colors**:
- Primary Blue: `#0d47a1` - Main actions, branding
- Success Green: `#4CAF50` - Correct states, filled cells
- Error Red: `#f44336` - Incorrect states, errors

**UI Colors**:
- Cell Border: `#e0e0e0` (light gray)
- Background: [To be filled]
- Text: [To be filled]

### Typography

[To be filled: Font families, sizes, weights]

### Layout Principles

**Mobile-First**: [To be filled: Responsive design approach]

**Touch-Friendly**: [To be filled: Minimum touch target sizes (44x44px)]

**Accessibility**: [To be filled: Color contrast, keyboard navigation]

### Component Patterns

[To be filled: Glass morphism for cards, rounded corners, shadows, transitions]

---

## UX Requirements

### Performance

- Puzzle generation: [To be filled: Expected time, loading indicators]
- Hint generation: [To be filled: Expected time, loading states]
- UI responsiveness: [To be filled: Immediate feedback requirements]

### Mobile Experience

[To be filled: Touch gestures, responsive grid sizing, mobile-optimized controls]

### Error Handling

[To be filled: User-friendly error messages, recovery paths, API error handling]

---

## Constraints & Limitations

### Technical Constraints

- Client-side only (no backend server)
- API key stored in browser localStorage
- Anthropic API rate limits
- Browser compatibility requirements

### Design Constraints

[To be filled: Grid size limits, puzzle complexity bounds, mobile screen considerations]

---

## Success Criteria

**User can:**
- Generate puzzles from any text prompt
- Solve puzzles with clear visual feedback
- Request hints when stuck
- Play on mobile and desktop devices
- Use the app without signing up or creating an account

**System must:**
- Generate valid, solvable puzzles
- Provide accurate hints based on current state
- Handle API errors gracefully
- Work offline after initial load (except AI features)

---

## Out of Scope (Current Version)

- User accounts / authentication
- Puzzle saving / history
- Multiplayer features
- Puzzle sharing
- Leaderboards / achievements
- Multiple AI providers
- Custom puzzle upload

---

## Cross-References

- **Implementation details**: See [Architecture](architecture.md)
- **AI features**: See [API Integration](api-integration.md)
- **Testing approach**: See [Testing Strategy](testing-strategy.md)
