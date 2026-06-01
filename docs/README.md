# Pixlogic Documentation

## The Rebuild Test

**Core Principle**: This documentation is designed to enable complete project reconstruction from scratch.

If you delete all source code but keep:
- `CLAUDE.md` (development guidelines)
- `docs/` (these specifications)

...you must be able to rebuild Pixlogic entirely with no gaps in understanding.

---

## Navigation Guide

### Start Here First
📋 **[Product Specification](product-specification.md)** - What we're building
- Features, requirements, user flows
- Game mechanics and rules
- UX requirements and design system
- **Read this first** to understand the product vision

### Technical Foundation
🏗️ **[Architecture](architecture.md)** - How it's structured
- Architectural patterns and design philosophy
- Component organization and state management
- File structure and code organization
- TypeScript usage and type design
- **Read this second** to understand technical approach

🤖 **[API Integration](api-integration.md)** - AI-powered features
- Anthropic Claude API integration
- Puzzle generation system
- Hint system (guidance and specific)
- Security considerations and prompt injection prevention
- **Read this for AI-specific implementation**

✅ **[Testing Strategy](testing-strategy.md)** - How to ensure quality
- Test-driven development approach
- Unit testing strategy
- E2E testing approach
- Coverage expectations and verification checklist
- **Read this to understand quality assurance**

---

## Quick Lookup

**Need to understand...**

### Product & Features
- Game rules and nonogram mechanics? → `product-specification.md` § Game Mechanics
- Available features? → `product-specification.md` § Features
- User flows (how users interact)? → `product-specification.md` § User Flows
- Design system (colors, typography)? → `product-specification.md` § Design System
- Difficulty system? → `product-specification.md` § Difficulty Levels

### Architecture & Code Organization
- Overall architecture patterns? → `architecture.md` § Architectural Patterns
- Component structure? → `architecture.md` § Component Structure
- State management approach? → `architecture.md` § State Management
- File organization? → `architecture.md` § File Structure
- Pure functions vs hooks vs components? → `architecture.md` § Code Organization Philosophy
- TypeScript patterns? → `architecture.md` § Type System

### AI Features
- How puzzles are generated? → `api-integration.md` § Puzzle Generation
- How hints work? → `api-integration.md` § Hint System
- Prompt structures? → `api-integration.md` § API Call Structure
- Security measures? → `api-integration.md` § Security Architecture
- Error handling? → `api-integration.md` § Error Handling

### Testing & Quality
- Testing philosophy (TDD)? → `testing-strategy.md` § Test-Driven Development
- Unit test approach? → `testing-strategy.md` § Unit Testing
- E2E test approach? → `testing-strategy.md` § End-to-End Testing
- Test coverage requirements? → `testing-strategy.md` § Coverage Requirements
- Verification checklist? → `testing-strategy.md` § Verification Before Completion

---

## Evolving This Documentation

### When to Update Specs

**Always update specs BEFORE implementing changes for:**
- New features or feature modifications
- Architectural changes (patterns, structure, state management)
- API integration changes (prompts, security, error handling)
- Design system changes (colors, layout patterns, components)
- Testing strategy changes

**Update specs IMMEDIATELY AFTER for:**
- Bug fixes that reveal spec gaps
- Implementation discoveries that clarify architecture

### When to Split Files

Consider splitting a documentation file when:

1. **File becomes too large** (>1000 lines) and hard to navigate
2. **Clear domain boundaries emerge** (e.g., "Puzzle System" becomes complex enough to warrant `puzzle-system.md`)
3. **Multiple teams/contexts** would benefit from separation (e.g., splitting "API Integration" into "puzzle-generation.md" and "hints-system.md")
4. **Frequent independent updates** to different sections suggest they belong in different files

**Process for splitting:**
1. Identify the section to extract
2. Create new file with clear scope
3. Update this README with navigation to new file
4. Add cross-references from related specs
5. Commit with clear message explaining the split rationale

**Example split scenarios:**
- If `api-integration.md` grows to cover multiple AI providers → split into `anthropic-integration.md`, `openai-integration.md`
- If `architecture.md` § State Management becomes 300+ lines → extract to `state-management.md`
- If puzzle generation becomes complex → extract from `api-integration.md` to `puzzle-system.md`

### Cross-References

Specs should reference each other when relevant:
- Format: `See [Architecture](architecture.md#state-management) for state management patterns`
- Use section anchors for precise references
- Prefer explicit cross-references over duplication

---

## Documentation Standards

### Writing Style
- **Implementation-agnostic where possible**, but include examples when they aid rebuilding
- **Example-driven**: Show concrete examples of patterns, prompts, data structures
- **Cross-referenced**: Link related concepts across files
- **Rebuild-focused**: Include enough detail that code can be reconstructed

### What to Include vs Exclude

✅ **Include:**
- WHAT features exist and WHY
- HOW systems are structured (patterns, approaches)
- Implementation examples that clarify understanding
- Security considerations and architectural decisions
- Design constraints and tradeoffs

❌ **Exclude:**
- Task tracking and completion summaries
- Tool-specific workflows (those belong in CLAUDE.md)
- Detailed change history (use git for this)
- Temporary notes or TODOs

---

## Current Documentation Status

| File | Status | Lines | Last Updated |
|------|--------|-------|--------------|
| `product-specification.md` | ✅ Complete | 567 | 2026-06-01 |
| `architecture.md` | ✅ Complete | 643 | 2026-06-01 |
| `api-integration.md` | ✅ Complete | 414 | 2026-06-01 |
| `testing-strategy.md` | 🚧 Skeleton | 293 | 2026-06-01 |

**Next steps:**
1. ✅ Create documentation structure (Phase 1) - Complete
2. ✅ Extract product specification from existing specs (Phase 2) - Complete
3. ✅ Extract architecture patterns (Phase 3) - Complete
4. ⏳ Create testing strategy documentation (Phase 4)
5. ⏳ Archive old superpowers/ directory (Phase 5)

---

## For AI Assistants

When you need context for any task:
1. Start with `docs/README.md` (this file) to orient yourself
2. Navigate to the relevant spec file using Quick Lookup above
3. Read the specific section you need
4. Follow cross-references to related concepts
5. If specs seem incomplete or contradictory, ask the user before implementing

**Remember**: These specs are the source of truth. When specs conflict with code, specs define the intended behavior.
