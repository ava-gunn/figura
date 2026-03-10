---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
classification:
  projectType: developer_tool
  domain: music_technology_creative_computing
  complexity: medium
  projectContext: brownfield
inputDocuments:
  - product-brief-figura-2026-03-06.md
  - domain-symbolic-music-representation-research-2026-03-06.md
  - brainstorming-session-2026-03-06-1920.md
  - .claude/ARCHITECTURE.md
  - .claude/DOMAIN.md
  - .claude/DSL.md
  - .claude/DECISIONS.md
documentCounts:
  briefs: 1
  research: 1
  brainstorming: 1
  projectDocs: 4
workflowType: 'prd'
---

# Product Requirements Document - figura

**Author:** Ava
**Date:** 2026-03-06

## Executive Summary

figura is a TypeScript music theory algebra that separates musical figures (melodic/harmonic shapes) from harmonic context (key + chord progression) and reunites them at resolution time. Inspired by Cognitone Synfire's parametric figure/harmony model — but implemented as an open-source, embeddable library — it targets the Strudel live coding ecosystem as its primary output format.

The core pipeline takes a key, Roman numeral progression, figure DSL string, and rhythm DSL string, and resolves them into concrete pitched events. Figures, rhythms, and harmonic contexts are independent dimensions: change any one without touching the others, and the resolver adapts. The library outputs Strudel mini-notation strings for immediate playback.

The primary user is a theory-aware musician and developer who live-codes with Strudel but finds its patterns too explicit — every pitch manually spelled, every chord change hand-transposed. figura closes the gap between "I have a melodic idea" and "I hear it across a progression" by letting the composer work at the level of shapes and relationships rather than individual notes.

### What Makes This Special

Two forces drive the value: **speed of experimentation** and **surprise as a creative outcome**. Swapping a figure, rhythm, or progression is a single edit — the resolver handles the rest. This speed enables combinatorial exploration that would be impractical by hand. The payoff is emergent music: simple inputs combine through the resolution pipeline to produce results the composer didn't fully anticipate. The library becomes a creative collaborator, not a transposition engine.

The core insight is that no JS/TS library bridges functional harmony (Roman numeral analysis) through a figure DSL to resolved concrete pitches. Tonal.js provides music theory primitives but no resolution pipeline. Strudel provides patterns but no harmonic intelligence. Synfire does the full resolution but is proprietary, desktop-only, and closed. figura is the first open-source, embeddable implementation of this model.

## Project Classification

- **Project Type:** Developer Tool — npm library with two packages (`@figura/core`, `@figura/strudel`), custom DSL, typed API surface
- **Domain:** Music Technology / Creative Computing — music theory algebra for symbolic phrase resolution
- **Complexity:** Medium — deep music theory domain knowledge required (scale degrees, chord tones, voice leading, contour preservation); no regulatory or compliance concerns
- **Project Context:** Brownfield — architecture, DSL specification, domain model, design decisions, and resolution algorithm already established

## Success Criteria

### User Success

- **Experimentation velocity:** Changing a figure, rhythm, or progression requires editing one string and re-evaluating — no manual pitch recalculation, no cascading edits across layers
- **Musical surprise:** Simple inputs combine through the resolution pipeline to produce music the composer didn't fully predict — the library surfaces combinations a human wouldn't manually explore
- **Coherence by ear:** Output played through Strudel sounds like intentional, harmonically relevant music — not random notes, not mechanical transposition

### Business Success

N/A — figura is a personal creative tool released as open source. No revenue, growth, or market share objectives. Success is measured entirely by the musical quality and usefulness of the output.

### Technical Success

- **Musical correctness:** Every resolved pitch belongs to the expected pitch space for the given harmony (scale tones for melody, chord tones for bass)
- **Contour preservation:** Same figure over different chords produces the same melodic shape (direction + magnitude), even though intervals change
- **Rhythm precedence:** Rhythm layer always wins — rests, ties, staccato, accents are never overridden by figure tokens
- **Degree overflow:** Degrees exceeding the pitch pool wrap modulo pool size — the resolver always produces music, never errors
- **Full test coverage:** 90% lines/functions, 85% branches as enforced by the code quality gates; every resolution rule covered by tests that verify musical correctness

