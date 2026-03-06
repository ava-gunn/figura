---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/product-brief-harmonics-2026-03-06.md
  - _bmad-output/planning-artifacts/research/domain-symbolic-music-representation-research-2026-03-06.md
  - _bmad-output/brainstorming/brainstorming-session-2026-03-06-1920.md
  - .claude/ARCHITECTURE.md
  - .claude/DOMAIN.md
  - .claude/DSL.md
  - .claude/DECISIONS.md
---

# harmonics - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for harmonics, decomposing the requirements from the PRD, Architecture, and supporting design documents into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Composer can provide a figure as a space-separated DSL string containing degree tokens (1-7), rest tokens (~), anchor modifiers (*), and octave-down modifiers (-)
FR2: Composer can provide a rhythm as a space-separated DSL string containing play (1), tie (_), staccato (.), rest (~), and accent (!) tokens
FR3: System can parse a figure DSL string into an array of typed FigureToken objects
FR4: System can parse a rhythm DSL string into an array of typed RhythmToken objects
FR5: System can accept modifier tokens in any order on a figure degree (e.g., 1*- and 1-* are equivalent)
FR6: Composer can specify a key and one or more Roman numeral chord symbols to define a harmonic context
FR7: System can resolve a Roman numeral chord symbol within a key to a concrete chord name and its associated scale
FR8: System can derive the diatonic scale (7 tones) for a given chord in a key context
FR9: System can derive the chord tones (gated by chord symbol) for a given chord
FR10: System can resolve a figure degree to a concrete pitch class using stateless resolution - pure function of (key, chord, figure type, degree)
FR11: System can resolve melody figure degrees against the diatonic scale (7-tone pitch space)
FR12: System can resolve bass figure degrees against chord tones (nearest-below voice leading)
FR13: System can wrap degrees that exceed the pitch pool size modulo the pool size, cycling into higher octaves
FR14: System can preserve contour (direction + magnitude) when the same figure resolves over different chords
FR15: System can resolve a complete phrase by zipping figure tokens and rhythm tokens with a harmonic context into concrete pitched events
FR16: System can perform single-pass left-to-right resolution without two-pass or look-ahead
FR17: System can apply rhythm precedence: rest, tie, staccato, and accent tokens always override figure token behavior
FR18: System can cycle figure and rhythm arrays independently when lengths differ, producing output length equal to LCM of both lengths
FR19: System can shift anchor importance to the nearest non-rest played note when an anchor aligns with a rest
FR20: System can convert a ResolvedFigure into a Strudel mini-notation notes string with correct pitch names and octaves
FR21: System can generate a Strudel struct pattern (t/f) representing play/rest positions
FR22: System can generate a Strudel velocity pattern with accent values (1.0) for accented positions
FR23: System can encode ties as _ appended to note names in the notes string
FR24: System can encode staccato as /2 appended to note names in the notes string
FR25: System can encode rests as ~ in the notes string
FR26: Composer can enable debug mode on resolution functions to receive per-position trace output
FR27: Debug mode can display: figure token, active chord, pitch pool, degree lookup, and resolved pitch for each position
FR28: Debug mode can assume 8th notes when no rhythm DSL is provided
FR29: Developer can import and use @harmonics/core without any Strudel dependency
FR30: Developer can import typed functions (parseFigure, parseRhythm, resolvePhrase, resolveScaleDegree, resolveChordDegree) from @harmonics/core
FR31: Developer can import toMiniNotation from @harmonics/strudel
FR32: Developer can access typed data structures (FigureToken, RhythmToken, HarmonyContext, ResolvedEvent, ResolvedFigure) as public exports
FR33: Developer can use the ResolvedFigure structured data to build custom renderers independent of Strudel

### NonFunctional Requirements

