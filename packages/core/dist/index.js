var __defProp = Object.defineProperty;
var __export = (target, all4) => {
  for (var name2 in all4)
    __defProp(target, name2, { get: all4[name2], enumerable: true });
};

// src/dsl/parseFigure.ts
function parseFigure(input) {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error("Invalid figure DSL: input is empty");
  }
  const raw = trimmed.split(/\s+/);
  return raw.map((token, index4) => {
    if (token === "~") {
      return { rest: true };
    }
    const degreeChar = token[0];
    const degree = Number(degreeChar);
    if (!Number.isInteger(degree) || degree < 1 || degree > 7) {
      throw new Error(`Invalid figure token "${token}" at position ${index4}`);
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
        throw new Error(`Invalid figure token "${token}" at position ${index4}`);
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
  return raw.map((token, index4) => {
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
        throw new Error(`Invalid rhythm token "${token}" at position ${index4}`);
    }
  });
}

// ../../node_modules/.pnpm/@tonaljs+pitch@5.0.2/node_modules/@tonaljs/pitch/dist/index.mjs
function isNamedPitch(src) {
  return src !== null && typeof src === "object" && "name" in src && typeof src.name === "string" ? true : false;
}
function isPitch(pitch2) {
  return pitch2 !== null && typeof pitch2 === "object" && "step" in pitch2 && typeof pitch2.step === "number" && "alt" in pitch2 && typeof pitch2.alt === "number" && !isNaN(pitch2.step) && !isNaN(pitch2.alt) ? true : false;
}
var FIFTHS = [0, 2, 4, -1, 1, 3, 5];
var STEPS_TO_OCTS = FIFTHS.map(
  (fifths) => Math.floor(fifths * 7 / 12)
);
function coordinates(pitch2) {
  const { step, alt, oct, dir = 1 } = pitch2;
  const f = FIFTHS[step] + 7 * alt;
  if (oct === void 0) {
    return [dir * f];
  }
  const o = oct - STEPS_TO_OCTS[step] - 4 * alt;
  return [dir * f, dir * o];
}
var FIFTHS_TO_STEPS = [3, 0, 4, 1, 5, 2, 6];
function pitch(coord) {
  const [f, o, dir] = coord;
  const step = FIFTHS_TO_STEPS[unaltered(f)];
  const alt = Math.floor((f + 1) / 7);
  if (o === void 0) {
    return { step, alt, dir };
  }
  const oct = o + 4 * alt + STEPS_TO_OCTS[step];
  return { step, alt, oct, dir };
}
function unaltered(f) {
  const i = (f + 1) % 7;
  return i < 0 ? 7 + i : i;
}

// ../../node_modules/.pnpm/@tonaljs+pitch-interval@6.1.0/node_modules/@tonaljs/pitch-interval/dist/index.mjs
var fillStr = (s, n) => Array(Math.abs(n) + 1).join(s);
var NoInterval = Object.freeze({
  empty: true,
  name: "",
  num: NaN,
  q: "",
  type: "",
  step: NaN,
  alt: NaN,
  dir: NaN,
  simple: NaN,
  semitones: NaN,
  chroma: NaN,
  coord: [],
  oct: NaN
});
var INTERVAL_TONAL_REGEX = "([-+]?\\d+)(d{1,4}|m|M|P|A{1,4})";
var INTERVAL_SHORTHAND_REGEX = "(AA|A|P|M|m|d|dd)([-+]?\\d+)";
var REGEX = new RegExp(
  "^" + INTERVAL_TONAL_REGEX + "|" + INTERVAL_SHORTHAND_REGEX + "$"
);
function tokenizeInterval(str) {
  const m = REGEX.exec(`${str}`);
  if (m === null) {
    return ["", ""];
  }
  return m[1] ? [m[1], m[2]] : [m[4], m[3]];
}
var cache = {};
function interval(src) {
  return typeof src === "string" ? cache[src] || (cache[src] = parse(src)) : isPitch(src) ? interval(pitchName(src)) : isNamedPitch(src) ? interval(src.name) : NoInterval;
}
var SIZES = [0, 2, 4, 5, 7, 9, 11];
var TYPES = "PMMPPMM";
function parse(str) {
  const tokens = tokenizeInterval(str);
  if (tokens[0] === "") {
    return NoInterval;
  }
  const num = +tokens[0];
  const q = tokens[1];
  const step = (Math.abs(num) - 1) % 7;
  const t = TYPES[step];
  if (t === "M" && q === "P") {
    return NoInterval;
  }
  const type = t === "M" ? "majorable" : "perfectable";
  const name2 = "" + num + q;
  const dir = num < 0 ? -1 : 1;
  const simple = num === 8 || num === -8 ? num : dir * (step + 1);
  const alt = qToAlt(type, q);
  const oct = Math.floor((Math.abs(num) - 1) / 7);
  const semitones = dir * (SIZES[step] + alt + 12 * oct);
  const chroma3 = (dir * (SIZES[step] + alt) % 12 + 12) % 12;
  const coord = coordinates({ step, alt, oct, dir });
  return {
    empty: false,
    name: name2,
    num,
    q,
    step,
    alt,
    dir,
    type,
    simple,
    semitones,
    chroma: chroma3,
    coord,
    oct
  };
}
function coordToInterval(coord, forceDescending) {
  const [f, o = 0] = coord;
  const isDescending = f * 7 + o * 12 < 0;
  const ivl = forceDescending || isDescending ? [-f, -o, -1] : [f, o, 1];
  return interval(pitch(ivl));
}
function qToAlt(type, q) {
  return q === "M" && type === "majorable" || q === "P" && type === "perfectable" ? 0 : q === "m" && type === "majorable" ? -1 : /^A+$/.test(q) ? q.length : /^d+$/.test(q) ? -1 * (type === "perfectable" ? q.length : q.length + 1) : 0;
}
function pitchName(props) {
  const { step, alt, oct = 0, dir } = props;
  if (!dir) {
    return "";
  }
  const calcNum = step + 1 + 7 * oct;
  const num = calcNum === 0 ? step + 1 : calcNum;
  const d = dir < 0 ? "-" : "";
  const type = TYPES[step] === "M" ? "majorable" : "perfectable";
  const name2 = d + num + altToQ(type, alt);
  return name2;
}
function altToQ(type, alt) {
  if (alt === 0) {
    return type === "majorable" ? "M" : "P";
  } else if (alt === -1 && type === "majorable") {
    return "m";
  } else if (alt > 0) {
    return fillStr("A", alt);
  } else {
    return fillStr("d", type === "perfectable" ? alt : alt + 1);
  }
}

// ../../node_modules/.pnpm/@tonaljs+pitch-note@6.1.0/node_modules/@tonaljs/pitch-note/dist/index.mjs
var fillStr2 = (s, n) => Array(Math.abs(n) + 1).join(s);
var NoNote = Object.freeze({
  empty: true,
  name: "",
  letter: "",
  acc: "",
  pc: "",
  step: NaN,
  alt: NaN,
  chroma: NaN,
  height: NaN,
  coord: [],
  midi: null,
  freq: null
});
var cache2 = /* @__PURE__ */ new Map();
var stepToLetter = (step) => "CDEFGAB".charAt(step);
var altToAcc = (alt) => alt < 0 ? fillStr2("b", -alt) : fillStr2("#", alt);
var accToAlt = (acc) => acc[0] === "b" ? -acc.length : acc.length;
function note(src) {
  const stringSrc = JSON.stringify(src);
  const cached = cache2.get(stringSrc);
  if (cached) {
    return cached;
  }
  const value = typeof src === "string" ? parse2(src) : isPitch(src) ? note(pitchName2(src)) : isNamedPitch(src) ? note(src.name) : NoNote;
  cache2.set(stringSrc, value);
  return value;
}
var REGEX2 = /^([a-gA-G]?)(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)$/;
function tokenizeNote(str) {
  const m = REGEX2.exec(str);
  return m ? [m[1].toUpperCase(), m[2].replace(/x/g, "##"), m[3], m[4]] : ["", "", "", ""];
}
function coordToNote(noteCoord) {
  return note(pitch(noteCoord));
}
var mod = (n, m) => (n % m + m) % m;
var SEMI = [0, 2, 4, 5, 7, 9, 11];
function parse2(noteName) {
  const tokens = tokenizeNote(noteName);
  if (tokens[0] === "" || tokens[3] !== "") {
    return NoNote;
  }
  const letter = tokens[0];
  const acc = tokens[1];
  const octStr = tokens[2];
  const step = (letter.charCodeAt(0) + 3) % 7;
  const alt = accToAlt(acc);
  const oct = octStr.length ? +octStr : void 0;
  const coord = coordinates({ step, alt, oct });
  const name2 = letter + acc + octStr;
  const pc = letter + acc;
  const chroma3 = (SEMI[step] + alt + 120) % 12;
  const height = oct === void 0 ? mod(SEMI[step] + alt, 12) - 12 * 99 : SEMI[step] + alt + 12 * (oct + 1);
  const midi2 = height >= 0 && height <= 127 ? height : null;
  const freq2 = oct === void 0 ? null : Math.pow(2, (height - 69) / 12) * 440;
  return {
    empty: false,
    acc,
    alt,
    chroma: chroma3,
    coord,
    freq: freq2,
    height,
    letter,
    midi: midi2,
    name: name2,
    oct,
    pc,
    step
  };
}
function pitchName2(props) {
  const { step, alt, oct } = props;
  const letter = stepToLetter(step);
  if (!letter) {
    return "";
  }
  const pc = letter + altToAcc(alt);
  return oct || oct === 0 ? pc + oct : pc;
}

// ../../node_modules/.pnpm/@tonaljs+pitch-distance@5.0.5/node_modules/@tonaljs/pitch-distance/dist/index.mjs
function transpose(noteName, intervalName) {
  const note2 = note(noteName);
  const intervalCoord = Array.isArray(intervalName) ? intervalName : interval(intervalName).coord;
  if (note2.empty || !intervalCoord || intervalCoord.length < 2) {
    return "";
  }
  const noteCoord = note2.coord;
  const tr2 = noteCoord.length === 1 ? [noteCoord[0] + intervalCoord[0]] : [noteCoord[0] + intervalCoord[0], noteCoord[1] + intervalCoord[1]];
  return coordToNote(tr2).name;
}
function tonicIntervalsTransposer(intervals, tonic) {
  const len = intervals.length;
  return (normalized) => {
    if (!tonic) return "";
    const index4 = normalized < 0 ? (len - -normalized % len) % len : normalized % len;
    const octaves = Math.floor(normalized / len);
    const root = transpose(tonic, [0, octaves]);
    return transpose(root, intervals[index4]);
  };
}
function distance(fromNote, toNote) {
  const from = note(fromNote);
  const to = note(toNote);
  if (from.empty || to.empty) {
    return "";
  }
  const fcoord = from.coord;
  const tcoord = to.coord;
  const fifths = tcoord[0] - fcoord[0];
  const octs = fcoord.length === 2 && tcoord.length === 2 ? tcoord[1] - fcoord[1] : -Math.floor(fifths * 7 / 12);
  const forceDescending = to.height === from.height && to.midi !== null && from.oct === to.oct && from.step > to.step;
  return coordToInterval([fifths, octs], forceDescending).name;
}

// ../../node_modules/.pnpm/@tonaljs+chord@6.1.2/node_modules/@tonaljs/chord/dist/index.mjs
var dist_exports = {};
__export(dist_exports, {
  chord: () => chord,
  chordScales: () => chordScales,
  default: () => index_default,
  degrees: () => degrees,
  detect: () => detect,
  extended: () => extended,
  get: () => get4,
  getChord: () => getChord,
  notes: () => notes,
  reduced: () => reduced,
  steps: () => steps,
  tokenize: () => tokenize,
  transpose: () => transpose2
});

// ../../node_modules/.pnpm/@tonaljs+collection@4.9.0/node_modules/@tonaljs/collection/dist/index.mjs
function ascR(b, n) {
  const a = [];
  for (; n--; a[n] = n + b) ;
  return a;
}
function descR(b, n) {
  const a = [];
  for (; n--; a[n] = b - n) ;
  return a;
}
function range(from, to) {
  return from < to ? ascR(from, to - from + 1) : descR(from, from - to + 1);
}
function rotate(times, arr) {
  const len = arr.length;
  const n = (times % len + len) % len;
  return arr.slice(n, len).concat(arr.slice(0, n));
}
function compact(arr) {
  return arr.filter((n) => n === 0 || n);
}

// ../../node_modules/.pnpm/@tonaljs+pcset@4.10.1/node_modules/@tonaljs/pcset/dist/index.mjs
var EmptyPcset = {
  empty: true,
  name: "",
  setNum: 0,
  chroma: "000000000000",
  normalized: "000000000000",
  intervals: []
};
var setNumToChroma = (num2) => Number(num2).toString(2).padStart(12, "0");
var chromaToNumber = (chroma22) => parseInt(chroma22, 2);
var REGEX3 = /^[01]{12}$/;
function isChroma(set) {
  return REGEX3.test(set);
}
var isPcsetNum = (set) => typeof set === "number" && set >= 0 && set <= 4095;
var isPcset = (set) => set && isChroma(set.chroma);
var cache3 = { [EmptyPcset.chroma]: EmptyPcset };
function get(src) {
  const chroma22 = isChroma(src) ? src : isPcsetNum(src) ? setNumToChroma(src) : Array.isArray(src) ? listToChroma(src) : isPcset(src) ? src.chroma : EmptyPcset.chroma;
  return cache3[chroma22] = cache3[chroma22] || chromaToPcset(chroma22);
}
var chroma = (set) => get(set).chroma;
var IVLS = [
  "1P",
  "2m",
  "2M",
  "3m",
  "3M",
  "4P",
  "5d",
  "5P",
  "6m",
  "6M",
  "7m",
  "7M"
];
function chromaToIntervals(chroma22) {
  const intervals2 = [];
  for (let i = 0; i < 12; i++) {
    if (chroma22.charAt(i) === "1") intervals2.push(IVLS[i]);
  }
  return intervals2;
}
function modes(set, normalize = true) {
  const pcs = get(set);
  const binary = pcs.chroma.split("");
  return compact(
    binary.map((_, i) => {
      const r = rotate(i, binary);
      return normalize && r[0] === "0" ? null : r.join("");
    })
  );
}
function isSubsetOf(set) {
  const s = get(set).setNum;
  return (notes2) => {
    const o = get(notes2).setNum;
    return s && s !== o && (o & s) === o;
  };
}
function isSupersetOf(set) {
  const s = get(set).setNum;
  return (notes2) => {
    const o = get(notes2).setNum;
    return s && s !== o && (o | s) === o;
  };
}
function chromaRotations(chroma22) {
  const binary = chroma22.split("");
  return binary.map((_, i) => rotate(i, binary).join(""));
}
function chromaToPcset(chroma22) {
  const setNum = chromaToNumber(chroma22);
  const normalizedNum = chromaRotations(chroma22).map(chromaToNumber).filter((n) => n >= 2048).sort()[0];
  const normalized = setNumToChroma(normalizedNum);
  const intervals2 = chromaToIntervals(chroma22);
  return {
    empty: false,
    name: "",
    setNum,
    chroma: chroma22,
    normalized,
    intervals: intervals2
  };
}
function listToChroma(set) {
  if (set.length === 0) {
    return EmptyPcset.chroma;
  }
  let pitch2;
  const binary = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < set.length; i++) {
    pitch2 = note(set[i]);
    if (pitch2.empty) pitch2 = interval(set[i]);
    if (!pitch2.empty) binary[pitch2.chroma] = 1;
  }
  return binary.join("");
}

