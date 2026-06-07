<template>
  <figure
    class="counterpoint-staff"
    :data-status="status"
    :data-verdict="verdict"
    :data-playing="isPlayingThis"
  >
    <div class="counterpoint-staff__header">
      <span class="counterpoint-staff__badge" :data-verdict="verdict">
        <span v-if="verdictIcon" class="counterpoint-staff__badge-icon" aria-hidden="true">{{ verdictIcon }}</span>
        {{ view.badge }}
      </span>
      <strong class="counterpoint-staff__title">{{ view.title }}</strong>
      <span v-if="view.sequentialHint" class="counterpoint-staff__seq">{{ view.sequentialHint }}</span>
      <button
        class="counterpoint-staff__play"
        type="button"
        :aria-label="isPlayingThis ? view.stopLabel : view.playLabel"
        :title="isPlayingThis ? view.stopLabel : view.playLabel"
        :data-playing="isPlayingThis"
        :disabled="isLoading"
        @click="togglePlay"
      >
        <span v-if="pending && !isPlayingThis" class="counterpoint-staff__play-loader" aria-hidden="true" />
        <svg v-else-if="!isPlayingThis" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4.6 3.1a.66.66 0 0 1 1-.57l8 4.9a.66.66 0 0 1 0 1.14l-8 4.9a.66.66 0 0 1-1-.57z" />
        </svg>
        <svg v-else viewBox="0 0 16 16" aria-hidden="true">
          <rect x="3.8" y="3.8" width="8.4" height="8.4" rx="1.6" />
        </svg>
      </button>
    </div>
    <div
      v-if="view.variants.length"
      class="counterpoint-staff__variants"
      role="group"
      :aria-label="view.variantsLabel"
    >
      <span v-if="view.variantsHint" class="counterpoint-staff__variants-hint">{{ view.variantsHint }}</span>
      <button
        v-for="variant in view.variants"
        :key="variant.id"
        class="counterpoint-staff__variant"
        type="button"
        :data-active="variant.id === selectedVariantId"
        :aria-pressed="variant.id === selectedVariantId"
        @click="selectVariant(variant.id)"
      >
        {{ variant.label }}
      </button>
    </div>
    <div class="counterpoint-staff__score" role="img" :aria-label="view.title">
      <div
        v-if="status !== 'ready'"
        class="counterpoint-staff__static"
        v-html="staticScoreSvg"
      />
      <div
        ref="target"
        class="counterpoint-staff__renderer"
        :aria-hidden="status !== 'ready'"
      />
      <div class="counterpoint-staff__progress" aria-hidden="true">
        <div ref="progressFill" class="counterpoint-staff__progress-fill" />
      </div>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -- escaped + minimal inline markdown from the trusted local registry -->
    <figcaption v-html="view.caption" />
    <div class="counterpoint-staff__diagnosis">
      <span
        v-for="ruleId in view.ruleIds"
        :key="ruleId"
        class="counterpoint-staff__rule"
      >
        {{ ruleId }}
      </span>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="view.diagnosis" />
    </div>
  </figure>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { StaffExampleDef, StaffLocale } from '@/data/staffExamples'
import { exampleVerdict, getStaffExample, resolveStaffVariant, verdictColor } from '@/data/staffExamples'
import { useStaffPlayer, type VoicePart } from '@/composables/useStaffPlayer'
import type { PartDef } from './counterpoint-staff/layout'
import { renderInline } from './counterpoint-staff/inlineMarkdown'
import { buildStaticScoreSvg } from './counterpoint-staff/staticScore'
import { renderVexFlow } from './counterpoint-staff/vexflowRenderer'
import { useStaffHighlight } from './counterpoint-staff/useStaffHighlight'

type Status = 'loading' | 'ready' | 'error'

const props = withDefaults(defineProps<{
  example: string
  locale?: StaffLocale
}>(), {
  locale: 'en',
})

const target = ref<HTMLDivElement | null>(null)
const progressFill = ref<HTMLDivElement | null>(null)
const status = ref<Status>('loading')
/** True between the play click and the instrument being ready (spinner). */
const pending = ref(false)
const { play, stop, isLoading, playingId, playbackState, audioNow } = useStaffPlayer()

const isPlayingThis = computed(() => playingId.value === props.example)

const uiCopy: Record<StaffLocale, { upper: string; middle: string; lower: string; play: string; stop: string; sequential: string; variants: string }> = {
  en: { upper: 'upper', middle: 'middle', lower: 'lower', play: 'Play this example', stop: 'Stop playback', sequential: 'voices play in turn', variants: 'Choose the excerpt' },
  ja: { upper: '上声', middle: '中声', lower: '下声', play: 'この譜例を再生', stop: '再生を停止', sequential: '声部を順に再生', variants: '抜粋を選択' },
}