NFR1: Resolution of a single phrase (up to 64 events) completes in under 10ms in a browser environment
NFR2: DSL parsing is synchronous and non-blocking
NFR3: No heap allocations beyond the output data structures (pure functional, no side effects)
NFR4: Every pitch resolution is deterministic - same inputs always produce same outputs
NFR5: Resolution functions are pure: no side effects, no shared mutable state, no implicit dependencies
NFR6: All resolution rules are covered by unit tests that assert specific pitch class outputs for known inputs
NFR7: The reference phrase end-to-end test serves as the regression gate for musical correctness
NFR8: @harmonics/core has zero runtime dependencies except tonal
NFR9: @harmonics/strudel depends only on @harmonics/core - never imports Strudel runtime code
NFR10: Package.json exports are validated by publint to ensure correct consumption by bundlers and Node.js
NFR11: ESM-only output, compatible with browser, Node.js 18+, and Deno
NFR12: 90% line/function coverage, 85% branch coverage enforced by Vitest
NFR13: Zero unused exports enforced by Knip
NFR14: Strict TypeScript (no any, no implicit returns, no unused variables)
NFR15: Conventional commits enforced by commitlint
NFR16: Pre-commit hooks enforce lint, typecheck, unused export, and monorepo consistency checks

### Additional Requirements

From Architecture:
- Brownfield project: monorepo infrastructure, toolchain, package structure, and source file layout are already in place - no starter template or scaffolding needed
- TypeScript 5.9 with strict mode (strict, exactOptionalPropertyTypes, noUncheckedIndexedAccess, noImplicitReturns)
- tsup for ESM build output with .d.ts generation
- Vitest 4.x with v8 coverage provider, workspace-aware configuration
- ESLint with @typescript-eslint/strict-type-checked + Prettier
- Knip, Publint, Sherif, CSpell, Depcheck as code quality gates
- Husky + lint-staged for pre-commit enforcement
- expandProgression() helper needed: converts user-friendly Progression type to HarmonyContext[] array (one per output position)
- Discriminated union for FigureToken (rest: true vs rest: false with degree/anchor/octaveDown); flat booleans for RhythmToken
- ResolvedEvent clarified: note as string ("D4" or "~"), degree (0 for rests), duration (1 normal, 0.5 staccato, 0 rest), velocity (0.8 normal, 1.0 accent, 0 rest), tie boolean
- Parsers throw Error with descriptive messages on invalid input; resolvers never throw - always produce music
- Debug mode via ResolveOptions: debug as boolean (console log) or callback ((trace: PositionTrace) => void)
- ResolvedFigure contains only type and events; Strudel strings live in StrudelOutput produced by toMiniNotation()
- Implementation order: Types -> Parsers -> Stateless resolvers -> expandProgression -> resolvePhrase -> toMiniNotation

From Brainstorming/Design Session:
- Pitch space as plugin architecture: new figure types are data (pitch space definitions), not new resolver logic
- Anchor demoted from "resolve first" to "range placement hint" - eliminates two-pass resolution
- Voice leading strategy is per-figure-type: melody = nearest overall, bass = nearest below
- Priority stack: contour > voice leading > range
- Single-pass left-to-right resolution algorithm with contour preservation
- First anchor octave: center of range if specified, else octave 4

From Domain Knowledge:
- Follow tonal's spelling conventions exactly - never re-spell enharmonics
- Use tonal API for all note/chord/scale operations (Scale.get, Chord.get, Note.midi, Note.fromMidi, Note.transpose)
- Named imports only from tonal; no wildcard imports
- ESM requires .js extension in import paths (even for .ts source files)

### FR Coverage Map

