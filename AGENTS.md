# Pixlogic - AI Development Guidelines

## Project
AI-powered nonogram puzzle game built with React + TypeScript + Vite + Tailwind CSS.

## Before Making Changes
1. **Read the design specification**: `docs/superpowers/plans/2026-05-24-pixlogic-implementation.md`
2. This document is the source of truth for all features and architecture
3. All changes must align with the specification

## Spec-Oriented Development
**CRITICAL**: Architectural changes must be documented BEFORE implementation.

### Workflow
1. Identify change needed
2. Document proposed approach in specs (`docs/superpowers/specs/` or `docs/`)
3. Present spec to user for review
4. Wait for approval
5. Implement according to spec
6. Verify implementation matches spec

### When to Update Specs
- API changes
- Security considerations
- Architectural patterns
- Prompt engineering
- Data flow changes

### Documentation Structure
- `docs/superpowers/specs/` - Design specs
- `docs/api-architecture.md` - API details
- `docs/` - Technical docs

### Anti-Pattern
❌ Implement first, document later
✅ Document first, get approval, then implement

See 2026-06-01 commits for example of what NOT to do (security improvements were implemented before updating specs).

## Mandatory Practices

### Test-Driven Development (TDD)
- Write tests FIRST, then implementation
- Test location: `src/**/__tests__/*.test.tsx`
- All tests must pass: `npm test` (223+ tests)
- Never commit without running tests

### Architecture Rules
- Business logic → `src/lib/` (pure functions)
- State management → `src/hooks/` (React hooks)
- UI components → `src/components/` (presentational)
- No business logic in components

### Code Quality
- No `console.log` in production
- No `any` types - use specific TypeScript types
- No unused imports
- No TODO comments without issues

### Testing Requirements
```bash
npm test              # Unit tests (must pass all)
npm run build         # Production build (must succeed)
npx tsc --noEmit      # TypeScript check (must have no errors)
npm run test:e2e      # E2E tests (optional)
```

### Design System
Colors (Tailwind CSS):
- Primary: #0d47a1
- Success: #4CAF50
- Error: #f44336

## Technology Stack
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Anthropic Claude API
- Vitest + React Testing Library
- Playwright (E2E)

## File Structure
- `src/lib/` - Core game logic (9 files)
- `src/hooks/` - React state hooks (4 files)
- `src/components/` - UI components (12 files)
- `src/types/` - TypeScript types

## Deployment
- GitHub Pages (automatic on push to main)
- Or manual: `npm run deploy`

## Documentation
- Design Spec: `docs/superpowers/plans/2026-05-24-pixlogic-implementation.md`
- README: `README.md`
- Deployment: `DEPLOYMENT.md`
