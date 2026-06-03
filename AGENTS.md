# nonora - AI Development Guidelines

## Project
AI-powered nonogram puzzle game built with React + TypeScript + Vite + Tailwind CSS.

## Before Making Changes
1. **Read the specifications**: Start with `docs/README.md` for navigation
2. Key specs: `product-specification.md`, `architecture.md`, `api-architecture.md`, `testing-strategy.md`
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
- `docs/api-architecture.md` - AI integration
- `docs/testing-strategy.md` - Testing approach

### Anti-Pattern
❌ Implement first, document later
✅ Document first, get approval, then implement

See 2026-06-01 commits for example of what NOT to do (security improvements were implemented before updating specs).

## Documentation Sync Protocol (MANDATORY)

**Principle**: This codebase follows the **"Rebuild from Scratch"** test (see `docs/README.md`). All code changes MUST be reflected in specifications.

### Rule: Code Changes Are NOT Complete Until Specs Are Updated

Every implementation task has these phases:
1. ✅ Write/modify code
2. ✅ Write/update tests
3. ✅ **Update relevant specs** (this step is NOT optional)
4. ✅ Commit (code + specs together)

### Before Every Commit: Spec Impact Check

Ask yourself these questions. If you answer "yes" to ANY, update specs FIRST:

**Data & Types:**
- Did I add/modify/remove TypeScript interfaces or types?
- Did I change data structures or state shape?
→ Update the **Architecture** spec (see `docs/README.md` § Architecture)

**Files & Organization:**
- Did I add/remove/rename any files (components, hooks, lib functions)?
- Did I change the directory structure?
→ Update the **Architecture** spec § File Structure

**Components & Hooks:**
- Did I change component names, props, or behavior?
- Did I add/remove hooks or change their APIs?
→ Update the **Architecture** spec § Component Organization / Custom Hooks

**AI Integration:**
- Did I modify API calls, prompts, or response handling?
- Did I change how Claude API is used?
→ Update the **API Architecture** spec (see `docs/README.md` § AI Features)

**User-Facing Features:**
- Did I change game mechanics, UI flows, or user interactions?
- Did I add/remove features?
→ Update the **Product Specification** (see `docs/README.md` § Product & Features)

**Testing:**
- Did I change testing strategy, patterns, or requirements?
→ Update the **Testing Strategy** spec (see `docs/README.md` § Testing & Quality)

**Bug Fixes:**
- Did this bug reveal a gap or inaccuracy in the specs?
→ Update the spec that should have prevented this bug

### Update the Index When Needed

If you:
- Add a new spec file
- Split an existing spec into multiple files
- Significantly reorganize documentation

Then update `docs/README.md`:
- Add navigation links
- Update Quick Lookup section
- Update file status table

### Verification Commands

Before committing, run these spot checks:

```bash
# Check for stale component/hook names in docs
grep -r "ComponentName\|hookName" docs/

# Check for old branding/terminology
grep -r "old-term" docs/

# Verify docs reference actual files
# (compare docs/architecture.md file list vs actual src/ structure)
```

### Commit Message Convention

Every commit MUST include spec status:

```
feat: add new feature X

Implementation details...

Specs: ✅ Updated product-specification.md § Features
Specs: ✅ Updated architecture.md § Component Organization
```

Or if genuinely no spec impact:

```
chore: update dependency versions

Specs: ⚠️ N/A - internal dependency update only
```

### When In Doubt

**Ask yourself**: "If I deleted all code but kept docs/, could someone rebuild this change from the specs alone?"

If the answer is NO, the specs are incomplete.

### Finding the Right Spec

Don't guess which file to update. Check `docs/README.md`:
- **§ Navigation Guide** - Links to each major spec
- **§ Quick Lookup** - Maps topics to specific sections
- **§ Current Documentation Status** - Lists all spec files

The index is the source of truth for documentation organization.

## Mandatory Practices

### Test-Driven Development (TDD)
- Write tests FIRST, then implementation
- Test location: `src/**/__tests__/*.test.tsx`
- All tests must pass: `npm test` (231+ tests)
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
