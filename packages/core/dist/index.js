// src/dsl/parseFigure.ts
function parseFigure(input) {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error("Invalid figure DSL: input is empty");
  }
  const raw = trimmed.split(/\s+/);
  return raw.map((token, index) => {
    if (token === "~") {
      return { rest: true };
    }
    const degreeChar = token[0];
    const degree = Number(degreeChar);
    if (!Number.isInteger(degree) || degree < 1 || degree > 7) {
      throw new Error(`Invalid figure token "${token}" at position ${index}`);
    }
    let anchor = false;
    let octaveDown = false;
    for (let i = 1; i < token.length; i++) {
      const ch = token[i];
      if (ch === "*" && !anchor) {
        anchor = true;
      } else if (ch === "-" && !octaveDown) {
        octaveDown = true;
      } else {
        throw new Error(`Invalid figure token "${token}" at position ${index}`);
      }
    }
    return { rest: false, degree, anchor, octaveDown };
  });
}

// src/dsl/parseRhythm.ts
function parseRhythm(input) {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error("Invalid rhythm DSL: input is empty");
  }
  const raw = trimmed.split(/\s+/);
  return raw.map((token, index) => {
    switch (token) {
      case "1":
        return { play: true, tie: false, staccato: false, accent: false };
      case "_":
        return { play: false, tie: true, staccato: false, accent: false };
      case ".":
        return { play: true, tie: false, staccato: true, accent: false };
      case "~":
        return { play: false, tie: false, staccato: false, accent: false };
      case "!":
        return { play: true, tie: false, staccato: false, accent: true };
      default:
        throw new Error(`Invalid rhythm token "${token}" at position ${index}`);
    }
  });
}

// src/resolve/resolveScaleDegree.ts
import { Scale, Note } from "tonal";
function resolveScaleDegree(degree, scaleName, octave = 4) {
  const scale = Scale.get(scaleName);
  if (!scale.notes.length) {
    throw new Error(`Unrecognised scale: "${scaleName}"`);
  }
  const len = scale.notes.length;
  const zeroIndex = ((degree - 1) % len + len) % len;
  const octaveOffset = Math.floor((degree - 1) / len);
  const pitchClass = scale.notes[zeroIndex];
  const rootPitchClass = scale.notes[0];
  const rootMidi = Note.midi(`${rootPitchClass}${String(octave)}`);
  const candidateMidi = Note.midi(`${pitchClass}${String(octave)}`);
  const intraOctaveAdjust = candidateMidi < rootMidi ? 1 : 0;
  const finalOctave = octave + octaveOffset + intraOctaveAdjust;
  return `${pitchClass}${String(finalOctave)}`;
}

// src/resolve/resolveChordDegree.ts
import { Chord, Note as Note2 } from "tonal";
function resolveChordDegree(degree, chordName, octave = 4) {
  const chord = Chord.get(chordName);
  if (!chord.notes.length) {
    throw new Error(`Unrecognised chord: "${chordName}"`);
  }
  const len = chord.notes.length;
  const zeroIndex = ((degree - 1) % len + len) % len;
  const octaveOffset = Math.floor((degree - 1) / len);
  const pitchClass = chord.notes[zeroIndex];
  const rootPitchClass = chord.notes[0];
  const rootMidi = Note2.midi(`${rootPitchClass}${String(octave)}`);
  const candidateMidi = Note2.midi(`${pitchClass}${String(octave)}`);
  const intraOctaveAdjust = candidateMidi < rootMidi ? 1 : 0;
  const finalOctave = octave + octaveOffset + intraOctaveAdjust;
  return `${pitchClass}${String(finalOctave)}`;
}

