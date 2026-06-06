/**
 * MIDI utility functions and constants for Bach generator
 */

export const KEY_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/**
 * Convert ticks to seconds given BPM and PPQ
 */
export function ticksToSeconds(ticks: number, bpm: number, ppq: number = 480): number {
  return (ticks / ppq) * (60 / bpm)
}

/**
 * Convert seconds to ticks
 */
export function secondsToTicks(seconds: number, bpm: number, ppq: number = 480): number {
  return (seconds * bpm / 60) * ppq
}

/**
 * Convert MIDI note number to note name (e.g., 60 -> "C4")
 */
export function midiToNoteName(midi: number): string {
  const note = NOTE_NAMES[midi % 12]
  const octave = Math.floor(midi / 12) - 1
  return `${note}${octave}`
}

/**
 * Convert MIDI note number to frequency in Hz
 */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

/**
 * Convert a VexFlow staff key (e.g. "c/5") plus optional accidental
 * ("#", "b", "n") to a MIDI note number. Returns null for invalid input.
 */
export function staffKeyToMidi(key: string, accidental?: string): number | null {
  const match = /^([a-g])([#b]?)\/(-?\d+)$/.exec(key.trim().toLowerCase())
  if (!match) return null
  const stepSemis: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }
  let semis = stepSemis[match[1]]
  const inlineAccidental = match[2]
  const applied = accidental ?? inlineAccidental
  if (applied === '#') semis += 1
  else if (applied === 'b') semis -= 1
  const octave = Number(match[3])
  const midi = (octave + 1) * 12 + semis
  return midi >= 0 && midi <= 127 ? midi : null
}

/**
 * Check if a MIDI note is a black key
 */
export function isBlackKey(midi: number): boolean {
  const pc = midi % 12
  return [1, 3, 6, 8, 10].includes(pc)
}