// ../../node_modules/.pnpm/@tonaljs+chord-type@5.1.1/node_modules/@tonaljs/chord-type/dist/index.mjs
var CHORDS = [
  // ==Major==
  ["1P 3M 5P", "major", "M ^  maj"],
  ["1P 3M 5P 7M", "major seventh", "maj7 \u0394 ma7 M7 Maj7 ^7"],
  ["1P 3M 5P 7M 9M", "major ninth", "maj9 \u03949 ^9"],
  ["1P 3M 5P 7M 9M 13M", "major thirteenth", "maj13 Maj13 ^13"],
  ["1P 3M 5P 6M", "sixth", "6 add6 add13 M6"],
  ["1P 3M 5P 6M 9M", "sixth added ninth", "6add9 6/9 69 M69"],
  ["1P 3M 6m 7M", "major seventh flat sixth", "M7b6 ^7b6"],
  [
    "1P 3M 5P 7M 11A",
    "major seventh sharp eleventh",
    "maj#4 \u0394#4 \u0394#11 M7#11 ^7#11 maj7#11"
  ],
  // ==Minor==
  // '''Normal'''
  ["1P 3m 5P", "minor", "m min -"],
  ["1P 3m 5P 7m", "minor seventh", "m7 min7 mi7 -7"],
  [
    "1P 3m 5P 7M",
    "minor/major seventh",
    "m/ma7 m/maj7 mM7 mMaj7 m/M7 -\u03947 m\u0394 -^7 -maj7"
  ],
  ["1P 3m 5P 6M", "minor sixth", "m6 -6"],
  ["1P 3m 5P 7m 9M", "minor ninth", "m9 -9"],
  ["1P 3m 5P 7M 9M", "minor/major ninth", "mM9 mMaj9 -^9"],
  ["1P 3m 5P 7m 9M 11P", "minor eleventh", "m11 -11"],
  ["1P 3m 5P 7m 9M 13M", "minor thirteenth", "m13 -13"],
  // '''Diminished'''
  ["1P 3m 5d", "diminished", "dim \xB0 o"],
  ["1P 3m 5d 7d", "diminished seventh", "dim7 \xB07 o7"],
  ["1P 3m 5d 7m", "half-diminished", "m7b5 \xF8 -7b5 h7 h"],
  // ==Dominant/Seventh==
  // '''Normal'''
  ["1P 3M 5P 7m", "dominant seventh", "7 dom"],
  ["1P 3M 5P 7m 9M", "dominant ninth", "9"],
  ["1P 3M 5P 7m 9M 13M", "dominant thirteenth", "13"],
  ["1P 3M 5P 7m 11A", "lydian dominant seventh", "7#11 7#4"],
  // '''Altered'''
  ["1P 3M 5P 7m 9m", "dominant flat ninth", "7b9"],
  ["1P 3M 5P 7m 9A", "dominant sharp ninth", "7#9"],
  ["1P 3M 7m 9m", "altered", "alt7"],
  // '''Suspended'''
  ["1P 4P 5P", "suspended fourth", "sus4 sus"],
  ["1P 2M 5P", "suspended second", "sus2"],
  ["1P 4P 5P 7m", "suspended fourth seventh", "7sus4 7sus"],
  ["1P 5P 7m 9M 11P", "eleventh", "11"],
  [
    "1P 4P 5P 7m 9m",
    "suspended fourth flat ninth",
    "b9sus phryg 7b9sus 7b9sus4"
  ],
  // ==Other==
  ["1P 5P", "fifth", "5"],
  ["1P 3M 5A", "augmented", "aug + +5 ^#5"],
  ["1P 3m 5A", "minor augmented", "m#5 -#5 m+"],
  ["1P 3M 5A 7M", "augmented seventh", "maj7#5 maj7+5 +maj7 ^7#5"],
  [
    "1P 3M 5P 7M 9M 11A",
    "major sharp eleventh (lydian)",
    "maj9#11 \u03949#11 ^9#11"
  ],
  // ==Legacy==
  ["1P 2M 4P 5P", "", "sus24 sus4add9"],
  ["1P 3M 5A 7M 9M", "", "maj9#5 Maj9#5"],
  ["1P 3M 5A 7m", "", "7#5 +7 7+ 7aug aug7"],
  ["1P 3M 5A 7m 9A", "", "7#5#9 7#9#5 7alt"],
  ["1P 3M 5A 7m 9M", "", "9#5 9+"],
  ["1P 3M 5A 7m 9M 11A", "", "9#5#11"],
  ["1P 3M 5A 7m 9m", "", "7#5b9 7b9#5"],
  ["1P 3M 5A 7m 9m 11A", "", "7#5b9#11"],
  ["1P 3M 5A 9A", "", "+add#9"],
  ["1P 3M 5A 9M", "", "M#5add9 +add9"],
  ["1P 3M 5P 6M 11A", "", "M6#11 M6b5 6#11 6b5"],
  ["1P 3M 5P 6M 7M 9M", "", "M7add13"],
  ["1P 3M 5P 6M 9M 11A", "", "69#11"],
  ["1P 3m 5P 6M 9M", "", "m69 -69"],
  ["1P 3M 5P 6m 7m", "", "7b6"],
  ["1P 3M 5P 7M 9A 11A", "", "maj7#9#11"],
  ["1P 3M 5P 7M 9M 11A 13M", "", "M13#11 maj13#11 M13+4 M13#4"],
  ["1P 3M 5P 7M 9m", "", "M7b9"],
  ["1P 3M 5P 7m 11A 13m", "", "7#11b13 7b5b13"],
  ["1P 3M 5P 7m 13M", "", "7add6 67 7add13"],
  ["1P 3M 5P 7m 9A 11A", "", "7#9#11 7b5#9 7#9b5"],
  ["1P 3M 5P 7m 9A 11A 13M", "", "13#9#11"],
  ["1P 3M 5P 7m 9A 11A 13m", "", "7#9#11b13"],
  ["1P 3M 5P 7m 9A 13M", "", "13#9"],
  ["1P 3M 5P 7m 9A 13m", "", "7#9b13"],
  ["1P 3M 5P 7m 9M 11A", "", "9#11 9+4 9#4"],
  ["1P 3M 5P 7m 9M 11A 13M", "", "13#11 13+4 13#4"],
  ["1P 3M 5P 7m 9M 11A 13m", "", "9#11b13 9b5b13"],
  ["1P 3M 5P 7m 9m 11A", "", "7b9#11 7b5b9 7b9b5"],
  ["1P 3M 5P 7m 9m 11A 13M", "", "13b9#11"],
  ["1P 3M 5P 7m 9m 11A 13m", "", "7b9b13#11 7b9#11b13 7b5b9b13"],
  ["1P 3M 5P 7m 9m 13M", "", "13b9"],
  ["1P 3M 5P 7m 9m 13m", "", "7b9b13"],
  ["1P 3M 5P 7m 9m 9A", "", "7b9#9"],
  ["1P 3M 5P 9M", "", "Madd9 2 add9 add2"],
  ["1P 3M 5P 9m", "", "Maddb9"],
  ["1P 3M 5d", "", "Mb5"],
  ["1P 3M 5d 6M 7m 9M", "", "13b5"],
  ["1P 3M 5d 7M", "", "M7b5"],
  ["1P 3M 5d 7M 9M", "", "M9b5"],
  ["1P 3M 5d 7m", "", "7b5"],
  ["1P 3M 5d 7m 9M", "", "9b5"],
  ["1P 3M 7m", "", "7no5"],
  ["1P 3M 7m 13m", "", "7b13"],
  ["1P 3M 7m 9M", "", "9no5"],
  ["1P 3M 7m 9M 13M", "", "13no5"],
  ["1P 3M 7m 9M 13m", "", "9b13"],
  ["1P 3m 4P 5P", "", "madd4"],
  ["1P 3m 5P 6m 7M", "", "mMaj7b6"],
  ["1P 3m 5P 6m 7M 9M", "", "mMaj9b6"],
  ["1P 3m 5P 7m 11P", "", "m7add11 m7add4"],
  ["1P 3m 5P 9M", "", "madd9"],
  ["1P 3m 5d 6M 7M", "", "o7M7"],
  ["1P 3m 5d 7M", "", "oM7"],
  ["1P 3m 6m 7M", "", "mb6M7"],
  ["1P 3m 6m 7m", "", "m7#5"],
  ["1P 3m 6m 7m 9M", "", "m9#5"],
  ["1P 3m 5A 7m 9M 11P", "", "m11A"],
  ["1P 3m 6m 9m", "", "mb6b9"],
  ["1P 2M 3m 5d 7m", "", "m9b5"],
  ["1P 4P 5A 7M", "", "M7#5sus4"],
  ["1P 4P 5A 7M 9M", "", "M9#5sus4"],
  ["1P 4P 5A 7m", "", "7#5sus4"],
  ["1P 4P 5P 7M", "", "M7sus4"],
  ["1P 4P 5P 7M 9M", "", "M9sus4"],
  ["1P 4P 5P 7m 9M", "", "9sus4 9sus"],
  ["1P 4P 5P 7m 9M 13M", "", "13sus4 13sus"],
  ["1P 4P 5P 7m 9m 13m", "", "7sus4b9b13 7b9b13sus4"],
  ["1P 4P 7m 10m", "", "4 quartal"],
  ["1P 5P 7m 9m 11P", "", "11b9"]
];
var data_default = CHORDS;
var NoChordType = {
  ...EmptyPcset,
  name: "",
  quality: "Unknown",
  intervals: [],
  aliases: []
};
var dictionary = [];
var index = {};
function get2(type) {
  return index[type] || NoChordType;
}
function all() {
  return dictionary.slice();
}
function add(intervals, aliases, fullName) {
  const quality = getQuality(intervals);
  const chord2 = {
    ...get(intervals),
    name: fullName || "",
    quality,
    intervals,
    aliases
  };
  dictionary.push(chord2);
  if (chord2.name) {
    index[chord2.name] = chord2;
  }
  index[chord2.setNum] = chord2;
  index[chord2.chroma] = chord2;
  chord2.aliases.forEach((alias) => addAlias(chord2, alias));
}
function addAlias(chord2, alias) {
  index[alias] = chord2;
}
function getQuality(intervals) {
  const has = (interval2) => intervals.indexOf(interval2) !== -1;
  return has("5A") ? "Augmented" : has("3M") ? "Major" : has("5d") ? "Diminished" : has("3m") ? "Minor" : "Unknown";
}
data_default.forEach(
  ([ivls, fullName, names22]) => add(ivls.split(" "), names22.split(" "), fullName)
);
dictionary.sort((a, b) => a.setNum - b.setNum);

