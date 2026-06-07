<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import type { EventData } from '@/wasm/index'
import { MINIMAP_HEIGHT, PIANO_KEY_WIDTH, PPQ, SEMITONE_PADDING } from './piano-roll/constants'
import { createCanvasCache, ensureCanvasSize } from './piano-roll/canvas'
import { collectAllNotes, getVisibleTickRange, pitchRange } from './piano-roll/notes'
import {
  type SceneLayout,
  clearBackground,
  createProjection,
  drawBackgroundLanes,
  drawBarGrid,
  drawNotes,
  drawPianoKeys,
  drawPlayhead,
} from './piano-roll/scene'
import { drawIdleTracery, drawWaveOverlay } from './piano-roll/decorations'
import { buildMinimapTexture, drawMinimap } from './piano-roll/minimap'

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

// Cached canvas dimensions to avoid unnecessary buffer resets (one per canvas).
const mainCache = createCanvasCache()
const mmCache = createCanvasCache()

/** Last playback tick — preserved when playback stops to keep the scrolled view */
let lastPlayTick = 0

/** Pre-computed minimap note density texture (regenerated on eventData change) */
let minimapTexture: OffscreenCanvas | null = null

/** Reference tick that drives the windowed view: live while playing, else paused. */
function currentRefTick(): number {
  return props.isPlaying ? props.currentTick : lastPlayTick
}

/** Computed bar position label */
const barLabel = computed(() => {
  const eventData = props.eventData
  if (!eventData) return ''

  const totalTicks = eventData.total_ticks || 1
  const ticksPerBar = PPQ * 4
  const totalBars = Math.ceil(totalTicks / ticksPerBar)

  const refTick = currentRefTick()
  const currentBar = refTick > 0 ? Math.floor(refTick / ticksPerBar) + 1 : 1

  return `${currentBar} / ${totalBars}`
})

/** Render the minimap canvas */
function renderMinimap() {
  const canvas = minimapRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { width, height } = ensureCanvasSize(canvas, ctx, mmCache)
  if (width <= 0 || height <= 0) return

  const eventData = props.eventData
  if (!eventData) return

  drawMinimap(ctx, {
    width,
    height,
    eventData,
    texture: minimapTexture,
    barLabel: barLabel.value,
    refTick: currentRefTick(),
    isPlaying: props.isPlaying,
  })
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

/** Render idle Gothic tracery — shown only before first generation */
function renderIdle(time: number) {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { width, height } = ensureCanvasSize(canvas, ctx, mainCache)
  drawIdleTracery(ctx, width, height, time)
}

function startIdleLoop() {
  stopIdleLoop()
  function frame(time: number) {
    renderIdle(time)
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

// ── Scene helpers ────────────────────────────────────────────────────────────

/** Build the visible-window layout, or null when there is nothing to draw. */
function buildLayout(
  width: number,
  height: number,
  refTick: number,
): { layout: SceneLayout; notes: ReturnType<typeof collectAllNotes> } | null {
  const eventData = props.eventData
  if (!eventData || !eventData.tracks || eventData.tracks.length === 0) return null

  const allNotes = collectAllNotes(eventData)
  if (allNotes.length === 0) return null

  const { minPitch, maxPitch } = pitchRange(allNotes, SEMITONE_PADDING)
  const totalTicks = eventData.total_ticks || props.duration
  const { startTick, endTick } = getVisibleTickRange(refTick, totalTicks)

  return { layout: { width, height, startTick, endTick, minPitch, maxPitch }, notes: allNotes }
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

  const { width, height } = ensureCanvasSize(canvas, ctx, mainCache)
  clearBackground(ctx, width, height)

  const built = buildLayout(width, height, currentRefTick())
  if (!built) return
  const { layout, notes } = built
  const proj = createProjection(layout)

  drawBackgroundLanes(ctx, layout, proj)
  drawBarGrid(ctx, layout, proj)
  drawNotes(ctx, notes, layout, proj)
  drawPianoKeys(ctx, layout, proj)
  drawPlayhead(ctx, layout, proj, currentRefTick(), props.isPlaying)

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

  const { width, height } = ensureCanvasSize(canvas, ctx, mainCache)
  clearBackground(ctx, width, height)

  const built = buildLayout(width, height, lastPlayTick)
  if (!built) return
  const { layout, notes } = built
  const proj = createProjection(layout)

  drawBackgroundLanes(ctx, layout, proj)
  drawBarGrid(ctx, layout, proj)
  drawNotes(ctx, notes, layout, proj, 0.25)
  drawWaveOverlay(ctx, width, height, time)
  drawPlayhead(ctx, layout, proj, lastPlayTick, false)
  drawPianoKeys(ctx, layout, proj)

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

// ── Minimap texture ──────────────────────────────────────────────────────────

/** Rebuild the minimap density texture at the minimap's current draw width. */
function rebuildMinimapTexture(data: EventData) {
  const canvas = minimapRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const drawWidth = rect.width - PIANO_KEY_WIDTH
  const texture = buildMinimapTexture(data, drawWidth, MINIMAP_HEIGHT)
  if (texture) minimapTexture = texture
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
      rebuildMinimapTexture(data)

      if (!props.isPlaying) {
        stopIdleLoop()
        startPausedLoop()
      }
    } else {
      lastPlayTick = 0
      minimapTexture = null
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
    rebuildMinimapTexture(props.eventData)
    startPausedLoop()
  } else {
    startIdleLoop()
  }

  // Observe container resize
  resizeObserver = new ResizeObserver(() => {
    mainCache.width = 0
    mainCache.height = 0
    mmCache.width = 0
    mmCache.height = 0

    // Rebuild minimap texture at new width
    if (props.eventData) {
      rebuildMinimapTexture(props.eventData)
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
