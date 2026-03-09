import { Note } from "tonal"
import type {
  FigureType,
  FigureToken,
  RhythmToken,
  HarmonyContext,
  ResolvedEvent,
  ResolvedFigure,
} from "../types/index.js"

/**
 * Resolves a pitch class to an absolute note at the octave nearest to
 * a reference MIDI pitch. For melody: nearest overall. For bass/chord:
 * nearest at or below.
 */
function placeNearestOctave(
  pitchClass: string,
  referenceMidi: number,
  strategy: "nearest" | "nearest-below",
): string {
  const refOctave = Math.floor(referenceMidi / 12) - 1
  const candidates = [refOctave - 1, refOctave, refOctave + 1]

  let bestNote = `${pitchClass}${String(refOctave)}`
  let bestDist = Infinity

  for (const oct of candidates) {
    const candidate = `${pitchClass}${String(oct)}`
    const midi = Note.midi(candidate)
    if (midi === null) continue

    const dist = Math.abs(midi - referenceMidi)

    if (strategy === "nearest-below") {
      if (midi > referenceMidi) continue
    }

    if (dist < bestDist) {
      bestDist = dist
      bestNote = candidate
    }
  }

  return bestNote
}

/**
 * Resolves a figure degree to an absolute note using the pitch pool and
 * voice leading from the previous note. Returns the resolved note string.
 */
function resolveDegree(
  degree: number,
  pool: string[],
  previousMidi: number | null,
  strategy: "nearest" | "nearest-below",
  octaveDown: boolean,
): string {
  const len = pool.length
  const zeroIndex = ((((degree - 1) % len) + len) % len)
  const octaveOffset = Math.floor((degree - 1) / len)
  const pitchClass = pool[zeroIndex]!

  let resolvedNote: string

  if (previousMidi === null) {
    const baseOctave = 4
    const rootPitchClass = pool[0]!
    const rootMidi = Note.midi(`${rootPitchClass}${String(baseOctave)}`)!
    const candidateMidi = Note.midi(`${pitchClass}${String(baseOctave)}`)!
    const intraOctaveAdjust = candidateMidi < rootMidi ? 1 : 0
    const finalOctave = baseOctave + octaveOffset + intraOctaveAdjust
    resolvedNote = `${pitchClass}${String(finalOctave)}`
  } else {
    resolvedNote = placeNearestOctave(pitchClass, previousMidi, strategy)

    if (octaveOffset !== 0) {
      const midi = Note.midi(resolvedNote)
      if (midi !== null) {
        resolvedNote = `${pitchClass}${String(Math.floor(midi / 12) - 1 + octaveOffset)}`
      }
    }
  }

  if (octaveDown) {
    const midi = Note.midi(resolvedNote)
    if (midi !== null) {
      resolvedNote = `${pitchClass}${String(Math.floor(midi / 12) - 1 - 1)}`
    }
  }

  return resolvedNote
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b
}

/**
 * Pre-scans figure and rhythm arrays for anchor positions that align with
 * rests, and shifts the anchor flag to the nearest non-rest played position.
 */
function buildAnchorShifts(
  figure: FigureToken[],
  rhythm: RhythmToken[],
  length: number,
): Set<number> {
  const shiftedAnchors = new Set<number>()

  for (let i = 0; i < length; i++) {
    const fig = figure[i % figure.length]!
    if (fig.rest || !fig.anchor) continue

    const rhy = rhythm[i % rhythm.length]!
    const isRest = !rhy.play && !rhy.tie

    if (!isRest) {
      // Anchor is on a playable position — keep it
      shiftedAnchors.add(i)
    } else {
      // Anchor aligns with rest — shift to nearest non-rest played position
      // Search forward first, then backward
      let shifted = false
      for (let fwd = i + 1; fwd < length; fwd++) {
        const fwdRhy = rhythm[fwd % rhythm.length]!
        if (fwdRhy.play && !fwdRhy.tie) {
          const fwdFig = figure[fwd % figure.length]!
          if (!fwdFig.rest) {
            shiftedAnchors.add(fwd)
            shifted = true
            break
          }
        }
      }
      if (!shifted) {
        for (let bwd = i - 1; bwd >= 0; bwd--) {
          const bwdRhy = rhythm[bwd % rhythm.length]!
          if (bwdRhy.play && !bwdRhy.tie) {
            const bwdFig = figure[bwd % figure.length]!
            if (!bwdFig.rest) {
              shiftedAnchors.add(bwd)
              break
            }
          }
        }
      }
    }
  }

  return shiftedAnchors
}

