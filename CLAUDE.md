# nonora Development Guidelines for Claude Code

## Project Overview
nonora is an AI-powered nonogram puzzle game built with React, TypeScript, and Anthropic's Claude API.

## Design Specification Location
**CRITICAL**: Before making ANY changes, read the specifications:
- **Start here**: `docs/README.md` - Navigation guide and quick lookup
- **Product**: `docs/product-specification.md` - Features and requirements
- **Architecture**: `docs/architecture.md` - Technical design and patterns
- **API**: `docs/api-architecture.md` - AI integration details
- **Testing**: `docs/testing-strategy.md` - Test approach and verification

All changes MUST align with these specifications.

## Spec-Oriented Development
**CRITICAL RULE**: This project follows spec-oriented development. All architectural changes must be documented BEFORE implementation.

### Workflow for Architectural Changes
1. **Identify change needed** (bug fix, new feature, security improvement)
2. **Check existing specs** in `docs/` (start with `docs/README.md` for navigation)
3. **Document the proposed approach** in appropriate spec file
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
- `docs/README.md` - Navigation guide and quick lookup
- `docs/product-specification.md` - Features, requirements, UX
- `docs/architecture.md` - Technical patterns and design
- `docs/api-architecture.md` - AI integration details
- `docs/testing-strategy.md` - Testing approach

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
- Unit tests: `npm test` (must show 231+ tests passing)
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
- Uses Anthropic Claude API (Sonnet 4.6)
- API key stored in localStorage (user-provided)
- All API calls go through `src/lib/api.ts` → `ApiClient` class
- Never commit API keys or secrets

## Deployment
- GitHub Pages: Automatic via GitHub Actions on push to `main`
- Manual: `npm run deploy`
- Base path configured in `vite.config.ts` as `/nonora/`

## Before Committing
- [ ] All 231+ unit tests passing (`npm test`)
- [ ] Production build succeeds (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No console.log statements in src/
- [ ] No TODO comments (implement or remove)
- [ ] No 'any' types (use specific types)
- [ ] Design spec compliance verified

## Getting Help
- **Specifications**: Start with `docs/README.md` for navigation
- **README**: `README.md` - Project overview
- **Deployment Guide**: `DEPLOYMENT.md`
- **E2E Tests**: `E2E_TEST_README.md`

---

**Remember**: The design spec is the source of truth. When in doubt, consult it first.
