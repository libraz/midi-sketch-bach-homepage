/** Note collection and view-window math for the piano roll. */
import type { EventData, NoteEvent } from '@/wasm/index'
import { PPQ } from './constants'

/** Collect all notes from all tracks into a flat array, voice info preserved. */
export function collectAllNotes(eventData: EventData): NoteEvent[] {
  const notes: NoteEvent[] = []
  for (const track of eventData.tracks) {
    for (const note of track.notes) {
      notes.push(note)
    }
  }
  return notes
}

/** Min/max pitch across the notes, padded by `padding` semitones each side. */
export function pitchRange(notes: NoteEvent[], padding: number): { minPitch: number; maxPitch: number } {
  let minPitch = Infinity
  let maxPitch = -Infinity
  for (const note of notes) {
    if (note.pitch < minPitch) minPitch = note.pitch
    if (note.pitch > maxPitch) maxPitch = note.pitch
  }
  return { minPitch: minPitch - padding, maxPitch: maxPitch + padding }
}

/**
 * Visible tick window around a reference tick. With no reference (refTick <= 0)
 * the whole piece is shown; otherwise an 8-bar window is centered with the
 * reference at ~25% from the left, clamped to the piece bounds.
 */
export function getVisibleTickRange(refTick: number, totalTicks: number): { startTick: number; endTick: number } {
  if (refTick <= 0) {
    // Never played or reset — show all notes
    return { startTick: 0, endTick: totalTicks }
  }

  // Windowed view: reference tick at ~25% from left
  const barsVisible = 8
  const ticksPerBar = PPQ * 4 // 4/4 time
  const windowTicks = barsVisible * ticksPerBar

  const playheadRatio = 0.25
  let startTick = refTick - windowTicks * playheadRatio
  let endTick = refTick + windowTicks * (1 - playheadRatio)

  // Clamp to valid range
  if (startTick < 0) {
    endTick -= startTick
    startTick = 0
  }
  if (endTick > totalTicks) {
    startTick -= (endTick - totalTicks)
    endTick = totalTicks
    if (startTick < 0) startTick = 0
  }

  return { startTick, endTick }
}
