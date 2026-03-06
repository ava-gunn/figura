# harmonics

A TypeScript music theory algebra for symbolic phrase resolution, targeting
Strudel as the primary output format. Inspired by Synfire (Cognitone).

## Concept

```
figure (symbolic) + harmony (context) = absolute notes
```

Phrases store scale degrees rather than absolute pitches. A harmony layer
(key + roman numerals) provides the context to resolve them. The same phrase
sounds correct over any chord progression without re-editing.

```
Key:    C
Chords: iim7        V7          IM7
Figure: 1*  3  5  3  2*  1  7-  1*
Rhythm: 1   _  1  .  ~   !  1   _
Output: D4  ~  A4  B4/2  ~  ^G4  B3  ~
```

## Packages

- `@harmonics/core` — pure music algebra, no Strudel dependency
- `@harmonics/strudel` — converts resolved output to Strudel mini-notation

## Setup

```bash
pnpm install
pnpm test          # all tests (currently failing — implement to make pass)
pnpm test:coverage # coverage report
pnpm build         # build all packages
```

## Development

See `.claude/ARCHITECTURE.md` for system design.
See `.claude/DOMAIN.md` for music theory concepts.
See `.claude/DSL.md` for the figure and rhythm DSL specification.
See `.claude/DECISIONS.md` for architectural decisions and rationale.
See `CLAUDE.md` for AI pair programming workflow.

## Stack

pnpm workspaces · TypeScript strict · tsup (ESM) · Vitest · ESLint ·
Prettier · Knip · Publint · Commitlint · Sherif · CSpell · Husky
