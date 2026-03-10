# Architectural Decisions

Decisions made during the design session, with rationale. Read before
proposing changes to core interfaces.

---

## ESM only, no CJS

**Decision:** Build output is ESM only (`--format esm`).
**Rationale:** Strudel is browser-native ESM. CJS adds complexity with no
benefit for this use case. Node 18+ supports ESM natively.

---

## Monorepo: core + strudel as separate packages

**Decision:** Two packages — `@figura/core` and `@figura/strudel`.
**Rationale:** Core has no Strudel dependency and could be used with other
live coding environments (TidalCycles via JavaScript bridge, Sonic Pi, etc).
Keeping the adapter separate means core is truly portable.

---

## Monophonic only (for now)

**Decision:** Figures resolve to single notes, not chords.
**Rationale:** Chord voicings require polyphonic output which complicates the
Strudel encoding (bracket syntax `[D3,F3,A3]`). Start monophonic, add
polyphony later. Figure type "chord" in monophonic mode means degrees index
chord tones — not that multiple notes play simultaneously.

---

## FigureType determines pitch space, not output polyphony

**Decision:** "melody", "chord", "bass" differ only in which pitch space
degree numbers index into.
**Rationale:** This matches Synfire's model and keeps the resolver clean.
Polyphony is a separate concern that can be added later without changing
the type system.

---

## Anchor = most important note, not absolute pitch

**Decision:** Anchor (`*`) marks the structurally important note in a phrase,
not a fixed pitch.
**Rationale:** Synfire's anchor concept — the resolver lands the anchor on the
best chord tone first, then voice-leads everything else around it. An absolute
pitch anchor would defeat the purpose of harmony-relative phrases.

**Academic basis:** Schenkerian Kopfton, Lerdahl & Jackendoff structural accent.
One primary anchor per phrase. Two equal anchors is musically contradictory.

---

## Rhythm DSL uses different tie/rest tokens than Strudel

**Decision:** Our rhythm DSL uses `_` for tie and `~` for rest. Strudel uses
`_` appended to note names for ties and `~` in the notes string for rests.
**Rationale:** Our DSL is a parallel string alongside the figure DSL — it needs
its own token per position. The translation to Strudel encoding happens in
`toMiniNotation()`, not in the parser.

---

## Staccato encoded as /2 (half duration), not legato ratio

**Decision:** Staccato is encoded as `/2` appended to the note name in
Strudel mini-notation.
**Rationale:** Halving duration is the most musically literal encoding.
`.legato(0.3)` approximates staccato via envelope but has no clean semantic
mapping and conflicts with legato used as a general articulation controller.

---

## Ties encoded inline in notes string, not in struct

**Decision:** Ties append `_` to the note name (`"D4_"`). Staccato appends
`/2` (`"B4/2"`). Both are inline in the `notes` string.
**Rationale:** Ties and staccato modify individual note duration — they belong
in the note string. Play/rest (struct) and accent (velocity) operate on the
rhythmic grid, so they live as separate parallel patterns.

---

## Anchor on a rest: rest wins

**Decision:** If the anchor figure token aligns with a rest rhythm token,
the rest is honoured and the anchor's importance shifts to the nearest
non-rest played note.
**Rationale:** The rhythm layer's intent (silence here) should not be
overridden by the pitch layer's structural importance. The musical interest
of a rest before an important note is itself a structural device.

---

## Figure/rhythm length mismatch: cycle to LCM

**Decision:** If figure and rhythm arrays differ in length, they cycle
independently. Output length = LCM of both lengths.
**Rationale:** This is how Strudel/TidalCycles thinks about pattern
combination — polyrhythmic cycling is a feature, not an error. A 3-note
figure over a 4-step rhythm creates 12 events before repeating.

---

## Strudel live performance: variables over buttons for phrase switching

**Decision:** Phrase/chord/key switching is done by editing variables and
re-running (Ctrl+Enter), not by wiring up `button()` signals.
**Rationale:** Pre-resolving all combinations of 3 figures × 3 rhythms × 3
progressions = 27 combinations. This isn't feasible to stack. Strudel's live
coding ethos accepts re-evaluation as a performance gesture. Buttons are used
for on/off gating of layers (melody/bass/chords), not for selection.

---

## Code quality toolchain

| Tool | Purpose |
|------|---------|
| ESLint + typescript-eslint strict | Type-aware linting |
| Prettier | Formatting |
| Vitest + @vitest/coverage-v8 | Tests, 90% coverage threshold |
| Knip | Unused exports/deps (critical for a library) |
| Publint | Validates package.json exports for consumers |
| Commitlint | Conventional commits (enables changelog automation) |
| Sherif | Monorepo package.json consistency |
| CSpell | Spelling — music theory terms need a custom dictionary |
| Husky + lint-staged | Pre-commit enforcement |

Knip and Publint are highest priority for a library — dead exports and
misconfigured package.json are invisible to the author but break consumers.