// src/resolve/resolvePhrase.ts
import { Note as Note3 } from "tonal";
function placeNearestOctave(pitchClass, referenceMidi, strategy) {
  const refOctave = Math.floor(referenceMidi / 12) - 1;
  const candidates = [refOctave - 1, refOctave, refOctave + 1];
  let bestNote = `${pitchClass}${String(refOctave)}`;
  let bestDist = Infinity;
  for (const oct of candidates) {
    const candidate = `${pitchClass}${String(oct)}`;
    const midi = Note3.midi(candidate);
    if (midi === null) continue;
    const dist = Math.abs(midi - referenceMidi);
    if (strategy === "nearest-below") {
      if (midi > referenceMidi) continue;
    }
    if (dist < bestDist) {
      bestDist = dist;
      bestNote = candidate;
    }
  }
  return bestNote;
}
function resolveDegree(degree, pool, previousMidi, strategy, octaveDown) {
  const len = pool.length;
  const zeroIndex = ((degree - 1) % len + len) % len;
  const octaveOffset = Math.floor((degree - 1) / len);
  const pitchClass = pool[zeroIndex];
  let resolvedNote;
  if (previousMidi === null) {
    const baseOctave = 4;
    const rootPitchClass = pool[0];
    const rootMidi = Note3.midi(`${rootPitchClass}${String(baseOctave)}`);
    const candidateMidi = Note3.midi(`${pitchClass}${String(baseOctave)}`);
    const intraOctaveAdjust = candidateMidi < rootMidi ? 1 : 0;
    const finalOctave = baseOctave + octaveOffset + intraOctaveAdjust;
    resolvedNote = `${pitchClass}${String(finalOctave)}`;
  } else {
    resolvedNote = placeNearestOctave(pitchClass, previousMidi, strategy);
    if (octaveOffset !== 0) {
      const midi = Note3.midi(resolvedNote);
      if (midi !== null) {
        resolvedNote = `${pitchClass}${String(Math.floor(midi / 12) - 1 + octaveOffset)}`;
      }
    }
  }
  if (octaveDown) {
    const midi = Note3.midi(resolvedNote);
    if (midi !== null) {
      resolvedNote = `${pitchClass}${String(Math.floor(midi / 12) - 1 - 1)}`;
    }
  }
  return resolvedNote;
}
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}
function lcm(a, b) {
  return a / gcd(a, b) * b;
}
function buildAnchorShifts(figure, rhythm, length) {
  const shiftedAnchors = /* @__PURE__ */ new Set();
  for (let i = 0; i < length; i++) {
    const fig = figure[i % figure.length];
    if (fig.rest || !fig.anchor) continue;
    const rhy = rhythm[i % rhythm.length];
    const isRest = !rhy.play && !rhy.tie;
    if (!isRest) {
      shiftedAnchors.add(i);
    } else {
      let shifted = false;
      for (let fwd = i + 1; fwd < length; fwd++) {
        const fwdRhy = rhythm[fwd % rhythm.length];
        if (fwdRhy.play && !fwdRhy.tie) {
          const fwdFig = figure[fwd % figure.length];
          if (!fwdFig.rest) {
            shiftedAnchors.add(fwd);
            shifted = true;
            break;
          }
        }
      }
      if (!shifted) {
        for (let bwd = i - 1; bwd >= 0; bwd--) {
          const bwdRhy = rhythm[bwd % rhythm.length];
          if (bwdRhy.play && !bwdRhy.tie) {
            const bwdFig = figure[bwd % figure.length];
            if (!bwdFig.rest) {
              shiftedAnchors.add(bwd);
              break;
            }
          }
        }
      }
    }
  }
  return shiftedAnchors;
}
function emitTrace(debug, trace) {
  if (!debug) return;
  if (typeof debug === "function") {
    debug(trace);
  } else {
    const noteLabel = trace.resolvedNote ?? "~";
    const suffix = trace.rhythmToken.tie ? " (tie)" : trace.resolvedNote === null ? " (rest)" : "";
    console.log(
      `[${String(trace.position)}] ${noteLabel}${suffix} | pool: [${trace.pitchPool.join(",")}] | chord: ${trace.harmony.chord}`
    );
  }
}
var REST_EVENT = {
  note: "~",
  degree: 0,
  anchor: false,
  duration: 0,
  velocity: 0,
  tie: false
};
function resolvePhrase(figure, rhythm, context, options) {
  const type = typeof options === "string" ? options : options.type;
  const debug = typeof options === "string" ? void 0 : options.debug;
  const DEFAULT_PLAY = { play: true, tie: false, staccato: false, accent: false };
  const effectiveRhythm = rhythm ?? Array.from({ length: figure.length }, () => ({ ...DEFAULT_PLAY }));
  const contexts = Array.isArray(context) ? context : null;
  const singleContext = Array.isArray(context) ? null : context;
  const length = contexts ? contexts.length : lcm(figure.length, effectiveRhythm.length);
  const voiceStrategy = type === "melody" ? "nearest" : "nearest-below";
  const anchorPositions = buildAnchorShifts(figure, effectiveRhythm, length);
  const events = [];
  let previousMidi = null;
  let previousNote = null;
  for (let i = 0; i < length; i++) {
    const fig = figure[i % figure.length];
    const rhy = effectiveRhythm[i % effectiveRhythm.length];
    const harm = contexts ? contexts[i] : singleContext;
    const pool = type === "melody" ? harm.scale : harm.chordTones;
    const isAnchor = anchorPositions.has(i);
    if (!rhy.play && !rhy.tie) {
      events.push({ ...REST_EVENT });
      emitTrace(debug, { position: i, figureToken: fig, rhythmToken: rhy, harmony: harm, pitchPool: pool, resolvedNote: null });
      continue;
    }
    if (rhy.tie) {
      if (!fig.rest && previousMidi !== null) {
        const theoretical = resolveDegree(fig.degree, pool, previousMidi, voiceStrategy, fig.octaveDown);
        previousMidi = Note3.midi(theoretical);
      }
      events.push({
        note: previousNote ?? "~",
        degree: fig.rest ? 0 : fig.degree,
        anchor: isAnchor,
        duration: 1,
        velocity: 0.8,
        tie: true
      });
      emitTrace(debug, { position: i, figureToken: fig, rhythmToken: rhy, harmony: harm, pitchPool: pool, resolvedNote: previousNote ?? null });
      continue;
    }
    if (fig.rest) {
      events.push({ ...REST_EVENT });
      emitTrace(debug, { position: i, figureToken: fig, rhythmToken: rhy, harmony: harm, pitchPool: pool, resolvedNote: null });
      continue;
    }
    const resolvedNote = resolveDegree(fig.degree, pool, previousMidi, voiceStrategy, fig.octaveDown);
    previousNote = resolvedNote;
    previousMidi = Note3.midi(resolvedNote);
    events.push({
      note: resolvedNote,
      degree: fig.degree,
      anchor: isAnchor,
      duration: rhy.staccato ? 0.5 : 1,
      velocity: rhy.accent ? 1 : 0.8,
      tie: false
    });
    emitTrace(debug, { position: i, figureToken: fig, rhythmToken: rhy, harmony: harm, pitchPool: pool, resolvedNote });
  }
  return { type, events };
}

