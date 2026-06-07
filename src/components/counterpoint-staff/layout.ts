/**
 * Geometry shared by the two renderers of a counterpoint staff example —
 * the static SVG fallback and the VexFlow engraving. These are pure
 * functions over an example's notes and time signature; both renderers
 * resolve note positions through the same beat math so the static fallback
 * and the hydrated score line up.
 */
import type { StaffNote } from '@/data/staffExamples'
import { durationBeats } from '@/data/staffExamples'
import type { VoicePart } from '@/composables/useStaffPlayer'

export type Clef = 'treble' | 'bass'

/** One stave the example renders: a voice with its notes, clef and label. */
export interface PartDef {
  part: VoicePart
  notes: StaffNote[]
  clef: Clef
  label: string
}

/** One system row's slice of a voice: its notes plus their global start index. */
export interface SystemSegment {
  startIndex: number
  notes: StaffNote[]
}

/** Per-part position accessors used by the shared overlay builder. */
export interface PartPositions {
  x: (index: number) => number
  y: (index: number) => number
}

export type Positions = Partial<Record<VoicePart, PartPositions>>

/** Left edge of every stave (clef/brace block sits to its left). */
export const STATIC_LEFT = 78

/** How many system rows an example wraps onto (long excerpts set `systemBars`). */
export function systemCount(bars: number, systemBars?: number): number {
  return systemBars ? Math.max(1, Math.ceil(bars / systemBars)) : 1
}

/** Vertical distance between the tops of consecutive system rows. */
export function systemStride(staveCount: number): number {
  return staveCount === 3 ? 330 : 230
}

/** Total figure height for the given stave and system counts. */
export function staffHeight(staveCount: number, systems: number): number {
  return (staveCount === 3 ? 335 : 235) + (systems - 1) * systemStride(staveCount)
}

/** Cumulative start beat for every note of a voice. */
export function startBeats(notes: StaffNote[]): number[] {
  const out: number[] = []
  let beat = 0
  for (const note of notes) {
    out.push(beat)
    beat += durationBeats(note.duration)
  }
  return out
}

/** Split a voice into per-system segments. Segments begin at bar boundaries. */
export function splitIntoSystems(notes: StaffNote[], beatsPerSystem: number, systems: number): SystemSegment[] {
  const segments: SystemSegment[] = Array.from({ length: systems }, () => ({ startIndex: 0, notes: [] }))
  let beat = 0
  notes.forEach((note, index) => {
    const sys = Math.min(Math.floor(beat / beatsPerSystem + 1e-6), systems - 1)
    if (segments[sys].notes.length === 0) segments[sys].startIndex = index
    segments[sys].notes.push(note)
    beat += durationBeats(note.duration)
  })
  return segments
}

/** Static-fallback stave tops: 46/146 for two staves, 46/146/246 for three. */
export function staticTops(count: number): number[] {
  return count === 3 ? [46, 146, 246] : [46, 146]
}

/** Vertical pixel position of a VexFlow key ("c/5") within a stave. */
export function pitchY(key: string, clef: Clef, staffTop: number): number {
  const [name, octaveText] = key.split('/')
  const octave = Number(octaveText)
  const stepMap: Record<string, number> = { c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6 }
  const step = (stepMap[name?.[0]?.toLowerCase()] ?? 0) + octave * 7
  const baseStep = clef === 'bass' ? stepMap.g + 2 * 7 : stepMap.e + 4 * 7
  return staffTop + 40 - (step - baseStep) * 5
}
