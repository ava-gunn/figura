---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-06'
inputDocuments:
  - prd.md
  - product-brief-figura-2026-03-06.md
  - domain-symbolic-music-representation-research-2026-03-06.md
  - brainstorming-session-2026-03-06-1920.md
  - .claude/ARCHITECTURE.md
  - .claude/DOMAIN.md
  - .claude/DSL.md
  - .claude/DECISIONS.md
workflowType: 'architecture'
project_name: 'figura'
user_name: 'Ava'
date: '2026-03-06'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

33 FRs across 7 categories forming a clean pipeline architecture:

| Category | FRs | Architectural Implication |
|---|---|---|
| DSL Parsing (FR1-5) | 2 parsers: figure + rhythm | Independent parser modules, no shared state |
| Harmonic Context (FR6-9) | Roman numeral resolution, scale/chord derivation | Depends on `tonal` for music theory primitives |
| Pitch Resolution (FR10-14) | Stateless degree-to-pitch, contour preservation | Pure functions, figure-type-polymorphic via pitch space |
| Phrase Resolution (FR15-19) | Single-pass orchestration, LCM cycling, rhythm precedence | Pipeline coordinator, no look-ahead |
| Strudel Output (FR20-25) | Mini-notation string generation | Separate package, string-only output |
| Debug & Observability (FR26-29) | Per-position trace output | Options parameter on resolution functions |
| API & Type Surface (FR30-33) | Public typed exports, standalone core | Package boundary design, type re-exports |

**Non-Functional Requirements:**

| NFR | Constraint | Architectural Impact |
|---|---|---|
| Performance | <10ms for 64 events | No async, no I/O, pure computation |
| Determinism | Same inputs = same outputs | Pure functions, no randomness, no shared state |
| Zero side effects | No heap beyond output | Functional style, return new objects |
| ESM-only | No CJS | Package.json `"type": "module"`, exports map |
| Single dependency | Only `tonal` in core | Minimal surface area, vendorable if needed |
| AGPL isolation | Never import Strudel runtime | `@figura/strudel` outputs strings only |
| Coverage | 90% lines/functions, 85% branches | TDD-first, every resolution rule tested |

**Scale & Complexity:**

- Primary domain: npm library — pure computation, no I/O, no UI
- Complexity level: Medium — deep music theory domain but narrow technical scope
- Estimated architectural components: ~8 modules across 2 packages

### Technical Constraints & Dependencies

- **TypeScript strict mode** — no `any`, no implicit returns, no unused variables
- **tonal** — sole runtime dependency; provides `Scale.get()`, `Chord.get()`, `Note.midi()`, `Note.fromMidi()`, `Note.transpose()`
- **pnpm monorepo** — workspace protocol for inter-package dependency
- **ESM-only output** — aligns with Strudel ecosystem and modern JS
- **MIT license** — maximum ecosystem compatibility, AGPL isolation from Strudel

### Cross-Cutting Concerns Identified

- **Pitch space polymorphism** — figure types (melody, bass, chord, pentatonic) differ only in pitch pool. Resolver logic is written once; new behaviors are new pitch space definitions (data, not code).
- **Type exports across package boundary** — core types used by strudel adapter must be re-exported cleanly. Publint validates package.json exports.
- **Music theory correctness** — enharmonic spelling, degree overflow wrapping, voice leading — all require comprehensive test coverage and reliance on tonal's conventions.
- **Contour preservation** — the defining algorithmic property. Must be verified by tests that assert direction sequences across chord changes.
- **Debug mode** — optional trace output on all resolution functions, threaded via an options parameter. Not a separate code path — same pipeline with instrumentation.

## Starter Template Evaluation

### Primary Technology Domain

**npm library** — TypeScript monorepo producing two ESM packages. No starter template needed; project infrastructure is fully established.

### Existing Foundation (Brownfield)

figura is not a greenfield project. The monorepo, toolchain, package structure, and source file layout are already in place. This section documents the existing technical decisions rather than evaluating starter options.

### Project Infrastructure

**Language & Runtime:**
- TypeScript 5.9 with strict mode (`strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitReturns`)
- ESM-only (`"type": "module"`, `"module": "ESNext"`, `"moduleResolution": "bundler"`)
- Target: ES2020