FR1: Epic 2, Story 2.1 - Figure DSL input specification
FR2: Epic 2, Story 2.2 - Rhythm DSL input specification
FR3: Epic 2, Story 2.1 - parseFigure() returns typed FigureToken[]
FR4: Epic 2, Story 2.2 - parseRhythm() returns typed RhythmToken[]
FR5: Epic 2, Story 2.1 - Modifier order flexibility (1*- and 1-* equivalent)
FR6: Epic 1, Story 1.3 - Key + Roman numeral harmonic context definition
FR7: Epic 1, Story 1.3 - Roman numeral to chord name + scale resolution
FR8: Epic 1, Stories 1.1 & 1.3 - Diatonic scale derivation for chord in key
FR9: Epic 1, Stories 1.2 & 1.3 - Chord tone derivation gated by chord symbol
FR10: Epic 1, Stories 1.1 & 1.2 - Stateless degree-to-pitch-class resolution
FR11: Epic 1, Story 1.1 - Melody figure degrees against diatonic scale
FR12: Epic 1, Story 1.2 - Bass figure degrees against chord tones (nearest-below)
FR13: Epic 1, Stories 1.1 & 1.2 - Degree overflow wraps modulo pool size
FR14: Epic 1, Story 1.3 & Epic 3, Story 3.1 - Contour preservation across chord changes
FR15: Epic 3, Story 3.1 - Full phrase resolution (zip figure + rhythm + harmony)
FR16: Epic 3, Story 3.1 - Single-pass left-to-right resolution
FR17: Epic 3, Story 3.1 - Rhythm precedence (rest/tie/staccato/accent always win)
FR18: Epic 3, Story 3.2 - LCM cycling for figure/rhythm length mismatch
FR19: Epic 3, Story 3.2 - Anchor on rest shifts to nearest played note
FR20: Epic 4, Story 4.1 - Strudel mini-notation notes string
FR21: Epic 4, Story 4.1 - Strudel struct pattern (t/f)
FR22: Epic 4, Story 4.1 - Strudel velocity pattern with accents
FR23: Epic 4, Story 4.1 - Tie encoding as _ appended to note names
FR24: Epic 4, Story 4.1 - Staccato encoding as /2 appended to note names
FR25: Epic 4, Story 4.1 - Rest encoding as ~ in notes string
FR26: Epic 3, Story 3.3 - Debug mode enable on resolution functions
FR27: Epic 3, Story 3.3 - Debug per-position trace output
FR28: Epic 3, Story 3.3 - Debug assumes 8th notes without rhythm DSL
FR29: Epic 4, Story 4.2 - Standalone @harmonics/core without Strudel dependency
FR30: Epic 4, Story 4.2 - Typed function imports from @harmonics/core
FR31: Epic 4, Story 4.2 - toMiniNotation import from @harmonics/strudel
FR32: Epic 4, Story 4.2 - Public type exports (FigureToken, RhythmToken, etc.)
FR33: Epic 4, Story 4.2 - ResolvedFigure for custom renderers

## Epic List

### Epic 1: Pitch Resolution Engine
Composer can resolve musical degrees to concrete pitches within a harmonic context. This is the foundational music theory engine - the thing no other JS/TS library does. A developer can specify a key + Roman numeral chord, and resolve any degree to the correct pitch class using stateless, pure functions.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14

### Epic 2: DSL Parsing
Composer can express musical figures and rhythms as compact string DSLs. A composer can write figure strings like "1* 3 5 3" and rhythm strings like "1 _ 1 ." and get back typed token arrays ready for the resolution pipeline.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 3: Phrase Resolution Pipeline
Composer can resolve complete musical phrases - combining figures, rhythms, and harmony into concrete pitched events with full debug transparency. The core pipeline works end-to-end: DSL tokens + harmonic context produce a ResolvedFigure with all phrase-level behaviors (single-pass resolution, rhythm precedence, LCM cycling, contour preservation, anchor-on-rest) plus optional debug trace output.
**FRs covered:** FR15, FR16, FR17, FR18, FR19, FR26, FR27, FR28

### Epic 4: Strudel Output & Library Validation
Composer can hear resolved phrases through Strudel, and developers can build on harmonics as a typed npm library. The full pipeline is complete from DSL input to Strudel playback. Includes toMiniNotation output adapter, the reference phrase end-to-end validation test, clean public API barrel exports, and standalone @harmonics/core usage.
**FRs covered:** FR20, FR21, FR22, FR23, FR24, FR25, FR29, FR30, FR31, FR32, FR33

## Epic 1: Pitch Resolution Engine

Composer can resolve musical degrees to concrete pitches within a harmonic context. This is the foundational music theory engine - the thing no other JS/TS library does. A developer can specify a key + Roman numeral chord, and resolve any degree to the correct pitch class using stateless, pure functions.

### Story 1.1: Core Type Definitions & Melody Scale Degree Resolution

As a developer,
I want to define the core type system and resolve melody figure degrees against a diatonic scale,
So that I have the foundational types and can look up the correct pitch class for any scale degree in any key/chord context.

