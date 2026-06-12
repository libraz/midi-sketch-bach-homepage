import { ref, onUnmounted } from 'vue'
import { Soundfont } from 'smplr'
import { createAudioContext } from '@/utils/webAudio'

interface NoteEvent {
  pitch: number
  velocity: number
  start_tick: number
  duration: number
  voice: number
}

interface TrackData {
  name: string
  channel: number
  program: number
  notes: NoteEvent[]
}

interface EventData {
  bpm: number
  total_ticks: number
  tracks: TrackData[]
}

// Instrument name mapping for smplr Soundfont
const INSTRUMENT_MAP: Record<string, string> = {
  organ: 'church_organ',
  harpsichord: 'harpsichord',
  piano: 'acoustic_grand_piano',
  violin: 'violin',
  cello: 'cello',
  guitar: 'acoustic_guitar_nylon',
}

let audioContext: AudioContext | null = null
let instrumentCache = new Map<string, Soundfont>()
let initPromise: Promise<void> | null = null

const globalIsLoading = ref(false)
const globalIsReady = ref(false)

const PPQ = 480

export function useBachPlayer() {
  const isPlaying = ref(false)
  const isPaused = ref(false)
  const currentTick = ref(0)
  const duration = ref(0)

  let animationFrame: number | null = null
  let startTime = 0
  let pausedTick = 0
  let bpm = 100
  let stopTimeout: ReturnType<typeof setTimeout> | null = null
  let cachedEventData: EventData | null = null
  let currentInstrumentName = 'church_organ'

  // Stop functions returned by instrument.start() for every scheduled note.
  // smplr queues notes beyond its lookahead window internally, and
  // instrument.stop() only silences already-sounding voices — it does NOT
  // clear that queue. Calling these cancels queued notes as well.
  let noteStops: Array<(time?: number) => void> = []

  /** Cancel all scheduled-but-not-yet-played notes and stop sounding ones. */
  function cancelScheduledNotes() {
    for (const stopNote of noteStops) {
      try { stopNote() } catch { /* ignore */ }
    }
    noteStops = []
  }

  // Generation counter to prevent stale animation loops from interfering
  // when play() is called while a previous play's updatePosition is running.
  let playGeneration = 0

  function ticksToSeconds(ticks: number): number {
    return (ticks / PPQ) * (60 / bpm)
  }

  function secondsToTicks(seconds: number): number {
    return (seconds * bpm / 60) * PPQ
  }

  async function loadInstrument(name: string): Promise<Soundfont> {
    if (!audioContext) {
      audioContext = createAudioContext()
    }

    const sfName = INSTRUMENT_MAP[name] || name
    if (instrumentCache.has(sfName)) {
      return instrumentCache.get(sfName)!
    }

    const sf = await new Soundfont(audioContext, { instrument: sfName as any }).load
    instrumentCache.set(sfName, sf)
    return sf
  }

  async function init(instrumentName: string = 'organ') {
    if (globalIsReady.value && instrumentCache.has(INSTRUMENT_MAP[instrumentName] || instrumentName)) {
      return
    }

    if (initPromise) {
      await initPromise
      return
    }

    globalIsLoading.value = true
    globalIsReady.value = false

    initPromise = (async () => {
      try {
        if (!audioContext) {
          audioContext = createAudioContext()
        }
        await loadInstrument(instrumentName)
        currentInstrumentName = instrumentName
        globalIsReady.value = true
      } finally {
        globalIsLoading.value = false
        initPromise = null
      }
    })()

    await initPromise
  }

  /**
   * Ensure AudioContext exists and is running.
   * Call this early in user gesture handlers (before any awaits)
   * so the browser allows audio playback.
   */
  async function ensureAudioContext() {
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = createAudioContext()
      instrumentCache.clear()
      globalIsReady.value = false
    }
    // iOS Safari reports a non-standard 'interrupted' state after phone
    // calls or app switches, so resume on anything that is not running.
    if (audioContext.state !== 'running') {
      await audioContext.resume()
    }
  }

  async function play(eventData: EventData, fromTick: number = 0, instrumentName?: string) {
    // Increment generation counter so any stale updatePosition loop
    // from a previous play() will see the mismatch and exit.
    const thisGen = ++playGeneration

    // Cancel pending timers from previous playback (if any remain)
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
    if (stopTimeout) {
      clearTimeout(stopTimeout)
      stopTimeout = null
    }

    // Stop any lingering notes from the previous cycle
    cancelScheduledNotes()
    for (const [, instrument] of instrumentCache) {
      try { instrument.stop() } catch { /* ignore */ }
    }

    isPaused.value = false
    pausedTick = 0

    if (!globalIsReady.value) {
      await init(instrumentName || currentInstrumentName)
    }

    // If AudioContext was closed, recreate it and reload instruments
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = createAudioContext()
      instrumentCache.clear()
      globalIsReady.value = false
      await init(instrumentName || currentInstrumentName)
    }

    if (audioContext.state !== 'running') {
      await audioContext.resume()
    }

    // Bail out if a newer play() call has superseded this one
    if (thisGen !== playGeneration) return

    // Load the instrument if different from current
    const instName = instrumentName || currentInstrumentName
    const sfName = INSTRUMENT_MAP[instName] || instName
    let instrument = instrumentCache.get(sfName)
    if (!instrument) {
      globalIsLoading.value = true
      try {
        instrument = await loadInstrument(instName)
      } finally {
        globalIsLoading.value = false
      }
    }

    // Bail out if superseded during async instrument load
    if (thisGen !== playGeneration) return

    currentInstrumentName = instName

    cachedEventData = eventData
    bpm = eventData.bpm || 100

    const offsetSeconds = ticksToSeconds(fromTick)
    startTime = audioContext.currentTime - offsetSeconds

    // Schedule all notes
    for (const track of eventData.tracks) {
      for (const note of track.notes) {
        const endTick = note.start_tick + note.duration

        if (endTick <= fromTick) continue

        const startSeconds = ticksToSeconds(note.start_tick)
        const durationSeconds = ticksToSeconds(note.duration)

        const adjustedStartSeconds = Math.max(0, startSeconds - offsetSeconds)
        const adjustedDuration = note.start_tick < fromTick
          ? durationSeconds - (offsetSeconds - startSeconds)
          : durationSeconds

        if (adjustedDuration > 0 && instrument) {
          noteStops.push(instrument.start({
            note: note.pitch,
            velocity: note.velocity,
            time: audioContext.currentTime + adjustedStartSeconds,
            duration: adjustedDuration,
          }))
        }
      }
    }

    duration.value = eventData.total_ticks
    isPlaying.value = true
    currentTick.value = fromTick

    const totalDurationSeconds = ticksToSeconds(eventData.total_ticks)

    // Auto-stop
    if (stopTimeout) clearTimeout(stopTimeout)
    const remainingSeconds = ticksToSeconds(eventData.total_ticks - fromTick)
    stopTimeout = setTimeout(() => {
      stop()
    }, remainingSeconds * 1000 + 500)

    // Position tracking — bound to this generation
    function updatePosition() {
      if (thisGen !== playGeneration || !isPlaying.value || !audioContext) return

      const elapsed = audioContext.currentTime - startTime
      currentTick.value = secondsToTicks(elapsed)

      if (currentTick.value >= duration.value || elapsed >= totalDurationSeconds + 0.1) {
        stop()
        return
      }

      animationFrame = requestAnimationFrame(updatePosition)
    }

    updatePosition()
  }

  function pause() {
    if (!isPlaying.value) return

    pausedTick = currentTick.value
    isPlaying.value = false
    isPaused.value = true

    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }

    if (stopTimeout) {
      clearTimeout(stopTimeout)
      stopTimeout = null
    }

    // Cancel queued notes and stop all instruments
    cancelScheduledNotes()
    for (const [, instrument] of instrumentCache) {
      instrument.stop()
    }
  }

  async function resume() {
    if (!isPaused.value || !cachedEventData) return
    await play(cachedEventData, pausedTick)
  }

  async function togglePlay(eventData: EventData, instrumentName?: string) {
    if (globalIsLoading.value) return

    if (isPlaying.value) {
      pause()
    } else if (isPaused.value) {
      await resume()
    } else {
      await play(eventData, 0, instrumentName)
    }
  }

  function stop() {
    // Increment generation so any running updatePosition loop exits
    playGeneration++

    isPlaying.value = false
    isPaused.value = false
    currentTick.value = 0
    pausedTick = 0

    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }

    if (stopTimeout) {
      clearTimeout(stopTimeout)
      stopTimeout = null
    }

    cancelScheduledNotes()
    for (const [, instrument] of instrumentCache) {
      try {
        instrument.stop()
      } catch {
        // Ignore errors from stopping instruments
      }
    }
  }

  function seek(tick: number) {
    currentTick.value = tick
    pausedTick = tick
  }

  onUnmounted(() => {
    stop()
  })

  return {
    isPlaying,
    isPaused,
    isLoading: globalIsLoading,
    isReady: globalIsReady,
    currentTick,
    duration,
    ensureAudioContext,
    init,
    play,
    pause,
    resume,
    togglePlay,
    stop,
    seek,
  }
}
