/**
 * Shared piano-roll scene layers. Both the active (playing) and paused
 * renders draw the same background lanes, bar grid and notes through these
 * functions, differing only in note opacity and the playhead style.
 */
import type { NoteEvent } from '@/wasm/index'
import { isBlackKey, midiToNoteName } from '@/utils/midiUtils'
import { NOTE_CORNER_RADIUS, PIANO_KEY_WIDTH, PLAYHEAD_COLOR, PPQ } from './constants'
import { getVoiceColor, hexToRgb } from './colors'

/** The visible window the scene is drawn into. */
export interface SceneLayout {
  width: number
  height: number
  startTick: number
  endTick: number
  minPitch: number
  maxPitch: number
}

/** Tick→x / pitch→y mapping derived from a {@link SceneLayout}. */
export interface Projection {
  tickToX(tick: number): number
  pitchToY(pitch: number): number
  noteHeight: number
}

/** Build the coordinate projection for a layout. */
export function createProjection(layout: SceneLayout): Projection {
  const drawWidth = layout.width - PIANO_KEY_WIDTH
  const visibleTicks = layout.endTick - layout.startTick
  const pitchRange = layout.maxPitch - layout.minPitch + 1
  const noteHeight = layout.height / pitchRange
  return {
    tickToX: (tick) => PIANO_KEY_WIDTH + ((tick - layout.startTick) / visibleTicks) * drawWidth,
    pitchToY: (pitch) => layout.height - (pitch - layout.minPitch + 1) * noteHeight,
    noteHeight,
  }
}

/** Fill the canvas with the cold dark background. */
export function clearBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#07080D'
  ctx.fillRect(0, 0, width, height)
}

/** Background semitone lanes (alternating shade for black keys). */
export function drawBackgroundLanes(ctx: CanvasRenderingContext2D, layout: SceneLayout, proj: Projection) {
  const drawWidth = layout.width - PIANO_KEY_WIDTH
  for (let pitch = layout.minPitch; pitch <= layout.maxPitch; pitch++) {
    const y = proj.pitchToY(pitch)
    const black = isBlackKey(pitch)
    ctx.fillStyle = black ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.015)'
    ctx.fillRect(PIANO_KEY_WIDTH, y, drawWidth, proj.noteHeight)

    // Subtle horizontal line at each semitone boundary
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(PIANO_KEY_WIDTH, y + proj.noteHeight)
    ctx.lineTo(layout.width, y + proj.noteHeight)
    ctx.stroke()
  }
}

/** Bar lines plus their numbers across the visible window. */
export function drawBarGrid(ctx: CanvasRenderingContext2D, layout: SceneLayout, proj: Projection) {
  const ticksPerBar = PPQ * 4 // 4/4 time
  const firstBar = Math.floor(layout.startTick / ticksPerBar)
  const lastBar = Math.ceil(layout.endTick / ticksPerBar)

  ctx.strokeStyle = 'rgba(100, 120, 170, 0.12)'
  ctx.lineWidth = 0.5
  for (let bar = firstBar; bar <= lastBar; bar++) {
    const barTick = bar * ticksPerBar
    if (barTick < layout.startTick || barTick > layout.endTick) continue
    const x = proj.tickToX(barTick)
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, layout.height)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(140, 160, 200, 0.3)'
  ctx.font = '9px "DM Sans", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  for (let bar = firstBar; bar <= lastBar; bar++) {
    const barTick = bar * ticksPerBar
    if (barTick < layout.startTick || barTick > layout.endTick) continue
    if (bar < 1) continue
    const x = proj.tickToX(barTick)
    if (x > PIANO_KEY_WIDTH + 2) {
      ctx.fillText(`${bar}`, x + 3, 4)
    }
  }
}

/**
 * Draw the notes inside the visible window. `alpha` dims the whole layer
 * (used for the paused render); velocity sets each note's own opacity.
 */
export function drawNotes(
  ctx: CanvasRenderingContext2D,
  notes: NoteEvent[],
  layout: SceneLayout,
  proj: Projection,
  alpha = 1,
) {
  if (alpha !== 1) ctx.globalAlpha = alpha
  for (const note of notes) {
    const noteEnd = note.start_tick + note.duration

    // Skip notes completely outside the visible range
    if (noteEnd < layout.startTick || note.start_tick > layout.endTick) continue

    const x = proj.tickToX(Math.max(note.start_tick, layout.startTick))
    const xEnd = proj.tickToX(Math.min(noteEnd, layout.endTick))
    const y = proj.pitchToY(note.pitch)
    const w = Math.max(xEnd - x, 1)
    const h = Math.max(proj.noteHeight - 1, 1)

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
  if (alpha !== 1) ctx.globalAlpha = 1.0
}

/** Draw the piano-key sidebar with C-note labels. */
export function drawPianoKeys(ctx: CanvasRenderingContext2D, layout: SceneLayout, proj: Projection) {
  const { height, minPitch, maxPitch } = layout
  const noteHeight = proj.noteHeight

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

/**
 * Vertical playhead at `tick`. The `active` style is a bright burgundy line
 * with a glow; the inactive style is a single dimmed line (paused / stopped).
 */
export function drawPlayhead(
  ctx: CanvasRenderingContext2D,
  layout: SceneLayout,
  proj: Projection,
  tick: number,
  active: boolean,
) {
  if (!(tick > 0 && tick >= layout.startTick && tick <= layout.endTick)) return
  const playheadX = proj.tickToX(tick)

  if (active) {
    // Active playhead
    ctx.strokeStyle = PLAYHEAD_COLOR
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(playheadX, 0)
    ctx.lineTo(playheadX, layout.height)
    ctx.stroke()

    // Glow effect
    ctx.strokeStyle = 'rgba(138, 46, 62, 0.3)'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(playheadX, 0)
    ctx.lineTo(playheadX, layout.height)
    ctx.stroke()
  } else {
    // Paused playhead — dimmed
    ctx.strokeStyle = 'rgba(138, 46, 62, 0.4)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(playheadX, 0)
    ctx.lineTo(playheadX, layout.height)
    ctx.stroke()
  }
}
