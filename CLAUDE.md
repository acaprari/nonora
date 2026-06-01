# Pixlogic Development Guidelines for Claude Code

## Project Overview
Pixlogic is an AI-powered nonogram puzzle game built with React, TypeScript, and Anthropic's Claude API.

## Design Specification Location
**CRITICAL**: Before making ANY changes, read the complete design specification:
- Location: `docs/superpowers/plans/2026-05-24-pixlogic-implementation.md`
- This document defines all features, architecture, and implementation details
- All changes MUST align with this specification

## Spec-Oriented Development
**CRITICAL RULE**: This project follows spec-oriented development. All architectural changes must be documented BEFORE implementation.

### Workflow for Architectural Changes
1. **Identify change needed** (bug fix, new feature, security improvement)
2. **Check existing specs** in `docs/superpowers/specs/` and `docs/`
3. **Document the proposed approach** in appropriate spec/architecture doc
4. **Present specification to user for review**
5. **Wait for approval** before implementing
6. **Implement according to approved spec**
7. **Verify implementation matches spec**

### When Specs Must Be Updated
- API structure changes
- Security considerations
- New architectural patterns
- Integration changes
- Prompt engineering modifications
- Data flow changes
- Any change that affects system architecture

### Documentation Structure
- `docs/superpowers/specs/` - Design specifications (requirements, high-level architecture)
- `docs/api-architecture.md` - API implementation details
- `docs/` - Other technical documentation

### Anti-Patterns to Avoid
❌ **DON'T:** Implement fixes reactively then document afterward
✅ **DO:** Document architectural approach, get approval, then implement

❌ **DON'T:** Make "small changes" to prompts/API without updating docs
✅ **DO:** Treat all architectural changes as requiring spec updates

### Reference Example (What NOT to Do)
See commit history from 2026-06-01 for security improvements:
- Added prompt injection prevention (sanitization + structural separation)
- Updated all API calls to use system/user pattern
- Created comprehensive API architecture documentation

This was done BACKWARDS (implementation first, docs after). **Don't repeat this pattern.**

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
