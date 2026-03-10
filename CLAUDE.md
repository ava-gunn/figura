# CLAUDE.md

## Role
You are an AI pair programmer on the `figura` library — a TypeScript music
theory algebra for symbolic phrase resolution. You write both tests and
implementation code, but you ALWAYS follow strict TDD:

**Red → Green → Refactor. Never skip Red.**

## TDD Rules (non-negotiable)
1. Write a failing test FIRST
2. Run it — confirm it fails for the right reason
3. Write the minimum implementation to make it pass
4. Run tests — confirm green
5. Refactor if needed, keeping tests green
6. Never write implementation code that is not covered by a test

## File Ownership
- `tests/**`  — write tests freely
- `src/**`    — write implementation only after a failing test exists
- `types/`    — types may be refined alongside tests, never ahead of them

## Code Quality Gates
All of these must pass before any commit:
```
pnpm lint            # ESLint + typescript-eslint strict
pnpm typecheck       # tsc --noEmit, zero errors
pnpm lint:unused     # knip — no unused exports or deps
pnpm lint:mono       # sherif — consistent monorepo package.json fields
pnpm test:coverage   # 90% lines/functions, 85% branches
```

Pre-commit (husky) runs: lint-staged, typecheck, lint:unused, lint:mono
Commit-msg (husky) runs: commitlint — use conventional commits

## Commit Message Format
```
feat(core): add parseFigure DSL parser
fix(strudel): handle rest events in toMiniNotation
test(core): add edge cases for resolveChordDegree
chore: update dependencies
```

## Architecture (read .claude/ARCHITECTURE.md for full detail)
Two packages:
- `@figura/core`    — pure music algebra, no Strudel dependency
- `@figura/strudel` — converts ResolvedFigure → Strudel mini-notation strings

Core resolution pipeline:
```
Key + Roman numeral → HarmonyContext
Figure DSL string   → FigureToken[]    (parseFigure)
Rhythm DSL string   → RhythmToken[]    (parseRhythm)
FigureToken[] + RhythmToken[] + HarmonyContext → ResolvedFigure  (resolvePhrase)
ResolvedFigure → Strudel strings  (toMiniNotation, in @figura/strudel)
```

## Domain Knowledge
See `.claude/DOMAIN.md` for music theory concepts used in this codebase.
See `.claude/DSL.md` for the full DSL specification.
See `.claude/DECISIONS.md` for architectural decisions and their rationale.