**Monorepo:**
- pnpm workspace with `packages/*` glob
- Two packages: `@figura/core` (depends on `tonal ^6.0.0`), `@figura/strudel` (depends on `@figura/core` via `workspace:*`)
- Both at version `0.0.1`

**Build Tooling:**
- tsup — ESM output with `.d.ts` generation (`tsup src/index.ts --format esm --dts`)
- Watch mode available via `pnpm dev`

**Testing:**
- Vitest 4.x with v8 coverage provider
- Workspace-aware: both packages configured as vitest workspaces
- Coverage thresholds: 90% lines/functions/statements, 85% branches

**Linting & Formatting:**
- ESLint with `@typescript-eslint/strict-type-checked` + Prettier
- Rules enforced: `no-unused-vars`, `explicit-function-return-type`, `no-explicit-any`
- lint-staged runs ESLint + Prettier on `.ts` files

**Code Quality Gates:**
- Knip — unused exports/deps
- Publint — package.json exports validation
- Sherif — monorepo consistency
- CSpell — spelling (music theory dictionary)
- Depcheck — dependency validation

**Git Workflow:**
- Husky + lint-staged for pre-commit
- Commitlint with conventional commits

**Package Exports:**
- Both packages use `exports` map with `import` + `types` conditions
- `module` field set for bundler compatibility

### Source File Structure (Established)

```
packages/core/src/
  types/index.ts          — shared TypeScript types
  dsl/parseFigure.ts      — figure DSL parser
  dsl/parseRhythm.ts      — rhythm DSL parser
  resolve/resolveScaleDegree.ts  — melody pitch resolution
  resolve/resolveChordDegree.ts  — chord/bass pitch resolution
  resolve/resolvePhrase.ts       — pipeline orchestrator
  index.ts                — public API barrel

packages/strudel/src/
  index.ts                — toMiniNotation adapter
```

### Assessment

The foundation is production-ready. No starter template selection or project scaffolding is needed. All architectural decisions about tooling, build, test, lint, and package structure have been made and implemented. The remaining architectural work is about the **resolution algorithm, type system, and module design** — not infrastructure.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
All critical decisions are now made — type system, resolution algorithm, package boundaries, and error handling are defined.

**Important Decisions (Shape Architecture):**
Debug mode design, public API surface, and harmony context expansion.

**Deferred Decisions (Post-MVP):**
- Chord figure type voice leading strategy
- Pentatonic figure type voice leading strategy
- Anchor range placement algorithm details
- Advanced chord symbol parsing (extensions, alterations)
- MCP server API shape

### Type System

**Decision:** Discriminated union for FigureToken; flat booleans for RhythmToken.

```typescript
type FigureType = "melody" | "chord" | "bass"

type FigureToken =
  | { rest: false; degree: number; anchor: boolean; octaveDown: boolean }
  | { rest: true }

type RhythmToken = {
  play: boolean
  tie: boolean
  accent: boolean
  staccato: boolean
}
```

**Rationale:** FigureToken rest vs note are fundamentally different shapes — a union prevents invalid states. RhythmToken fields are orthogonal articulation booleans on the same grid position; rest is the implicit `play: false, tie: false` state.

### Harmony Context

**Decision:** One `HarmonyContext` per output position. `expandProgression()` helper converts user-friendly progressions.

```typescript
type HarmonyContext = {
  key: string
  roman: string
  chord: string
  scale: string[]
  chordTones: string[]
}

type Progression = {
  key: string
  chords: { roman: string; duration: number }[]
}

function expandProgression(prog: Progression): HarmonyContext[]
```

**Rationale:** Resolver stays pure — `events[i]` resolves against `harmonies[i]`, no position-mapping logic. The helper handles expansion from the user-facing format.

### Resolution Output

**Decision:** `ResolvedFigure` contains only `type` and `events`. Strudel strings live in `StrudelOutput`, produced by `toMiniNotation()`.

```typescript
// @figura/core
type ResolvedEvent = {
  note: string
  degree: number
  anchor: boolean
  duration: number
  velocity: number
  tie: boolean
}

type ResolvedFigure = {
  type: FigureType
  events: ResolvedEvent[]
}

// @figura/strudel
type StrudelOutput = {
  notes: string
  struct: string
  velocity: string
}
```

**Rationale:** Core must not know about Strudel encoding. `ResolvedFigure` is the portable intermediate representation; output adapters convert it to target formats.

### Error Handling

