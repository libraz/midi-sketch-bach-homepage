/**
 * Minimap strip: a pre-rendered note-density texture plus the per-frame
 * overlay (bar label, bar dividers, viewport window and playhead).
 */
import type { EventData } from '@/wasm/index'
import { PIANO_KEY_WIDTH, PLAYHEAD_COLOR, PPQ } from './constants'
import { getVoiceColor, hexToRgb } from './colors'
import { collectAllNotes, getVisibleTickRange, pitchRange } from './notes'

/**
 * Build an offscreen texture of note density for the minimap. Returns the
 * texture (blank when there are no notes), or null when the target size is
 * invalid — in which case the caller should keep its previous texture.
 */
export function buildMinimapTexture(eventData: EventData, drawWidth: number, drawHeight: number): OffscreenCanvas | null {
  const dpr = window.devicePixelRatio || 1
  const pw = Math.round(drawWidth * dpr)
  const ph = Math.round(drawHeight * dpr)
  if (pw <= 0 || ph <= 0) return null

  const texture = new OffscreenCanvas(pw, ph)
  const ctx = texture.getContext('2d')!
  ctx.scale(dpr, dpr)

  const allNotes = collectAllNotes(eventData)
  if (allNotes.length === 0) return texture

  const totalTicks = eventData.total_ticks || 1

  // Pitch range for vertical mapping
  const { minPitch, maxPitch } = pitchRange(allNotes, 1)
  const range = maxPitch - minPitch + 1

  // Draw each note as a tiny colored mark
  for (const note of allNotes) {
    const x = (note.start_tick / totalTicks) * drawWidth
    const w = Math.max((note.duration / totalTicks) * drawWidth, 0.5)
    const yRatio = 1 - (note.pitch - minPitch) / range
    const y = yRatio * drawHeight
    const h = Math.max(drawHeight / range, 0.5)

    const color = getVoiceColor(note.voice)
    const rgb = hexToRgb(color)
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`
    ctx.fillRect(x, y, w, h)
  }
  return texture
}

/** Per-frame state needed to draw the minimap overlay. */
export interface MinimapFrame {
  width: number
  height: number
  eventData: EventData
  texture: OffscreenCanvas | null
  barLabel: string
  /** isPlaying ? currentTick : lastPlayTick */
  refTick: number
  isPlaying: boolean
}

/** Draw the minimap: background, label, texture, dividers, viewport, playhead. */
export function drawMinimap(ctx: CanvasRenderingContext2D, frame: MinimapFrame) {
  const { width, height, eventData, texture, barLabel, refTick, isPlaying } = frame
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
  ctx.fillText(barLabel, labelWidth / 2, height / 2)

  // ── Note density texture ──
  if (texture && drawWidth > 0) {
    ctx.drawImage(texture, labelWidth, 1, drawWidth, height - 1)
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
  const { startTick, endTick } = getVisibleTickRange(refTick, totalTicks)
  const vpX = labelWidth + (startTick / totalTicks) * drawWidth
  const vpW = ((endTick - startTick) / totalTicks) * drawWidth

  // Only show viewport indicator when in windowed mode (not showing everything)
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
  const playheadTick = refTick
  if (playheadTick > 0) {
    const phX = labelWidth + (playheadTick / totalTicks) * drawWidth

    if (isPlaying) {
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