// src/resolve/expandProgression.ts
import { Scale as Scale2, Chord as Chord2 } from "tonal";
var ROMAN_NUMERALS = [
  { numeral: "VII", degree: 7 },
  { numeral: "III", degree: 3 },
  { numeral: "VI", degree: 6 },
  { numeral: "IV", degree: 4 },
  { numeral: "II", degree: 2 },
  { numeral: "V", degree: 5 },
  { numeral: "I", degree: 1 }
];
var DEGREE_MODE = {
  1: "ionian",
  2: "dorian",
  3: "phrygian",
  4: "lydian",
  5: "mixolydian",
  6: "aeolian",
  7: "locrian"
};
var SUFFIX_MAP = {
  m7: "m7",
  "7": "7",
  M7: "maj7",
  maj7: "maj7",
  m7b5: "m7b5",
  "\xF87": "m7b5"
};
function parseRoman(roman) {
  for (const { numeral, degree } of ROMAN_NUMERALS) {
    if (roman.toUpperCase().startsWith(numeral)) {
      const suffix = roman.slice(numeral.length);
      const chordSuffix = SUFFIX_MAP[suffix];
      if (chordSuffix === void 0) {
        throw new Error(`Unrecognised Roman numeral suffix in "${roman}"`);
      }
      return { degree, chordSuffix };
    }
  }
  throw new Error(`Unrecognised Roman numeral: "${roman}"`);
}
function expandProgression(progression) {
  const { key, chords } = progression;
  const keyScale = Scale2.get(`${key} major`);
  if (!keyScale.notes.length) {
    throw new Error(`Invalid key: "${key}"`);
  }
  const result = [];
  for (const { roman, duration } of chords) {
    if (duration < 1) {
      throw new Error(`Invalid duration ${String(duration)} for Roman numeral "${roman}" \u2014 must be >= 1`);
    }
    const { degree, chordSuffix } = parseRoman(roman);
    const rootNote = keyScale.notes[degree - 1];
    const modeName = DEGREE_MODE[degree];
    const chordName = `${rootNote}${chordSuffix}`;
    const scaleName = `${rootNote} ${modeName}`;
    const scaleNotes = Scale2.get(scaleName).notes;
    const chordTones = Chord2.get(chordName).notes;
    if (!scaleNotes.length) {
      throw new Error(`Cannot resolve scale "${scaleName}" for Roman numeral "${roman}"`);
    }
    if (!chordTones.length) {
      throw new Error(`Cannot resolve chord "${chordName}" for Roman numeral "${roman}"`);
    }
    const ctx = { key, roman, chord: chordName, scale: scaleNotes, chordTones };
    for (let i = 0; i < duration; i++) {
      result.push(ctx);
    }
  }
  return result;
}
export {
  expandProgression,
  parseFigure,
  parseRhythm,
  resolveChordDegree,
  resolvePhrase,
  resolveScaleDegree
};
