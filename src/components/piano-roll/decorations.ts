/**
 * Atmospheric piano-roll layers: the Gothic idle tracery shown before the
 * first generation, and the soft wave overlay drawn over the paused notes.
 */
import { IDLE_BG, PIANO_KEY_WIDTH } from './constants'
import { GOTHIC_VOICES } from './colors'

/** Render the idle Gothic tracery (ribbed vault, arches, rose window). */
export function drawIdleTracery(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
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
    const breath = 0.035 + Math.sin(t * 0.2 + i * 0.9) * 0.022
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
    const alpha = 0.1 + Math.sin(t * 0.35 + i * 1.3) * 0.045

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
  const ringBreath = 0.05 + Math.sin(t * 0.2) * 0.018
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
    const spokeBreath = 0.045 + Math.sin(t * 0.25 + i * 0.5) * 0.02
    ctx.strokeStyle = `rgba(140, 155, 190, ${spokeBreath})`
    ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.moveTo(roseCx, roseCy)
    ctx.lineTo(roseCx + Math.cos(angle) * roseR, roseCy + Math.sin(angle) * roseR)
    ctx.stroke()

    // Stained-glass wedge fill — cycling through voice colors
    const v = GOTHIC_VOICES[i % 4]
    const fillBreath = 0.028 + Math.sin(t * 0.2 + i * 0.7) * 0.013
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
  glow.addColorStop(0, `rgba(58, 91, 160, ${0.035 + Math.sin(t * 0.2) * 0.012})`)
  glow.addColorStop(0.5, `rgba(195, 155, 55, ${0.014 + Math.sin(t * 0.25 + 1) * 0.006})`)
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)
}

/** Soft, breathing wave lines drawn over the paused notes. */
export function drawWaveOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
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
}
