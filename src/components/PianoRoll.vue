<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { NoteEvent, TrackData, EventData } from '@/wasm/index'
import { midiToNoteName, isBlackKey } from '@/utils/midiUtils'

const props = defineProps<{
  eventData: EventData | null
  currentTick: number
  isPlaying: boolean
  duration: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let resizeObserver: ResizeObserver | null = null
let playRafId: number | null = null
let idleRafId: number | null = null

// Cached canvas dimensions to avoid unnecessary buffer resets
let cachedWidth = 0
let cachedHeight = 0
let cachedDpr = 0

/** Last playback tick — preserved when playback stops to keep the scrolled view */
let lastPlayTick = 0

/** Ensure canvas buffer matches display size; returns false if no resize was needed */
function ensureCanvasSize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): { width: number; height: number } {
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  if (width !== cachedWidth || height !== cachedHeight || dpr !== cachedDpr) {
    canvas.width = width * dpr
    canvas.height = height * dpr
    cachedWidth = width
    cachedHeight = height
    cachedDpr = dpr
  }

  // Always reset transform since canvas.width/height assignment resets it
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  return { width, height }
}

const PPQ = 480
const PIANO_KEY_WIDTH = 40
const NOTE_CORNER_RADIUS = 2
const SEMITONE_PADDING = 2

/** Voice color palette (Bach: voice-based, not track-based) */
const VOICE_COLORS: Record<number, string> = {
  0: '#D4A63E', // Soprano - Gold
  1: '#8A2E3E', // Alto - Burgundy
  2: '#4A8B6B', // Tenor - Green
  3: '#6B7BB5', // Bass - Steel blue
}
const VOICE_COLOR_DEFAULT = '#B57A4A' // Bronze for voice 4+

const PLAYHEAD_COLOR = '#8A2E3E'

/** Collect all notes from all tracks into a flat array with voice info preserved */
function collectAllNotes(eventData: EventData): NoteEvent[] {
  const notes: NoteEvent[] = []
  for (const track of eventData.tracks) {
    for (const note of track.notes) {
      notes.push(note)
    }
  }
  return notes
}

/** Get color for a voice index */
function getVoiceColor(voice: number): string {
  return VOICE_COLORS[voice] ?? VOICE_COLOR_DEFAULT
}

/** Parse hex color to RGB components */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