// ../../node_modules/.pnpm/@tonaljs+chord-detect@4.9.1/node_modules/@tonaljs/chord-detect/dist/index.mjs
var namedSet = (notes2) => {
  const pcToName = notes2.reduce((record, n) => {
    const chroma3 = note(n).chroma;
    if (chroma3 !== void 0) {
      record[chroma3] = record[chroma3] || note(n).name;
    }
    return record;
  }, {});
  return (chroma3) => pcToName[chroma3];
};
function detect(source, options = {}) {
  const notes2 = source.map((n) => note(n).pc).filter((x) => x);
  if (note.length === 0) {
    return [];
  }
  const found = findMatches(notes2, 1, options);
  return found.filter((chord2) => chord2.weight).sort((a, b) => b.weight - a.weight).map((chord2) => chord2.name);
}
var BITMASK = {
  // 3m 000100000000
  // 3M 000010000000
  anyThirds: 384,
  // 5P 000000010000
  perfectFifth: 16,
  // 5d 000000100000
  // 5A 000000001000
  nonPerfectFifths: 40,
  anySeventh: 3
};
var testChromaNumber = (bitmask) => (chromaNumber) => Boolean(chromaNumber & bitmask);
var hasAnyThird = testChromaNumber(BITMASK.anyThirds);
var hasPerfectFifth = testChromaNumber(BITMASK.perfectFifth);
var hasAnySeventh = testChromaNumber(BITMASK.anySeventh);
var hasNonPerfectFifth = testChromaNumber(BITMASK.nonPerfectFifths);
function hasAnyThirdAndPerfectFifthAndAnySeventh(chordType) {
  const chromaNumber = parseInt(chordType.chroma, 2);
  return hasAnyThird(chromaNumber) && hasPerfectFifth(chromaNumber) && hasAnySeventh(chromaNumber);
}
function withPerfectFifth(chroma3) {
  const chromaNumber = parseInt(chroma3, 2);
  return hasNonPerfectFifth(chromaNumber) ? chroma3 : (chromaNumber | 16).toString(2);
}
function findMatches(notes2, weight, options) {
  const tonic = notes2[0];
  const tonicChroma = note(tonic).chroma;
  const noteName = namedSet(notes2);
  const allModes = modes(notes2, false);
  const found = [];
  allModes.forEach((mode, index4) => {
    const modeWithPerfectFifth = options.assumePerfectFifth && withPerfectFifth(mode);
    const chordTypes = all().filter((chordType) => {
      if (options.assumePerfectFifth && hasAnyThirdAndPerfectFifthAndAnySeventh(chordType)) {
        return chordType.chroma === modeWithPerfectFifth;
      }
      return chordType.chroma === mode;
    });
    chordTypes.forEach((chordType) => {
      const chordName = chordType.aliases[0];
      const baseNote = noteName(index4);
      const isInversion = index4 !== tonicChroma;
      if (isInversion) {
        found.push({
          weight: 0.5 * weight,
          name: `${baseNote}${chordName}/${tonic}`
        });
      } else {
        found.push({ weight: 1 * weight, name: `${baseNote}${chordName}` });
      }
    });
  });
  return found;
}

