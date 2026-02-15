<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import type { NoteEvent, TrackData, EventData } from '@/wasm/index'
import { midiToNoteName, isBlackKey } from '@/utils/midiUtils'

const props = defineProps<{
  eventData: EventData | null
  currentTick: number
  isPlaying: boolean
  duration: number
}>()

const emit = defineEmits<{
  seek: [tick: number]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const minimapRef = ref<HTMLCanvasElement | null>(null)
let resizeObserver: ResizeObserver | null = null
let playRafId: number | null = null
let idleRafId: number | null = null

// Cached canvas dimensions to avoid unnecessary buffer resets
let cachedWidth = 0
let cachedHeight = 0
let cachedDpr = 0

// Minimap cached dimensions
let mmCachedWidth = 0
let mmCachedHeight = 0
let mmCachedDpr = 0

/** Last playback tick — preserved when playback stops to keep the scrolled view */
let lastPlayTick = 0

/** Pre-computed minimap note density texture (regenerated on eventData change) */
let minimapTextureCanvas: OffscreenCanvas | null = null

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

/** Ensure minimap canvas buffer matches display size */
function ensureMinimapSize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): { width: number; height: number } {
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  if (width !== mmCachedWidth || height !== mmCachedHeight || dpr !== mmCachedDpr) {
    canvas.width = width * dpr
    canvas.height = height * dpr
    mmCachedWidth = width
    mmCachedHeight = height
    mmCachedDpr = dpr
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { width, height }
}

const PPQ = 480
const PIANO_KEY_WIDTH = 40
const NOTE_CORNER_RADIUS = 2
const SEMITONE_PADDING = 2
const MINIMAP_HEIGHT = 22

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
  ctx.fillStyle = '#0D0E14'
  ctx.fillRect(0, 0, PIANO_KEY_WIDTH, height)

  // Right border
  ctx.strokeStyle = 'rgba(100, 120, 170, 0.25)'
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
    ctx.fillStyle = black ? '#07080D' : '#0D0E14'
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
      ctx.fillStyle = 'rgba(140, 160, 200, 0.6)'
      ctx.font = `${Math.min(10, noteHeight * 0.8)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(noteName, PIANO_KEY_WIDTH / 2, y + noteHeight / 2)
    }
  }
}

// ── Minimap ──────────────────────────────────────────────────────────────────

/** Build an offscreen texture of note density for the minimap.
 *  Called once per eventData change; result is blitted each frame. */
function buildMinimapTexture(eventData: EventData, drawWidth: number, drawHeight: number) {
  const dpr = window.devicePixelRatio || 1
  const pw = Math.round(drawWidth * dpr)
  const ph = Math.round(drawHeight * dpr)
  if (pw <= 0 || ph <= 0) return

  minimapTextureCanvas = new OffscreenCanvas(pw, ph)
  const ctx = minimapTextureCanvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const allNotes = collectAllNotes(eventData)
  if (allNotes.length === 0) return

  const totalTicks = eventData.total_ticks || 1

  // Pitch range for vertical mapping
  let minPitch = Infinity
  let maxPitch = -Infinity
  for (const note of allNotes) {
    if (note.pitch < minPitch) minPitch = note.pitch
    if (note.pitch > maxPitch) maxPitch = note.pitch
  }
  minPitch -= 1
  maxPitch += 1
  const pitchRange = maxPitch - minPitch + 1

  // Draw each note as a tiny colored mark
  for (const note of allNotes) {
    const x = (note.start_tick / totalTicks) * drawWidth
    const w = Math.max((note.duration / totalTicks) * drawWidth, 0.5)
    const yRatio = 1 - (note.pitch - minPitch) / pitchRange
    const y = yRatio * drawHeight
    const h = Math.max(drawHeight / pitchRange, 0.5)

    const color = getVoiceColor(note.voice)
    const rgb = hexToRgb(color)
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`
    ctx.fillRect(x, y, w, h)
  }
}

/** Computed bar position label */
const barLabel = computed(() => {
  const eventData = props.eventData
  if (!eventData) return ''

  const totalTicks = eventData.total_ticks || 1
  const ticksPerBar = PPQ * 4
  const totalBars = Math.ceil(totalTicks / ticksPerBar)

  const refTick = props.isPlaying ? props.currentTick : lastPlayTick
  const currentBar = refTick > 0 ? Math.floor(refTick / ticksPerBar) + 1 : 1

  return `${currentBar} / ${totalBars}`
})

