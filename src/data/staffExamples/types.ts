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
  /**
   * Duration: "w", "h", "q", "8", "16", "32" (default "q").
   * A trailing "d" makes it dotted ("8d" = dotted eighth).
   */
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

/** Fields a variant may replace on its base example. */
export type StaffVariantOverride = Partial<Pick<StaffExampleDef,
  'upper' | 'middle' | 'lower' |
  'upperLabel' | 'middleLabel' | 'lowerLabel' |
  'caption' | 'diagnosis' | 'issues' | 'width' |
  'time' | 'keySignature' | 'bars' |
  'upperClef' | 'middleClef' | 'lowerClef'
>>

/**
 * One switchable alternative for an example — e.g. which variation sounds
 * over an unchanging ground. The staff component renders a pill switcher
 * when an example declares variants.
 */
export interface StaffVariantDef {
  id: string
  /** Short label shown on the switcher pill. */
  label: LocalizedText
  /** Fields replacing the base example's while this variant is selected. */
  override: StaffVariantOverride
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
  /** Time signature: "2/4", "3/4", "4/4", or "6/8". */
  time: string
  /** Number of bars (default 1). Bars are separated by barlines. */
  bars?: number
  /**
   * Bars per system row. Defaults to all bars on one system; set it on
   * long excerpts so they wrap instead of scaling down to a thin strip.
   * Overlay marks must not span a system break.
   */
  systemBars?: number
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
  /**
   * Switchable alternatives for the example. The first entry is selected
   * by default; its override is usually empty (the base content).
   */
  variants?: StaffVariantDef[]
  /** Short italic lead-in shown before the variant pills (e.g. "over the same ground —"). */
  variantsHint?: LocalizedText
}

/** Overall reading of one example, used for the badge and frame color. */
export type StaffVerdict = 'bad' | 'good' | 'caution' | 'neutral'

/** The example with one variant's overrides applied (the base def when it has no variants). */
export function resolveStaffVariant(def: StaffExampleDef, variantId?: string): StaffExampleDef {
  const variant = def.variants?.find((v) => v.id === variantId) ?? def.variants?.[0]
  return variant ? { ...def, ...variant.override } : def
}

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

/** Quarter-note beats per bar from the example's time signature (6/8 → 3). */
export function beatsPerBar(time: string): number {
  const [numerator, denominator] = time.split('/').map(Number)
  if (!Number.isFinite(numerator) || numerator <= 0) return 4
  const unit = Number.isFinite(denominator) && denominator > 0 ? 4 / denominator : 1
  return numerator * unit
}

/** Duration of one note in beats (quarter = 1). A trailing "d" means dotted (×1.5). */
export function durationBeats(duration?: string): number {
  const value = duration ?? 'q'
  const dotted = value.endsWith('d')
  const base = (() => {
    switch (dotted ? value.slice(0, -1) : value) {
      case 'w': return 4
      case 'h': return 2
      case '8': return 0.5
      case '16': return 0.25
      case '32': return 0.125
      default: return 1
    }
  })()
  return dotted ? base * 1.5 : base
}

/** Total beats covered by a sequence of notes. */
export function totalBeats(notes: StaffNote[]): number {
  return notes.reduce((sum, note) => sum + durationBeats(note.duration), 0)
}
