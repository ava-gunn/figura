/**
 * Determines which pitch space degree numbers index into:
 * - "melody"  → scale tones (7 degrees, diatonic to active chord's scale)
 * - "chord"   → chord tones only (4 degrees for 7th chords)
 * - "bass"    → root-relative, always monophonic, low register
 */
type FigureType = "melody" | "chord" | "bass";
/**
 * A single parsed token from the figure DSL string.
 * Discriminated union: rest tokens have no degree/modifier fields.
 *
 * e.g. "1*-" → { rest: false, degree: 1, anchor: true, octaveDown: true }
 * e.g. "~"   → { rest: true }
 */
type FigureToken = {
    rest: false;
    degree: number;
    anchor: boolean;
    octaveDown: boolean;
} | {
    rest: true;
};
/**
 * A single parsed token from the rhythm DSL string.
 *
 * DSL chars:
 *   1  = play normally
 *   _  = tie (sustain previous note, no retrigger)
 *   .  = staccato (half duration → Strudel /2)
 *   ~  = rest
 *   !  = accent (higher velocity)
 */
type RhythmToken = {
    play: boolean;
    tie: boolean;
    accent: boolean;
    staccato: boolean;
};
/**
 * The full harmonic context passed to the resolver at evaluation time.
 * Represents one "slot" in the harmony timeline.
 * One HarmonyContext per output position — expandProgression() handles expansion.
 */
type HarmonyContext = {
    key: string;
    roman: string;
    chord: string;
    scale: string[];
    chordTones: string[];
};
/**
 * User-friendly progression format.
 * expandProgression() converts this to HarmonyContext[] (one per output position).
 */
type Progression = {
    key: string;
    chords: {
        roman: string;
        duration: number;
    }[];
};
/**
 * A single resolved musical event — the output of combining one FigureToken
 * with one RhythmToken against an active chord/scale context.
 */
type ResolvedEvent = {
    note: string;
    degree: number;
    anchor: boolean;
    duration: number;
    velocity: number;
    tie: boolean;
};
/**
 * The fully resolved output of a figure+rhythm pair against a harmony context.
 * Contains type and events only — Strudel strings are produced by toMiniNotation().
 */
type ResolvedFigure = {
    type: FigureType;
    events: ResolvedEvent[];
};
/**
 * Per-position trace output for debug mode.
 */
type PositionTrace = {
    position: number;
    figureToken: FigureToken;
    rhythmToken: RhythmToken;
    harmony: HarmonyContext;
    pitchPool: string[];
    resolvedNote: string | null;
};
/**
 * Options bag for resolvePhrase.
 * debug: true logs to console; callback captures traces programmatically.
 */
type ResolveOptions = {
    type: FigureType;
    debug?: boolean | ((trace: PositionTrace) => void);
};

/**
 * Parses a figure DSL string into an array of FigureTokens.
 *
 * ## DSL Syntax
 * Tokens are space-separated. Each token is a degree (1–7) with optional modifiers:
 *
 *   `*`  anchor     — the most important note; resolved against the strongest
 *                     chord tone first, all other notes fit around it
 *   `-`  octaveDown — drop the resolved pitch one octave
 *
 * Modifiers may appear in any order after the degree digit.
 *
 * ## Figure Type affects resolution (not parsing)
 * The same figure string is interpreted differently depending on FigureType:
 *   - "melody" → degrees index the active chord's scale (7 tones)
 *   - "chord"  → degrees index chord tones only (4 tones for 7th chords)
 *   - "bass"   → degrees index chord tones, forced to low register
 *
 * ## Examples
 * ```
 * "1* 3 5 3 2* 1"      simple melodic phrase, anchors on 1 and 2
 * "1*- 5 1 3"          bass figure, low root anchor
 * "1* 3- 5 7"          chord figure with low third
 * ```
 *
 * @throws if input is empty
 * @throws if a degree is not in range 1–7
 * @throws if a token contains unrecognised characters
 */
declare function parseFigure(input: string): FigureToken[];

