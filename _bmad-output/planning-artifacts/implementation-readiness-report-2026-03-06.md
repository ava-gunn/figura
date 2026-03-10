# Implementation Readiness Assessment Report

**Date:** 2026-03-06
**Project:** figura

## Document Inventory

| Document | File | Format | Status |
|---|---|---|---|
| PRD | prd.md | Whole | Found |
| Architecture | architecture.md | Whole | Found |
| Epics & Stories | epics.md | Whole | Found |
| UX Design | N/A | N/A | Not applicable (library, no UI) |

No duplicates. No conflicts. All required documents present.

## PRD Analysis

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
FR29: Developer can import and use @figura/core without any Strudel dependency
FR30: Developer can import typed functions (parseFigure, parseRhythm, resolvePhrase, resolveScaleDegree, resolveChordDegree) from @figura/core
FR31: Developer can import toMiniNotation from @figura/strudel
FR32: Developer can access typed data structures (FigureToken, RhythmToken, HarmonyContext, ResolvedEvent, ResolvedFigure) as public exports
FR33: Developer can use the ResolvedFigure structured data to build custom renderers independent of Strudel

Total FRs: 33

### Non-Functional Requirements

NFR1: Resolution of a single phrase (up to 64 events) completes in under 10ms in a browser environment
NFR2: DSL parsing is synchronous and non-blocking
NFR3: No heap allocations beyond the output data structures (pure functional, no side effects)
NFR4: Every pitch resolution is deterministic - same inputs always produce same outputs
NFR5: Resolution functions are pure: no side effects, no shared mutable state, no implicit dependencies
NFR6: All resolution rules are covered by unit tests that assert specific pitch class outputs for known inputs
NFR7: The reference phrase end-to-end test serves as the regression gate for musical correctness
NFR8: @figura/core has zero runtime dependencies except tonal
NFR9: @figura/strudel depends only on @figura/core - never imports Strudel runtime code
NFR10: Package.json exports are validated by publint to ensure correct consumption by bundlers and Node.js
NFR11: ESM-only output, compatible with browser, Node.js 18+, and Deno
NFR12: 90% line/function coverage, 85% branch coverage enforced by Vitest
NFR13: Zero unused exports enforced by Knip
NFR14: Strict TypeScript (no any, no implicit returns, no unused variables)
NFR15: Conventional commits enforced by commitlint
NFR16: Pre-commit hooks enforce lint, typecheck, unused export, and monorepo consistency checks

Total NFRs: 16

### Additional Requirements

- Brownfield project with established infrastructure (monorepo, toolchain, package structure)
- MVP scope: melody + bass figure types; chord and pentatonic are post-MVP
- Reference phrase validation gate: "1* 3 5 3 2* 1 7- 1*" with rhythm "1 _ 1 . ~ ! 1 _" over iim7 V7 IM7 in C
- Implementation order specified: Types -> Parsers -> Stateless resolvers -> expandProgression -> resolvePhrase -> toMiniNotation
- TDD-first development mandated (red-green-refactor)
- expandProgression() helper needed but not listed as a separate FR

### PRD Completeness Assessment

The PRD is comprehensive and well-structured. All 33 FRs are clearly numbered and testable. NFRs cover performance, correctness, integration, and code quality. The phased development plan (MVP -> Growth -> Vision) is clearly scoped. One minor observation: expandProgression() is described in the Architecture but not called out as its own FR in the PRD — it is implied by FR6-7 but the function itself is an architectural decision rather than a requirement gap.

## Epic Coverage Validation

### Coverage Matrix

| FR | PRD Requirement | Epic Coverage | Status |
|---|---|---|---|
| FR1 | Figure DSL input | Epic 2, Story 2.1 | Covered |
| FR2 | Rhythm DSL input | Epic 2, Story 2.2 | Covered |
| FR3 | parseFigure() | Epic 2, Story 2.1 | Covered |
| FR4 | parseRhythm() | Epic 2, Story 2.2 | Covered |
| FR5 | Modifier order flexibility | Epic 2, Story 2.1 | Covered |
| FR6 | Key + Roman numeral context | Epic 1, Story 1.3 | Covered |
| FR7 | Roman numeral to chord + scale | Epic 1, Story 1.3 | Covered |
| FR8 | Diatonic scale derivation | Epic 1, Stories 1.1 & 1.3 | Covered |
| FR9 | Chord tone derivation | Epic 1, Stories 1.2 & 1.3 | Covered |
| FR10 | Stateless degree-to-pitch | Epic 1, Stories 1.1 & 1.2 | Covered |
| FR11 | Melody against diatonic scale | Epic 1, Story 1.1 | Covered |
| FR12 | Bass against chord tones | Epic 1, Story 1.2 | Covered |
| FR13 | Degree overflow wraps | Epic 1, Stories 1.1 & 1.2 | Covered |
| FR14 | Contour preservation | Epic 1, Story 1.3 & Epic 3, Story 3.1 | Covered |
| FR15 | Full phrase resolution | Epic 3, Story 3.1 | Covered |
| FR16 | Single-pass left-to-right | Epic 3, Story 3.1 | Covered |
| FR17 | Rhythm precedence | Epic 3, Story 3.1 | Covered |
| FR18 | LCM cycling | Epic 3, Story 3.2 | Covered |
| FR19 | Anchor on rest shifts | Epic 3, Story 3.2 | Covered |
| FR20 | Strudel notes string | Epic 4, Story 4.1 | Covered |
| FR21 | Strudel struct pattern | Epic 4, Story 4.1 | Covered |
| FR22 | Strudel velocity pattern | Epic 4, Story 4.1 | Covered |
| FR23 | Tie encoding | Epic 4, Story 4.1 | Covered |
| FR24 | Staccato encoding | Epic 4, Story 4.1 | Covered |
| FR25 | Rest encoding | Epic 4, Story 4.1 | Covered |
| FR26 | Debug mode enable | Epic 3, Story 3.3 | Covered |
| FR27 | Debug per-position trace | Epic 3, Story 3.3 | Covered |
| FR28 | Debug default 8th notes | Epic 3, Story 3.3 | Covered |
| FR29 | Standalone core | Epic 4, Story 4.2 | Covered |
| FR30 | Typed function imports | Epic 4, Story 4.2 | Covered |
| FR31 | toMiniNotation import | Epic 4, Story 4.2 | Covered |
| FR32 | Public type exports | Epic 4, Story 4.2 | Covered |
| FR33 | ResolvedFigure for custom renderers | Epic 4, Story 4.2 | Covered |