**Decision:** Parsers throw on invalid input. Resolver never throws — always produces music.

**Rationale:** DSL parsing is a system boundary where validation belongs. The resolver receives typed data and applies "always resolve, never error" — degree overflow wraps, rest wins, anchor shifts to nearest played note.

### Debug Mode

**Decision:** Options bag with optional trace callback.

```typescript
type PositionTrace = {
  position: number
  figureToken: FigureToken
  rhythmToken: RhythmToken
  harmony: HarmonyContext
  pitchPool: string[]
  resolvedNote: string | null
}

type ResolveOptions = {
  type: FigureType
  debug?: boolean | ((trace: PositionTrace) => void)
}
```

**Rationale:** `debug: true` logs to console for interactive use. Callback form enables programmatic trace capture for tooling and visualization. No separate code path — same resolver, optional instrumentation.

### Public API Surface

**Decision:** Minimal flat exports from barrel files. No namespace objects, no default exports.

`@figura/core` exports:
- Functions: `parseFigure`, `parseRhythm`, `resolveScaleDegree`, `resolveChordDegree`, `resolvePhrase`, `expandProgression`
- Types: `FigureType`, `FigureToken`, `RhythmToken`, `HarmonyContext`, `Progression`, `ResolvedEvent`, `ResolvedFigure`, `ResolveOptions`, `PositionTrace`

`@figura/strudel` exports:
- Functions: `toMiniNotation`
- Types: `StrudelOutput`

**Rationale:** Flat named exports are tree-shakeable and IDE-friendly. Minimal surface area — every export is intentional and validated by knip/publint.

### Decision Impact Analysis

**Implementation Sequence:**
1. Types (`types/index.ts`) — foundation for everything
2. Parsers (`parseFigure`, `parseRhythm`) — validate input, produce typed tokens
3. Stateless resolvers (`resolveScaleDegree`, `resolveChordDegree`) — pure pitch lookup
4. `expandProgression` — harmony context expansion
5. `resolvePhrase` — orchestrate pipeline with debug support
6. `toMiniNotation` — Strudel output adapter

**Cross-Component Dependencies:**
- Parsers depend on types only
- Stateless resolvers depend on types + tonal
- `expandProgression` depends on types + tonal
- `resolvePhrase` depends on everything in core
- `toMiniNotation` depends on `ResolvedFigure` type only

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

7 areas where AI agents could make different choices when implementing figura modules.

### Naming Patterns

**File Naming:**
- Source files: `camelCase.ts` — e.g., `parseFigure.ts`, `resolveScaleDegree.ts`
- Type-only files: `camelCase.ts` in `types/` directory — e.g., `types/index.ts`
- Test files: `camelCase.test.ts` — mirrors source file name exactly
- No `index.ts` barrel files except at package root (`packages/core/src/index.ts`)

**Function Naming:**
- Public API: `verbNoun` camelCase — `parseFigure`, `resolvePhrase`, `expandProgression`, `toMiniNotation`
- Internal helpers: `verbNoun` camelCase, unexported — same convention, not exported from barrel
- No `get`/`set` prefixes unless truly accessing/mutating state (there is none)

**Type Naming:**
- PascalCase for all types and interfaces — `FigureToken`, `HarmonyContext`, `ResolvedEvent`
- Union literal types: lowercase string literals — `"melody" | "chord" | "bass"`
- No `I` prefix for interfaces, no `T` prefix for types

**Variable Naming:**
- camelCase for all variables and parameters
- Music theory terms use their standard spelling: `chordTones`, `scaleDegree`, `octaveDown`, `pitchPool`
- Abbreviated forms avoided: `harmony` not `harm`, `figure` not `fig`, `position` not `pos`

### Structure Patterns

**Test Organization:**
- Tests in `packages/*/tests/` directory (not co-located)
- Test file mirrors source structure: `tests/dsl/parseFigure.test.ts` tests `src/dsl/parseFigure.ts`
- One test file per source file — no multi-module test files
- Test file imports from source file directly, not from barrel

**Test Writing:**
- Use `describe` blocks named after the function under test
- Use nested `describe` for categories (e.g., `describe('valid input')`, `describe('edge cases')`)
- Use `it` with sentence-style descriptions: `it('wraps degree 8 to degree 1 in the next octave')`
- Assert specific pitch values, not just "no error" — musical correctness requires concrete assertions
- Reference phrase test (`1* 3 5 3 2* 1 7- 1*` over `iim7 V7 IM7`) must exist as an end-to-end test