/**
 * Parses a rhythm DSL string into an array of RhythmTokens.
 *
 * ## DSL Syntax
 * Tokens are space-separated single characters:
 *
 *   `1`  play     — trigger the note at normal duration and velocity
 *   `_`  tie      — sustain the previous note (no retrigger)
 *                   → Strudel: appended `_` to previous note name e.g. "D4_"
 *   `.`  staccato — play at half duration
 *                   → Strudel: appended `/2` to note name e.g. "B4/2"
 *   `~`  rest     — silence
 *                   → Strudel: `~` in mini-notation
 *   `!`  accent   — play at higher velocity (1.0 vs default 0.8)
 *                   → Strudel: `.velocity()` parallel pattern
 *
 * ## Strudel mapping
 * Ties and staccato are encoded inline in the note string.
 * Play/rest is encoded as the `.struct()` pattern ("t"/"f").
 * Accent is encoded as the `.velocity()` pattern.
 *
 * ## Examples
 * ```
 * "1 _ 1 . ~ ! 1 _"
 * "1 1 1 1"          four equal hits
 * ". 1 ! ~ 1 _ 1 ."  mixed articulations
 * ```
 *
 * @throws if input is empty
 * @throws if a token is not one of: 1 _ . ~ !
 */
declare function parseRhythm(input: string): RhythmToken[];

/**
 * Resolves a scale degree to an absolute note name given a scale and octave.
 * Used by the "melody" figure type resolver.
 *
 * Degrees index into the diatonic scale tones of the active chord's scale.
 * Degree 1 = root/tonic, degree 7 = leading tone.
 *
 * Degrees beyond the scale size wrap modulo the pool size, cycling into
 * higher octaves. Zero and negative degrees wrap into lower octaves.
 * The resolver never throws on degree values — always produces music.
 *
 * Scale tones are placed in ascending order from the root: if a pitch class
 * is lower than the root (e.g. C in D dorian), it goes in the next octave.
 *
 * @throws if scaleName is not recognised by tonal
 */
declare function resolveScaleDegree(degree: number, scaleName: string, octave?: number): string;

/**
 * Resolves a chord degree to an absolute note name given a chord and octave.
 * Used by the "chord" and "bass" figure type resolvers.
 *
 * Degrees index into chord tones only — not the full scale.
 * For a 7th chord: 1=root, 2=third, 3=fifth, 4=seventh.
 * Degrees beyond the chord tone count wrap around (modulo), cycling into
 * higher octaves. Zero and negative degrees wrap into lower octaves.
 * The resolver never throws on degree values — always produces music.
 *
 * Chord tones are placed in ascending order from the root: if a pitch class
 * is lower than the root (e.g. C in Dm7), it goes in the next octave.
 *
 * ## Difference from resolveScaleDegree
 * resolveScaleDegree uses all 7 diatonic scale tones.
 * resolveChordDegree uses only the chord tones (typically 3-4).
 * This means degree 2 resolves differently:
 *   - scale: degree 2 over Dm7 = E (second scale tone)
 *   - chord: degree 2 over Dm7 = F (third of the chord)
 *
 * ## Examples
 * ```
 * resolveChordDegree(1, "Dm7", 4)   // → "D4"  (root)
 * resolveChordDegree(2, "Dm7", 4)   // → "F4"  (third)
 * resolveChordDegree(3, "Dm7", 4)   // → "A4"  (fifth)
 * resolveChordDegree(4, "Dm7", 4)   // → "C5"  (seventh)
 * resolveChordDegree(1, "G7",  4)   // → "G4"
 * resolveChordDegree(2, "G7",  4)   // → "B4"
 * ```
 *
 * @throws if chordName is not recognised by tonal
 */
declare function resolveChordDegree(degree: number, chordName: string, octave?: number): string;

/**
 * The core resolution function — the heart of the figura algebra.
 *
 * Combines a parsed figure, a parsed rhythm, and a harmony context into
 * a fully resolved sequence of musical events. Single-pass left-to-right
 * resolution with voice leading.
 *
 * Context can be a single HarmonyContext (applied to all positions) or
 * an array (one per output position).
 */
declare function resolvePhrase(figure: FigureToken[], rhythm: RhythmToken[] | undefined, context: HarmonyContext | HarmonyContext[], options: FigureType | ResolveOptions): ResolvedFigure;

declare function expandProgression(progression: Progression): HarmonyContext[];

export { type FigureToken, type FigureType, type HarmonyContext, type PositionTrace, type Progression, type ResolveOptions, type ResolvedEvent, type ResolvedFigure, type RhythmToken, expandProgression, parseFigure, parseRhythm, resolveChordDegree, resolvePhrase, resolveScaleDegree };