// ../../node_modules/.pnpm/@tonaljs+interval@5.1.0/node_modules/@tonaljs/interval/dist/index.mjs
var IQ = "P m M m M P d P m M m M".split(" ");
var add2 = combinator((a, b) => [a[0] + b[0], a[1] + b[1]]);
var subtract = combinator((a, b) => [a[0] - b[0], a[1] - b[1]]);
function combinator(fn) {
  return (a, b) => {
    const coordA = interval(a).coord;
    const coordB = interval(b).coord;
    if (coordA && coordB) {
      const coord = fn(coordA, coordB);
      return coordToInterval(coord).name;
    }
  };
}

// ../../node_modules/.pnpm/@tonaljs+scale-type@4.9.2/node_modules/@tonaljs/scale-type/dist/index.mjs
var SCALES = [
  // Basic scales
  ["1P 2M 3M 5P 6M", "major pentatonic", "pentatonic"],
  ["1P 2M 3M 4P 5P 6M 7M", "major", "ionian"],
  ["1P 2M 3m 4P 5P 6m 7m", "minor", "aeolian"],
  // Jazz common scales
  ["1P 2M 3m 3M 5P 6M", "major blues"],
  ["1P 3m 4P 5d 5P 7m", "minor blues", "blues"],
  ["1P 2M 3m 4P 5P 6M 7M", "melodic minor"],
  ["1P 2M 3m 4P 5P 6m 7M", "harmonic minor"],
  ["1P 2M 3M 4P 5P 6M 7m 7M", "bebop"],
  ["1P 2M 3m 4P 5d 6m 6M 7M", "diminished", "whole-half diminished"],
  // Modes
  ["1P 2M 3m 4P 5P 6M 7m", "dorian"],
  ["1P 2M 3M 4A 5P 6M 7M", "lydian"],
  ["1P 2M 3M 4P 5P 6M 7m", "mixolydian", "dominant"],
  ["1P 2m 3m 4P 5P 6m 7m", "phrygian"],
  ["1P 2m 3m 4P 5d 6m 7m", "locrian"],
  // 5-note scales
  ["1P 3M 4P 5P 7M", "ionian pentatonic"],
  ["1P 3M 4P 5P 7m", "mixolydian pentatonic", "indian"],
  ["1P 2M 4P 5P 6M", "ritusen"],
  ["1P 2M 4P 5P 7m", "egyptian"],
  // Source: https://en.wikipedia.org/wiki/Neapolitan_scale
  ["1P 3M 4P 5d 7m", "neapolitan major pentatonic"],
  ["1P 3m 4P 5P 6m", "vietnamese 1"],
  ["1P 2m 3m 5P 6m", "pelog"],
  ["1P 2m 4P 5P 6m", "kumoijoshi"],
  ["1P 2M 3m 5P 6m", "hirajoshi"],
  ["1P 2m 4P 5d 7m", "iwato"],
  ["1P 2m 4P 5P 7m", "in-sen"],
  ["1P 3M 4A 5P 7M", "lydian pentatonic", "chinese"],
  ["1P 3m 4P 6m 7m", "malkos raga"],
  ["1P 3m 4P 5d 7m", "locrian pentatonic", "minor seven flat five pentatonic"],
  ["1P 3m 4P 5P 7m", "minor pentatonic", "vietnamese 2"],
  ["1P 3m 4P 5P 6M", "minor six pentatonic"],
  ["1P 2M 3m 5P 6M", "flat three pentatonic", "kumoi"],
  ["1P 2M 3M 5P 6m", "flat six pentatonic"],
  ["1P 2m 3M 5P 6M", "scriabin"],
  ["1P 3M 5d 6m 7m", "whole tone pentatonic"],
  ["1P 3M 4A 5A 7M", "lydian #5p pentatonic"],
  ["1P 3M 4A 5P 7m", "lydian dominant pentatonic"],
  ["1P 3m 4P 5P 7M", "minor #7m pentatonic"],
  ["1P 3m 4d 5d 7m", "super locrian pentatonic"],
  // 6-note scales
  ["1P 2M 3m 4P 5P 7M", "minor hexatonic"],
  ["1P 2A 3M 5P 5A 7M", "augmented"],
  ["1P 2M 4P 5P 6M 7m", "piongio"],
  // Source: https://en.wikipedia.org/wiki/Neapolitan_scale
  ["1P 2m 3M 4A 6M 7m", "prometheus neapolitan"],
  ["1P 2M 3M 4A 6M 7m", "prometheus"],
  ["1P 2m 3M 5d 6m 7m", "mystery #1"],
  ["1P 2m 3M 4P 5A 6M", "six tone symmetric"],
  ["1P 2M 3M 4A 5A 6A", "whole tone", "messiaen's mode #1"],
  ["1P 2m 4P 4A 5P 7M", "messiaen's mode #5"],
  // 7-note scales
  ["1P 2M 3M 4P 5d 6m 7m", "locrian major", "arabian"],
  ["1P 2m 3M 4A 5P 6m 7M", "double harmonic lydian"],
  [
    "1P 2m 2A 3M 4A 6m 7m",
    "altered",
    "super locrian",
    "diminished whole tone",
    "pomeroy"
  ],
  ["1P 2M 3m 4P 5d 6m 7m", "locrian #2", "half-diminished", "aeolian b5"],
  [
    "1P 2M 3M 4P 5P 6m 7m",
    "mixolydian b6",
    "melodic minor fifth mode",
    "hindu"
  ],
  ["1P 2M 3M 4A 5P 6M 7m", "lydian dominant", "lydian b7", "overtone"],
  ["1P 2M 3M 4A 5A 6M 7M", "lydian augmented"],
  [
    "1P 2m 3m 4P 5P 6M 7m",
    "dorian b2",
    "phrygian #6",
    "melodic minor second mode"
  ],
  [
    "1P 2m 3m 4d 5d 6m 7d",
    "ultralocrian",
    "superlocrian bb7",
    "superlocrian diminished"
  ],
  ["1P 2m 3m 4P 5d 6M 7m", "locrian 6", "locrian natural 6", "locrian sharp 6"],
  ["1P 2A 3M 4P 5P 5A 7M", "augmented heptatonic"],
  // Source https://en.wikipedia.org/wiki/Ukrainian_Dorian_scale
  [
    "1P 2M 3m 4A 5P 6M 7m",
    "dorian #4",
    "ukrainian dorian",
    "romanian minor",
    "altered dorian"
  ],
  ["1P 2M 3m 4A 5P 6M 7M", "lydian diminished"],
  ["1P 2M 3M 4A 5A 7m 7M", "leading whole tone"],
  ["1P 2M 3M 4A 5P 6m 7m", "lydian minor"],
  ["1P 2m 3M 4P 5P 6m 7m", "phrygian dominant", "spanish", "phrygian major"],
  ["1P 2m 3m 4P 5P 6m 7M", "balinese"],
  // Source: https://en.wikipedia.org/wiki/Neapolitan_scale
  ["1P 2m 3m 4P 5P 6M 7M", "neapolitan major"],
  ["1P 2M 3M 4P 5P 6m 7M", "harmonic major"],
  ["1P 2m 3M 4P 5P 6m 7M", "double harmonic major", "gypsy"],
  ["1P 2M 3m 4A 5P 6m 7M", "hungarian minor"],
  ["1P 2A 3M 4A 5P 6M 7m", "hungarian major"],
  ["1P 2m 3M 4P 5d 6M 7m", "oriental"],
  ["1P 2m 3m 3M 4A 5P 7m", "flamenco"],
  ["1P 2m 3m 4A 5P 6m 7M", "todi raga"],
  ["1P 2m 3M 4P 5d 6m 7M", "persian"],
  ["1P 2m 3M 5d 6m 7m 7M", "enigmatic"],
  [
    "1P 2M 3M 4P 5A 6M 7M",
    "major augmented",
    "major #5",
    "ionian augmented",
    "ionian #5"
  ],
  ["1P 2A 3M 4A 5P 6M 7M", "lydian #9"],
  // 8-note scales
  ["1P 2m 2M 4P 4A 5P 6m 7M", "messiaen's mode #4"],
  ["1P 2m 3M 4P 4A 5P 6m 7M", "purvi raga"],
  ["1P 2m 3m 3M 4P 5P 6m 7m", "spanish heptatonic"],
  ["1P 2M 3m 3M 4P 5P 6M 7m", "bebop minor"],
  ["1P 2M 3M 4P 5P 5A 6M 7M", "bebop major"],
  ["1P 2m 3m 4P 5d 5P 6m 7m", "bebop locrian"],
  ["1P 2M 3m 4P 5P 6m 7m 7M", "minor bebop"],
  ["1P 2M 3M 4P 5d 5P 6M 7M", "ichikosucho"],
  ["1P 2M 3m 4P 5P 6m 6M 7M", "minor six diminished"],
  [
    "1P 2m 3m 3M 4A 5P 6M 7m",
    "half-whole diminished",
    "dominant diminished",
    "messiaen's mode #2"
  ],
  ["1P 3m 3M 4P 5P 6M 7m 7M", "kafi raga"],
  ["1P 2M 3M 4P 4A 5A 6A 7M", "messiaen's mode #6"],
  // 9-note scales
  ["1P 2M 3m 3M 4P 5d 5P 6M 7m", "composite blues"],
  ["1P 2M 3m 3M 4A 5P 6m 7m 7M", "messiaen's mode #3"],
  // 10-note scales
  ["1P 2m 2M 3m 4P 4A 5P 6m 6M 7M", "messiaen's mode #7"],
  // 12-note scales
  ["1P 2m 2M 3m 3M 4P 5d 5P 6m 6M 7m 7M", "chromatic"]
];
var data_default2 = SCALES;
var NoScaleType = {
  ...EmptyPcset,
  intervals: [],
  aliases: []
};
var dictionary2 = [];
var index2 = {};
function names() {
  return dictionary2.map((scale2) => scale2.name);
}
function get3(type) {
  return index2[type] || NoScaleType;
}
function all2() {
  return dictionary2.slice();
}
function add3(intervals, name2, aliases = []) {
  const scale2 = { ...get(intervals), name: name2, intervals, aliases };
  dictionary2.push(scale2);
  index2[scale2.name] = scale2;
  index2[scale2.setNum] = scale2;
  index2[scale2.chroma] = scale2;
  scale2.aliases.forEach((alias) => addAlias2(scale2, alias));
  return scale2;
}
function addAlias2(scale2, alias) {
  index2[alias] = scale2;
}
data_default2.forEach(
  ([ivls, name2, ...aliases]) => add3(ivls.split(" "), name2, aliases)
);