**Module Organization:**
- Each public function lives in its own file
- Internal helpers live in the same file as the function that uses them, unexported
- No `utils/` or `helpers/` directories — if a helper is shared, it gets its own file in the appropriate subdirectory
- Subdirectories by domain: `dsl/` for parsers, `resolve/` for resolvers, `types/` for type definitions

### Format Patterns

**Music Theory Conventions (tonal alignment):**
- Note names: uppercase letter + optional accidental + octave number — `"D4"`, `"F#4"`, `"Bb3"`
- Follow tonal's spelling conventions exactly — never re-spell enfigura (if tonal says `"Bb"`, use `"Bb"`, not `"A#"`)
- Chord names: tonal format — `"Dm7"`, `"G7"`, `"Cmaj7"`
- Scale names: tonal format — `"D dorian"`, `"G mixolydian"`
- Roman numerals: case-sensitive — `"iim7"` (lowercase = minor), `"V7"` (uppercase = major), `"IM7"`
- Octave range: integers, middle C = C4, scientific pitch notation

**Function Signature Conventions:**
- Required parameters as positional arguments
- Optional configuration as a final options object (`ResolveOptions`)
- Return new objects, never mutate inputs
- All functions are synchronous — no `async`, no Promises, no callbacks (except debug trace)

**Return Value Conventions:**
- Parsers return arrays: `FigureToken[]`, `RhythmToken[]`
- Resolvers return objects: `ResolvedFigure`, `HarmonyContext`
- `toMiniNotation` returns `StrudelOutput`
- No `null` returns — parsers throw on invalid input, resolvers always produce output

### Process Patterns

**Error Handling:**
- Parsers: throw `Error` with descriptive message including the invalid token and position — e.g., `'Invalid figure token "x" at position 3'`
- Resolvers: never throw. Degree overflow wraps. Rest wins. Always produce music.
- No custom error classes for MVP — plain `Error` is sufficient
- No try/catch inside library code — errors propagate to the caller

**tonal API Usage:**
- Always use `Scale.get(name).notes` for scale tones
- Always use `Chord.get(name).notes` for chord tones
- Always use `Note.midi(name)` for pitch comparison (voice leading distance)
- Always use `Note.fromMidi(n)` for reverse lookup
- Never construct note names by string concatenation — use tonal for transposition and naming

**Import Patterns:**
- Named imports only: `import { Scale, Chord, Note } from 'tonal'`
- No wildcard imports: never `import * as Tonal from 'tonal'`
- Internal cross-file imports use relative paths: `import { FigureToken } from '../types/index.js'`
- ESM requires `.js` extension in import paths (even for `.ts` source files) — enforced by `moduleResolution: "bundler"` + tsup

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow TDD: write failing test first, then minimal implementation, then refactor
- Use tonal for all note/chord/scale operations — never hand-roll music theory primitives
- Assert specific pitch values in tests — `expect(result).toBe("D4")`, not `expect(result).toBeDefined()`
- Keep functions pure — no side effects, no shared mutable state, no I/O
- Run `pnpm lint && pnpm typecheck && pnpm lint:unused` before considering work complete

**Anti-Patterns to Avoid:**

| Anti-Pattern | Correct Pattern |
|---|---|
| `Note.get("D").letter + "4"` (string concat) | `Note.fromMidi(Note.midi("D4")!)` (tonal roundtrip) |
| `if (token === "~") return null` (null return) | `if (token.rest) { /* handle rest */ }` (discriminated union) |
| `async function resolvePhrase(...)` | `function resolvePhrase(...)` (synchronous) |
| `export default function parseFigure` | `export function parseFigure` (named export) |
| `catch (e) { return [] }` (swallow errors) | Let parser errors propagate to caller |
| `tests/allTests.test.ts` (mega test file) | `tests/dsl/parseFigure.test.ts` (one per source) |

## Project Structure & Boundaries

### Complete Project Directory Structure

