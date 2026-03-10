# Architecture

## Overview

Figura is a **music theory algebra** — it separates musical intent (figures,
rhythm) from musical context (harmony, key) and resolves them to absolute notes.

Inspired by Synfire (Cognitone), but implemented as a composable TypeScript
library targeting Strudel as the primary output format.

## Core Concept

```
figure (symbolic) + harmony (context) = absolute notes
```

Phrases store _relative_ musical data (scale degrees, chord-relative tones).
The harmony layer provides the context needed to resolve them to real pitches.
This means the same phrase sounds correct over any chord progression without
being re-edited — it follows the harmony automatically.

## Abstraction Stack (top to bottom)

```
Key: C
  ↓ key + roman numeral → chord name
Chords: iim7  V7  IM7
  ↓ chord name → scale / chord tones
Figure: 1*  3  5  3  2*  1  7-  1*
  ↓ degree + figure type + chord tones → absolute pitch
Rhythm: 1   _  1  .  ~   !  1   _
  ↓ rhythm token → articulation (play/rest/tie/staccato/accent)
Output: D4  ~  A4  B4/2  ~  ^G4  B3  ~
  ↓ toMiniNotation()
Strudel: note("D4 A4 B4/2 ~ G4 B3").struct("t f t t f t t f").velocity(...)
```

Each layer is **independently editable and reusable**. Changing the key
transposes everything. Swapping a figure changes the melody. Swapping the
rhythm changes the groove. None of these require touching the other layers.

## Package Structure

### `@figura/core`

Pure music algebra. Zero runtime dependencies except `tonal`.
Can run in any JS environment (browser, Node, Deno).

```
src/
  types/index.ts          — all shared TypeScript types
  dsl/
    parseFigure.ts        — figure DSL string → FigureToken[]
    parseRhythm.ts        — rhythm DSL string → RhythmToken[]
  resolve/
    resolveScaleDegree.ts — degree + scale → absolute note (melody figures)
    resolveChordDegree.ts — degree + chord → absolute note (chord/bass figures)
    resolvePhrase.ts      — orchestrates full resolution pipeline
```

### `@figura/strudel`

Strudel adapter. Depends on `@figura/core`.
Converts `ResolvedFigure` to Strudel mini-notation strings.

```
src/
  index.ts                — toMiniNotation(ResolvedFigure) → {notes, struct, velocity}
```

## Key Types

```typescript
FigureType     = "melody" | "chord" | "bass"
FigureToken    = { rest: false, degree, anchor, octaveDown } | { rest: true }
RhythmToken    = { play, tie, accent, staccato }
HarmonyContext = { key, roman, chord, scale: string[], chordTones: string[] }
ResolvedEvent  = { note: string, degree, anchor, duration, velocity, tie }  // "~" for rests
ResolvedFigure = { type, events }
```

## Resolution Rules

### Figure type determines pitch space

- `"melody"` → `resolveScaleDegree` — 7 diatonic tones of the chord's scale
- `"chord"` → `resolveChordDegree` — chord tones only (4 for 7th chords)
- `"bass"` → `resolveChordDegree` — chord tones, forced octave 2–3

### Anchor resolution

The anchor token is the most important note in a phrase (Synfire concept).
Resolution order:

1. Resolve anchor to strongest chord tone first
2. Resolve all other notes relative to the anchor (minimise voice leading leaps)
3. Apply octaveDown after pitch resolution

### Rhythm/figure length mismatch

If figure and rhythm arrays differ in length, they cycle independently.
Resolution output length = LCM(figure.length, rhythm.length).
This creates polyrhythmic rotation — intentional and desirable.

### Anchor on a rest

If the anchor token aligns with a rest rhythm token, the rest wins.
The anchor importance shifts to the nearest non-rest played note.

## Strudel Output Format

```
notes:    "D4 D4_ A4 B4/2 ~ G4 B3 B3_"
struct:   "t f t t f t t f"
velocity: "0.8 0.8 0.8 0.8 0 1 0.8 0.8"
```

Usage:

```javascript
note(notes).struct(struct).velocity(velocity).sound('piano')
```

Ties and staccato are encoded inline in the `notes` string.
Play/rest lives in `struct`. Accent lives in `velocity`.

## Currently Out of Scope

- Polyphonic chord voicings (monophonic only for now)
- Voice leading across chord changes (planned)
- Strudel live performance buttons/signals integration (see DECISIONS.md)
