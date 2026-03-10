---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Resolution semantics for the figura DSL - turning symbolic figures into concrete pitched events'
session_goals: 'Explore design decisions, edge cases, and tradeoffs in the resolution pipeline; surface non-obvious interactions between rhythm, harmony, and voicing'
selected_approach: 'ai-recommended'
techniques_used: ['Morphological Analysis', 'First Principles Thinking', 'Assumption Reversal']
ideas_generated: 12
context_file: ''
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Ava
**Date:** 2026-03-06

## Session Overview

**Topic:** Resolution semantics for the figura DSL - turning symbolic figures into concrete pitched events
**Goals:** Explore design decisions, edge cases, and tradeoffs in the resolution pipeline; surface non-obvious interactions between rhythm, harmony, and voicing

### Context Guidance

_The figura library is a TypeScript music theory algebra for symbolic phrase resolution. The core pipeline resolves Key + Roman numeral to HarmonyContext, parses Figure DSL and Rhythm DSL tokens, then resolves them into concrete pitched events (ResolvedFigure) which can be converted to Strudel mini-notation._

### Session Setup

_Session focused on three interconnected design challenges: (1) how figure tokens resolve to absolute pitches through the harmony context, (2) what takes precedence when rhythm placement and harmonic anchor points conflict, and (3) how voicings, inversions, and voice leading affect the resolution output._

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Resolution semantics for the figura DSL with focus on design decisions, edge cases, and tradeoffs

**Recommended Techniques:**

- **Morphological Analysis:** Map the full parameter space of the resolution pipeline — every axis (figure type, anchor behavior, voicing strategy, conflict resolution) with all possible values — to reveal unexplored combinations
- **First Principles Thinking:** Strip away assumptions about how music theory libraries "should" work and rebuild from fundamental truths about pitch resolution
- **Assumption Reversal:** Flip core assumptions (rhythm always wins, anchors are priority signals, voicings are post-processing) to stress-test the design and surface edge cases

**AI Rationale:** This sequence moves from comprehensive mapping (what's possible) to axiomatic grounding (what's true) to adversarial stress-testing (what breaks). Each phase builds on the previous — you can't reverse assumptions you haven't identified, and you can't identify assumptions without first mapping the space.

## Technique Execution Results

### Morphological Analysis (Partial)

**Parameter Axes Identified:**

| Axis | Options | Status |
|------|---------|--------|
| Figure type | melody, chord, bass, pentatonic (new) | Decided: add pentatonic |
| Degree resolution space | Scale tones, chord tones (gated by chord symbol), pentatonic subset | Decided: chord symbol gates available tones |
| Upper structures | Separate type vs. folded into chord type | Decided: fold into chord type, gated by chord symbol (Dm7 = 4 tones, Dm13 = 7 tones) |
| Degree overflow | Wrap (modulo), clamp, error | Decided: wrap modulo pool size |
| Anchor behavior | Best chord tone first, voice-lead others | Decided: anchor is range placement hint only |
| Rhythm vs figure conflict | Rest wins over anchor (decided) | Decided: rhythm always wins, no exceptions |
| Octave placement | Voice leading, explicit `-` modifier | Decided: contour-based, left-to-right |
| Harmony change mid-phrase | Same degree can produce different pitch | Contour preserves direction, not intervals |
| Chord symbol parsing | m7, 7, maj7, m7b5 + extensions (9, 11, 13, add9, sus4) | Scope still open |

**Key Design Decisions Made:**

1. Add pentatonic as a new figure type (5-tone pool)
2. Upper structures fold into chord type rather than being a separate figure type
3. Chord progression symbol itself gates how many tones the chord figure type exposes
4. Degrees exceeding the tone pool wrap modulo pool size (cycling into higher octaves)

### First Principles Thinking

**Axioms Established:**