```
figura/
├── .claude/
│   ├── ARCHITECTURE.md          — package structure & resolution rules
│   ├── DECISIONS.md             — design decisions with rationale
│   ├── DOMAIN.md                — music theory reference
│   └── DSL.md                   — figure & rhythm DSL specification
├── .eslintrc.cjs                — ESLint strict-type-checked config
├── .husky/
│   ├── commit-msg               — commitlint hook
│   └── pre-commit               — lint-staged + typecheck + knip + sherif
├── .prettierrc                  — Prettier config
├── .cspell.json                 — CSpell with music theory dictionary
├── commitlint.config.cjs        — conventional commits config
├── knip.json                    — unused exports/deps config
├── package.json                 — root workspace scripts & devDeps
├── pnpm-lock.yaml
├── pnpm-workspace.yaml          — packages/* workspace
├── tsconfig.base.json           — shared strict TS config
├── vitest.config.ts             — coverage thresholds (90/90/85/90)
├── vitest.workspace.ts          — workspace: core + strudel
│
├── packages/
│   ├── core/
│   │   ├── package.json         — @figura/core, depends on tonal
│   │   ├── tsconfig.json        — extends base, rootDir: src
│   │   ├── src/
│   │   │   ├── index.ts         — public API barrel (re-exports all)
│   │   │   ├── types/
│   │   │   │   └── index.ts     — FigureType, FigureToken, RhythmToken,
│   │   │   │                      HarmonyContext, Progression,
│   │   │   │                      ResolvedEvent, ResolvedFigure,
│   │   │   │                      ResolveOptions, PositionTrace
│   │   │   ├── dsl/
│   │   │   │   ├── parseFigure.ts    — figure DSL → FigureToken[]
│   │   │   │   └── parseRhythm.ts    — rhythm DSL → RhythmToken[]
│   │   │   └── resolve/
│   │   │       ├── resolveScaleDegree.ts   — degree + scale → pitch
│   │   │       ├── resolveChordDegree.ts   — degree + chord → pitch
│   │   │       ├── resolvePhrase.ts        — full pipeline orchestrator
│   │   │       └── expandProgression.ts    — Progression → HarmonyContext[]
│   │   └── tests/
│   │       ├── dsl/
│   │       │   ├── parseFigure.test.ts
│   │       │   └── parseRhythm.test.ts
│   │       └── resolve/
│   │           ├── resolveScaleDegree.test.ts
│   │           ├── resolveChordDegree.test.ts
│   │           ├── resolvePhrase.test.ts
│   │           └── expandProgression.test.ts
│   │
│   └── strudel/
│       ├── package.json         — @figura/strudel, depends on core
│       ├── tsconfig.json        — extends base, rootDir: src
│       ├── src/
│       │   └── index.ts         — toMiniNotation(ResolvedFigure) → StrudelOutput
│       └── tests/
│           └── toMiniNotation.test.ts
│
└── coverage/                    — generated, gitignored
```

### Architectural Boundaries

**Package Boundary (the hard line):**

```
@figura/core          @figura/strudel
┌──────────────────┐     ┌──────────────────┐
│  types/           │     │                  │
│  dsl/             │────>│  toMiniNotation  │
│  resolve/         │     │                  │
│                  │     │  StrudelOutput   │
│  tonal (dep)     │     │                  │
└──────────────────┘     └──────────────────┘
     imports                  imports
     tonal only               @figura/core only
```

- Core never imports from strudel
- Strudel never imports tonal directly — it only consumes `ResolvedFigure`
- Strudel never imports Strudel runtime code (AGPL isolation)
- Types flow one direction: core defines them, strudel consumes them

**Module Boundaries within Core:**