### Missing Requirements

None. All 33 FRs have traceable coverage in epics and stories.

### Coverage Statistics

- Total PRD FRs: 33
- FRs covered in epics: 33
- Coverage percentage: 100%

## UX Alignment Assessment

### UX Document Status

Not Found — correctly absent. figura is a developer tool (npm library) with no user interface. The "user interface" is the typed API surface consumed via import statements.

### Alignment Issues

None. No UX/UI is implied by the PRD or Architecture.

### Warnings

None. UX documentation is not applicable for this project type.

## Epic Quality Review

### User Value Focus

All 4 epics describe what the user/developer can accomplish, not technical milestones:
- Epic 1: "resolve musical degrees to concrete pitches" — core differentiator
- Epic 2: "express figures and rhythms as compact string DSLs" — input capability
- Epic 3: "resolve complete musical phrases" — pipeline capability
- Epic 4: "hear resolved phrases through Strudel" + "build on figura as a library" — output + validation

No technical-only epics found.

### Epic Independence

- Epic 1: Standalone (types + resolvers)
- Epic 2: Uses Epic 1 types (prior). Parsers work independently.
- Epic 3: Uses Epic 1 + 2 (both prior). Produces ResolvedFigure without Strudel.
- Epic 4: Uses Epic 1-3 (all prior). Complete pipeline.

No epic requires a future epic. No circular dependencies.

### Story Dependencies

All 10 stories verified: no forward dependencies. Within each epic, stories build only on prior stories or prior epics. Stories 1.2/1.3 are independent of each other; 2.1/2.2 are independent; 3.2/3.3 are independent.

### Acceptance Criteria Quality

All stories use Given/When/Then format with specific, testable outcomes (concrete pitch values, token properties, event counts, exact Strudel strings). Error conditions covered for parsers (invalid input throws). Reference phrase end-to-end test serves as the canonical validation gate.

### Brownfield Compliance

Correctly identified as brownfield. No unnecessary scaffolding stories. Builds directly on established infrastructure.

### Critical Violations

None.

### Major Issues

None.

### Minor Concerns

1. Story 1.3 (expandProgression) missing AC for invalid Roman numeral input. Low risk — Architecture specifies resolvers never throw, and tonal handles edge cases gracefully.
2. Story 1.1 bundles type definitions with resolveScaleDegree. Acceptable — types alone have no user value; bundling creates a meaningful deliverable.

## Summary and Recommendations

### Overall Readiness Status

READY

### Critical Issues Requiring Immediate Action

None. All validation checks passed. The project is ready for implementation.

### Assessment Summary

| Category | Result |
|---|---|
| Documents Present | 3/3 required (PRD, Architecture, Epics) |
| FR Coverage | 33/33 (100%) |
| UX Alignment | N/A — library, no UI |
| Epic User Value | All 4 epics deliver user value |
| Epic Independence | All epics standalone, no circular deps |
| Story Dependencies | All 10 stories verified, no forward deps |
| Acceptance Criteria | All stories have specific, testable Given/When/Then ACs |
| Brownfield Compliance | Correct — no unnecessary scaffolding |
| Critical Violations | 0 |
| Major Issues | 0 |
| Minor Concerns | 2 |

### Minor Concerns (Optional to Address)

1. Consider adding an AC to Story 1.3 for how expandProgression handles an unrecognized Roman numeral. The Architecture says resolvers never throw, so the expected behavior should be documented (e.g., tonal returns empty data, which the resolver wraps gracefully).

2. Story 1.1 bundling types with resolveScaleDegree is a pragmatic choice. No action needed — just noted for awareness.

### Recommended Next Steps

1. Proceed to Sprint Planning (`/bmad-bmm-sprint-planning`) to generate the implementation plan
2. Run in a fresh context window for each story implementation
3. Follow TDD strictly as mandated in CLAUDE.md: failing test first, minimal implementation, refactor
4. Use the reference phrase (`1* 3 5 3 2* 1 7- 1*` over `iim7 V7 IM7` in C) as the canonical end-to-end validation gate in Story 4.2

### Final Note

This assessment identified 2 minor concerns across 5 validation categories. No critical or major issues were found. The PRD, Architecture, and Epics/Stories are well-aligned, comprehensive, and ready for implementation. The project benefits from strong existing documentation (.claude/ domain docs, brainstorming session, domain research) that provides complete context for AI-assisted development.

**Assessor:** Implementation Readiness Workflow
**Date:** 2026-03-06