/** Render the minimap canvas */
function renderMinimap() {
  const canvas = minimapRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { width, height } = ensureMinimapSize(canvas, ctx)
  if (width <= 0 || height <= 0) return

  const eventData = props.eventData
  if (!eventData) return

  const totalTicks = eventData.total_ticks || 1
  const ticksPerBar = PPQ * 4

  // Left label area matching piano key sidebar
  const labelWidth = PIANO_KEY_WIDTH
  const drawWidth = width - labelWidth

  // ── Background ──
  ctx.fillStyle = '#07080D'
  ctx.fillRect(0, 0, width, height)

  // Top border — thin stone ledge line
  ctx.strokeStyle = 'rgba(100, 120, 170, 0.15)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(0, 0.5)
  ctx.lineTo(width, 0.5)
  ctx.stroke()

  // ── Label area background ──
  ctx.fillStyle = '#0D0E14'
  ctx.fillRect(0, 0, labelWidth, height)

  // Separator
  ctx.strokeStyle = 'rgba(100, 120, 170, 0.25)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(labelWidth, 0)
  ctx.lineTo(labelWidth, height)
  ctx.stroke()

  // ── Bar label ──
  ctx.fillStyle = 'rgba(140, 160, 200, 0.5)'
  ctx.font = '8px "DM Sans", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(barLabel.value, labelWidth / 2, height / 2)

  // ── Note density texture ──
  if (minimapTextureCanvas && drawWidth > 0) {
    ctx.drawImage(minimapTextureCanvas, labelWidth, 1, drawWidth, height - 1)
  }

  // ── Bar dividers ──
  const totalBars = Math.ceil(totalTicks / ticksPerBar)
  // Only draw bar lines if there aren't too many (keep it readable)
  if (totalBars <= 200) {
    ctx.strokeStyle = 'rgba(100, 120, 170, 0.08)'
    ctx.lineWidth = 0.5
    for (let bar = 1; bar <= totalBars; bar++) {
      const barTick = bar * ticksPerBar
      const x = labelWidth + (barTick / totalTicks) * drawWidth
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
  }

  // ── Viewport window indicator ──
  const { startTick, endTick } = getVisibleTickRange(props.currentTick, totalTicks)
  const vpX = labelWidth + (startTick / totalTicks) * drawWidth
  const vpW = ((endTick - startTick) / totalTicks) * drawWidth

  // Only show viewport indicator when in windowed mode (not showing everything)
  const refTick = props.isPlaying ? props.currentTick : lastPlayTick
  if (refTick > 0) {
    // Viewport fill
    ctx.fillStyle = 'rgba(100, 120, 170, 0.06)'
    ctx.fillRect(vpX, 1, vpW, height - 1)

    // Viewport border — left and right edges
    ctx.strokeStyle = 'rgba(100, 120, 170, 0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(vpX, 1)
    ctx.lineTo(vpX, height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(vpX + vpW, 1)
    ctx.lineTo(vpX + vpW, height)
    ctx.stroke()
  }

  // ── Playhead on minimap ──
  const playheadTick = props.isPlaying ? props.currentTick : lastPlayTick
  if (playheadTick > 0) {
    const phX = labelWidth + (playheadTick / totalTicks) * drawWidth

    if (props.isPlaying) {
      // Active — burgundy glow
      ctx.strokeStyle = 'rgba(138, 46, 62, 0.5)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(phX, 1)
      ctx.lineTo(phX, height)
      ctx.stroke()

      ctx.strokeStyle = PLAYHEAD_COLOR
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(phX, 1)
      ctx.lineTo(phX, height)
      ctx.stroke()
    } else {
      // Paused — dimmed
      ctx.strokeStyle = 'rgba(138, 46, 62, 0.4)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(phX, 1)
      ctx.lineTo(phX, height)
      ctx.stroke()
    }
  }
}

/** Handle click on minimap to seek */
function handleMinimapClick(e: MouseEvent) {
  const canvas = minimapRef.value
  if (!canvas) return

  const eventData = props.eventData
  if (!eventData) return

  const rect = canvas.getBoundingClientRect()
  const clickX = e.clientX - rect.left

  const labelWidth = PIANO_KEY_WIDTH
  const drawWidth = rect.width - labelWidth

  // Ignore clicks on the label area
  if (clickX < labelWidth) return

  const ratio = (clickX - labelWidth) / drawWidth
  const totalTicks = eventData.total_ticks || 1
  const targetTick = Math.round(Math.max(0, Math.min(ratio, 1)) * totalTicks)

  emit('seek', targetTick)
}

/** Handle drag on minimap for scrubbing */
let isDragging = false

function handleMinimapMouseDown(e: MouseEvent) {
  isDragging = true
  handleMinimapClick(e)
  window.addEventListener('mousemove', handleMinimapMouseMove)
  window.addEventListener('mouseup', handleMinimapMouseUp)
}

function handleMinimapMouseMove(e: MouseEvent) {
  if (!isDragging) return
  handleMinimapClick(e)
}

function handleMinimapMouseUp() {
  isDragging = false
  window.removeEventListener('mousemove', handleMinimapMouseMove)
  window.removeEventListener('mouseup', handleMinimapMouseUp)
}

// ── Idle Wave Animation (pre-generation only) ────────────────────────────────

/** Gothic idle background color */
const IDLE_BG = '#07080D'

/** Voice palette for Gothic stained-glass tones */
const GOTHIC_VOICES = [
  { r: 195, g: 155, b: 55 },  // Soprano — Amber
  { r: 155, g: 35,  b: 53 },  // Alto    — Ruby
  { r: 45,  g: 122, b: 95 },  // Tenor   — Emerald
  { r: 58,  g: 91,  b: 160 }, // Bass    — Sapphire
]

/** Render idle Gothic tracery — shown only before first generation */
function renderIdleWaves(time: number) {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { width, height } = ensureCanvasSize(canvas, ctx)

  // Background — cold dark
  ctx.fillStyle = IDLE_BG
  ctx.fillRect(0, 0, width, height)

  const t = time / 1000

  // ── Layer 1: Ribbed Vault (vertical ribs from vanishing point) ──────
  const ribCount = 7
  const vanishX = width / 2
  const vanishY = height + 20 // slightly below bottom edge
  for (let i = 0; i < ribCount; i++) {
    const angle = (-0.55 + (i / (ribCount - 1)) * 1.1) // spread range in radians
    const breath = 0.02 + Math.sin(t * 0.2 + i * 0.9) * 0.015
    ctx.strokeStyle = `rgba(140, 155, 190, ${breath})`
    ctx.lineWidth = 0.7
    ctx.beginPath()
    ctx.moveTo(vanishX, vanishY)
    // Extend upward to top edge
    const endX = vanishX + Math.sin(angle) * (height + 60)
    const endY = vanishY - Math.cos(angle) * (height + 60)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }

  // ── Layer 2: Pointed arches (one per voice, rising from bottom) ─────
  const archCount = 4
  const archSpacing = width / (archCount + 1)
  for (let i = 0; i < archCount; i++) {
    const v = GOTHIC_VOICES[i]
    const cx = archSpacing * (i + 1)
    const archW = archSpacing * 0.65
    const baseArchH = height * 0.42
    const breathAmp = Math.sin(t * 0.3 + i * 1.6) * 0.06
    const archH = baseArchH * (1 + breathAmp)
    const alpha = 0.06 + Math.sin(t * 0.35 + i * 1.3) * 0.03

    // Main arch stroke
    ctx.strokeStyle = `rgba(${v.r}, ${v.g}, ${v.b}, ${alpha})`
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(cx - archW / 2, height)
    ctx.quadraticCurveTo(cx, height - archH, cx + archW / 2, height)
    ctx.stroke()

    // Ghost echo arch (slightly larger, dimmer)
    ctx.strokeStyle = `rgba(${v.r}, ${v.g}, ${v.b}, ${alpha * 0.3})`
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(cx - archW / 2 - 6, height)
    ctx.quadraticCurveTo(cx, height - archH - 12, cx + archW / 2 + 6, height)
    ctx.stroke()
  }

  // ── Layer 3: Rose window (central radial tracery) ──────────────────
  const roseCx = width / 2
  const roseCy = height * 0.42
  const roseR = Math.min(width, height) * 0.22
  const segments = 12

  // Outer ring
  const ringBreath = 0.03 + Math.sin(t * 0.2) * 0.01
  ctx.strokeStyle = `rgba(140, 155, 190, ${ringBreath})`
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.arc(roseCx, roseCy, roseR, 0, Math.PI * 2)
  ctx.stroke()

  // Radial tracery lines + stained-glass color fills
  for (let i = 0; i < segments; i++) {
    const angle = (Math.PI * 2 * i) / segments - Math.PI / 2
    const nextAngle = (Math.PI * 2 * (i + 1)) / segments - Math.PI / 2

    // Tracery spoke
    const spokeBreath = 0.025 + Math.sin(t * 0.25 + i * 0.5) * 0.012
    ctx.strokeStyle = `rgba(140, 155, 190, ${spokeBreath})`
    ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.moveTo(roseCx, roseCy)
    ctx.lineTo(roseCx + Math.cos(angle) * roseR, roseCy + Math.sin(angle) * roseR)
    ctx.stroke()

    // Stained-glass wedge fill — cycling through voice colors
    const v = GOTHIC_VOICES[i % 4]
    const fillBreath = 0.015 + Math.sin(t * 0.2 + i * 0.7) * 0.008
    ctx.fillStyle = `rgba(${v.r}, ${v.g}, ${v.b}, ${fillBreath})`
    ctx.beginPath()
    ctx.moveTo(roseCx, roseCy)
    ctx.arc(roseCx, roseCy, roseR * 0.92, angle, nextAngle)
    ctx.closePath()
    ctx.fill()
  }

  // Inner ring (smaller)
  ctx.strokeStyle = `rgba(140, 155, 190, ${ringBreath * 0.7})`
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.arc(roseCx, roseCy, roseR * 0.45, 0, Math.PI * 2)
  ctx.stroke()

  // Center glow — multi-colored (sapphire + amber blend)
  const glow = ctx.createRadialGradient(roseCx, roseCy, 0, roseCx, roseCy, roseR * 1.5)
  glow.addColorStop(0, `rgba(58, 91, 160, ${0.02 + Math.sin(t * 0.2) * 0.008})`)
  glow.addColorStop(0.5, `rgba(195, 155, 55, ${0.008 + Math.sin(t * 0.25 + 1) * 0.004})`)
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
  ctx.fillStyle = '#07080D'
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

  ctx.strokeStyle = 'rgba(100, 120, 170, 0.12)'
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
  ctx.fillStyle = 'rgba(140, 160, 200, 0.3)'
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

  // --- Render minimap ---
  renderMinimap()
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
  ctx.fillStyle = '#07080D'
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

  ctx.strokeStyle = 'rgba(100, 120, 170, 0.12)'
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
  ctx.fillStyle = 'rgba(140, 160, 200, 0.3)'
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

  // --- Render minimap ---
  renderMinimap()
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

// Watch eventData changes — rebuild minimap texture
watch(
  () => props.eventData,
  (data) => {
    if (data) {
      // Rebuild minimap texture when new data arrives
      const canvas = minimapRef.value
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const drawWidth = rect.width - PIANO_KEY_WIDTH
        buildMinimapTexture(data, drawWidth, MINIMAP_HEIGHT)
      }

      if (!props.isPlaying) {
        stopIdleLoop()
        startPausedLoop()
      }
    } else {
      lastPlayTick = 0
      minimapTextureCanvas = null
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
    // Build minimap texture if we already have data
    const mmCanvas = minimapRef.value
    if (mmCanvas && props.eventData) {
      const rect = mmCanvas.getBoundingClientRect()
      const drawWidth = rect.width - PIANO_KEY_WIDTH
      buildMinimapTexture(props.eventData, drawWidth, MINIMAP_HEIGHT)
    }
    startPausedLoop()
  } else {
    startIdleLoop()
  }

  // Observe container resize
  resizeObserver = new ResizeObserver(() => {
    cachedWidth = 0
    cachedHeight = 0
    mmCachedWidth = 0
    mmCachedHeight = 0

    // Rebuild minimap texture at new width
    if (props.eventData) {
      const mmCanvas = minimapRef.value
      if (mmCanvas) {
        const rect = mmCanvas.getBoundingClientRect()
        const drawWidth = rect.width - PIANO_KEY_WIDTH
        if (drawWidth > 0) {
          buildMinimapTexture(props.eventData, drawWidth, MINIMAP_HEIGHT)
        }
      }
    }
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
  // Clean up drag listeners
  window.removeEventListener('mousemove', handleMinimapMouseMove)
  window.removeEventListener('mouseup', handleMinimapMouseUp)
})
</script>

<template>
  <div class="piano-roll">
    <canvas ref="canvasRef" class="piano-roll__main"></canvas>
    <canvas
      v-show="eventData"
      ref="minimapRef"
      class="piano-roll__minimap"
      @mousedown="handleMinimapMouseDown"
    ></canvas>
  </div>
</template>

<style scoped>
.piano-roll {
  position: relative;
  width: 100%;
  height: 100%;
  background: #07080D;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.piano-roll__main {
  display: block;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.piano-roll__minimap {
  display: block;
  width: 100%;
  height: 22px;
  flex-shrink: 0;
  cursor: pointer;
  border-top: 1px solid rgba(100, 120, 170, 0.1);
}

.piano-roll__minimap:hover {
  background: rgba(100, 120, 170, 0.02);
}
</style>