| Module | Depends On | Exports |
|---|---|---|
| `types/` | nothing | All type definitions |
| `dsl/parseFigure` | `types/` | `parseFigure()` |
| `dsl/parseRhythm` | `types/` | `parseRhythm()` |
| `resolve/resolveScaleDegree` | `types/`, `tonal` | `resolveScaleDegree()` |
| `resolve/resolveChordDegree` | `types/`, `tonal` | `resolveChordDegree()` |
| `resolve/expandProgression` | `types/`, `tonal` | `expandProgression()` |
| `resolve/resolvePhrase` | `types/`, all resolve/* modules | `resolvePhrase()` |

### Requirements to Structure Mapping

**FR Category → File Mapping:**

| FR Category | Source File | Test File |
|---|---|---|
| DSL Parsing (FR1-5) | `dsl/parseFigure.ts`, `dsl/parseRhythm.ts` | `tests/dsl/*.test.ts` |
| Harmonic Context (FR6-9) | `resolve/expandProgression.ts` | `tests/resolve/expandProgression.test.ts` |
| Pitch Resolution (FR10-14) | `resolve/resolveScaleDegree.ts`, `resolve/resolveChordDegree.ts` | `tests/resolve/resolve*.test.ts` |
| Phrase Resolution (FR15-19) | `resolve/resolvePhrase.ts` | `tests/resolve/resolvePhrase.test.ts` |
| Strudel Output (FR20-25) | `strudel/src/index.ts` | `strudel/tests/toMiniNotation.test.ts` |
| Debug & Observability (FR26-29) | `resolve/resolvePhrase.ts` (options bag) | `tests/resolve/resolvePhrase.test.ts` |
| API & Type Surface (FR30-33) | `types/index.ts`, `index.ts` barrels | Validated by publint + knip |

### Data Flow

```
User Input                    Core Pipeline                     Strudel Output
─────────                    ─────────────                     ──────────────

"1* 3 5 3"  ──> parseFigure() ──> FigureToken[]  ─┐
                                                    │
"1 _ 1 ."   ──> parseRhythm() ──> RhythmToken[]  ─┤
                                                    ├──> resolvePhrase() ──> ResolvedFigure
{ key: "C",                                        │         │
  chords: [...] } ──> expandProgression()          │         │
                       ──> HarmonyContext[] ────────┘         │
                                                              v
                                                    toMiniNotation()
                                                              │
                                                              v
                                                    StrudelOutput
                                                    { notes, struct, velocity }
```

### Development Workflow

**Build:** `pnpm build` → tsup builds both packages (core first, strudel second via dependency order)
**Test:** `pnpm test` → vitest runs both workspaces in parallel
**Lint:** `pnpm lint:all` → ESLint + knip + depcheck + sherif + cspell + publint
**Typecheck:** `pnpm typecheck` → tsc --noEmit against base config

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:**
All decisions are internally consistent:
- Type system (discriminated union FigureToken, flat boolean RhythmToken) aligns with parser output and resolver consumption
- HarmonyContext per-position aligns with single-pass left-to-right resolution — no position-mapping logic in the resolver
- ResolvedFigure without Strudel strings aligns with the core/strudel package boundary
- Error handling (parsers throw, resolvers never throw) aligns with "always resolve, never error"
- Debug mode via options bag aligns with pure function design — no separate code path
- ESM-only + tsup + tonal ^6.0.0 — all compatible, no version conflicts

**Pattern Consistency:**
- Naming conventions (camelCase files, PascalCase types, verbNoun functions) are consistent with the existing codebase
- Test structure (tests/ directory mirroring src/) matches established patterns
- Import patterns (named imports, relative paths, .js extensions) align with ESM + tsup + bundler moduleResolution

**Structure Alignment:**
- Project structure supports all architectural decisions
- Package boundary is clean: core owns types and resolution, strudel owns string output
- Module dependency graph is acyclic within core

### Requirements Coverage Validation

**Functional Requirements Coverage:**

| FR | Coverage | Architectural Support |
|---|---|---|
| FR1-5 (DSL Parsing) | Full | `parseFigure.ts`, `parseRhythm.ts` — discriminated union output |
| FR6-9 (Harmonic Context) | Full | `expandProgression.ts` — Roman numeral to HarmonyContext via tonal |
| FR10-14 (Pitch Resolution) | Full | `resolveScaleDegree.ts`, `resolveChordDegree.ts` — stateless, pure |
| FR15-19 (Phrase Resolution) | Full | `resolvePhrase.ts` — single-pass, LCM cycling, rhythm precedence |
| FR20-25 (Strudel Output) | Full | `toMiniNotation` in strudel package — string-only output |
| FR26-29 (Debug) | Full | `ResolveOptions.debug` — boolean or callback |
| FR30-33 (API/Types) | Full | Barrel exports, all types public, core standalone |

**Non-Functional Requirements Coverage:**

| NFR | Status | How Addressed |
|---|---|---|
| <10ms for 64 events | Covered | Pure sync computation, no I/O, no async |
| Deterministic | Covered | Pure functions, no randomness, no shared state |
| ESM-only | Covered | Package.json type: module, tsup --format esm |
| Single dependency (tonal) | Covered | Core depends only on tonal; strudel depends only on core |
| AGPL isolation | Covered | Strudel outputs strings, never imports Strudel runtime |
| 90/85% coverage | Covered | Vitest thresholds configured, TDD-first enforcement |

### Gaps Identified and Resolved

**Gap 1: `expandProgression.ts` not yet created**
- Status: Acknowledged — new file to be created during implementation
- Location: `packages/core/src/resolve/expandProgression.ts`
- Test: `packages/core/tests/resolve/expandProgression.test.ts`
- No architectural impact — just a new module following established patterns

**Gap 2: `ResolvedEvent` edge case fields clarified**

Resolution adopted:

```typescript
type ResolvedEvent = {
  note: string       // pitch name ("D4") or "~" for rests
  degree: number     // original figure degree, 0 for rests
  anchor: boolean    // whether this was the anchor position
  duration: number   // 1 = normal, 0.5 = staccato, 0 = rest
  velocity: number   // 0.8 = normal, 1.0 = accent, 0 = rest
  tie: boolean       // true = sustain into next position
}
```

- Rest positions: `{ note: "~", degree: 0, anchor: false, duration: 0, velocity: 0, tie: false }`
- Staccato: `duration: 0.5` — toMiniNotation encodes as `/2`
- Ties: `tie: true` on the preceding event — toMiniNotation appends `_` to the note name and emits `f` in struct for the tied position
- Events array length always equals output positions (no gaps, no skips)

**Gap 3: FigureType extensibility**

Resolution adopted: closed union for MVP, extended later.

```typescript
type FigureType = "melody" | "chord" | "bass"
// Post-MVP: type FigureType = "melody" | "chord" | "bass" | "pentatonic"
```

Widening a string union is a non-breaking change for consumers.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (medium — deep domain, narrow scope)
- [x] Technical constraints identified (TypeScript strict, ESM, tonal, AGPL isolation)
- [x] Cross-cutting concerns mapped (pitch space polymorphism, type exports, debug mode)

**Architectural Decisions**
- [x] Type system fully specified (FigureToken union, RhythmToken flat, ResolvedEvent clarified)
- [x] Resolution algorithm defined (single-pass, contour-preserving, per-position harmony)
- [x] Package boundary enforced (core pure, strudel string-only)
- [x] Error handling philosophy established (parsers throw, resolvers never throw)
- [x] Debug mode designed (options bag with boolean or callback)

**Implementation Patterns**
- [x] Naming conventions established (files, functions, types, variables)
- [x] Structure patterns defined (test organization, module organization)
- [x] Music theory conventions specified (tonal alignment, note naming)
- [x] Process patterns documented (error handling, tonal API usage, imports)
- [x] Anti-patterns identified with correct alternatives

**Project Structure**
- [x] Complete directory structure defined
- [x] Package boundaries established with dependency diagram
- [x] Module boundaries within core mapped
- [x] FR categories mapped to specific files
- [x] Data flow documented end-to-end

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — brownfield project with established infrastructure, deep domain documentation, and all critical decisions resolved.

**Key Strengths:**
- Pure functional architecture with no I/O makes every module independently testable
- Pitch space as plugin architecture means new figure types are data, not code changes
- Single-pass resolution algorithm is simple to implement and reason about
- Strong existing documentation (.claude/ docs, PRD, brainstorming) provides complete domain context

**Areas for Future Enhancement:**
- Voice leading strategies per figure type (deferred — only melody nearest-overall and bass nearest-below for MVP)
- Anchor range placement algorithm (deferred — anchor is range hint, details TBD post-MVP)
- Advanced chord symbol parsing (deferred — m7, 7, maj7, m7b5 for MVP)
- Pentatonic figure type (deferred — extends FigureType union)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all modules
- Respect package and module boundaries — check dependency table before importing
- Use TDD: failing test first, minimal implementation, refactor
- Use tonal for all music theory operations — never hand-roll
- Refer to this document and `.claude/` docs for all architectural questions

**Implementation Order:**
1. Types (`types/index.ts`) — define all types per this document
2. `parseFigure` + `parseRhythm` — DSL parsers with error throwing
3. `resolveScaleDegree` + `resolveChordDegree` — stateless pitch lookup
4. `expandProgression` — harmony context expansion
5. `resolvePhrase` — pipeline orchestration with debug support
6. `toMiniNotation` — Strudel adapter
7. Reference phrase end-to-end test — validation gate
