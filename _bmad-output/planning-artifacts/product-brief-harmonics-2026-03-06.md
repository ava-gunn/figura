---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - brainstorming-session-2026-03-06-1920.md
  - domain-symbolic-music-representation-research-2026-03-06.md
date: 2026-03-06
author: Ava
---

# Product Brief: figura

## Executive Summary

figura is a TypeScript music theory algebra that brings Synfire-style parametric figure resolution to the programmatic live coding space. It provides a simple API for combining small musical figures with harmonic contexts and rhythms, letting composers experiment with how the same shapes sound across different chords, keys, and rhythmic treatments. The library outputs Strudel mini-notation strings, integrating directly into the live coding ecosystem.

---

## Core Vision

### Problem Statement

In Strudel and other live coding environments, musical patterns are explicit and repetitive. Composing a melodic motif over a chord progression requires manually spelling out every note for every chord change. Experimenting with how a figure sounds in a different harmonic context or with a different rhythm means rewriting the pattern from scratch. There is no separation between the shape of a musical idea and the harmonic context it lives in.

### Problem Impact

This friction discourages harmonic experimentation. Live coders either avoid harmonic complexity or spend their creative energy on manual transposition rather than exploring musical possibilities. The gap between "I have a simple melodic idea" and "I hear it realized across a progression" is too wide.

### Why Existing Solutions Fall Short

- **Strudel/Tidal Cycles** — Pattern-first, not harmony-first. Chord symbols are literal, not functional. No concept of resolving a figure against a harmonic context.
- **Tonal.js** — Provides music theory primitives (notes, chords, scales) but no resolution pipeline. Tells you what a chord contains, not how to voice a figure over it.
- **Cognitone Synfire** — The closest conceptual precedent, with parametric figure/harmony separation and configurable rendering. But it's proprietary, desktop-only, and closed-source — not embeddable, not programmable, not available to live coders.
- **music21** — Python-only, analysis-oriented, not designed for generative use or browser environments.

### Proposed Solution

A two-package TypeScript library with a simple API for symbolic phrase resolution:

- **@figura/core** — Pure music algebra. Takes a key, Roman numeral progression, figure DSL string, and rhythm DSL string, and resolves them into concrete pitched events. Stateless, functional, composable.
- **@figura/strudel** — Converts resolved figures into Strudel mini-notation strings for immediate playback in the live coding environment.

The core insight, validated by Synfire's commercial success, is separating the *figure* (a reusable melodic/harmonic shape) from the *context* (key, chord, voicing) and reuniting them at resolution time. Change the figure, the rhythm, or the harmony independently — the resolver adapts.

### Key Differentiators

- **Synfire's model, as a library** — The first open-source, embeddable implementation of parametric figure/harmony resolution
- **Composability** — Figures, rhythms, and harmonic contexts are independent, interchangeable pieces. Small inputs produce emergent musical complexity.
- **Live coding native** — Outputs Strudel mini-notation; designed for the browser-based live coding ecosystem
- **Surprise as a feature** — The library is a creative collaborator. Simple figures combined with harmonic context produce music the composer didn't fully anticipate.
- **Pure functional TypeScript** — Stateless resolution, immutable data, fully typed API

## Target Users

### Primary Users

**Ava — The Theory-Curious Sound Explorer**

A developer and musician who knows music theory and wants a programmatic tool for harmonic experimentation. Comfortable with Roman numerals, chord progressions, and melodic concepts. Currently uses Strudel for live coding but finds patterns too explicit — every note manually spelled out, every chord change hand-transposed. Wants to define small musical ideas and hear them transform across harmonic contexts. Motivated by surprise: the moment when simple ingredients combine into something unexpected. Uses figura as a creative collaborator, not a notation tool.

**Live Music Coders — The Pattern Tinkerers**

Strudel and Tidal Cycles users who compose through code. Basic music theory knowledge is helpful but not required — they understand chords and keys at a practical level. Drawn to figura because it lets them get harmonically interesting results without manually managing every pitch. The experimentation loop is the learning path: try a figure over a progression, hear what happens, tweak, repeat. They discover figura through the Strudel ecosystem, community channels, or seeing someone use it in a performance.