const baseDef = computed<StaffExampleDef>(() => {
  const found = getStaffExample(props.example)
  if (found) return found
  // Unknown id: fall back to the canonical first example so the page
  // still renders, and make the mistake visible in the console.
  console.warn(`[CounterpointStaff] unknown example id: ${props.example}`)
  return getStaffExample('parallelFifths')!
})

/** Selected variant id (first variant by default; empty for variant-less examples). */
const selectedVariantId = ref(baseDef.value.variants?.[0]?.id ?? '')
watch(baseDef, (d) => {
  selectedVariantId.value = d.variants?.[0]?.id ?? ''
})

const def = computed<StaffExampleDef>(() => resolveStaffVariant(baseDef.value, selectedVariantId.value))

function selectVariant(id: string) {
  if (id === selectedVariantId.value) return
  // The score is about to change; never leave stale audio running under it.
  if (isPlayingThis.value) stop()
  selectedVariantId.value = id
}

const view = computed(() => {
  const locale: StaffLocale = props.locale === 'ja' ? 'ja' : 'en'
  const d = def.value
  const ui = uiCopy[locale]
  const parts: PartDef[] = [
    { part: 'upper', notes: d.upper, clef: d.upperClef, label: d.upperLabel?.[locale] ?? ui.upper },
  ]
  if (d.middle) {
    parts.push({ part: 'middle', notes: d.middle, clef: d.middleClef ?? 'treble', label: d.middleLabel?.[locale] ?? ui.middle })
  }
  parts.push({ part: 'lower', notes: d.lower, clef: d.lowerClef, label: d.lowerLabel?.[locale] ?? ui.lower })
  return {
    badge: d.badge[locale],
    title: d.title[locale],
    caption: renderInline(d.caption[locale]),
    diagnosis: renderInline(d.diagnosis[locale]),
    ruleIds: d.ruleIds,
    parts,
    playLabel: ui.play,
    stopLabel: ui.stop,
    sequentialHint: d.playback === 'sequential' ? ui.sequential : '',
    variants: (d.variants ?? []).map((variant) => ({ id: variant.id, label: variant.label[locale] })),
    variantsLabel: ui.variants,
    variantsHint: d.variantsHint?.[locale] ?? '',
  }
})

const verdict = computed(() => exampleVerdict(def.value))
/** Default color for overlay marks and issue rings without an explicit color. */
const markColor = computed(() => verdictColor(verdict.value))
const verdictIcon = computed(() => {
  switch (verdict.value) {
    case 'bad': return '✕'
    case 'good': return '✓'
    case 'caution': return '!'
    default: return ''
  }
})

async function togglePlay() {
  pending.value = true
  try {
    await play(props.example, def.value)
  } catch (error) {
    console.error('[CounterpointStaff] playback failed', error)
  } finally {
    pending.value = false
  }
}

/** Static SVG fallback, shown until VexFlow hydrates the score. */
const staticScoreSvg = computed(() => buildStaticScoreSvg(def.value, view.value.parts, markColor.value))

// --- VexFlow render & playback highlight -----------------------------------

/** Rendered note centers per part, for the playback highlight. */
let renderedPositions: Partial<Record<VoicePart, Array<{ x: number; y: number }>>> = {}
let highlightMarks: Partial<Record<VoicePart, SVGGElement>> = {}

async function render() {
  if (!target.value) return
  status.value = 'loading'
  try {
    const result = await renderVexFlow(target.value, {
      def: def.value,
      parts: view.value.parts,
      markColor: markColor.value,
    })
    renderedPositions = result.renderedPositions
    highlightMarks = result.highlightMarks
    status.value = 'ready'
  } catch (error) {
    console.error(error)
    status.value = 'error'
  }
}

useStaffHighlight({
  exampleId: () => props.example,
  playbackState,
  audioNow,
  progressFill,
  getMarks: () => highlightMarks,
  getPositions: () => renderedPositions,
})

onMounted(render)
watch(() => [props.example, props.locale, selectedVariantId.value], render)
</script>

<style scoped>
/*
 * Engraved score plate: the card chrome follows the docs theme, the score
 * itself sits on warm paper, and playback borrows the demo's candlelight
 * language — cold steel idle chrome that turns warm gold while sounding.
 */