const REST_EVENT: ResolvedEvent = {
  note: "~",
  degree: 0,
  anchor: false,
  duration: 0,
  velocity: 0,
  tie: false,
}

/**
 * The core resolution function — the heart of the harmonics algebra.
 *
 * Combines a parsed figure, a parsed rhythm, and a harmony context into
 * a fully resolved sequence of musical events. Single-pass left-to-right
 * resolution with voice leading.
 *
 * Context can be a single HarmonyContext (applied to all positions) or
 * an array (one per output position).
 */
export function resolvePhrase(
  figure: FigureToken[],
  rhythm: RhythmToken[],
  context: HarmonyContext | HarmonyContext[],
  type: FigureType,
): ResolvedFigure {
  const contexts = Array.isArray(context) ? context : null
  const singleContext = Array.isArray(context) ? null : context
  const length = contexts ? contexts.length : lcm(figure.length, rhythm.length)
  const voiceStrategy = type === "melody" ? "nearest" as const : "nearest-below" as const

  // Pre-scan for anchor positions that need shifting due to rest alignment
  const anchorPositions = buildAnchorShifts(figure, rhythm, length)

  const events: ResolvedEvent[] = []
  let previousMidi: number | null = null
  let previousNote: string | null = null

  for (let i = 0; i < length; i++) {
    const fig = figure[i % figure.length]!
    const rhy = rhythm[i % rhythm.length]!
    const harm = contexts ? contexts[i]! : singleContext!
    const pool = type === "melody" ? harm.scale : harm.chordTones
    const isAnchor = anchorPositions.has(i)

    // REST — rhythm rest
    if (!rhy.play && !rhy.tie) {
      events.push({ ...REST_EVENT })
      continue
    }

    // TIE — sustain previous note, but advance voice leading chain.
    // previousMidi is updated (for voice leading continuity) while
    // previousNote is kept (for the sustained pitch output).
    if (rhy.tie) {
      if (events.length > 0) {
        events[events.length - 1]!.tie = true
      }

      // Advance voice leading even though output sustains
      if (!fig.rest && previousMidi !== null) {
        const theoretical = resolveDegree(fig.degree, pool, previousMidi, voiceStrategy, fig.octaveDown)
        previousMidi = Note.midi(theoretical)
      }

      events.push({
        note: previousNote ?? "~",
        degree: fig.rest ? 0 : fig.degree,
        anchor: isAnchor,
        duration: 1,
        velocity: 0.8,
        tie: false,
      })
      continue
    }

    // Figure rest (rhythm says play, but figure is rest)
    if (fig.rest) {
      events.push({ ...REST_EVENT })
      continue
    }

    // ─── Pitch resolution ────────────────────────────────────────────────
    const resolvedNote = resolveDegree(fig.degree, pool, previousMidi, voiceStrategy, fig.octaveDown)

    previousNote = resolvedNote
    previousMidi = Note.midi(resolvedNote)

    // ─── Articulation ─────────────────────────────────────────────────────
    events.push({
      note: resolvedNote,
      degree: fig.degree,
      anchor: isAnchor,
      duration: rhy.staccato ? 0.5 : 1,
      velocity: rhy.accent ? 1.0 : 0.8,
      tie: false,
    })
  }

  return { type, events }
}
