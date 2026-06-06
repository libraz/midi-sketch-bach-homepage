/**
 * Shared types for the counterpoint staff example library.
 *
 * Each example is a small two-stave score with localized teaching text,
 * the validator rule IDs it illustrates, and overlay marks that highlight
 * the musical issue (or the allowed pattern) on the staff.
 */

export type StaffLocale = 'en' | 'ja'

/** Text provided in both site languages. */
export type LocalizedText = Record<StaffLocale, string>

/** A single note (or rest) on one staff. */
export interface StaffNote {
  /** VexFlow key, e.g. "c/5". Ignored for rests except for vertical placement. */
  key: string
  /** VexFlow duration: "w", "h", "q", "8" (default "q"). */
  duration?: string
  /** Render as a rest instead of a note. */
  rest?: boolean
  /** Accidental glyph, e.g. "#", "b", "n". */
  accidental?: string
  /** Notehead color override. */
  color?: string
  /** Short label drawn above the note (interval, function, etc.). */
  annotation?: string
  /** Draw the dashed issue ring around the notehead. */
  issue?: boolean
  /** Tie this note to the next note in the same voice (same pitch). */
  tie?: boolean
}

/** Overlay mark connecting or framing notes to explain the diagnosis. */
export interface IssueMark {
  kind: 'vertical' | 'motion' | 'note' | 'bracket'
  label: string
  upperIndex?: number
  middleIndex?: number
  lowerIndex?: number
  fromUpper?: number
  toUpper?: number
  fromMiddle?: number
  toMiddle?: number
  fromLower?: number
  toLower?: number
  /** Optional color override (defaults to the issue red). */
  color?: string
}

/** Complete definition of one staff example. */
export interface StaffExampleDef {
  /** Validator rule IDs this example illustrates (shown as chips). */
  ruleIds: string[]
  badge: LocalizedText
  title: LocalizedText
  /** One-line reading of what the overlay marks show. */
  diagnosis: LocalizedText
  /** Longer caption under the score. */
  caption: LocalizedText
  /** Time signature: "2/4", "3/4", or "4/4". */
  time: string
  /** Number of bars (default 1). Bars are separated by barlines. */
  bars?: number
  /**
   * Key signature (VexFlow spec such as "Cm" or "F"). When set, note keys
   * must be spelled with their sounding accidental (e.g. "bb/2") and the
   * `accidental` field is reserved for explicit glyphs such as naturals.
   */
  keySignature?: string
  /** Rendered width in CSS pixels. */
  width: number
  upperClef: 'treble' | 'bass'
  /** Clef for the optional middle stave (three-voice examples). */
  middleClef?: 'treble' | 'bass'
  lowerClef: 'treble' | 'bass'
  /** Optional stave label override (defaults to "upper"/"lower"). */
  upperLabel?: LocalizedText
  /** Optional stave label for the middle stave. */
  middleLabel?: LocalizedText
  /** Optional stave label override (defaults to "upper"/"lower"). */
  lowerLabel?: LocalizedText
  upper: StaffNote[]
  /** Optional middle voice rendered on its own stave between upper and lower. */
  middle?: StaffNote[]
  lower: StaffNote[]
  issues?: IssueMark[]
  /**
   * How the play button renders the example: both staves together
   * (real counterpoint, default) or one after the other (side-by-side
   * comparisons such as subject vs. answer).
   */
  playback?: 'together' | 'sequential'
  /**
   * What the example demonstrates: a violation (bad), an allowed
   * pattern (good), or a conditional/contextual case (caution).
   * Derived from the notehead colors when omitted — see exampleVerdict.
   */
  verdict?: StaffVerdict
}

/** Overall reading of one example, used for the badge and frame color. */
export type StaffVerdict = 'bad' | 'good' | 'caution' | 'neutral'

/** Issue highlight (forbidden / violation). */
export const RED = '#b91c1c'
/** Attention highlight (scoped or conditionally allowed). */
export const AMBER = '#b45309'
/** Positive highlight (correct resolution / allowed pattern). */
export const GREEN = '#047857'

/**
 * Verdict of an example: explicit `verdict` when declared, otherwise
 * derived from the notehead colors — a RED note marks a violation, a
 * GREEN note an allowed pattern, an AMBER-only example a contextual
 * case, and an uncolored example is neutral reference material.
 */
export function exampleVerdict(def: StaffExampleDef): StaffVerdict {
  if (def.verdict) return def.verdict
  const notes = [...def.upper, ...(def.middle ?? []), ...def.lower]
  if (notes.some((note) => note.color === RED)) return 'bad'
  if (notes.some((note) => note.color === GREEN)) return 'good'
  if (notes.some((note) => note.color === AMBER)) return 'caution'
  return 'neutral'
}

/** Default overlay-mark color for a verdict (issue marks without an explicit color). */
export function verdictColor(verdict: StaffVerdict): string {
  return verdict === 'good' ? GREEN : verdict === 'caution' ? AMBER : RED
}

/** Beats per bar from the example's time signature. */
export function beatsPerBar(time: string): number {
  const beats = Number(time.split('/')[0])
  return Number.isFinite(beats) && beats > 0 ? beats : 4
}

/** Duration of one note in beats (quarter = 1). */
export function durationBeats(duration?: string): number {
  switch (duration ?? 'q') {
    case 'w': return 4
    case 'h': return 2
    case '8': return 0.5
    case '16': return 0.25
    default: return 1
  }
}

/** Total beats covered by a sequence of notes. */
export function totalBeats(notes: StaffNote[]): number {
  return notes.reduce((sum, note) => sum + durationBeats(note.duration), 0)
}