.counterpoint-staff {
  /* Candlelight golds (RGB triplets for rgba() composition). */
  --staff-gold: 184, 146, 46;
  --staff-gold-light: 212, 166, 62;
  /* Cold steel idle chrome. */
  --staff-steel: 90, 107, 140;
  /* Verdict accent (slate until a verdict applies). */
  --staff-verdict: 100, 116, 139;
  --staff-verdict-text: #64748b;

  position: relative;
  margin: 1.75rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.5s ease, box-shadow 0.5s ease;
}

.dark .counterpoint-staff {
  --staff-steel: 144, 160, 192;
}

.counterpoint-staff[data-verdict="bad"] {
  --staff-verdict: 185, 28, 28;
  --staff-verdict-text: #b91c1c;
}

.counterpoint-staff[data-verdict="good"] {
  --staff-verdict: 4, 120, 87;
  --staff-verdict-text: #047857;
}

.counterpoint-staff[data-verdict="caution"] {
  --staff-verdict: 180, 83, 9;
  --staff-verdict-text: #b45309;
}

.dark .counterpoint-staff[data-verdict="bad"] { --staff-verdict-text: #e06c6c; }
.dark .counterpoint-staff[data-verdict="good"] { --staff-verdict-text: #34c39a; }
.dark .counterpoint-staff[data-verdict="caution"] { --staff-verdict-text: #d9924a; }

/* Verdict edge: a thin accent that fades out toward the caption. */
.counterpoint-staff::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(var(--staff-verdict), 0.95) 0%,
    rgba(var(--staff-verdict), 0.55) 60%,
    rgba(var(--staff-verdict), 0) 100%
  );
  pointer-events: none;
}

.counterpoint-staff[data-verdict="neutral"]::before {
  display: none;
}

/* While sounding, the whole plate catches candlelight. */
.counterpoint-staff[data-playing="true"] {
  border-color: rgba(var(--staff-gold-light), 0.45);
  box-shadow:
    0 0 0 1px rgba(var(--staff-gold-light), 0.1),
    0 6px 24px rgba(var(--staff-gold), 0.1),
    0 0 48px rgba(var(--staff-gold), 0.06);
}

/* --- Header ---------------------------------------------------------- */

.counterpoint-staff__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.65rem;
  padding: 0.8rem 0.9rem 0.7rem 1.1rem;
  color: var(--vp-c-text-1);
}

.counterpoint-staff__title {
  min-width: 0;
  font-size: 0.95rem;
  line-height: 1.35;
}

.counterpoint-staff__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  min-height: 1.4rem;
  padding: 0 0.6rem;
  border: 1px solid rgba(var(--staff-verdict), 0.3);
  border-radius: 999px;
  background: rgba(var(--staff-verdict), 0.09);
  color: var(--staff-verdict-text);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  white-space: nowrap;
}

.counterpoint-staff__badge-icon {
  font-size: 0.68rem;
  line-height: 1;
}

.counterpoint-staff__seq {
  color: var(--vp-c-text-3);
  font-size: 0.76rem;
  font-style: italic;
  white-space: nowrap;
}

/* --- Play control: cold stone that catches candlelight ----------------- */

