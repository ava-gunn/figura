---
title: 'Strudel Example Scripts'
slug: 'strudel-example-scripts'
created: '2026-03-09'
status: 'completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['TypeScript', 'tonal.js', '@figura/core', '@figura/strudel', 'Strudel mini-notation']
files_to_modify: ['examples/jazz-ii-v-i.js', 'examples/pop-ballad.js', 'examples/blues-shuffle.js', 'examples/modal-vamp.js', 'examples/classical-arpeggio.js', 'examples/latin-bossa.js']
code_patterns: ['expandProgression → parseFigure → parseRhythm → resolvePhrase → toMiniNotation → Strudel pattern', 'Progression = { key, chords: [{ roman, duration }] }', 'note(notes).struct(struct).velocity(velocity).sound(synth)']
test_patterns: []
---

# Tech-Spec: Strudel Example Scripts

**Created:** 2026-03-09

## Overview

### Problem Statement

The figura library has no examples — a new user can't see how figura output feeds into Strudel for live coding. All usage patterns are buried in tests and planning docs.

### Solution

Create an `examples/` directory with Strudel-ready scripts in a variety of musical styles, showing the full pipeline from figura resolution to Strudel patterns with playback.

### Scope

**In Scope:**
- An `examples/` directory at the project root
- Multiple Strudel scripts, each showcasing a different musical style
- Coverage of `melody`, `chord`, and `bass` figure types where musically appropriate
- Full pipeline ending in Strudel patterns (`note()`, `s()`, etc.) that produce sound in the Strudel editor
- Comments explaining the musical context and figura usage

**Out of Scope:**
- Node.js runnability / CLI scripts
- New library API changes
- Web UI beyond Strudel's own editor
- Package publishing or build changes

## Context for Development

### Codebase Patterns

- Pipeline: `expandProgression → parseFigure → parseRhythm → resolvePhrase → toMiniNotation`
- `expandProgression({ key, chords: [{ roman, duration }] })` → `HarmonyContext[]`
- `resolvePhrase(figure, rhythm, context, options)` — options is `FigureType` string or `ResolveOptions` object
- `toMiniNotation(resolved)` → `{ notes, struct, velocity }` strings
- Strudel usage: `note(notes).struct(struct).velocity(velocity).sound("piano")`
- Supported roman numerals: `IM7`, `iim7`, `iiim7`, `IVM7`/`IVmaj7`, `V7`, `vim7`, `viiø7`/`viim7b5`
- Figure types: `melody` (7 scale degrees), `chord` (chord tones), `bass` (chord tones, low register)

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `packages/core/src/index.ts` | Public API exports |
| `packages/strudel/src/index.ts` | `toMiniNotation` + `StrudelOutput` type |
| `packages/core/src/types/index.ts` | `Progression`, `FigureType`, `ResolveOptions` |
| `packages/core/src/resolve/expandProgression.ts` | Roman numeral → HarmonyContext[] |
| `.claude/DSL.md` | Full DSL grammar and examples |
| `.claude/DOMAIN.md` | Roman numerals, chord/scale relationships |

### Technical Decisions

- Scripts target the Strudel editor environment (browser-based), not Node.js
- Each script should be self-contained and pasteable into the Strudel REPL
- Scripts are `.js` files (Strudel editor runs plain JS, not TS)
- Imports use `@figura/core` and `@figura/strudel` package names
- Each example focuses on a distinct musical style to showcase the library's versatility
- Examples should use comments to explain musical context for non-musicians
- Each example uses `stack()` to layer melody, chord, and/or bass parts where musically appropriate
- Different Strudel `.sound()` values per example to showcase variety (piano, synth, bass, etc.)

## Implementation Plan

### Tasks

- [ ] Task 1: Create `examples/` directory
  - File: `examples/` (new directory)
  - Action: Create the directory at the project root

- [ ] Task 2: Jazz ii-V-I example
  - File: `examples/jazz-ii-v-i.js`
  - Action: Create a jazz example using the canonical ii-V-I progression in C
  - Notes:
    - Progression: `iim7 → V7 → IM7` (the most common jazz cadence)
    - Use the reference phrase from the design session: figure `"1* 3 5 3 2* 1 7- 1*"`, rhythm `"1 _ 1 . ~ ! 1 _"`
    - Layer melody + chord comping + walking bass using `stack()`
    - Melody: `type: "melody"` — indexes scale degrees
    - Chords: `type: "chord"` — indexes chord tones for comping pattern
    - Bass: `type: "bass"` — root-based walking pattern with octave-down
    - Sound: piano for melody, keys/pad for chords, bass synth for bass
    - This is the "hello world" example — should be the most thoroughly commented

- [ ] Task 3: Pop ballad example
  - File: `examples/pop-ballad.js`
  - Action: Create a pop/singer-songwriter style example
  - Notes:
    - Progression: `IM7 → vim7 → IVM7 → V7` (classic pop turnaround, key of G)
    - Give each chord 2 beats duration to create a slower feel
    - Simple stepwise melody figure with ties for a legato feel
    - Arpeggiated chord figure (e.g., `"1 2 3 4"` with flowing rhythm)
    - Demonstrates: longer progressions, different key, legato via ties

