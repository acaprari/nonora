# Pixlogic - AI Development Guidelines

## Project
AI-powered nonogram puzzle game built with React + TypeScript + Vite + Tailwind CSS.

## Before Making Changes
1. **Read the specifications**: Start with `docs/README.md` for navigation
2. Key specs: `product-specification.md`, `architecture.md`, `api-integration.md`, `testing-strategy.md`
3. All changes must align with these specifications

## Spec-Oriented Development
**CRITICAL**: Architectural changes must be documented BEFORE implementation.

### Workflow
1. Identify change needed
2. Check existing specs in `docs/` (start with `docs/README.md`)
3. Document proposed approach in appropriate spec file
4. Present spec to user for review
5. Wait for approval
6. Implement according to spec
7. Verify implementation matches spec

### When to Update Specs
- API changes
- Security considerations
- Architectural patterns
- Prompt engineering
- Data flow changes

### Documentation Structure
- `docs/README.md` - Navigation and quick lookup
- `docs/product-specification.md` - Features and UX
- `docs/architecture.md` - Technical design
- `docs/api-integration.md` - AI integration
- `docs/testing-strategy.md` - Testing approach

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
- **Specifications**: Start with `docs/README.md` for navigation
- **README**: `README.md` - Project overview
- **Deployment**: `DEPLOYMENT.md`