**Acceptance Criteria:**

**Given** a scale `["D","E","F","G","A","B","C"]` (D dorian) and degree 1
**When** resolveScaleDegree is called
**Then** it returns `"D"`

**Given** a scale `["D","E","F","G","A","B","C"]` and degree 3
**When** resolveScaleDegree is called
**Then** it returns `"F"`

**Given** a scale with 7 tones and degree 8
**When** resolveScaleDegree is called
**Then** it wraps to degree 1 in the next octave (modulo pool size)

**Given** degree 0 or negative values
**When** resolveScaleDegree is called
**Then** it wraps correctly and never throws an error

### Story 1.2: Chord/Bass Degree Resolution

As a developer,
I want to resolve figure degrees against chord tones,
So that bass and chord figures resolve to the correct chord tone pitches with nearest-below voice leading.

**Acceptance Criteria:**

**Given** chord tones `["D","F","A","C"]` (Dm7) and degree 1
**When** resolveChordDegree is called
**Then** it returns `"D"`

**Given** chord tones `["D","F","A","C"]` (Dm7) and degree 2
**When** resolveChordDegree is called
**Then** it returns `"F"`

**Given** chord tones with 4 tones and degree 5
**When** resolveChordDegree is called
**Then** it wraps to degree 1 in the next octave (modulo pool size)

**Given** a previous note context
**When** resolveChordDegree is called for bass figure type
**Then** it selects the octave nearest below the previous note

### Story 1.3: Expand Harmonic Progression

As a developer,
I want to convert a key and Roman numeral chord symbols into an array of HarmonyContext objects,
So that I can define progressions naturally (key + Roman numerals) and get fully resolved harmonic data for the resolution pipeline.

**Acceptance Criteria:**

**Given** key "C" and Roman numeral "iim7"
**When** expandProgression is called
**Then** the HarmonyContext contains chord "Dm7", scale `["D","E","F","G","A","B","C"]`, and chordTones `["D","F","A","C"]`

**Given** key "C" and Roman numeral "V7"
**When** expandProgression is called
**Then** the HarmonyContext contains chord "G7" with mixolydian scale

**Given** key "C" and Roman numeral "IM7"
**When** expandProgression is called
**Then** the HarmonyContext contains chord "Cmaj7" with ionian scale

**Given** a progression with durations `[{roman: "iim7", duration: 4}, {roman: "V7", duration: 2}]`
**When** expandProgression is called
**Then** it returns 6 HarmonyContext objects (4 for iim7, 2 for V7)

## Epic 2: DSL Parsing

Composer can express musical figures and rhythms as compact string DSLs. A composer can write figure strings like "1* 3 5 3" and rhythm strings like "1 _ 1 ." and get back typed token arrays ready for the resolution pipeline.

### Story 2.1: Parse Figure DSL

As a composer,
I want to write a figure as a space-separated string like `"1* 3 5 3 2* 1 7- 1*"`,
So that I can express melodic shapes concisely and get back typed tokens for the resolution pipeline.

**Acceptance Criteria:**

**Given** `"1 3 5"`
**When** parseFigure is called
**Then** it returns 3 FigureToken objects with degrees 1, 3, 5 and rest: false, anchor: false, octaveDown: false

**Given** `"1*"`
**When** parseFigure is called
**Then** it returns a token with degree 1, anchor: true, octaveDown: false

**Given** `"7-"`
**When** parseFigure is called
**Then** it returns a token with degree 7, anchor: false, octaveDown: true

**Given** `"1*-"` or `"1-*"`
**When** parseFigure is called
**Then** both return identical tokens with anchor: true, octaveDown: true (modifier order does not matter)

**Given** `"~"`
**When** parseFigure is called
**Then** it returns a token with rest: true

**Given** `"x"` or `"8"` or `""`
**When** parseFigure is called
**Then** it throws an Error with a descriptive message including the invalid token and position

### Story 2.2: Parse Rhythm DSL

As a composer,
I want to write a rhythm as a space-separated string like `"1 _ 1 . ~ ! 1 _"`,
So that I can express timing and articulation independently from the figure.