// ../../node_modules/.pnpm/@tonaljs+chord@6.1.2/node_modules/@tonaljs/chord/dist/index.mjs
var NoChord = {
  empty: true,
  name: "",
  symbol: "",
  root: "",
  bass: "",
  rootDegree: 0,
  type: "",
  tonic: null,
  setNum: NaN,
  quality: "Unknown",
  chroma: "",
  normalized: "",
  aliases: [],
  notes: [],
  intervals: []
};
function tokenize(name2) {
  const [letter, acc, oct, type] = tokenizeNote(name2);
  if (letter === "") {
    return tokenizeBass("", name2);
  } else if (letter === "A" && type === "ug") {
    return tokenizeBass("", "aug");
  } else {
    return tokenizeBass(letter + acc, oct + type);
  }
}
function tokenizeBass(note2, chord2) {
  const split = chord2.split("/");
  if (split.length === 1) {
    return [note2, split[0], ""];
  }
  const [letter, acc, oct, type] = tokenizeNote(split[1]);
  if (letter !== "" && oct === "" && type === "") {
    return [note2, split[0], letter + acc];
  } else {
    return [note2, chord2, ""];
  }
}
function get4(src) {
  if (Array.isArray(src)) {
    return getChord(src[1] || "", src[0], src[2]);
  } else if (src === "") {
    return NoChord;
  } else {
    const [tonic, type, bass] = tokenize(src);
    const chord2 = getChord(type, tonic, bass);
    return chord2.empty ? getChord(src) : chord2;
  }
}
function getChord(typeName, optionalTonic, optionalBass) {
  const type = get2(typeName);
  const tonic = note(optionalTonic || "");
  const bass = note(optionalBass || "");
  if (type.empty || optionalTonic && tonic.empty || optionalBass && bass.empty) {
    return NoChord;
  }
  const bassInterval = distance(tonic.pc, bass.pc);
  const bassIndex = type.intervals.indexOf(bassInterval);
  const hasRoot = bassIndex >= 0;
  const root = hasRoot ? bass : note("");
  const rootDegree = bassIndex === -1 ? NaN : bassIndex + 1;
  const hasBass = bass.pc && bass.pc !== tonic.pc;
  const intervals = Array.from(type.intervals);
  if (hasRoot) {
    for (let i = 1; i < rootDegree; i++) {
      const num = intervals[0][0];
      const quality = intervals[0][1];
      const newNum = parseInt(num, 10) + 7;
      intervals.push(`${newNum}${quality}`);
      intervals.shift();
    }
  } else if (hasBass) {
    const ivl = subtract(distance(tonic.pc, bass.pc), "8P");
    if (ivl) intervals.unshift(ivl);
  }
  const notes2 = tonic.empty ? [] : intervals.map((i) => transpose(tonic.pc, i));
  typeName = type.aliases.indexOf(typeName) !== -1 ? typeName : type.aliases[0];
  const symbol = `${tonic.empty ? "" : tonic.pc}${typeName}${hasRoot && rootDegree > 1 ? "/" + root.pc : hasBass ? "/" + bass.pc : ""}`;
  const name2 = `${optionalTonic ? tonic.pc + " " : ""}${type.name}${hasRoot && rootDegree > 1 ? " over " + root.pc : hasBass ? " over " + bass.pc : ""}`;
  return {
    ...type,
    name: name2,
    symbol,
    tonic: tonic.pc,
    type: type.name,
    root: root.pc,
    bass: hasBass ? bass.pc : "",
    intervals,
    rootDegree,
    notes: notes2
  };
}
var chord = get4;
function transpose2(chordName, interval2) {
  const [tonic, type, bass] = tokenize(chordName);
  if (!tonic) {
    return chordName;
  }
  const tr2 = transpose(bass, interval2);
  const slash = tr2 ? "/" + tr2 : "";
  return transpose(tonic, interval2) + type + slash;
}
function chordScales(name2) {
  const s = get4(name2);
  const isChordIncluded = isSupersetOf(s.chroma);
  return all2().filter((scale2) => isChordIncluded(scale2.chroma)).map((scale2) => scale2.name);
}
function extended(chordName) {
  const s = get4(chordName);
  const isSuperset = isSupersetOf(s.chroma);
  return all().filter((chord2) => isSuperset(chord2.chroma)).map((chord2) => s.tonic + chord2.aliases[0]);
}
function reduced(chordName) {
  const s = get4(chordName);
  const isSubset = isSubsetOf(s.chroma);
  return all().filter((chord2) => isSubset(chord2.chroma)).map((chord2) => s.tonic + chord2.aliases[0]);
}
function notes(chordName, tonic) {
  const chord2 = get4(chordName);
  const note2 = tonic || chord2.tonic;
  if (!note2 || chord2.empty) return [];
  return chord2.intervals.map((ivl) => transpose(note2, ivl));
}
function degrees(chordName, tonic) {
  const chord2 = get4(chordName);
  const note2 = tonic || chord2.tonic;
  const transpose22 = tonicIntervalsTransposer(chord2.intervals, note2);
  return (degree) => degree ? transpose22(degree > 0 ? degree - 1 : degree) : "";
}
function steps(chordName, tonic) {
  const chord2 = get4(chordName);
  const note2 = tonic || chord2.tonic;
  return tonicIntervalsTransposer(chord2.intervals, note2);
}
var index_default = {
  getChord,
  get: get4,
  detect,
  chordScales,
  extended,
  reduced,
  tokenize,
  transpose: transpose2,
  degrees,
  steps,
  notes,
  chord
};

// ../../node_modules/.pnpm/@tonaljs+duration-value@4.9.0/node_modules/@tonaljs/duration-value/dist/index.mjs
var DATA = [
  [
    0.125,
    "dl",
    ["large", "duplex longa", "maxima", "octuple", "octuple whole"]
  ],
  [0.25, "l", ["long", "longa"]],
  [0.5, "d", ["double whole", "double", "breve"]],
  [1, "w", ["whole", "semibreve"]],
  [2, "h", ["half", "minim"]],
  [4, "q", ["quarter", "crotchet"]],
  [8, "e", ["eighth", "quaver"]],
  [16, "s", ["sixteenth", "semiquaver"]],
  [32, "t", ["thirty-second", "demisemiquaver"]],
  [64, "sf", ["sixty-fourth", "hemidemisemiquaver"]],
  [128, "h", ["hundred twenty-eighth"]],
  [256, "th", ["two hundred fifty-sixth"]]
];
var data_default3 = DATA;
var VALUES = [];
data_default3.forEach(
  ([denominator, shorthand, names22]) => add4(denominator, shorthand, names22)
);
function add4(denominator, shorthand, names22) {
  VALUES.push({
    empty: false,
    dots: "",
    name: "",
    value: 1 / denominator,
    fraction: denominator < 1 ? [1 / denominator, 1] : [1, denominator],
    shorthand,
    names: names22
  });
}

// ../../node_modules/.pnpm/@tonaljs+note@4.12.1/node_modules/@tonaljs/note/dist/index.mjs
var dist_exports2 = {};
__export(dist_exports2, {
  accidentals: () => accidentals,
  ascending: () => ascending,
  chroma: () => chroma2,
  default: () => index_default2,
  descending: () => descending,
  distance: () => distance2,
  enharmonic: () => enharmonic,
  freq: () => freq,
  fromFreq: () => fromFreq,
  fromFreqSharps: () => fromFreqSharps,
  fromMidi: () => fromMidi,
  fromMidiSharps: () => fromMidiSharps,
  get: () => get5,
  midi: () => midi,
  name: () => name,
  names: () => names2,
  octave: () => octave,
  pitchClass: () => pitchClass,
  simplify: () => simplify,
  sortedNames: () => sortedNames,
  sortedUniqNames: () => sortedUniqNames,
  tr: () => tr,
  trBy: () => trBy,
  trFifths: () => trFifths,
  trFrom: () => trFrom,
  transpose: () => transpose3,
  transposeBy: () => transposeBy,
  transposeFifths: () => transposeFifths,
  transposeFrom: () => transposeFrom,
  transposeOctaves: () => transposeOctaves
});

