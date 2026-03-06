# Domain Knowledge

Music theory concepts used in this codebase. Read this before implementing
anything in `resolve/`.

## Scale Degrees vs Chord Tones

This distinction is the most important concept in the codebase.

**Scale degrees** index all 7 diatonic tones of a scale:

```
D dorian: D  E  F  G  A  B  C
degree:   1  2  3  4  5  6  7
```

**Chord tones** index only the tones that form the chord (4 for 7th chords):

```
Dm7 chord tones: D  F  A  C
degree:          1  2  3  4
```

Degree 2 resolves differently depending on figure type:

- melody figure (scale) over Dm7: degree 2 = E
- chord figure (chord tones) over Dm7: degree 2 = F

## Chord/Scale Relationships

Each chord implies a scale (its natural mode in the key context):

| Roman  | Chord (key C) | Scale        |
| ------ | ------------- | ------------ |
| IM7    | Cmaj7         | C ionian     |
| iim7   | Dm7           | D dorian     |
| iiim7  | Em7           | E phrygian   |
| IVmaj7 | Fmaj7         | F lydian     |
| V7     | G7            | G mixolydian |
| vim7   | Am7           | A aeolian    |
| viiø7  | Bm7b5         | B locrian    |

## Anchor Notes (Synfire concept)

The anchor is the **most structurally important note** in a phrase — not an
absolute pitch, but a priority signal to the resolver.

Academic music theory basis:

- Schenkerian analysis: every phrase has one Kopfton (structural apex)
- Lerdahl & Jackendoff: one structural accent per phrase
- A phrase has at most one primary anchor — two equal anchors is musically
  contradictory (hierarchy is fundamental to tonal phrases)

In practice: the resolver lands the anchor on the best-fitting chord tone
first, then fits all other notes around it via voice leading.

## Voice Leading

Minimise interval motion between consecutive notes. When resolving a degree
to an absolute pitch, prefer the octave that is closest to the previous note.

This applies especially when the harmony changes beneath a sustained figure —
the same degree number may produce a different pitch class, and the octave
should be chosen to minimise the melodic leap.

## Roman Numeral Notation

```
I   = major chord on scale degree 1
ii  = minor chord on scale degree 2  (lowercase = minor)
iii = minor chord on scale degree 3
IV  = major chord on scale degree 4
V   = major chord on scale degree 5
vi  = minor chord on scale degree 6
vii = diminished chord on scale degree 7

Suffixes:
  m7   = minor seventh
  7    = dominant seventh
  maj7 = major seventh
  m7b5 = half-diminished
```

Common progressions used in examples:

- `iim7 V7 IM7` — the ii-V-I, most common jazz cadence
- `IM7 VIm7 iim7 V7` — the I-vi-ii-V turnaround

## Strudel Mini-Notation Reference

Relevant subset for this library:

```
"D4"      note at octave 4
"D4_"     tie — sustain D4 (no retrigger on next step)
"D4/2"    half duration (staccato)
"~"       rest
"[D3,F3]" chord (polyphonic — not used yet, monophonic only)
"<A B>"   alternating — A on cycle 1, B on cycle 2

.struct("t f t t")    binary play/rest pattern
.velocity("0.8 1 0.8") per-note velocity
.sound("piano")        synth/sample
.midi()                send to MIDI output
```

## Tonal.js API Reference (used in resolver implementations)

```typescript
import { Scale, Chord, Note } from 'tonal'

Scale.get('D dorian').notes // ["D","E","F","G","A","B","C"]
Chord.get('Dm7').notes // ["D","F","A","C"]
Note.midi('D4') // 62
Note.fromMidi(62) // "D4"
Note.transpose('D4', '3M') // "F#4"
```