**Acceptance Criteria:**

**Given** `"1"`
**When** parseRhythm is called
**Then** it returns a RhythmToken with play: true, tie: false, staccato: false, accent: false

**Given** `"_"`
**When** parseRhythm is called
**Then** it returns a token with play: true, tie: true

**Given** `"."`
**When** parseRhythm is called
**Then** it returns a token with play: true, staccato: true

**Given** `"~"`
**When** parseRhythm is called
**Then** it returns a token with play: false, tie: false, staccato: false, accent: false

**Given** `"!"`
**When** parseRhythm is called
**Then** it returns a token with play: true, accent: true

**Given** `"x"` or `""`
**When** parseRhythm is called
**Then** it throws an Error with a descriptive message

## Epic 3: Phrase Resolution Pipeline

Composer can resolve complete musical phrases - combining figures, rhythms, and harmony into concrete pitched events with full debug transparency. The core pipeline works end-to-end: DSL tokens + harmonic context produce a ResolvedFigure with all phrase-level behaviors (single-pass resolution, rhythm precedence, LCM cycling, contour preservation, anchor-on-rest) plus optional debug trace output.

### Story 3.1: Core Phrase Resolution

As a composer,
I want to resolve a complete phrase by combining figure tokens, rhythm tokens, and a harmonic context,
So that I get back a ResolvedFigure with concrete pitched events that preserve melodic contour and respect rhythm articulations.

**Acceptance Criteria:**

**Given** figure tokens `[1, 3, 5]`, rhythm tokens `[play, play, play]`, and HarmonyContext for Dm7 in key C
**When** resolvePhrase is called with type "melody"
**Then** it returns a ResolvedFigure with 3 events containing correct pitches (D4, F4, A4)

**Given** a rhythm token with play: false (rest) at position 2
**When** resolvePhrase is called
**Then** the event at position 2 has note: "~", duration: 0, velocity: 0 (rhythm precedence - rest wins)

**Given** a rhythm token with tie: true at position 2
**When** resolvePhrase is called
**Then** the event at position 1 has tie: true and position 2 sustains the previous pitch

**Given** a rhythm token with staccato: true
**When** resolvePhrase is called
**Then** the event has duration: 0.5

**Given** a rhythm token with accent: true
**When** resolvePhrase is called
**Then** the event has velocity: 1.0

**Given** the same figure `[1, 3, 5]` over Dm7 then G7
**When** resolvePhrase is called
**Then** the contour (ascending) is preserved across both chords even though pitch classes differ

**Given** figure type "melody"
**When** resolvePhrase resolves consecutive notes
**Then** octave placement uses nearest-overall voice leading

**Given** figure type "bass"
**When** resolvePhrase resolves consecutive notes
**Then** octave placement uses nearest-below voice leading

**Given** no previous note context
**When** resolvePhrase resolves the first anchor (or first note if no anchor)
**Then** it places it at octave 4

### Story 3.2: LCM Cycling & Anchor-on-Rest

As a composer,
I want figure and rhythm arrays to cycle independently when their lengths differ, and anchors that land on rests to shift to the nearest played note,
So that I can create polyrhythmic patterns and trust that structural importance is preserved even with rests.

**Acceptance Criteria:**

**Given** a figure with 3 tokens and a rhythm with 4 tokens
**When** resolvePhrase is called
**Then** the output has 12 events (LCM of 3 and 4), with both arrays cycling

**Given** a figure with 4 tokens and a rhythm with 4 tokens
**When** resolvePhrase is called
**Then** the output has 4 events (no cycling needed)

**Given** figure `[1*, 3, 5]` and rhythm `[rest, play, play]` where the anchor at position 0 aligns with a rest
**When** resolvePhrase is called
**Then** the rest is honoured and anchor importance shifts to the nearest non-rest played note (position 1)

### Story 3.3: Debug Mode

As a composer,
I want to enable debug mode on resolvePhrase to see a per-position trace of how each note was resolved,
So that I can understand and troubleshoot unexpected resolution results.

**Acceptance Criteria:**