1. **Pitch class resolution is stateless** — Pure function of (key, chord, figure type, degree) to pitch class. No context, no side effects.
2. **Octave resolution is contextual** — Depends on contour, voice leading, and range.
3. **Figure identity = contour, not intervals** — Direction (up/down) + magnitude (step/skip/leap). Same figure over different chords produces different intervals but same contour.
4. **Step = 1 degree in active pitch space** — Pitch-space agnostic. A step in chord tones (a 3rd) and a step in diatonic (a 2nd) are both degree +1.
5. **Anchor = placement handle** — Determines where the contour sits in range, not resolution order.
6. **Priority: contour > voice leading > range** — Contour never violated, voice leading preferred, range is soft/best-effort.
7. **Voice leading at phrase boundaries only** — Last note of phrase N to first note of phrase N+1.
8. **Chord symbol gates the pitch pool** — Dm7 = 4 tones, Dm13 = 7 tones for chord figure type.
9. **Rest wins over anchor** — Rhythm layer's silence is never overridden.
10. **Overflow wraps modulo pool size** — Cycling into higher octaves.

### Assumption Reversal

**Reversals Tested:**

| Assumption Flipped | Result | Outcome |
|--------------------|--------|---------|
| Contour is NOT preserved | Figure loses identity based on context — same figure, same chord, different shape | Confirmed: contour must be preserved |
| Rest does NOT win over anchor | Rhythm DSL can't be trusted, rests get overridden | Confirmed: rest wins. Expanded to rhythm always wins, all tokens |
| Degree overflow errors | Breaks reusability across figure types, composer must track pool sizes | Confirmed: wrap, never error |
| Pitch resolution is stateful | Richer (approach tones, avoid notes) but harder to reason about | Confirmed: stateless. Context-sensitivity lives in future pitch spaces |
| Voice leading minimizes interval (universal) | Bass lines sound flat, register differences lost | Changed: voice leading strategy is per-figure-type |
| Anchor resolves first (two-pass) | Unnecessary complexity — contour + left-to-right achieves the same | Changed: single-pass, anchor is range hint only |

**Key Changes from Reversals:**

- Anchor demoted from "resolve first" to "range placement hint" — eliminates two-pass resolution
- Voice leading strategy moved from universal to per-figure-type
- "Rhythm always wins" expanded from just rest to all rhythm tokens (tie, staccato, accent)
- "Always resolve, never error" established as core philosophy

## Idea Organization and Prioritization

### Theme 1: Pitch Space Architecture

_What pitches are available at each position_

- **Stateless pitch class resolution** — Pure function of (key, chord, figure type, degree). No context, no side effects, independently testable.
- **Step = one degree in active pitch space** — Contour classification is purely positional. A step in chord tones and a step in diatonic are both degree +1.
- **Chord symbol gates pitch pool** — Upper structures available when declared. Dm7 = 4 tones, Dm13 = 7.
- **Complexity lives in pitch spaces, not the resolver** — New musical behaviors are new pitch space definitions, not new conditionals. Plugin architecture through data.
- **Pentatonic figure type** — 5-tone pitch space, degrees 6-7 wrap.
- **Upper structures fold into chord type** — Not a separate figure type; gated by chord symbol.

### Theme 2: Contour and Shape

_How the figure maintains its identity across harmonic changes_

- **Contour preservation, not interval preservation** — Direction + magnitude (step/skip/leap), not semitone distances.
- **Shape-first octave placement** — Octave determined by contour from previous note.
- **Always resolve, never error** — Wrapping, defaulting, soft constraints. The resolver always produces music.

### Theme 3: Resolution Algorithm

_How it all fits together_

- **Single-pass left-to-right resolution** — No two-pass. Anchor demoted to range placement hint.
- **Anchor = placement handle** — Marks which note to center in the range. Doesn't affect resolution order.
- **First anchor octave** — Center of range if specified, else octave 4.

### Theme 4: Layer Precedence

_How rhythm and figure interact_

- **Priority stack: contour > voice leading > range** — Contour never violated, voice leading preferred, range is soft.
- **Rhythm always wins** — Rest, tie, staccato, accent never overridden by any figure token. Zero exceptions.

### Theme 5: Voice Leading