.counterpoint-staff__play {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.15rem;
  height: 2.15rem;
  margin-left: auto;
  flex-shrink: 0;
  padding: 0;
  border: 1.5px solid rgba(var(--staff-steel), 0.45);
  border-radius: 50%;
  background: var(--vp-c-bg);
  color: rgb(var(--staff-steel));
  cursor: pointer;
  transition:
    border-color 0.3s ease,
    color 0.3s ease,
    background 0.3s ease,
    box-shadow 0.45s ease,
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.counterpoint-staff__play svg {
  width: 0.95rem;
  height: 0.95rem;
  fill: currentColor;
}

.counterpoint-staff__play:hover:not(:disabled) {
  border-color: rgba(var(--staff-gold-light), 0.65);
  color: rgb(var(--staff-gold));
  transform: scale(1.07);
  box-shadow:
    0 0 14px rgba(var(--staff-gold-light), 0.22),
    0 0 34px rgba(var(--staff-gold-light), 0.09);
}

.dark .counterpoint-staff__play:hover:not(:disabled) {
  color: #d4b86a;
}

.counterpoint-staff__play:active:not(:disabled) {
  transform: scale(0.95);
}

.counterpoint-staff__play[data-playing="true"] {
  border-color: rgba(var(--staff-gold-light), 0.7);
  background: rgba(var(--staff-gold-light), 0.1);
  color: rgb(var(--staff-gold));
  animation: staff-play-pulse 2.2s ease-out infinite;
}

.dark .counterpoint-staff__play[data-playing="true"] {
  color: #d4b86a;
}

@keyframes staff-play-pulse {
  0% {
    box-shadow:
      0 0 0 0 rgba(var(--staff-gold-light), 0.3),
      0 0 18px rgba(var(--staff-gold-light), 0.16);
  }
  70% {
    box-shadow:
      0 0 0 10px rgba(var(--staff-gold-light), 0),
      0 0 18px rgba(var(--staff-gold-light), 0.16);
  }
  100% {
    box-shadow:
      0 0 0 0 rgba(var(--staff-gold-light), 0),
      0 0 18px rgba(var(--staff-gold-light), 0.16);
  }
}

.counterpoint-staff__play:disabled {
  cursor: wait;
}

.counterpoint-staff__play-loader {
  width: 0.85rem;
  height: 0.85rem;
  border: 2px solid rgba(var(--staff-steel), 0.25);
  border-top-color: rgb(var(--staff-steel));
  border-radius: 50%;
  animation: staff-spin 0.9s linear infinite;
}

@keyframes staff-spin {
  to { transform: rotate(360deg); }
}

/* --- Variant switcher: engraved plate labels with a gilded stud --------- */

.counterpoint-staff__variants {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  padding: 0.05rem 1.1rem 0.7rem;
}

/* Italic lead-in that reads into the pills: "over the same ground — Aria…". */
.counterpoint-staff__variants-hint {
  margin-right: 0.2rem;
  color: var(--vp-c-text-3);
  font-size: 0.78rem;
  font-style: italic;
  letter-spacing: 0.01em;
}

.counterpoint-staff__variant {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  min-height: 1.6rem;
  padding: 0 0.8rem 0 0.66rem;
  border: 1px solid rgba(var(--staff-steel), 0.38);
  border-radius: 999px;
  background: transparent;
  color: rgba(var(--staff-steel), 0.95);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  font-variant-caps: small-caps;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 0.3s ease,
    color 0.3s ease,
    background 0.3s ease,
    box-shadow 0.45s ease;
}

/* The stud: a small mount that takes the candlelight when selected. */
.counterpoint-staff__variant::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(var(--staff-steel), 0.4);
  transition: background 0.3s ease, box-shadow 0.45s ease;
}

.counterpoint-staff__variant:hover:not([data-active="true"]) {
  border-color: rgba(var(--staff-gold-light), 0.55);
  color: rgb(var(--staff-gold));
}

.counterpoint-staff__variant:hover:not([data-active="true"])::before {
  background: rgba(var(--staff-gold-light), 0.7);
}

.dark .counterpoint-staff__variant:hover:not([data-active="true"]) {
  color: #d4b86a;
}

.counterpoint-staff__variant[data-active="true"] {
  border-color: rgba(var(--staff-gold-light), 0.68);
  background: linear-gradient(
    180deg,
    rgba(var(--staff-gold-light), 0.16),
    rgba(var(--staff-gold), 0.06)
  );
  color: rgb(var(--staff-gold));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 0 12px rgba(var(--staff-gold-light), 0.16),
    0 0 30px rgba(var(--staff-gold-light), 0.06);
  cursor: default;
}

.counterpoint-staff__variant[data-active="true"]::before {
  background: rgb(var(--staff-gold-light));
  box-shadow: 0 0 6px rgba(var(--staff-gold-light), 0.85);
}

.dark .counterpoint-staff__variant[data-active="true"] {
  color: #d4b86a;
}

/* --- Score: warm paper plate ------------------------------------------ */

.counterpoint-staff__score {
  position: relative;
  padding: 0.4rem 0.9rem 0.55rem;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(184, 146, 46, 0.05), transparent 65%),
    linear-gradient(180deg, #fffefb 0%, #faf6ee 100%);
  box-shadow:
    inset 0 1px 0 rgba(120, 95, 40, 0.08),
    inset 0 -1px 0 rgba(120, 95, 40, 0.08);
}

.dark .counterpoint-staff__score {
  background:
    radial-gradient(ellipse at 50% 0%, rgba(184, 146, 46, 0.06), transparent 65%),
    linear-gradient(180deg, #f7f3ea 0%, #efe9dc 100%);
}

/* A warm vignette breathes in while the example sounds. */
.counterpoint-staff__score::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 45%, rgba(212, 166, 62, 0.08), transparent 70%);
  opacity: 0;
  transition: opacity 0.6s ease;
}

.counterpoint-staff[data-playing="true"] .counterpoint-staff__score::after {
  opacity: 1;
}

/* Scores carry a viewBox, so they scale down to the container width
   instead of clipping; height: auto preserves the aspect ratio. */
.counterpoint-staff__score :deep(svg) {
  display: block;
  max-width: 100%;
  height: auto;
}