- [ ] Task 4: Blues shuffle example
  - File: `examples/blues-shuffle.js`
  - Action: Create a blues-flavored example
  - Notes:
    - Progression: `I7 → I7 → I7 → I7 → IV7 → IV7 → I7 → I7 → V7 → IV7 → I7 → V7` — but since only `IM7`, `IVM7`, `V7` etc. are supported with 7th suffixes, use the closest available: `V7` for dominant, and adapt. Actually `V7` works for dominant 7th chords. For a blues in C: use `IM7` (approximation) and `V7` on the appropriate degrees. Alternatively, set key to F so that `V7 = C7`, `IM7 = Fmaj7`, `IVM7 = Bbmaj7` — or simplify to a 4-bar blues turnaround: `IM7 → IVM7 → V7 → IM7` in a blues-friendly key
    - Use accents (`!`) heavily in the rhythm for a punchy blues feel
    - Staccato dots for rhythmic crispness
    - Demonstrates: accent and staccato articulations, rhythmic drive

- [ ] Task 5: Modal vamp example
  - File: `examples/modal-vamp.js`
  - Action: Create a modal/ambient example over a single chord
  - Notes:
    - Progression: single `iim7` chord (D dorian in key of C) — held for 8+ beats
    - Long, exploratory melody figure using all 7 scale degrees
    - Rhythm with rests and ties for an ambient, spacious feel
    - Demonstrates: single-chord context (no progression changes), LCM cycling (use different-length figure and rhythm), the full 7-degree scale space
    - Sound: pad/synth for an ambient texture

- [ ] Task 6: Classical arpeggio example
  - File: `examples/classical-arpeggio.js`
  - Action: Create a classical-style arpeggiated example
  - Notes:
    - Progression: `IM7 → IVM7 → vim7 → V7` in C (Pachelbel-adjacent)
    - Use `type: "chord"` with figure `"1 2 3 4 3 2"` for a rolling arpeggio pattern
    - Steady rhythm of all `"1"` tokens (no articulation — pure and even)
    - Layer a simple bass on root notes
    - Demonstrates: chord-type figure resolution, even rhythms, classical texture

- [ ] Task 7: Latin bossa nova example
  - File: `examples/latin-bossa.js`
  - Action: Create a bossa nova style example
  - Notes:
    - Progression: `IM7 → iim7 → iiim7 → iim7` in F (soft jazz-bossa changes)
    - Syncopated rhythm pattern using ties and rests: e.g., `"1 ~ 1 _ 1 ~ 1 _"`
    - Melody with chromatic-adjacent stepwise motion (degrees 1-3-2-4-3-5 etc.)
    - Bass: simple root pattern with the bossa "long-short" feel via staccato
    - Demonstrates: syncopation via rhythm DSL, iiim7 (phrygian), layered parts

### Acceptance Criteria

- [ ] AC 1: Given the `examples/` directory exists, when a user lists its contents, then they find 6 `.js` files — one per musical style
- [ ] AC 2: Given any example file, when pasted into the Strudel REPL with figura loaded, then it produces audible musical output without errors
- [ ] AC 3: Given the jazz ii-V-I example, when read by a developer unfamiliar with figura, then the comments explain the full pipeline from imports through to Strudel playback
- [ ] AC 4: Given each example, when the `expandProgression` call is inspected, then the roman numerals are all valid (`IM7`, `iim7`, `iiim7`, `IVM7`, `V7`, `vim7`, `viiø7`/`viim7b5`) and durations are >= 1
- [ ] AC 5: Given the set of examples, when all figure types are tallied, then `melody`, `chord`, and `bass` are each used in at least one example
- [ ] AC 6: Given the set of examples, when all rhythm tokens are tallied, then play (`1`), tie (`_`), staccato (`.`), rest (`~`), and accent (`!`) are each used in at least one example
- [ ] AC 7: Given the modal vamp example, when figure and rhythm have different lengths, then the resolver produces LCM-length output demonstrating cycling behavior
- [ ] AC 8: Given each example, when the Strudel pattern is constructed, then it uses `note(notes).struct(struct).velocity(velocity).sound(...)` correctly
- [ ] AC 9: Given each example file, when opened in an editor, then it contains a header comment block explaining the musical style, key, progression, and what figura features it demonstrates

## Additional Context

### Dependencies

- `@figura/core` — the built core package (parsers, resolver, expandProgression)
- `@figura/strudel` — toMiniNotation converter
- Strudel editor environment — provides `note()`, `.struct()`, `.velocity()`, `.sound()`, `.stack()` etc.
- No new npm dependencies needed for the library itself

### Testing Strategy

- Manual: paste each example into the Strudel REPL and verify it produces sound
- Verify each example's imports, progression, figure DSL, and rhythm DSL are syntactically valid by tracing through the resolver logic
- Confirm no unsupported roman numerals or suffixes are used

### Notes

- The Strudel editor has its own import mechanism — examples may need adaptation depending on how the user loads figura into Strudel
- `expandProgression` only supports major-key diatonic chords with 7th suffixes (m7, 7, M7, m7b5) — example progressions must stay within these bounds
- LCM cycling: if figure and rhythm have different lengths, the resolver cycles both to LCM length — the modal vamp example specifically demonstrates this
- Blues example is constrained by the available chord types — a true blues would use dominant 7ths on I and IV, but our `IM7` and `IVM7` produce major 7ths. This is noted in the example comments as a known approximation. A future extension could add support for secondary dominants.
- All examples should be musically sensible — the figure/rhythm combinations should produce something that sounds intentional, not random