_How phrases connect_

- **Voice leading at phrase boundaries only** — Last note of phrase N to first note of phrase N+1.
- **Per-figure-type voice leading strategy** — Melody: nearest overall. Bass: nearest below. Chord/pentatonic: TBD.

### Breakthrough Concepts

- **Pitch space as plugin architecture** — Adding musical behaviors by defining data (new pitch spaces) rather than code (new resolver logic). The resolver is written once; new figure types are configuration.
- **Anchor demotion to range hint** — Eliminates two-pass resolution, simplifies the algorithm dramatically, reframes the anchor from Schenkerian structural concept to practical placement tool.

### Prioritization Results

**Top Priority — Implement First (Core Resolver):**

1. Stateless pitch class resolution — the foundation
2. Single-pass left-to-right with contour — the algorithm
3. Rhythm always wins — simplest precedence rule

**Second Priority — Musical Richness:**

4. Chord symbol gates pitch pool — upper structures when declared
5. Pentatonic figure type — new pitch space, same resolver
6. Per-figure-type voice leading — melody nearest, bass nearest-below

**Third Priority — Polish and Placement:**

7. Anchor as range placement hint — soft range centering
8. First anchor octave bootstrap — range center or octave 4
9. Always resolve, never error — graceful wrapping and fallbacks

**Deferred — Future Figure Types:**

10. Chromatic with preferred notes — new pitch space, same resolver
11. Approach tones — new pitch space with context-sensitive lookup

### Resolution Algorithm (Complete)

```
Input: figure tokens, rhythm tokens, harmony context, figure type, range (optional)

1. Resolve all pitch classes left-to-right
   (stateless: key + chord at position + figure type + degree -> pitch class)

2. Assign octaves left-to-right:
   - First note: center of range if range given, else octave 4
   - Each subsequent note: pick octave that honors contour
     (step up = next degree up, even if it crosses octave boundary)
   - Voice leading from previous phrase: last note -> first note,
     using figure type's voice leading strategy

3. If range is specified:
   - Find the anchor position (or first note if no anchor)
   - Calculate how to shift the whole phrase so anchor
     lands near center of range
   - Apply shift — all notes move by same interval
   - Contour and shape perfectly preserved

4. Apply rhythm: rest = silence, tie = sustain previous,
   staccato = half duration, accent = velocity
   (rhythm always wins, no exceptions)

5. Apply explicit modifiers: `-` drops one octave from resolved pitch
```

### Figure Type Reference

| Figure Type | Pitch Space | Voice Leading Strategy | Pool Size |
|-------------|-------------|----------------------|-----------|
| melody | Diatonic scale (7 tones) | Nearest overall | 7 |
| chord | Chord tones (gated by symbol) | TBD | 3-7 |
| bass | Chord tones (same as chord) | Nearest below | 3-7 |
| pentatonic | Pentatonic scale (5 tones) | Nearest overall | 5 |

## Session Summary and Insights

**Key Achievements:**

- Established 10 axioms grounding the resolution pipeline in first principles
- Redesigned anchor from two-pass structural concept to single-pass range hint
- Defined pitch space as a plugin architecture — new figure types are data, not code
- Established clear precedence: contour > voice leading > range, rhythm always wins
- Produced a complete single-pass resolution algorithm ready for implementation

**Session Reflections:**

The most significant shift was the anchor demotion. Starting with the Synfire/Schenkerian model of "anchor resolves first," the assumption reversal revealed that single-pass left-to-right with contour preservation achieves the same musical result with a simpler algorithm. The anchor's real job is range placement, not resolution ordering. This emerged naturally from stress-testing rather than upfront design — a good argument for the brainstorming technique sequence used.

**Recommended Next Steps:**

1. Feed this output into a Quick Spec (`/bmad-bmm-quick-spec`) for the resolver redesign
2. Or create a full PRD (`/bmad-bmm-create-prd`) for the complete figura library scope
3. Update `.claude/DECISIONS.md` and `.claude/DSL.md` with the new axioms and algorithm