/* Each freshly engraved score settles onto the paper. */
.counterpoint-staff__renderer :deep(svg) {
  animation: staff-engrave-in 0.4s ease both;
}

@keyframes staff-engrave-in {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.counterpoint-staff__renderer[aria-hidden="true"] {
  display: none;
}

/* --- Progress hairline -------------------------------------------------- */

.counterpoint-staff__progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: rgba(var(--staff-gold), 0.14);
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
}

.counterpoint-staff[data-playing="true"] .counterpoint-staff__progress {
  opacity: 1;
}

.counterpoint-staff__progress-fill {
  height: 100%;
  transform: scaleX(0);
  transform-origin: left;
  background: linear-gradient(90deg, rgba(var(--staff-gold), 0.55), rgb(var(--staff-gold-light)));
  box-shadow: 0 0 8px rgba(var(--staff-gold-light), 0.55);
}

/* --- SVG annotations (static fallback + VexFlow overlay) ---------------- */

.counterpoint-staff__score :deep(.counterpoint-staff__svg-label) {
  font-family: var(--vp-font-family-base);
  font-size: 12px;
  font-weight: 700;
}

.counterpoint-staff__score :deep(.counterpoint-staff__svg-issue-label) {
  fill: #b91c1c;
  font-family: var(--vp-font-family-base);
  font-size: 11px;
  font-weight: 800;
}

.counterpoint-staff__score :deep(.counterpoint-staff__svg-issue-line),
.counterpoint-staff__score :deep(.counterpoint-staff__svg-bracket),
.counterpoint-staff__score :deep(.counterpoint-staff__svg-issue-box),
.counterpoint-staff__score :deep(.counterpoint-staff__svg-issue-ring) {
  fill: none;
  stroke: #b91c1c;
  stroke-width: 1.8;
  stroke-linecap: round;
}

.counterpoint-staff__score :deep(.counterpoint-staff__svg-issue-line) {
  opacity: 0.75;
  stroke-dasharray: 5 4;
}

.counterpoint-staff__score :deep(.counterpoint-staff__svg-issue-ring) {
  stroke-dasharray: 3 3;
}

.counterpoint-staff__score :deep(.counterpoint-staff__svg-issue-box) {
  opacity: 0.9;
  stroke-dasharray: 6 4;
}

.counterpoint-staff__score :deep(.counterpoint-staff__svg-clef),
.counterpoint-staff__score :deep(.counterpoint-staff__svg-time) {
  fill: #111827;
  font-family: var(--vp-font-family-base);
  font-size: 12px;
  font-weight: 700;
}

/* --- Playback highlight: candlelight on the sounding note --------------- */

.counterpoint-staff__score :deep(.counterpoint-staff__playhead) {
  pointer-events: none;
}

.counterpoint-staff__score :deep(.counterpoint-staff__playhead-halo) {
  fill: rgba(212, 166, 62, 0.32);
  filter: blur(5px);
}

.counterpoint-staff__score :deep(.counterpoint-staff__playhead-ring) {
  fill: rgba(212, 166, 62, 0.12);
  stroke: #b8922e;
  stroke-width: 1.8;
}

/* --- Caption & diagnosis ------------------------------------------------ */

.counterpoint-staff figcaption {
  margin: 0;
  padding: 0.85rem 1.1rem 0.4rem;
  color: var(--vp-c-text-2);
  font-size: 0.92rem;
  line-height: 1.65;
}

.counterpoint-staff__diagnosis {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.5rem;
  align-items: center;
  padding: 0.15rem 1.1rem 1rem;
  color: var(--vp-c-text-1);
  font-size: 0.86rem;
  line-height: 1.55;
}

/* Rule chips follow the example's verdict instead of always reading red. */
.counterpoint-staff__rule {
  display: inline-flex;
  align-items: center;
  min-height: 1.35rem;
  padding: 0 0.5rem;
  border: 1px solid rgba(var(--staff-verdict), 0.28);
  border-radius: 5px;
  background: rgba(var(--staff-verdict), 0.08);
  color: var(--staff-verdict-text);
  font-family: var(--vp-font-family-mono);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* --- Motion preferences ------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .counterpoint-staff,
  .counterpoint-staff__play,
  .counterpoint-staff__variant {
    transition: none;
  }

  .counterpoint-staff__renderer :deep(svg) {
    animation: none;
  }

  .counterpoint-staff__play[data-playing="true"] {
    animation: none;
    box-shadow: 0 0 18px rgba(var(--staff-gold-light), 0.16);
  }

  .counterpoint-staff__play:hover:not(:disabled) {
    transform: none;
  }
}
</style>
