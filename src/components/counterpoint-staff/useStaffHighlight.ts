/**
 * Drives the per-note playback highlight on a rendered counterpoint staff.
 *
 * While the shared staff player reports an example sounding, a requestAnimation
 * frame loop moves each part's highlight mark onto whichever note is currently
 * playing and advances the progress hairline. The rendered marks and note
 * positions are read through getters so the loop always sees the latest render.
 */
import { onUnmounted, watch, type Ref } from 'vue'
import type { PlaybackState, VoicePart } from '@/composables/useStaffPlayer'

interface StaffHighlightOptions {
  /** Id of the example this component renders. */
  exampleId: () => string
  /** Live playback timing from the shared staff player. */
  playbackState: Ref<PlaybackState | null>
  /** Current AudioContext clock in seconds. */
  audioNow: () => number
  /** The progress hairline element. */
  progressFill: Ref<HTMLDivElement | null>
  /** The hidden highlight marks from the latest render. */
  getMarks: () => Partial<Record<VoicePart, SVGGElement>>
  /** The rendered note centers from the latest render. */
  getPositions: () => Partial<Record<VoicePart, Array<{ x: number; y: number }>>>
}

export function useStaffHighlight(opts: StaffHighlightOptions) {
  let rafId = 0

  function hideHighlights() {
    for (const mark of Object.values(opts.getMarks())) {
      if (mark) mark.style.visibility = 'hidden'
    }
    if (opts.progressFill.value) opts.progressFill.value.style.transform = 'scaleX(0)'
  }

  function highlightTick() {
    const state = opts.playbackState.value
    if (!state || state.id !== opts.exampleId()) {
      hideHighlights()
      rafId = 0
      return
    }
    const marks = opts.getMarks()
    const positions = opts.getPositions()
    const t = opts.audioNow() - state.startTime
    for (const part of ['upper', 'middle', 'lower'] as const) {
      const mark = marks[part]
      if (!mark) continue
      let active: { x: number; y: number } | null = null
      for (const w of state.windows) {
        if (w.part === part && w.start <= t && t < w.end) {
          active = positions[part]?.[w.index] ?? null
          break
        }
      }
      if (active) {
        mark.setAttribute('transform', `translate(${active.x} ${active.y})`)
        mark.style.visibility = 'visible'
      } else {
        mark.style.visibility = 'hidden'
      }
    }
    // Gilded progress hairline along the bottom edge of the score.
    if (opts.progressFill.value) {
      const total = state.windows.reduce((max, w) => Math.max(max, w.end), 0)
      const ratio = total > 0 ? Math.min(Math.max(t / total, 0), 1) : 0
      opts.progressFill.value.style.transform = `scaleX(${ratio})`
    }
    rafId = requestAnimationFrame(highlightTick)
  }

  watch(opts.playbackState, (state) => {
    if (state && state.id === opts.exampleId()) {
      if (!rafId) rafId = requestAnimationFrame(highlightTick)
    } else {
      hideHighlights()
    }
  })

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
  })
}