// ../../node_modules/.pnpm/@tonaljs+midi@4.10.2/node_modules/@tonaljs/midi/dist/index.mjs
var L2 = Math.log(2);
var L440 = Math.log(440);
function freqToMidi(freq2) {
  const v = 12 * (Math.log(freq2) - L440) / L2 + 69;
  return Math.round(v * 100) / 100;
}
var SHARPS = "C C# D D# E F F# G G# A A# B".split(" ");
var FLATS = "C Db D Eb E F Gb G Ab A Bb B".split(" ");
function midiToNoteName(midi2, options = {}) {
  if (isNaN(midi2) || midi2 === -Infinity || midi2 === Infinity) return "";
  midi2 = Math.round(midi2);
  const pcs = options.sharps === true ? SHARPS : FLATS;
  const pc = pcs[midi2 % 12];
  if (options.pitchClass) {
    return pc;
  }
  const o = Math.floor(midi2 / 12) - 1;
  return pc + o;
}

// ../../node_modules/.pnpm/@tonaljs+note@4.12.1/node_modules/@tonaljs/note/dist/index.mjs
var NAMES = ["C", "D", "E", "F", "G", "A", "B"];
var toName = (n) => n.name;
var onlyNotes = (array) => array.map(note).filter((n) => !n.empty);
function names2(array) {
  if (array === void 0) {
    return NAMES.slice();
  } else if (!Array.isArray(array)) {
    return [];
  } else {
    return onlyNotes(array).map(toName);
  }
}
var get5 = note;
var name = (note2) => get5(note2).name;
var pitchClass = (note2) => get5(note2).pc;
var accidentals = (note2) => get5(note2).acc;
var octave = (note2) => get5(note2).oct;
var midi = (note2) => get5(note2).midi;
var freq = (note2) => get5(note2).freq;
var chroma2 = (note2) => get5(note2).chroma;
function fromMidi(midi2) {
  return midiToNoteName(midi2);
}
function fromFreq(freq2) {
  return midiToNoteName(freqToMidi(freq2));
}
function fromFreqSharps(freq2) {
  return midiToNoteName(freqToMidi(freq2), { sharps: true });
}
function fromMidiSharps(midi2) {
  return midiToNoteName(midi2, { sharps: true });
}
var distance2 = distance;
var transpose3 = transpose;
var tr = transpose;
var transposeBy = (interval2) => (note2) => transpose3(note2, interval2);
var trBy = transposeBy;
var transposeFrom = (note2) => (interval2) => transpose3(note2, interval2);
var trFrom = transposeFrom;
function transposeFifths(noteName, fifths) {
  return transpose3(noteName, [fifths, 0]);
}
var trFifths = transposeFifths;
function transposeOctaves(noteName, octaves) {
  return transpose3(noteName, [0, octaves]);
}
var ascending = (a, b) => a.height - b.height;
var descending = (a, b) => b.height - a.height;
function sortedNames(notes2, comparator) {
  comparator = comparator || ascending;
  return onlyNotes(notes2).sort(comparator).map(toName);
}
function sortedUniqNames(notes2) {
  return sortedNames(notes2, ascending).filter(
    (n, i, a) => i === 0 || n !== a[i - 1]
  );
}
var simplify = (noteName) => {
  const note2 = get5(noteName);
  if (note2.empty) {
    return "";
  }
  return midiToNoteName(note2.midi || note2.chroma, {
    sharps: note2.alt > 0,
    pitchClass: note2.midi === null
  });
};
function enharmonic(noteName, destName) {
  const src = get5(noteName);
  if (src.empty) {
    return "";
  }
  const dest = get5(
    destName || midiToNoteName(src.midi || src.chroma, {
      sharps: src.alt < 0,
      pitchClass: true
    })
  );
  if (dest.empty || dest.chroma !== src.chroma) {
    return "";
  }
  if (src.oct === void 0) {
    return dest.pc;
  }
  const srcChroma = src.chroma - src.alt;
  const destChroma = dest.chroma - dest.alt;
  const destOctOffset = srcChroma > 11 || destChroma < 0 ? -1 : srcChroma < 0 || destChroma > 11 ? 1 : 0;
  const destOct = src.oct + destOctOffset;
  return dest.pc + destOct;
}
var index_default2 = {
  names: names2,
  get: get5,
  name,
  pitchClass,
  accidentals,
  octave,
  midi,
  ascending,
  descending,
  distance: distance2,
  sortedNames,
  sortedUniqNames,
  fromMidi,
  fromMidiSharps,
  freq,
  fromFreq,
  fromFreqSharps,
  chroma: chroma2,
  transpose: transpose3,
  tr,
  transposeBy,
  trBy,
  transposeFrom,
  trFrom,
  transposeFifths,
  transposeOctaves,
  trFifths,
  simplify,
  enharmonic
};

