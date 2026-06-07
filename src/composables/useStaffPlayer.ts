import { ref } from 'vue'
import { Soundfont } from 'smplr'
import type { StaffExampleDef, StaffNote } from '@/data/staffExamples/types'
import { durationBeats } from '@/data/staffExamples/types'
import { staffKeyToMidi } from '@/utils/midiUtils'

/**
 * Lightweight shared player for counterpoint staff examples.
 *
 * One AudioContext and one harpsichord instance are shared across all
 * CounterpointStaff components on a page; starting an example stops
 * whatever other example is sounding. While an example plays, the
 * per-note timing windows are exposed so the staff component can
 * highlight the sounding notes in real time.
 */

const BPM = 72
const SECONDS_PER_BEAT = 60 / BPM
/** Gap between the two staves in sequential playback. */
const SEQUENTIAL_GAP_SECONDS = 0.6
const VELOCITY = 92

let audioContext: AudioContext | null = null
let instrument: Soundfont | null = null
let loadPromise: Promise<Soundfont> | null = null
let stopTimer: ReturnType<typeof setTimeout> | null = null

// Stop functions returned by instrument.start() for every scheduled note.
// smplr queues notes beyond its lookahead window internally, and
// instrument.stop() only silences already-sounding voices — it does NOT
// clear that queue. Calling these cancels queued notes as well.
let noteStops: Array<(time?: number) => void> = []

const isLoading = ref(false)
/** Id of the example currently sounding (empty string when silent). */
const playingId = ref('')

/** Which stave a highlight window belongs to. */
export type VoicePart = 'upper' | 'middle' | 'lower'

/** Timing window of one written note, in seconds relative to `startTime`. */
export interface HighlightWindow {
  part: VoicePart
  /** Index into the example's note array for that part. */
  index: number
  start: number
  end: number
}

export interface PlaybackState {
  id: string
  /** AudioContext time at which beat 0 sounds. */
  startTime: number
  windows: HighlightWindow[]
}

/** Live playback timing, or null when silent. */
const playbackState = ref<PlaybackState | null>(null)

/** Current AudioContext clock (seconds); 0 when no context exists. */
function audioNow(): number {
  return audioContext?.currentTime ?? 0
}

async function loadInstrument(): Promise<Soundfont> {
  if (instrument) return instrument
  if (!loadPromise) {
    loadPromise = (async () => {
      if (!audioContext || audioContext.state === 'closed') {
        audioContext = new AudioContext()
      }
      const sf = await new Soundfont(audioContext, { instrument: 'harpsichord' }).load
      instrument = sf
      return sf
    })()
  }
  return loadPromise
}

interface ScheduledNote {
  midi: number
  startBeat: number
  beats: number
}

interface VoiceSchedule {
  /** Audio events with tied notes merged into single sounds. */
  audio: ScheduledNote[]
  /** One highlight window per written (non-rest) note. */
  windows: HighlightWindow[]
}

function scheduleVoice(notes: StaffNote[], part: VoicePart, offsetBeats: number): VoiceSchedule {
  const audio: ScheduledNote[] = []
  const windows: HighlightWindow[] = []
  let beat = offsetBeats
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i]
    const beats = durationBeats(note.duration)
    if (!note.rest) {
      const midi = staffKeyToMidi(note.key, note.accidental)
      if (midi !== null) {
        // Merge a tie chain into one audio event spanning all tied notes.
        let totalBeats = beats
        let j = i
        let chainBeat = beat + beats
        while (notes[j]?.tie && notes[j + 1] && !notes[j + 1].rest) {
          const nextBeats = durationBeats(notes[j + 1].duration)
          windows.push({
            part,
            index: j + 1,
            start: chainBeat * SECONDS_PER_BEAT,
            end: (chainBeat + nextBeats) * SECONDS_PER_BEAT,
          })
          totalBeats += nextBeats
          chainBeat += nextBeats
          j++
        }
        audio.push({ midi, startBeat: beat, beats: totalBeats })
        windows.push({
          part,
          index: i,
          start: beat * SECONDS_PER_BEAT,
          end: (beat + beats) * SECONDS_PER_BEAT,
        })
        beat += totalBeats
        i = j
        continue
      }
    }
    beat += beats
  }
  return { audio, windows }
}

export function useStaffPlayer() {
  function stop() {
    playingId.value = ''
    playbackState.value = null
    if (stopTimer) {
      clearTimeout(stopTimer)
      stopTimer = null
    }
    for (const stopNote of noteStops) {
      try {
        stopNote()
      } catch {
        // Ignore: the note may already have ended.
      }
    }
    noteStops = []
    if (instrument) {
      try {
        instrument.stop()
      } catch {
        // Ignore: the instrument may already be silent.
      }
    }
  }

  async function play(id: string, example: StaffExampleDef) {
    // Toggle off when the same example is already sounding.
    if (playingId.value === id) {
      stop()
      return
    }
    stop()

    // Create/resume the AudioContext inside the user gesture.
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContext()
      instrument = null
      loadPromise = null
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    isLoading.value = true
    let sf: Soundfont
    try {
      sf = await loadInstrument()
    } finally {
      isLoading.value = false
    }

    // Sequential playback chains the voices: upper, then middle (when
    // present), then lower, with a short gap between entries.
    const sequential = example.playback === 'sequential'
    const gapBeats = SEQUENTIAL_GAP_SECONDS / SECONDS_PER_BEAT
    const endBeat = (voice: VoiceSchedule) =>
      voice.audio.reduce((max, n) => Math.max(max, n.startBeat + n.beats), 0)
    const upper = scheduleVoice(example.upper, 'upper', 0)
    const middle = example.middle
      ? scheduleVoice(example.middle, 'middle', sequential ? endBeat(upper) + gapBeats : 0)
      : null
    const lowerOffset = sequential ? endBeat(middle ?? upper) + gapBeats : 0
    const lower = scheduleVoice(example.lower, 'lower', lowerOffset)
    const all = [...upper.audio, ...(middle?.audio ?? []), ...lower.audio]
    if (all.length === 0) return

    const now = audioContext.currentTime + 0.05
    for (const note of all) {
      noteStops.push(sf.start({
        note: note.midi,
        velocity: VELOCITY,
        time: now + note.startBeat * SECONDS_PER_BEAT,
        duration: note.beats * SECONDS_PER_BEAT * 0.95,
      }))
    }

    playingId.value = id
    playbackState.value = {
      id,
      startTime: now,
      windows: [...upper.windows, ...(middle?.windows ?? []), ...lower.windows],
    }
    const totalBeats = all.reduce((max, n) => Math.max(max, n.startBeat + n.beats), 0)
    stopTimer = setTimeout(() => {
      if (playingId.value === id) stop()
    }, totalBeats * SECONDS_PER_BEAT * 1000 + 400)
  }

  return { play, stop, isLoading, playingId, playbackState, audioNow }
}
