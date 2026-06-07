/** Canvas sizing helper that keeps the backing buffer matched to the display. */

/** Cached display size, so the buffer is only reset when it actually changes. */
export interface CanvasCache {
  width: number
  height: number
  dpr: number
}

/** A fresh, "needs resize" cache. */
export function createCanvasCache(): CanvasCache {
  return { width: 0, height: 0, dpr: 0 }
}

/**
 * Ensure the canvas buffer matches its display size and the context is scaled
 * for the device pixel ratio. Returns the CSS (logical) width and height.
 * Pass a per-canvas {@link CanvasCache} so unrelated canvases don't fight over
 * one another's cached dimensions.
 */
export function ensureCanvasSize(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  cache: CanvasCache,
): { width: number; height: number } {
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  if (width !== cache.width || height !== cache.height || dpr !== cache.dpr) {
    canvas.width = width * dpr
    canvas.height = height * dpr
    cache.width = width
    cache.height = height
    cache.dpr = dpr
  }

  // Always reset transform since canvas.width/height assignment resets it
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  return { width, height }
}