**Given** `debug: true` in ResolveOptions
**When** resolvePhrase is called
**Then** it logs per-position trace output to the console including: figure token, rhythm token, active harmony, pitch pool, and resolved note

**Given** `debug: (trace) => traces.push(trace)` as a callback in ResolveOptions
**When** resolvePhrase is called
**Then** it invokes the callback for each position with a PositionTrace object

**Given** a PositionTrace object
**Then** it contains: position (number), figureToken (FigureToken), rhythmToken (RhythmToken), harmony (HarmonyContext), pitchPool (string[]), and resolvedNote (string | null)

**Given** no rhythm DSL is provided
**When** debug mode is active
**Then** it assumes 8th note durations for trace output

## Epic 4: Strudel Output & Library Validation

Composer can hear resolved phrases through Strudel, and developers can build on harmonics as a typed npm library. The full pipeline is complete from DSL input to Strudel playback. Includes toMiniNotation output adapter, the reference phrase end-to-end validation test, clean public API barrel exports, and standalone @harmonics/core usage.

### Story 4.1: Strudel Mini-Notation Output

As a composer,
I want to convert a ResolvedFigure into Strudel mini-notation strings,
So that I can play resolved phrases through Strudel with correct notes, timing, and dynamics.

**Acceptance Criteria:**

**Given** a ResolvedFigure with events `[{note: "D4", tie: false, duration: 1, velocity: 0.8}]`
**When** toMiniNotation is called
**Then** notes contains `"D4"`, struct contains `"t"`, velocity contains `"0.8"`

**Given** an event with tie: true
**When** toMiniNotation is called
**Then** the note name has `_` appended (e.g., `"D4_"`) and the tied position has `"f"` in struct

**Given** an event with duration: 0.5 (staccato)
**When** toMiniNotation is called
**Then** the note name has `/2` appended (e.g., `"B4/2"`)

**Given** an event with note: "~" (rest)
**When** toMiniNotation is called
**Then** notes contains `"~"` and struct contains `"f"` at that position

**Given** an event with velocity: 1.0 (accent)
**When** toMiniNotation is called
**Then** velocity contains `"1"` at that position

**Given** the reference phrase ResolvedFigure (8 events over iim7 V7 IM7)
**When** toMiniNotation is called
**Then** it returns notes: `"D4 D4_ A4 B4/2 ~ G4 B3 B3_"`, struct: `"t f t t f t t f"`, velocity: `"0.8 0.8 0.8 0.8 0 1 0.8 0.8"`

**Given** that @harmonics/strudel imports only from @harmonics/core
**Then** it never imports Strudel runtime code (AGPL isolation)

### Story 4.2: Public API Surface & End-to-End Validation

As a developer,
I want clean typed exports from both packages and a reference phrase end-to-end test proving the full pipeline,
So that I can build on harmonics as a reliable, well-typed library and trust that the resolution pipeline produces musically correct output.

**Acceptance Criteria:**

**Given** @harmonics/core
**When** a developer imports it
**Then** `parseFigure`, `parseRhythm`, `resolvePhrase`, `resolveScaleDegree`, `resolveChordDegree`, and `expandProgression` are available as named exports

**Given** @harmonics/core
**When** a developer imports types
**Then** `FigureType`, `FigureToken`, `RhythmToken`, `HarmonyContext`, `Progression`, `ResolvedEvent`, `ResolvedFigure`, `ResolveOptions`, and `PositionTrace` are available as type exports

**Given** @harmonics/strudel
**When** a developer imports it
**Then** `toMiniNotation` and `StrudelOutput` are available as exports

**Given** @harmonics/core installed without @harmonics/strudel
**When** a developer uses parseFigure, resolvePhrase, etc.
**Then** everything works with zero Strudel dependency

**Given** the reference phrase (`1* 3 5 3 2* 1 7- 1*` with rhythm `1 _ 1 . ~ ! 1 _` over `iim7 V7 IM7` in C)
**When** the full pipeline runs (parseFigure -> parseRhythm -> expandProgression -> resolvePhrase -> toMiniNotation)
**Then** the output matches the documented expected Strudel strings exactly

**Given** both packages built and validated
**Then** publint reports no issues with package.json exports, and knip reports zero unused exports