// ../../node_modules/.pnpm/@tonaljs+roman-numeral@4.9.1/node_modules/@tonaljs/roman-numeral/dist/index.mjs
var NoRomanNumeral = { empty: true, name: "", chordType: "" };
var cache4 = {};
function get6(src) {
  return typeof src === "string" ? cache4[src] || (cache4[src] = parse3(src)) : typeof src === "number" ? get6(NAMES2[src] || "") : isPitch(src) ? fromPitch(src) : isNamedPitch(src) ? get6(src.name) : NoRomanNumeral;
}
function fromPitch(pitch2) {
  return get6(altToAcc(pitch2.alt) + NAMES2[pitch2.step]);
}
var REGEX4 = /^(#{1,}|b{1,}|x{1,}|)(IV|I{1,3}|VI{0,2}|iv|i{1,3}|vi{0,2})([^IViv]*)$/;
function tokenize2(str) {
  return REGEX4.exec(str) || ["", "", "", ""];
}
var ROMANS = "I II III IV V VI VII";
var NAMES2 = ROMANS.split(" ");
var NAMES_MINOR = ROMANS.toLowerCase().split(" ");
function parse3(src) {
  const [name2, acc, roman, chordType] = tokenize2(src);
  if (!roman) {
    return NoRomanNumeral;
  }
  const upperRoman = roman.toUpperCase();
  const step = NAMES2.indexOf(upperRoman);
  const alt = accToAlt(acc);
  const dir = 1;
  return {
    empty: false,
    name: name2,
    roman,
    interval: interval({ step, alt, dir }).name,
    acc,
    chordType,
    alt,
    step,
    major: roman === upperRoman,
    oct: 0,
    dir
  };
}

// ../../node_modules/.pnpm/@tonaljs+key@4.11.2/node_modules/@tonaljs/key/dist/index.mjs
var Empty = Object.freeze([]);
var NoKey = {
  type: "major",
  tonic: "",
  alteration: 0,
  keySignature: ""
};
var NoKeyScale = {
  tonic: "",
  grades: Empty,
  intervals: Empty,
  scale: Empty,
  triads: Empty,
  chords: Empty,
  chordsHarmonicFunction: Empty,
  chordScales: Empty,
  secondaryDominants: Empty,
  secondaryDominantSupertonics: Empty,
  substituteDominantsMinorRelative: Empty,
  substituteDominants: Empty,
  substituteDominantSupertonics: Empty,
  secondaryDominantsMinorRelative: Empty
};
var NoMajorKey = {
  ...NoKey,
  ...NoKeyScale,
  type: "major",
  minorRelative: "",
  scale: Empty,
  substituteDominants: Empty,
  secondaryDominantSupertonics: Empty,
  substituteDominantsMinorRelative: Empty
};
var NoMinorKey = {
  ...NoKey,
  type: "minor",
  relativeMajor: "",
  natural: NoKeyScale,
  harmonic: NoKeyScale,
  melodic: NoKeyScale
};
var mapScaleToType = (scale2, list, sep = "") => list.map((type, i) => `${scale2[i]}${sep}${type}`);
function keyScale(grades, triads3, chordTypes, harmonicFunctions, chordScales2) {
  return (tonic) => {
    const intervals = grades.map((gr) => get6(gr).interval || "");
    const scale2 = intervals.map((interval2) => transpose3(tonic, interval2));
    const chords2 = mapScaleToType(scale2, chordTypes);
    const secondaryDominants = scale2.map((note2) => transpose3(note2, "5P")).map(
      (note2) => (
        // A secondary dominant is a V chord which:
        // 1. is not diatonic to the key,
        // 2. it must have a diatonic root.
        scale2.includes(note2) && !chords2.includes(note2 + "7") ? note2 + "7" : ""
      )
    );
    const secondaryDominantSupertonics = supertonics(
      secondaryDominants,
      triads3
    );
    const substituteDominants = secondaryDominants.map((chord2) => {
      if (!chord2) return "";
      const domRoot = chord2.slice(0, -1);
      const subRoot = transpose3(domRoot, "5d");
      return subRoot + "7";
    });
    const substituteDominantSupertonics = supertonics(
      substituteDominants,
      triads3
    );
    return {
      tonic,
      grades,
      intervals,
      scale: scale2,
      triads: mapScaleToType(scale2, triads3),
      chords: chords2,
      chordsHarmonicFunction: harmonicFunctions.slice(),
      chordScales: mapScaleToType(scale2, chordScales2, " "),
      secondaryDominants,
      secondaryDominantSupertonics,
      substituteDominants,
      substituteDominantSupertonics,
      // @deprecated use secondaryDominantsSupertonic
      secondaryDominantsMinorRelative: secondaryDominantSupertonics,
      // @deprecated use secondaryDominantsSupertonic
      substituteDominantsMinorRelative: substituteDominantSupertonics
    };
  };
}
var supertonics = (dominants, targetTriads) => {
  return dominants.map((chord2, index4) => {
    if (!chord2) return "";
    const domRoot = chord2.slice(0, -1);
    const minorRoot = transpose3(domRoot, "5P");
    const target = targetTriads[index4];
    const isMinor = target.endsWith("m");
    return isMinor ? minorRoot + "m7" : minorRoot + "m7b5";
  });
};
var MajorScale = keyScale(
  "I II III IV V VI VII".split(" "),
  " m m   m dim".split(" "),
  "maj7 m7 m7 maj7 7 m7 m7b5".split(" "),
  "T SD T SD D T D".split(" "),
  "major,dorian,phrygian,lydian,mixolydian,minor,locrian".split(",")
);
var NaturalScale = keyScale(
  "I II bIII IV V bVI bVII".split(" "),
  "m dim  m m  ".split(" "),
  "m7 m7b5 maj7 m7 m7 maj7 7".split(" "),
  "T SD T SD D SD SD".split(" "),
  "minor,locrian,major,dorian,phrygian,lydian,mixolydian".split(",")
);
var HarmonicScale = keyScale(
  "I II bIII IV V bVI VII".split(" "),
  "m dim aug m   dim".split(" "),
  "mMaj7 m7b5 +maj7 m7 7 maj7 o7".split(" "),
  "T SD T SD D SD D".split(" "),
  "harmonic minor,locrian 6,major augmented,lydian diminished,phrygian dominant,lydian #9,ultralocrian".split(
    ","
  )
);
var MelodicScale = keyScale(
  "I II bIII IV V VI VII".split(" "),
  "m m aug   dim dim".split(" "),
  "m6 m7 +maj7 7 7 m7b5 m7b5".split(" "),
  "T SD T SD D  ".split(" "),
  "melodic minor,dorian b2,lydian augmented,lydian dominant,mixolydian b6,locrian #2,altered".split(
    ","
  )
);

// ../../node_modules/.pnpm/@tonaljs+mode@4.9.2/node_modules/@tonaljs/mode/dist/index.mjs
var MODES = [
  [0, 2773, 0, "ionian", "", "Maj7", "major"],
  [1, 2902, 2, "dorian", "m", "m7"],
  [2, 3418, 4, "phrygian", "m", "m7"],
  [3, 2741, -1, "lydian", "", "Maj7"],
  [4, 2774, 1, "mixolydian", "", "7"],
  [5, 2906, 3, "aeolian", "m", "m7", "minor"],
  [6, 3434, 5, "locrian", "dim", "m7b5"]
];
var NoMode = {
  ...EmptyPcset,
  name: "",
  alt: 0,
  modeNum: NaN,
  triad: "",
  seventh: "",
  aliases: []
};
var modes2 = MODES.map(toMode);
var index3 = {};
modes2.forEach((mode2) => {
  index3[mode2.name] = mode2;
  mode2.aliases.forEach((alias) => {
    index3[alias] = mode2;
  });
});
function get7(name2) {
  return typeof name2 === "string" ? index3[name2.toLowerCase()] || NoMode : name2 && name2.name ? get7(name2.name) : NoMode;
}
function toMode(mode2) {
  const [modeNum, setNum, alt, name2, triad, seventh, alias] = mode2;
  const aliases = alias ? [alias] : [];
  const chroma3 = Number(setNum).toString(2);
  const intervals = get3(name2).intervals;
  return {
    empty: false,
    intervals,
    modeNum,
    chroma: chroma3,
    normalized: chroma3,
    name: name2,
    setNum,
    alt,
    triad,
    seventh,
    aliases
  };
}
function chords(chords2) {
  return (modeName, tonic) => {
    const mode2 = get7(modeName);
    if (mode2.empty) return [];
    const triads22 = rotate(mode2.modeNum, chords2);
    const tonics = mode2.intervals.map((i) => transpose(tonic, i));
    return triads22.map((triad, i) => tonics[i] + triad);
  };
}
var triads = chords(MODES.map((x) => x[4]));
var seventhChords = chords(MODES.map((x) => x[5]));

// ../../node_modules/.pnpm/@tonaljs+scale@4.13.4/node_modules/@tonaljs/scale/dist/index.mjs
var dist_exports3 = {};
__export(dist_exports3, {
  default: () => index_default3,
  degrees: () => degrees2,
  detect: () => detect2,
  extended: () => extended2,
  get: () => get8,
  modeNames: () => modeNames,
  names: () => names3,
  rangeOf: () => rangeOf,
  reduced: () => reduced2,
  scale: () => scale,
  scaleChords: () => scaleChords,
  scaleNotes: () => scaleNotes,
  steps: () => steps2,
  tokenize: () => tokenize3
});
var NoScale = {
  empty: true,
  name: "",
  type: "",
  tonic: null,
  setNum: NaN,
  chroma: "",
  normalized: "",
  aliases: [],
  notes: [],
  intervals: []
};
function tokenize3(name2) {
  if (typeof name2 !== "string") {
    return ["", ""];
  }
  const i = name2.indexOf(" ");
  const tonic = note(name2.substring(0, i));
  if (tonic.empty) {
    const n = note(name2);
    return n.empty ? ["", name2.toLowerCase()] : [n.name, ""];
  }
  const type = name2.substring(tonic.name.length + 1).toLowerCase();
  return [tonic.name, type.length ? type : ""];
}
var names3 = names;
function get8(src) {
  const tokens = Array.isArray(src) ? src : tokenize3(src);
  const tonic = note(tokens[0]).name;
  const st = get3(tokens[1]);
  if (st.empty) {
    return NoScale;
  }
  const type = st.name;
  const notes2 = tonic ? st.intervals.map((i) => transpose(tonic, i)) : [];
  const name2 = tonic ? tonic + " " + type : type;
  return { ...st, name: name2, type, tonic, notes: notes2 };
}
var scale = get8;
function detect2(notes2, options = {}) {
  const notesChroma = chroma(notes2);
  const tonic = note(options.tonic ?? notes2[0] ?? "");
  const tonicChroma = tonic.chroma;
  if (tonicChroma === void 0) {
    return [];
  }
  const pitchClasses = notesChroma.split("");
  pitchClasses[tonicChroma] = "1";
  const scaleChroma = rotate(tonicChroma, pitchClasses).join("");
  const match = all2().find((scaleType) => scaleType.chroma === scaleChroma);
  const results = [];
  if (match) {
    results.push(tonic.name + " " + match.name);
  }
  if (options.match === "exact") {
    return results;
  }
  extended2(scaleChroma).forEach((scaleName) => {
    results.push(tonic.name + " " + scaleName);
  });
  return results;
}
function scaleChords(name2) {
  const s = get8(name2);
  const inScale = isSubsetOf(s.chroma);
  return all().filter((chord2) => inScale(chord2.chroma)).map((chord2) => chord2.aliases[0]);
}
function extended2(name2) {
  const chroma22 = isChroma(name2) ? name2 : get8(name2).chroma;
  const isSuperset = isSupersetOf(chroma22);
  return all2().filter((scale2) => isSuperset(scale2.chroma)).map((scale2) => scale2.name);
}
function reduced2(name2) {
  const isSubset = isSubsetOf(get8(name2).chroma);
  return all2().filter((scale2) => isSubset(scale2.chroma)).map((scale2) => scale2.name);
}
function scaleNotes(notes2) {
  const pcset = notes2.map((n) => note(n).pc).filter((x) => x);
  const tonic = pcset[0];
  const scale2 = sortedUniqNames(pcset);
  return rotate(scale2.indexOf(tonic), scale2);
}
function modeNames(name2) {
  const s = get8(name2);
  if (s.empty) {
    return [];
  }
  const tonics = s.tonic ? s.notes : s.intervals;
  return modes(s.chroma).map((chroma22, i) => {
    const modeName = get8(chroma22).name;
    return modeName ? [tonics[i], modeName] : ["", ""];
  }).filter((x) => x[0]);
}
function getNoteNameOf(scale2) {
  const names22 = Array.isArray(scale2) ? scaleNotes(scale2) : get8(scale2).notes;
  const chromas = names22.map((name2) => note(name2).chroma);
  return (noteOrMidi) => {
    const currNote = typeof noteOrMidi === "number" ? note(fromMidi(noteOrMidi)) : note(noteOrMidi);
    const height = currNote.height;
    if (height === void 0) return void 0;
    const chroma22 = height % 12;
    const position = chromas.indexOf(chroma22);
    if (position === -1) return void 0;
    return enharmonic(currNote.name, names22[position]);
  };
}
function rangeOf(scale2) {
  const getName = getNoteNameOf(scale2);
  return (fromNote, toNote) => {
    const from = note(fromNote).height;
    const to = note(toNote).height;
    if (from === void 0 || to === void 0) return [];
    return range(from, to).map(getName).filter((x) => x);
  };
}
function degrees2(scaleName) {
  const { intervals, tonic } = get8(scaleName);
  const transpose22 = tonicIntervalsTransposer(intervals, tonic);
  return (degree) => degree ? transpose22(degree > 0 ? degree - 1 : degree) : "";
}
function steps2(scaleName) {
  const { intervals, tonic } = get8(scaleName);
  return tonicIntervalsTransposer(intervals, tonic);
}
var index_default3 = {
  degrees: degrees2,
  detect: detect2,
  extended: extended2,
  get: get8,
  modeNames,
  names: names3,
  rangeOf,
  reduced: reduced2,
  scaleChords,
  scaleNotes,
  steps: steps2,
  tokenize: tokenize3,
  // deprecated
  scale
};

// ../../node_modules/.pnpm/@tonaljs+voice-leading@5.1.2/node_modules/@tonaljs/voice-leading/dist/index.mjs
var topNoteDiff = (voicings, lastVoicing) => {
  if (!lastVoicing || !lastVoicing.length) {
    return voicings[0];
  }
  const topNoteMidi = (voicing) => index_default2.midi(voicing[voicing.length - 1]) || 0;
  const diff = (voicing) => Math.abs(topNoteMidi(lastVoicing) - topNoteMidi(voicing));
  return voicings.sort((a, b) => diff(a) - diff(b))[0];
};
var index_default4 = {
  topNoteDiff
};

// ../../node_modules/.pnpm/@tonaljs+voicing-dictionary@5.1.3/node_modules/@tonaljs/voicing-dictionary/dist/index.mjs
var triads2 = {
  M: ["1P 3M 5P", "3M 5P 8P", "5P 8P 10M"],
  m: ["1P 3m 5P", "3m 5P 8P", "5P 8P 10m"],
  o: ["1P 3m 5d", "3m 5d 8P", "5d 8P 10m"],
  aug: ["1P 3M 5A", "3M 5A 8P", "5A 8P 10M"]
};
var lefthand = {
  m7: ["3m 5P 7m 9M", "7m 9M 10m 12P"],
  "7": ["3M 6M 7m 9M", "7m 9M 10M 13M"],
  "^7": ["3M 5P 7M 9M", "7M 9M 10M 12P"],
  "69": ["3M 5P 6A 9M"],
  m7b5: ["3m 5d 7m 8P", "7m 8P 10m 12d"],
  "7b9": ["3M 6m 7m 9m", "7m 9m 10M 13m"],
  // b9 / b13
  "7b13": ["3M 6m 7m 9m", "7m 9m 10M 13m"],
  // b9 / b13
  o7: ["1P 3m 5d 6M", "5d 6M 8P 10m"],
  "7#11": ["7m 9M 11A 13A"],
  "7#9": ["3M 7m 9A"],
  mM7: ["3m 5P 7M 9M", "7M 9M 10m 12P"],
  m6: ["3m 5P 6M 9M", "6M 9M 10m 12P"]
};
var all3 = {
  M: ["1P 3M 5P", "3M 5P 8P", "5P 8P 10M"],
  m: ["1P 3m 5P", "3m 5P 8P", "5P 8P 10m"],
  o: ["1P 3m 5d", "3m 5d 8P", "5d 8P 10m"],
  aug: ["1P 3M 5A", "3M 5A 8P", "5A 8P 10M"],
  m7: ["3m 5P 7m 9M", "7m 9M 10m 12P"],
  "7": ["3M 6M 7m 9M", "7m 9M 10M 13M"],
  "^7": ["3M 5P 7M 9M", "7M 9M 10M 12P"],
  "69": ["3M 5P 6A 9M"],
  m7b5: ["3m 5d 7m 8P", "7m 8P 10m 12d"],
  "7b9": ["3M 6m 7m 9m", "7m 9m 10M 13m"],
  // b9 / b13
  "7b13": ["3M 6m 7m 9m", "7m 9m 10M 13m"],
  // b9 / b13
  o7: ["1P 3m 5d 6M", "5d 6M 8P 10m"],
  "7#11": ["7m 9M 11A 13A"],
  "7#9": ["3M 7m 9A"],
  mM7: ["3m 5P 7M 9M", "7M 9M 10m 12P"],
  m6: ["3m 5P 6M 9M", "6M 9M 10m 12P"]
};
var defaultDictionary = lefthand;
function lookup(symbol, dictionary3 = defaultDictionary) {
  if (dictionary3[symbol]) {
    return dictionary3[symbol];
  }
  const { aliases } = index_default.get("C" + symbol);
  const match = Object.keys(dictionary3).find((_symbol) => aliases.includes(_symbol)) || "";
  if (match !== void 0) {
    return dictionary3[match];
  }
  return void 0;
}
var index_default5 = {
  lookup,
  lefthand,
  triads: triads2,
  all: all3,
  defaultDictionary
};

// ../../node_modules/.pnpm/@tonaljs+voicing@5.1.3/node_modules/@tonaljs/voicing/dist/index.mjs
var defaultDictionary2 = index_default5.all;
var defaultVoiceLeading = index_default4.topNoteDiff;

// ../../node_modules/.pnpm/@tonaljs+core@5.0.2/node_modules/@tonaljs/core/dist/index.mjs
function deprecate(original, alternative, fn) {
  return function(...args) {
    console.warn(`${original} is deprecated. Use ${alternative}.`);
    return fn.apply(this, args);
  };
}
var isNamed = deprecate("isNamed", "isNamedPitch", isNamedPitch);

// src/resolve/resolveScaleDegree.ts
function resolveScaleDegree(degree, scaleName, octave2 = 4) {
  const scale2 = dist_exports3.get(scaleName);
  if (!scale2.notes.length) {
    throw new Error(`Unrecognised scale: "${scaleName}"`);
  }
  const len = scale2.notes.length;
  const zeroIndex = ((degree - 1) % len + len) % len;
  const octaveOffset = Math.floor((degree - 1) / len);
  const pitchClass2 = scale2.notes[zeroIndex];
  const rootPitchClass = scale2.notes[0];
  const rootMidi = dist_exports2.midi(`${rootPitchClass}${String(octave2)}`);
  const candidateMidi = dist_exports2.midi(`${pitchClass2}${String(octave2)}`);
  const intraOctaveAdjust = candidateMidi < rootMidi ? 1 : 0;
  const finalOctave = octave2 + octaveOffset + intraOctaveAdjust;
  return `${pitchClass2}${String(finalOctave)}`;
}

// src/resolve/resolveChordDegree.ts
function resolveChordDegree(degree, chordName, octave2 = 4) {
  const chord2 = dist_exports.get(chordName);
  if (!chord2.notes.length) {
    throw new Error(`Unrecognised chord: "${chordName}"`);
  }
  const len = chord2.notes.length;
  const zeroIndex = ((degree - 1) % len + len) % len;
  const octaveOffset = Math.floor((degree - 1) / len);
  const pitchClass2 = chord2.notes[zeroIndex];
  const rootPitchClass = chord2.notes[0];
  const rootMidi = dist_exports2.midi(`${rootPitchClass}${String(octave2)}`);
  const candidateMidi = dist_exports2.midi(`${pitchClass2}${String(octave2)}`);
  const intraOctaveAdjust = candidateMidi < rootMidi ? 1 : 0;
  const finalOctave = octave2 + octaveOffset + intraOctaveAdjust;
  return `${pitchClass2}${String(finalOctave)}`;
}

// src/resolve/resolvePhrase.ts
function placeNearestOctave(pitchClass2, referenceMidi, strategy) {
  const refOctave = Math.floor(referenceMidi / 12) - 1;
  const candidates = [refOctave - 1, refOctave, refOctave + 1];
  let bestNote = `${pitchClass2}${String(refOctave)}`;
  let bestDist = Infinity;
  for (const oct of candidates) {
    const candidate = `${pitchClass2}${String(oct)}`;
    const midi2 = dist_exports2.midi(candidate);
    if (midi2 === null) continue;
    const dist = Math.abs(midi2 - referenceMidi);
    if (strategy === "nearest-below") {
      if (midi2 > referenceMidi) continue;
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
  const pitchClass2 = pool[zeroIndex];
  let resolvedNote;
  if (previousMidi === null) {
    const baseOctave = 4;
    const rootPitchClass = pool[0];
    const rootMidi = dist_exports2.midi(`${rootPitchClass}${String(baseOctave)}`);
    const candidateMidi = dist_exports2.midi(`${pitchClass2}${String(baseOctave)}`);
    const intraOctaveAdjust = candidateMidi < rootMidi ? 1 : 0;
    const finalOctave = baseOctave + octaveOffset + intraOctaveAdjust;
    resolvedNote = `${pitchClass2}${String(finalOctave)}`;
  } else {
    resolvedNote = placeNearestOctave(pitchClass2, previousMidi, strategy);
    if (octaveOffset !== 0) {
      const midi2 = dist_exports2.midi(resolvedNote);
      if (midi2 !== null) {
        resolvedNote = `${pitchClass2}${String(Math.floor(midi2 / 12) - 1 + octaveOffset)}`;
      }
    }
  }
  if (octaveDown) {
    const midi2 = dist_exports2.midi(resolvedNote);
    if (midi2 !== null) {
      resolvedNote = `${pitchClass2}${String(Math.floor(midi2 / 12) - 1 - 1)}`;
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
        previousMidi = dist_exports2.midi(theoretical);
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
    previousMidi = dist_exports2.midi(resolvedNote);
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
  const { key, chords: chords2 } = progression;
  const keyScale2 = dist_exports3.get(`${key} major`);
  if (!keyScale2.notes.length) {
    throw new Error(`Invalid key: "${key}"`);
  }
  const result = [];
  for (const { roman, duration } of chords2) {
    if (duration < 1) {
      throw new Error(`Invalid duration ${String(duration)} for Roman numeral "${roman}" \u2014 must be >= 1`);
    }
    const { degree, chordSuffix } = parseRoman(roman);
    const rootNote = keyScale2.notes[degree - 1];
    const modeName = DEGREE_MODE[degree];
    const chordName = `${rootNote}${chordSuffix}`;
    const scaleName = `${rootNote} ${modeName}`;
    const scaleNotes2 = dist_exports3.get(scaleName).notes;
    const chordTones = dist_exports.get(chordName).notes;
    if (!scaleNotes2.length) {
      throw new Error(`Cannot resolve scale "${scaleName}" for Roman numeral "${roman}"`);
    }
    if (!chordTones.length) {
      throw new Error(`Cannot resolve chord "${chordName}" for Roman numeral "${roman}"`);
    }
    const ctx = { key, roman, chord: chordName, scale: scaleNotes2, chordTones };
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
