# Pixlogic Development Guidelines for Claude Code

## Project Overview
Pixlogic is an AI-powered nonogram puzzle game built with React, TypeScript, and Anthropic's Claude API.

## Design Specification Location
**CRITICAL**: Before making ANY changes, read the complete design specification:
- Location: `docs/superpowers/plans/2026-05-24-pixlogic-implementation.md`
- This document defines all features, architecture, and implementation details
- All changes MUST align with this specification

## Mandatory Development Practices

### 1. Test-Driven Development (TDD)
- **ALWAYS write tests FIRST**, then implementation
- Use the `test-driven-development` superpowers skill for all feature work
- Test file location: `src/**/__tests__/*.test.tsx` or `src/**/*.test.ts`
- All tests must pass before committing: `npm test`

### 2. Superpowers Skills Usage
**You MUST invoke these skills when applicable:**
- `brainstorming` - Before any new feature or significant change
- `test-driven-development` - For all feature implementation
- `systematic-debugging` - When encountering bugs or test failures
- `verification-before-completion` - Before claiming work is complete
- `requesting-code-review` - Before major changes or completion

### 3. Architecture Patterns
- **Pure functions** in `src/lib/` for all business logic
- **React hooks** in `src/hooks/` for state management
- **Components** in `src/components/` are presentational with props
- **NO business logic in components** - use hooks and lib functions
- **Immutable state updates** throughout

### 4. Testing Requirements
- Unit tests: `npm test` (must show 223+ tests passing)
- E2E tests: `npm run test:e2e`
- Build verification: `npm run build` (must succeed)
- TypeScript check: `npx tsc --noEmit` (must have no errors)

### 5. Design System
**Color Palette** (defined in `tailwind.config.js`):
- Primary: `#0d47a1` (dark blue) - Use for main actions
- Success: `#4CAF50` (green) - Use for correct states
- Error: `#f44336` (red) - Use for error states
- Cell filled: `#4CAF50` (green)
- Cell border: `#e0e0e0` (light gray)

**Typography & Layout**:
- Use Tailwind CSS utility classes
- Mobile-first responsive design
- Touch-friendly targets (min 44x44px)

### 6. Code Quality Standards
- **No `console.log`** in production code (use only for debugging)
- **No `any` types** - use specific TypeScript types
- **No unused imports** - remove before committing
- **No TODO comments** - either implement or create an issue

## File Structure
```
src/
├── components/     # React UI components (presentational)
├── hooks/          # Custom React hooks (state management)
├── lib/            # Pure functions (business logic)
│   ├── clueCalculator.ts
│   ├── validator.ts
│   ├── difficultyEngine.ts
│   ├── api.ts
│   └── puzzleGenerator.ts
├── types/          # TypeScript type definitions
├── App.tsx         # Main application component
└── main.tsx        # Application entry point
```

## Common Tasks

### Adding a New Feature
1. Invoke `brainstorming` skill first
2. Locate relevant section in design spec
3. Invoke `test-driven-development` skill
4. Write tests first in appropriate `__tests__` directory
5. Implement feature to pass tests
6. Run `npm test` and `npm run build`
7. Invoke `verification-before-completion` skill
8. Commit only after verification

### Fixing a Bug
1. Invoke `systematic-debugging` skill
2. Write a failing test that reproduces the bug
3. Fix the implementation
4. Verify test passes and no regressions
5. Run full test suite

### Refactoring
1. Ensure all tests pass before starting
2. Make changes while keeping tests green
3. Verify no functionality changes
4. Run full test suite

## API Integration
- Uses Anthropic Claude API (Sonnet 4)
- API key stored in localStorage (user-provided)
- All API calls go through `src/lib/api.ts` → `ApiClient` class
- Never commit API keys or secrets

## Deployment
- GitHub Pages: Automatic via GitHub Actions on push to `main`
- Manual: `npm run deploy`
- Base path configured in `vite.config.ts` as `/pixlogic/`

## Before Committing
- [ ] All 223+ unit tests passing (`npm test`)
- [ ] Production build succeeds (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No console.log statements in src/
- [ ] No TODO comments (implement or remove)
- [ ] No 'any' types (use specific types)
- [ ] Design spec compliance verified

## Getting Help
- Design Spec: `docs/superpowers/plans/2026-05-24-pixlogic-implementation.md`
- README: `README.md`
- Deployment Guide: `DEPLOYMENT.md`
- E2E Tests: `E2E_TEST_README.md`

---

**Remember**: The design spec is the source of truth. When in doubt, consult it first.
