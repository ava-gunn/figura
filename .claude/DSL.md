# DSL Specification

Two parallel string DSLs that compose together. Both are space-separated
token strings. They are zipped by position to produce resolved events.

## Figure DSL

Encodes **what** to play (symbolic pitch).

### Grammar

```
figure     := token (WS+ token)*
token      := rest | note
rest       := "~"
note       := DEGREE modifier*
DEGREE     := "1" | "2" | "3" | "4" | "5" | "6" | "7"
modifier   := anchor | octave_down
anchor     := "*"
octave_down := "-"
WS         := " " | "\t"
```

### Tokens

| Token   | Meaning                                      |
| ------- | -------------------------------------------- |
| `1`–`7` | Scale or chord degree (context-dependent)    |
| `*`     | Anchor — most important note, resolved first |
| `-`     | Octave down — drop resolved pitch one octave |

Modifiers may appear in any order: `1*-` and `1-*` are equivalent.

### Examples

```
"1* 3 5 3 2* 1 7- 1*"   — reference phrase from design session
"1*- 5 1 3 5 3"          — bass-style, low root anchor
"3* 2 1 7- 1*"           — descending phrase
```

## Rhythm DSL

Encodes **when** and **how** to play (temporal articulation).

### Grammar

```
rhythm := token (WS+ token)*
token  := "1" | "_" | "." | "~" | "!"
WS     := " " | "\t"
```

### Tokens

| Token | Meaning                              | Strudel encoding            |
| ----- | ------------------------------------ | --------------------------- |
| `1`   | Play normally                        | `t` in struct               |
| `_`   | Tie — sustain previous, no retrigger | `_` appended to note name   |
| `.`   | Staccato — half duration             | `/2` appended to note name  |
| `~`   | Rest — silence                       | `~` in notes, `f` in struct |
| `!`   | Accent — higher velocity             | `1.0` in velocity pattern   |

**Note:** Strudel uses `~` for rests. Our DSL also uses `~` for rests.
Our DSL uses `_` for ties. Strudel uses `_` appended to note names for ties.
These are compatible — parsers translate between them.

### Examples

```
"1 _ 1 . ~ ! 1 _"   — reference rhythm from design session
"1 1 1 1"             — four equal hits
". 1 ! ~ 1 _ 1 ."    — mixed articulations
```

## Zipping Figure + Rhythm

Figure and rhythm are zipped by position. If lengths differ, they cycle:

```
figure: 1*  3   5           (length 3)
rhythm: 1   _   .   ~       (length 4)
result: 12 events (LCM of 3 and 4)
```

## Full Example (from design session)

```
Key:    C
Chords: iim7        V7          IM7
Figure: 1*  3  5  3  2*  1  7-  1*
Rhythm: 1   _  1  .  ~   !  1   _
```

Resolves to:

```
Pos | Figure | Rhythm | Chord  | Resolved | Output
----|--------|--------|--------|----------|--------
1   | 1*     | 1      | Dm7    | D4       | D4
2   | 3      | _      | Dm7    | F4       | D4_ (sustain)
3   | 5      | 1      | Dm7    | A4       | A4
4   | 3      | .      | G7     | B4       | B4/2 (staccato)
5   | 2*     | ~      | G7     | —        | ~ (rest wins over anchor)
6   | 1      | !      | G7     | G4       | G4 (accented)
7   | 7-     | 1      | Cmaj7  | B3       | B3 (octave down)
8   | 1*     | _      | Cmaj7  | C4       | B3_ (sustain, C4 never triggers)
```

Strudel output:

```javascript
note('D4 D4_ A4 B4/2 ~ G4 B3 B3_')
  .struct('t f t t f t t f')
  .velocity('0.8 0.8 0.8 0.8 0 1 0.8 0.8')
  .sound('piano')
```

## Chord at position 4

Note that figure degree 3 resolves to B4 at position 4 (not F4) because
the chord has changed from Dm7 to G7. Same degree, different chord, different
absolute pitch. This is the harmony engine working correctly.
