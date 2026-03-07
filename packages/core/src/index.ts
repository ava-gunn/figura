export type {
  FigureType,
  FigureToken,
  RhythmToken,
  ResolvedEvent,
  ResolvedFigure,
  HarmonyContext,
  Progression,
  ResolveOptions,
  PositionTrace,
} from "./types/index.js"

export { parseFigure }   from "./dsl/parseFigure.js"
export { parseRhythm }   from "./dsl/parseRhythm.js"
export { resolveScaleDegree } from "./resolve/resolveScaleDegree.js"
export { resolveChordDegree } from "./resolve/resolveChordDegree.js"
export { resolvePhrase }      from "./resolve/resolvePhrase.js"