### Secondary Users

N/A — figura is a focused library for a specific creative use case. Future secondary audiences (music educators, AI/generative music researchers, tool builders) may emerge but are not driving design decisions now.

### User Journey

1. **Discovery** — Finds figura through the Strudel ecosystem, a blog post, or seeing a live coding performance that uses it
2. **Onboarding** — Installs via npm, writes a first example: a simple figure over a I-IV-V-I. Hears the figure resolve across the chords. Immediately gets it.
3. **Core Usage** — Defines figures and rhythms, swaps harmonic contexts, listens for interesting combinations. The workflow is: sketch, play, tweak, surprise.
4. **Success Moment** — Hears something novel that emerged from simple inputs. "I didn't write that melody — the library found it."
5. **Long-term** — Builds a personal library of figures and progressions. Uses figura as a core part of live coding sessions and composition experiments.

## Success Metrics

The primary success metric for figura is **musical coherence of output**. When simple figures are resolved against a harmonic context, the result should sound like intentional, harmonically relevant music — not random notes, not mechanical transposition.

Concrete indicators of musical coherence:
- Pitches resolve correctly to the active harmony (right notes for the chord/key)
- Contour is preserved — the shape of the figure is recognizable across chord changes
- Voice leading between phrases sounds smooth, not jarring
- Rhythmic application produces natural-sounding results
- The overall output sounds like something a musician would write, not something a computer generated

### Business Objectives

N/A — figura is a personal creative tool released as open source. There are no revenue, growth, or market share objectives. Success is measured by the quality and musical usefulness of the output.

### Key Performance Indicators

- **Musical correctness** — Resolved pitches belong to the expected pitch space for the given harmony
- **Contour preservation** — Same figure over different chords produces the same melodic shape
- **Coherence by ear** — Output passes the "does this sound like music" test when listened to through Strudel
- **Experimentation velocity** — Changing a figure, rhythm, or progression produces a new coherent result without manual intervention

## MVP Scope

### Core Features

**Resolution Pipeline (end to end):**
- Key + Roman numeral → HarmonyContext
- Figure DSL parser with melody and bass figure types
- Rhythm DSL parser
- Single-pass left-to-right resolution with stateless pitch class resolution and contour preservation
- Rhythm always wins precedence rule
- Degree overflow wraps modulo pool size

**Packages:**
- `@figura/core` — Pure music algebra, the full resolution pipeline
- `@figura/strudel` — Converts ResolvedFigure to Strudel mini-notation strings

**Figure Types:**
- Melody — Diatonic scale (7 tones), nearest-overall voice leading
- Bass — Chord tones (gated by chord symbol), nearest-below voice leading

### Out of Scope for MVP

- Chord and pentatonic figure types
- Voice leading between phrases (phrase boundary smoothing)
- Advanced chord symbols (extensions beyond 7ths, alterations like #11, b9)
- Anchor as range placement hint
- Configurable voice leading strategies
- Non-Western scales, microtonal support
- MCP server / AI tool-use integration

### MVP Success Criteria

- Melody figures resolve to musically correct pitches over a diatonic chord progression
- Bass figures resolve to appropriate chord tones beneath the melody
- Contour is preserved — same figure over different chords produces the same melodic shape
- Rhythm DSL independently controls timing — same figure with different rhythms produces different but coherent results
- Output through Strudel sounds like intentional, harmonically relevant music
- Two voices (melody + bass) together sound musically coherent

### Future Vision

- Chord and pentatonic figure types (expanding the pitch space palette)
- Per-figure-type voice leading strategies
- Advanced chord symbols (extensions, alterations, sus chords)
- Anchor/range placement for register control
- Voice leading at phrase boundaries
- AI integration — MCP server for AI agents to call figura as a harmony reasoning tool
- Non-Western scales and microtonal extensions (MIDI 2.0 pitch model)