### Measurable Outcomes

- Every pitch resolution rule has a corresponding test that asserts the correct pitch class for a given (key, chord, figure type, degree) input
- Contour tests verify that the same figure over different harmonic contexts produces matching direction sequences
- End-to-end tests verify that figure DSL + rhythm DSL + harmonic context produces expected Strudel mini-notation output
- The reference phrase from the design session (`1* 3 5 3 2* 1 7- 1*` over `iim7 V7 IM7`) resolves to the documented expected output

## Product Scope

**MVP:** Full resolution pipeline with melody + bass figure types, Strudel mini-notation output, and debug mode. Validated by the reference phrase end-to-end test.

**Growth (Post-MVP):** Chord and pentatonic figure types, per-figure-type voice leading, phrase boundary voice leading, advanced chord symbols, anchor as range placement hint, documentation and examples.

**Vision:** AI/MCP integration, non-Western scales, microtonal support, chromatic figure type, approach tones.

See [Project Scoping & Phased Development](#project-scoping--phased-development) for detailed feature breakdown, implementation order, and validation milestones.

## User Journeys

### Journey 1: Ava — First Harmonic Experiment (Primary, Happy Path)

Ava has been live coding in Strudel for months, manually spelling out notes for every chord change. She's heard about figura and installs it via npm. She opens her Strudel session, imports `@figura/strudel`, and writes her first experiment: a simple ascending figure `"1 3 5 3"` over a `iim7 V7 IM7` progression in C.

She hits Ctrl+Enter. The figure resolves — D, F, A, F over Dm7, then the same shape shifts to G7 and Cmaj7. She hears the contour preserved but the pitches change with the harmony. She swaps the figure to `"5 3 1 3"` — same chords, inverted shape, completely different feel. Then she swaps the progression to a minor key. Three edits, three different musical results, zero manual transposition.

The moment: she hears something she didn't write. The combination of a simple figure and a jazz progression produced a melodic line she wouldn't have composed by hand. She's hooked.

**Capabilities revealed:** Figure DSL parsing, rhythm DSL parsing, harmonic context resolution, Strudel mini-notation output, single-string edit experimentation loop.

### Journey 2: Pattern Tinkerer — Learning Through Experimentation (Primary, Alternative Path)

Kai knows chords and keys at a practical level but doesn't think in Roman numerals day-to-day. He sees someone use figura in a live coding stream — the performer swaps one string and the whole melody reshapes over the chords. He wants that.

He installs figura, copies the example from the README, and plays it. It works. He starts changing numbers in the figure string — `"1 3 5"` becomes `"1 2 3"` — and listens to what happens. He doesn't fully understand why degree 2 over a V7 chord gives him an A, but it sounds right, so he keeps going. He tries adding rhythm: `"1 _ . 1"` — now there's a tie, a staccato, and the groove changes without touching the melody.

Kai's learning path is the experimentation loop itself: try, listen, tweak, repeat. He builds intuition for how figures and harmonies interact by hearing the results, not by studying theory upfront.

**Capabilities revealed:** Low barrier to entry (copy-paste examples), rhythm DSL independence from figure DSL, musical coherence even with naive input, experimentation as learning path.

### Journey 3: Ava — Debugging a Wrong Note (Primary, Edge Case)

Ava is working on a bass line: `"1*- 3 1 5"` as a bass figure type over `iim7 V7 IM7`. Position 3 over V7 sounds wrong — she expected the root G but is hearing something else. She's not sure if her figure is wrong, her chord is wrong, or the resolver is doing something unexpected.

She enables debug mode on the resolve function. The output prints each position: the figure token, the active chord, the pitch pool (chord tones for bass), the degree lookup, and the resolved pitch. She sees that degree 1 at position 3 is resolving against V7's chord tones `[G, B, D, F]` — root is G, and it is G. She realizes the issue is actually the octave — nearest-below voice leading from position 2 placed it in a different octave than she expected.

She adjusts with the `-` modifier to force the octave down, re-evaluates, and the bass line sits where she wants it. Debug mode turned a confusing musical result into a transparent, traceable resolution.

**Capabilities revealed:** Debug mode with per-position trace output, pitch pool visibility, voice leading transparency, octave modifier as escape hatch.

### Journey 4: Developer — Building a Harmony Playground (API Consumer)

Mika is building a browser-based music education tool. She wants students to experiment with how the same melodic shape sounds over different chord progressions. She imports `@figura/core` directly — no Strudel dependency needed.

She calls `parseFigure()`, `parseRhythm()`, and `resolvePhrase()` with typed inputs and gets back a `ResolvedFigure` with concrete pitched events. She maps the events to her own Web Audio renderer. She uses the debug output to build a visualization showing students which pitch pool each degree resolved against.

Later, she adds `@figura/strudel` for a quick demo mode that outputs mini-notation strings for Strudel playback. The two packages compose cleanly — core for her custom renderer, strudel for the demo.

**Capabilities revealed:** `@figura/core` usable without Strudel, typed API surface for programmatic use, `ResolvedFigure` as structured data (not just strings), debug output as a building block for tooling, clean package boundary between core and strudel.

### Journey Requirements Summary

| Capability | Journey 1 | Journey 2 | Journey 3 | Journey 4 |
|---|---|---|---|---|
| Figure DSL parser | x | x | x | x |
| Rhythm DSL parser | x | x | | x |
| Harmonic context resolution | x | x | x | x |
| Strudel mini-notation output | x | x | x | |
| Single-pass contour-preserving resolution | x | x | x | x |
| Debug mode (per-position trace) | | | x | x |
| `@figura/core` standalone use | | | | x |
| Typed `ResolvedFigure` as structured data | | | x | x |
| Octave modifier (`-`) as escape hatch | | | x | |
| Copy-paste examples / low entry barrier | | x | | |

## Innovation & Novel Patterns

### Detected Innovation Areas

**DSL Creation — Dual composable DSLs:**
The Figure DSL and Rhythm DSL are independent, parallel string languages that zip by position. Each is minimal (5-7 token types) but their composition produces emergent complexity — polyrhythmic cycling via LCM when lengths differ, harmonic variation as chords change beneath the same figure. The DSLs are compact enough for live coding but expressive enough for serious compositional exploration.

**New Paradigm — Figure/harmony separation as a library:**
Cognitone Synfire proved that separating parametric figures from harmonic context, then reuniting them at render time, produces musically coherent results. figura is the first implementation of this model as an open-source, embeddable TypeScript library. The resolution pipeline (Key + Roman numeral + Figure DSL + Rhythm DSL to concrete pitched events) has no equivalent in the JS/TS ecosystem.

**Pitch space as plugin architecture:**
From the brainstorming session — new musical behaviors are new pitch space definitions (data), not new resolver logic (code). The resolver is written once; figure types (melody, bass, chord, pentatonic) differ only in which pitch space degrees index into. This makes the system extensible without modifying the core algorithm.

### Market Context & Competitive Landscape

No JS/TS library bridges Roman numeral analysis through a figure DSL to resolved concrete pitches. The closest competitors operate in different niches: Tonal.js (primitives, no resolution), Strudel (patterns, no harmonic intelligence), music21 (Python, analysis-oriented), Synfire (proprietary, desktop-only). figura occupies the gap between these tools — the connective tissue between functional harmony knowledge and concrete musical output.

HarmonyTok research (2025) validates that pitch-class decomposition outperforms opaque symbol-level representation, aligning with figura' resolution approach. The growth of LLM-driven symbolic music generation creates demand for well-typed, structured harmonic representations that can serve as both human DSLs and machine-readable tool interfaces.

### Validation

See [Measurable Outcomes](#measurable-outcomes) for the complete test strategy. The reference phrase (`1* 3 5 3 2* 1 7- 1*` over `iim7 V7 IM7`) serves as the canonical end-to-end validation gate.

## Developer Tool Specific Requirements

### Project-Type Overview

figura is distributed as two npm packages in a pnpm monorepo. The library targets TypeScript/JavaScript developers working in browser and Node.js environments. ESM-only output aligns with the Strudel ecosystem and modern JS tooling.

### Technical Architecture Considerations

**Language & Runtime:**
- TypeScript with strict type checking, ESM-only output
- Zero runtime dependencies except `tonal` in `@figura/core`
- Compatible with any JS environment: browser, Node.js, Deno

**Package Distribution:**
- `@figura/core` — pure music algebra, no Strudel dependency
- `@figura/strudel` — string-output adapter, depends on `@figura/core`
- Published to npm via pnpm monorepo
- MIT license for maximum ecosystem compatibility

**API Surface:**
- `parseFigure(dsl: string): FigureToken[]` — Figure DSL parser
- `parseRhythm(dsl: string): RhythmToken[]` — Rhythm DSL parser
- `resolvePhrase(figure, rhythm, harmony, options?): ResolvedFigure` — full resolution pipeline
- `resolveScaleDegree(degree, scale): string` — melody figure pitch resolution
- `resolveChordDegree(degree, chord): string` — chord/bass figure pitch resolution
- `toMiniNotation(resolved: ResolvedFigure): StrudelOutput` — Strudel adapter
- All functions support a debug mode that prints per-position trace output (figure token, active chord, pitch pool, degree lookup, resolved pitch), assuming 8th notes if no rhythm DSL provided

**Type Exports:**
- `FigureType`, `FigureToken`, `RhythmToken`, `HarmonyContext`, `ResolvedEvent`, `ResolvedFigure` — all publicly exported and documented

### Code Examples

Canonical example from design session:
```typescript
import { parseFigure, parseRhythm, resolvePhrase } from '@figura/core'
import { toMiniNotation } from '@figura/strudel'

const harmony = { key: 'C', chords: ['iim7', 'V7', 'IM7'] }
const figure = parseFigure('1* 3 5 3 2* 1 7- 1*')
const rhythm = parseRhythm('1 _ 1 . ~ ! 1 _')

const resolved = resolvePhrase(figure, rhythm, harmony, { type: 'melody' })
const { notes, struct, velocity } = toMiniNotation(resolved)

// notes:    "D4 D4_ A4 B4/2 ~ G4 B3 B3_"
// struct:   "t f t t f t t f"
// velocity: "0.8 0.8 0.8 0.8 0 1 0.8 0.8"
```

### Implementation Considerations

- **Code quality toolchain:** ESLint + typescript-eslint strict, Prettier, Vitest with 90% coverage, Knip (unused exports), Publint (package.json validation), Sherif (monorepo consistency), CSpell (music theory dictionary), Husky + lint-staged
- **TDD-first:** Red-green-refactor, no implementation without a failing test
- **Conventional commits:** Enforced by commitlint, enables changelog automation
- **AGPL isolation:** `@figura/strudel` outputs strings only — never imports Strudel runtime code

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP — prove the resolution pipeline produces musically coherent output. A solo developer project with no market or revenue pressure; the MVP succeeds when the reference phrase resolves correctly and sounds like music through Strudel.

**Resource Requirements:** Solo developer (Ava), TypeScript expertise, music theory domain knowledge. No external dependencies beyond `tonal` and the development toolchain.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Journey 1 (First Harmonic Experiment) — full happy path
- Journey 3 (Debugging a Wrong Note) — debug mode available from the start

**Must-Have Capabilities:**
1. `parseFigure()` — Figure DSL string to FigureToken[]
2. `parseRhythm()` — Rhythm DSL string to RhythmToken[]
3. `resolveScaleDegree()` — stateless pitch class resolution for melody figures
4. `resolveChordDegree()` — stateless pitch class resolution for bass figures
5. `resolvePhrase()` — single-pass left-to-right resolution with contour preservation
6. `toMiniNotation()` — ResolvedFigure to Strudel mini-notation strings
7. Debug mode on all resolution functions (per-position trace output)
8. Melody figure type (diatonic scale, 7 tones, nearest-overall voice leading)
9. Bass figure type (chord tones, nearest-below voice leading)
10. Rhythm precedence: rest, tie, staccato, accent always win
11. Degree overflow wraps modulo pool size

**Validation Milestone:** The reference phrase (`1* 3 5 3 2* 1 7- 1*` with rhythm `1 _ 1 . ~ ! 1 _` over `iim7 V7 IM7` in C) resolves to the documented expected output. This is the gate for MVP completeness — if this phrase resolves correctly with contour preserved across chord changes, the pipeline works.

**Implementation Order (within MVP):**
1. Stateless pitch class resolution — the foundation
2. Single-pass left-to-right with contour — the algorithm
3. Rhythm always wins — simplest precedence rule
4. DSL parsers — figure and rhythm
5. Full pipeline orchestration — resolvePhrase
6. Strudel adapter — toMiniNotation
7. Debug mode — per-position trace
8. Reference phrase validation — end-to-end proof

### Post-MVP Features

**Phase 2 (Growth):**
- Chord figure type (chord tones gated by chord symbol, pool size 3-7)
- Pentatonic figure type (5-tone pitch space)
- Per-figure-type voice leading strategies
- Voice leading at phrase boundaries
- Advanced chord symbols (extensions, alterations)
- Anchor as range placement hint
- Journey 2 support (copy-paste examples, documentation)
- Journey 4 support (API consumer documentation, usage guides)

**Phase 3 (Expansion):**
- AI integration — MCP server for AI agents
- Non-Western scales, microtonal support (MIDI 2.0 pitch model)
- Configurable voice leading strategies
- Chromatic figure type with preferred notes
- Approach tones as context-sensitive pitch space

### Risk Mitigation Strategy

**Technical Risks:**
- Contour preservation across chord changes is the highest-risk algorithm component. Mitigated by making the reference phrase the validation gate — it exercises chord changes (Dm7 to G7 to Cmaj7), contour (ascending and descending), and all rhythm tokens.
- Enharmonic spelling edge cases mitigated by TDD-first development and reliance on Tonal.js for note naming conventions.

**Market Risks:**
- N/A — personal creative tool, no market validation needed. Success is musical quality, not adoption.

**Resource Risks:**
- Solo developer. If time is constrained, the implementation order above is designed so each step produces a working, testable unit. The pipeline can ship as soon as step 6 (toMiniNotation) is complete; debug mode and reference validation are polish.

## Functional Requirements

### DSL Parsing

- **FR1:** Composer can provide a figure as a space-separated DSL string containing degree tokens (1-7), rest tokens (~), anchor modifiers (*), and octave-down modifiers (-)
- **FR2:** Composer can provide a rhythm as a space-separated DSL string containing play (1), tie (_), staccato (.), rest (~), and accent (!) tokens
- **FR3:** System can parse a figure DSL string into an array of typed FigureToken objects
- **FR4:** System can parse a rhythm DSL string into an array of typed RhythmToken objects
- **FR5:** System can accept modifier tokens in any order on a figure degree (e.g., `1*-` and `1-*` are equivalent)

### Harmonic Context

- **FR6:** Composer can specify a key and one or more Roman numeral chord symbols to define a harmonic context
- **FR7:** System can resolve a Roman numeral chord symbol within a key to a concrete chord name and its associated scale
- **FR8:** System can derive the diatonic scale (7 tones) for a given chord in a key context
- **FR9:** System can derive the chord tones (gated by chord symbol) for a given chord

### Pitch Resolution

- **FR10:** System can resolve a figure degree to a concrete pitch class using stateless resolution — pure function of (key, chord, figure type, degree)
- **FR11:** System can resolve melody figure degrees against the diatonic scale (7-tone pitch space)
- **FR12:** System can resolve bass figure degrees against chord tones (nearest-below voice leading)
- **FR13:** System can wrap degrees that exceed the pitch pool size modulo the pool size, cycling into higher octaves
- **FR14:** System can preserve contour (direction + magnitude) when the same figure resolves over different chords

### Phrase Resolution

- **FR15:** System can resolve a complete phrase by zipping figure tokens and rhythm tokens with a harmonic context into concrete pitched events
- **FR16:** System can perform single-pass left-to-right resolution without two-pass or look-ahead
- **FR17:** System can apply rhythm precedence: rest, tie, staccato, and accent tokens always override figure token behavior
- **FR18:** System can cycle figure and rhythm arrays independently when lengths differ, producing output length equal to LCM of both lengths
- **FR19:** System can shift anchor importance to the nearest non-rest played note when an anchor aligns with a rest

### Strudel Output

- **FR20:** System can convert a ResolvedFigure into a Strudel mini-notation notes string with correct pitch names and octaves
- **FR21:** System can generate a Strudel struct pattern (t/f) representing play/rest positions
- **FR22:** System can generate a Strudel velocity pattern with accent values (1.0) for accented positions
- **FR23:** System can encode ties as `_` appended to note names in the notes string
- **FR24:** System can encode staccato as `/2` appended to note names in the notes string
- **FR25:** System can encode rests as `~` in the notes string

### Debug & Observability

- **FR26:** Composer can enable debug mode on resolution functions to receive per-position trace output
- **FR27:** Debug mode can display: figure token, active chord, pitch pool, degree lookup, and resolved pitch for each position
- **FR28:** Debug mode can assume 8th notes when no rhythm DSL is provided
- **FR29:** Developer can import and use `@figura/core` without any Strudel dependency

### API & Type Surface

- **FR30:** Developer can import typed functions (`parseFigure`, `parseRhythm`, `resolvePhrase`, `resolveScaleDegree`, `resolveChordDegree`) from `@figura/core`
- **FR31:** Developer can import `toMiniNotation` from `@figura/strudel`
- **FR32:** Developer can access typed data structures (`FigureToken`, `RhythmToken`, `HarmonyContext`, `ResolvedEvent`, `ResolvedFigure`) as public exports
- **FR33:** Developer can use the ResolvedFigure structured data to build custom renderers independent of Strudel

## Non-Functional Requirements

### Performance

- Resolution of a single phrase (up to 64 events) completes in under 10ms in a browser environment
- DSL parsing is synchronous and non-blocking
- No heap allocations beyond the output data structures (pure functional, no side effects)

### Correctness

- Every pitch resolution is deterministic — same inputs always produce same outputs
- Resolution functions are pure: no side effects, no shared mutable state, no implicit dependencies
- All resolution rules are covered by unit tests that assert specific pitch class outputs for known inputs
- The reference phrase end-to-end test serves as the regression gate for musical correctness

### Integration & Compatibility

- `@figura/core` has zero runtime dependencies except `tonal`
- `@figura/strudel` depends only on `@figura/core` — never imports Strudel runtime code
- Package.json exports are validated by publint to ensure correct consumption by bundlers and Node.js
- ESM-only output, compatible with browser, Node.js 18+, and Deno

### Code Quality

- 90% line/function coverage, 85% branch coverage enforced by Vitest
- Zero unused exports enforced by Knip
- Strict TypeScript (no `any`, no implicit returns, no unused variables)
- Conventional commits enforced by commitlint
- Pre-commit hooks enforce lint, typecheck, unused export, and monorepo consistency checks