/** Calculate visible tick window — uses lastPlayTick for paused state */
function getVisibleTickRange(
  currentTick: number,
  totalTicks: number,
): { startTick: number; endTick: number } {
  const refTick = props.isPlaying ? currentTick : lastPlayTick

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

/** Draw the piano key sidebar */
function drawPianoKeys(
  ctx: CanvasRenderingContext2D,
  height: number,
  minPitch: number,
  maxPitch: number,
  noteHeight: number,
) {
  // Background
  ctx.fillStyle = '#1A1510'
  ctx.fillRect(0, 0, PIANO_KEY_WIDTH, height)

  // Right border
  ctx.strokeStyle = 'rgba(184, 146, 46, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PIANO_KEY_WIDTH, 0)
  ctx.lineTo(PIANO_KEY_WIDTH, height)
  ctx.stroke()

  // Draw keys and labels
  for (let pitch = minPitch; pitch <= maxPitch; pitch++) {
    const y = height - (pitch - minPitch + 1) * noteHeight
    const black = isBlackKey(pitch)

    // Key background
    ctx.fillStyle = black ? '#0D0A07' : '#1A1510'
    ctx.fillRect(0, y, PIANO_KEY_WIDTH - 1, noteHeight)

    // Subtle line between keys
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(0, y + noteHeight)
    ctx.lineTo(PIANO_KEY_WIDTH - 1, y + noteHeight)
    ctx.stroke()

    // Label C notes
    if (pitch % 12 === 0) {
      const noteName = midiToNoteName(pitch)
      ctx.fillStyle = 'rgba(212, 166, 62, 0.7)'
      ctx.font = `${Math.min(10, noteHeight * 0.8)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(noteName, PIANO_KEY_WIDTH / 2, y + noteHeight / 2)
    }
  }
}

// ── Idle Wave Animation (pre-generation only) ────────────────────────────────

/** Render idle waves — shown only before first generation */
function renderIdleWaves(time: number) {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { width, height } = ensureCanvasSize(canvas, ctx)

  // Background
  ctx.fillStyle = '#0D0A07'
  ctx.fillRect(0, 0, width, height)

  // Subtle horizontal grid suggesting staff lines
  ctx.strokeStyle = 'rgba(184, 146, 46, 0.025)'
  ctx.lineWidth = 0.5
  const gridSpacing = height / 10
  for (let i = 1; i < 10; i++) {
    ctx.beginPath()
    ctx.moveTo(0, i * gridSpacing)
    ctx.lineTo(width, i * gridSpacing)
    ctx.stroke()
  }

  // Time in seconds
  const t = time / 1000

  // Voice-colored waves — suggesting organ pipe vibrations
  const waves = [
    { r: 212, g: 166, b: 62,  amp: 14, freq: 0.006, speed: 0.5,  yRatio: 0.2,  lw: 1.8 },
    { r: 138, g: 46,  b: 62,  amp: 10, freq: 0.008, speed: 0.38, yRatio: 0.36, lw: 1.4 },
    { r: 74,  g: 139, b: 107, amp: 12, freq: 0.005, speed: 0.55, yRatio: 0.52, lw: 1.4 },
    { r: 107, g: 123, b: 181, amp: 16, freq: 0.004, speed: 0.3,  yRatio: 0.68, lw: 1.8 },
    { r: 181, g: 122, b: 74,  amp: 8,  freq: 0.01,  speed: 0.45, yRatio: 0.84, lw: 1.0 },
  ]

  for (const w of waves) {
    const baseY = height * w.yRatio
    const breath = 0.12 + Math.sin(t * 0.35 + w.yRatio * Math.PI * 3) * 0.06

    ctx.beginPath()
    ctx.strokeStyle = `rgba(${w.r}, ${w.g}, ${w.b}, ${breath})`
    ctx.lineWidth = w.lw

    for (let x = 0; x <= width; x += 2) {
      const y = baseY +
        Math.sin(x * w.freq + t * w.speed) * w.amp +
        Math.sin(x * w.freq * 2.3 + t * w.speed * 0.7) * (w.amp * 0.25)
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = `rgba(${w.r}, ${w.g}, ${w.b}, ${breath * 0.3})`
    ctx.lineWidth = w.lw * 0.5

    for (let x = 0; x <= width; x += 3) {
      const y = baseY + 6 +
        Math.sin(x * w.freq * 1.7 + t * w.speed * 1.3 + 1.5) * (w.amp * 0.5)
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // Center glow
  const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.4)
  glow.addColorStop(0, `rgba(184, 146, 46, ${0.025 + Math.sin(t * 0.25) * 0.01})`)
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)
}

function startIdleLoop() {
  stopIdleLoop()
  function frame(time: number) {
    renderIdleWaves(time)
    idleRafId = requestAnimationFrame(frame)
  }
  idleRafId = requestAnimationFrame(frame)
}

function stopIdleLoop() {
  if (idleRafId !== null) {
    cancelAnimationFrame(idleRafId)
    idleRafId = null
  }
}

// ── Main Note Render ─────────────────────────────────────────────────────────

/** Save playback position on every frame so it survives stop() resetting currentTick to 0 */
function trackPlayPosition() {
  if (props.isPlaying && props.currentTick > 0) {
    lastPlayTick = props.currentTick
  }
}

function render() {
  trackPlayPosition()
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { width, height } = ensureCanvasSize(canvas, ctx)

  // Clear canvas
  ctx.fillStyle = '#0D0A07'
  ctx.fillRect(0, 0, width, height)

  const eventData = props.eventData
  if (!eventData || !eventData.tracks || eventData.tracks.length === 0) return

  const allNotes = collectAllNotes(eventData)
  if (allNotes.length === 0) return

  // Calculate pitch range
  let minPitch = Infinity
  let maxPitch = -Infinity
  for (const note of allNotes) {
    if (note.pitch < minPitch) minPitch = note.pitch
    if (note.pitch > maxPitch) maxPitch = note.pitch
  }
  minPitch -= SEMITONE_PADDING
  maxPitch += SEMITONE_PADDING
  const pitchRange = maxPitch - minPitch + 1

  // Calculate visible tick range
  const totalTicks = eventData.total_ticks || props.duration
  const { startTick, endTick } = getVisibleTickRange(props.currentTick, totalTicks)
  const visibleTicks = endTick - startTick

  // Drawing dimensions
  const drawWidth = width - PIANO_KEY_WIDTH
  const noteHeight = height / pitchRange

  // Helper: convert tick to x position
  function tickToX(tick: number): number {
    return PIANO_KEY_WIDTH + ((tick - startTick) / visibleTicks) * drawWidth
  }

  // Helper: convert pitch to y position (higher pitch = higher on screen = lower y)
  function pitchToY(pitch: number): number {
    return height - (pitch - minPitch + 1) * noteHeight
  }

  // --- Draw background semitone lines ---
  for (let pitch = minPitch; pitch <= maxPitch; pitch++) {
    const y = pitchToY(pitch)
    const black = isBlackKey(pitch)
    ctx.fillStyle = black ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.015)'
    ctx.fillRect(PIANO_KEY_WIDTH, y, drawWidth, noteHeight)

    // Subtle horizontal line at each semitone boundary
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(PIANO_KEY_WIDTH, y + noteHeight)
    ctx.lineTo(width, y + noteHeight)
    ctx.stroke()
  }

  // --- Draw time grid (bar lines) ---
  const ticksPerBar = PPQ * 4 // 4/4 time
  const firstBar = Math.floor(startTick / ticksPerBar)
  const lastBar = Math.ceil(endTick / ticksPerBar)

  ctx.strokeStyle = 'rgba(184, 146, 46, 0.15)'
  ctx.lineWidth = 0.5
  for (let bar = firstBar; bar <= lastBar; bar++) {
    const barTick = bar * ticksPerBar
    if (barTick < startTick || barTick > endTick) continue
    const x = tickToX(barTick)
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // --- Draw bar numbers ---
  ctx.fillStyle = 'rgba(212, 166, 62, 0.35)'
  ctx.font = '9px "DM Sans", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  for (let bar = firstBar; bar <= lastBar; bar++) {
    const barTick = bar * ticksPerBar
    if (barTick < startTick || barTick > endTick) continue
    if (bar < 1) continue
    const x = tickToX(barTick)
    if (x > PIANO_KEY_WIDTH + 2) {
      ctx.fillText(`${bar}`, x + 3, 4)
    }
  }

  // --- Draw notes ---
  for (const note of allNotes) {
    const noteEnd = note.start_tick + note.duration

    // Skip notes completely outside the visible range
    if (noteEnd < startTick || note.start_tick > endTick) continue

    const x = tickToX(Math.max(note.start_tick, startTick))
    const xEnd = tickToX(Math.min(noteEnd, endTick))
    const y = pitchToY(note.pitch)
    const w = Math.max(xEnd - x, 1)
    const h = Math.max(noteHeight - 1, 1)

    // Voice-based color with velocity-based opacity
    const color = getVoiceColor(note.voice)
    const rgb = hexToRgb(color)
    const velocityAlpha = 0.6 + (note.velocity / 127) * 0.4

    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${velocityAlpha})`

    // Rounded rectangle
    if (w > NOTE_CORNER_RADIUS * 2 && h > NOTE_CORNER_RADIUS * 2) {
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, NOTE_CORNER_RADIUS)
      ctx.fill()
    } else {
      ctx.fillRect(x, y, w, h)
    }
  }

  // --- Draw piano key sidebar ---
  drawPianoKeys(ctx, height, minPitch, maxPitch, noteHeight)

  // --- Draw playhead ---
  const playheadTick = props.isPlaying ? props.currentTick : lastPlayTick
  if (playheadTick > 0 && playheadTick >= startTick && playheadTick <= endTick) {
    const playheadX = tickToX(playheadTick)

    if (props.isPlaying) {
      // Active playhead
      ctx.strokeStyle = PLAYHEAD_COLOR
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(playheadX, 0)
      ctx.lineTo(playheadX, height)
      ctx.stroke()

      // Glow effect
      ctx.strokeStyle = 'rgba(138, 46, 62, 0.3)'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.moveTo(playheadX, 0)
      ctx.lineTo(playheadX, height)
      ctx.stroke()
    } else {
      // Paused playhead — dimmed
      ctx.strokeStyle = 'rgba(138, 46, 62, 0.4)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(playheadX, 0)
      ctx.lineTo(playheadX, height)
      ctx.stroke()
    }
  }
}

// ── Playback Animation Loop ─────────────────────────────────────────────────

function startPlayLoop() {
  stopPlayLoop()
  function frame() {
    render()
    if (props.isPlaying) {
      playRafId = requestAnimationFrame(frame)
    }
  }
  frame()
}

function stopPlayLoop() {
  if (playRafId !== null) {
    cancelAnimationFrame(playRafId)
    playRafId = null
  }
}

// ── Paused Render Loop (notes + subtle waves) ───────────────────────────────

let pausedRafId: number | null = null

/** Render paused state: clear notes at reduced opacity + soft wave overlay */
function renderPaused(time: number) {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { width, height } = ensureCanvasSize(canvas, ctx)

  // Clear canvas
  ctx.fillStyle = '#0D0A07'
  ctx.fillRect(0, 0, width, height)

  const eventData = props.eventData
  if (!eventData || !eventData.tracks || eventData.tracks.length === 0) return

  const allNotes = collectAllNotes(eventData)
  if (allNotes.length === 0) return

  // Calculate pitch range
  let minPitch = Infinity
  let maxPitch = -Infinity
  for (const note of allNotes) {
    if (note.pitch < minPitch) minPitch = note.pitch
    if (note.pitch > maxPitch) maxPitch = note.pitch
  }
  minPitch -= SEMITONE_PADDING
  maxPitch += SEMITONE_PADDING
  const pitchRange = maxPitch - minPitch + 1

  const totalTicks = eventData.total_ticks || props.duration
  const { startTick, endTick } = getVisibleTickRange(0, totalTicks)
  const visibleTicks = endTick - startTick

  const drawWidth = width - PIANO_KEY_WIDTH
  const noteHeight = height / pitchRange

  function tickToX(tick: number): number {
    return PIANO_KEY_WIDTH + ((tick - startTick) / visibleTicks) * drawWidth
  }
  function pitchToY(pitch: number): number {
    return height - (pitch - minPitch + 1) * noteHeight
  }

  // --- Background semitone lanes ---
  for (let pitch = minPitch; pitch <= maxPitch; pitch++) {
    const y = pitchToY(pitch)
    const black = isBlackKey(pitch)
    ctx.fillStyle = black ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.015)'
    ctx.fillRect(PIANO_KEY_WIDTH, y, drawWidth, noteHeight)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(PIANO_KEY_WIDTH, y + noteHeight)
    ctx.lineTo(width, y + noteHeight)
    ctx.stroke()
  }

  // --- Bar lines ---
  const ticksPerBar = PPQ * 4
  const firstBar = Math.floor(startTick / ticksPerBar)
  const lastBar = Math.ceil(endTick / ticksPerBar)

  ctx.strokeStyle = 'rgba(184, 146, 46, 0.15)'
  ctx.lineWidth = 0.5
  for (let bar = firstBar; bar <= lastBar; bar++) {
    const barTick = bar * ticksPerBar
    if (barTick < startTick || barTick > endTick) continue
    const x = tickToX(barTick)
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // --- Bar numbers ---
  ctx.fillStyle = 'rgba(212, 166, 62, 0.35)'
  ctx.font = '9px "DM Sans", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  for (let bar = firstBar; bar <= lastBar; bar++) {
    const barTick = bar * ticksPerBar
    if (barTick < startTick || barTick > endTick) continue
    if (bar < 1) continue
    const x = tickToX(barTick)
    if (x > PIANO_KEY_WIDTH + 2) {
      ctx.fillText(`${bar}`, x + 3, 4)
    }
  }

  // --- Notes at reduced opacity ---
  ctx.globalAlpha = 0.25
  for (const note of allNotes) {
    const noteEnd = note.start_tick + note.duration
    if (noteEnd < startTick || note.start_tick > endTick) continue

    const x = tickToX(Math.max(note.start_tick, startTick))
    const xEnd = tickToX(Math.min(noteEnd, endTick))
    const y = pitchToY(note.pitch)
    const w = Math.max(xEnd - x, 1)
    const h = Math.max(noteHeight - 1, 1)

    const color = getVoiceColor(note.voice)
    const rgb = hexToRgb(color)
    const velocityAlpha = 0.6 + (note.velocity / 127) * 0.4
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${velocityAlpha})`

    if (w > NOTE_CORNER_RADIUS * 2 && h > NOTE_CORNER_RADIUS * 2) {
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, NOTE_CORNER_RADIUS)
      ctx.fill()
    } else {
      ctx.fillRect(x, y, w, h)
    }
  }
  ctx.globalAlpha = 1.0

  // --- Subtle wave overlay ---
  const t = time / 1000
  const waves = [
    { r: 212, g: 166, b: 62,  amp: 14, freq: 0.005, speed: 0.35, yRatio: 0.2,  lw: 1.6 },
    { r: 138, g: 46,  b: 62,  amp: 10, freq: 0.007, speed: 0.28, yRatio: 0.4,  lw: 1.4 },
    { r: 74,  g: 139, b: 107, amp: 12, freq: 0.004, speed: 0.4,  yRatio: 0.55, lw: 1.4 },
    { r: 107, g: 123, b: 181, amp: 16, freq: 0.003, speed: 0.22, yRatio: 0.72, lw: 1.6 },
  ]

  for (const w of waves) {
    const baseY = height * w.yRatio
    const breath = 0.1 + Math.sin(t * 0.3 + w.yRatio * Math.PI * 3) * 0.05

    ctx.beginPath()
    ctx.strokeStyle = `rgba(${w.r}, ${w.g}, ${w.b}, ${breath})`
    ctx.lineWidth = w.lw

    for (let x = PIANO_KEY_WIDTH; x <= width; x += 2) {
      const y = baseY +
        Math.sin(x * w.freq + t * w.speed) * w.amp +
        Math.sin(x * w.freq * 2.3 + t * w.speed * 0.7) * (w.amp * 0.2)
      if (x === PIANO_KEY_WIDTH) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // --- Paused playhead ---
  if (lastPlayTick > 0 && lastPlayTick >= startTick && lastPlayTick <= endTick) {
    const playheadX = tickToX(lastPlayTick)
    ctx.strokeStyle = 'rgba(138, 46, 62, 0.4)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(playheadX, 0)
    ctx.lineTo(playheadX, height)
    ctx.stroke()
  }

  // --- Piano keys (drawn last, on top) ---
  drawPianoKeys(ctx, height, minPitch, maxPitch, noteHeight)
}

function startPausedLoop() {
  stopPausedLoop()
  function frame(time: number) {
    renderPaused(time)
    pausedRafId = requestAnimationFrame(frame)
  }
  pausedRafId = requestAnimationFrame(frame)
}

function stopPausedLoop() {
  if (pausedRafId !== null) {
    cancelAnimationFrame(pausedRafId)
    pausedRafId = null
  }
}

// ── Watchers ─────────────────────────────────────────────────────────────────

// Watch isPlaying to start/stop playback animation
watch(
  () => props.isPlaying,
  (playing) => {
    if (playing) {
      stopPausedLoop()
      stopIdleLoop()
      startPlayLoop()
    } else {
      stopPlayLoop()
      if (props.eventData) {
        startPausedLoop()
      } else {
        startIdleLoop()
      }
    }
  },
)

// Watch eventData changes
watch(
  () => props.eventData,
  (data) => {
    if (data) {
      if (!props.isPlaying) {
        stopIdleLoop()
        startPausedLoop()
      }
    } else {
      lastPlayTick = 0
      stopPausedLoop()
      stopPlayLoop()
      startIdleLoop()
    }
  },
  { deep: true },
)

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  if (props.isPlaying) {
    startPlayLoop()
  } else if (props.eventData) {
    startPausedLoop()
  } else {
    startIdleLoop()
  }

  // Observe container resize
  resizeObserver = new ResizeObserver(() => {
    cachedWidth = 0
    cachedHeight = 0
    // All loops pick up the new size on next frame automatically
  })
  resizeObserver.observe(canvas.parentElement!)
})

onUnmounted(() => {
  stopPlayLoop()
  stopPausedLoop()
  stopIdleLoop()
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<template>
  <div class="piano-roll">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.piano-roll {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0D0A07;
  overflow: hidden;
}
.piano-roll canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
