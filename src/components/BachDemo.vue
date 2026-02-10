<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useBachGeneration } from '@/composables/useBachGeneration'
import { useBachPlayer } from '@/composables/useBachPlayer'
import { useBachStore } from '@/stores/useBachStore'
import { FORM_PRESETS, getFormsByCategory } from '@/data/formPresets'
import { KEY_NAMES } from '@/utils/midiUtils'
import PianoRoll from './PianoRoll.vue'

const { t } = useI18n()
const generation = useBachGeneration()
const player = useBachPlayer()
const store = useBachStore()

// ── Local UI state ──────────────────────────────────────────────────────────

const showSettings = ref(false)
const activeCategory = ref<'organ' | 'solo'>('organ')
const isLoading = ref(true) // true until WASM init completes
const isRegenerating = ref(false)


// ── Instrument ID → name mapping ────────────────────────────────────────────

const INSTRUMENT_NAMES: Record<number, string> = {
  0: 'organ',
  1: 'harpsichord',
  2: 'piano',
  3: 'violin',
  4: 'cello',
  5: 'guitar',
}

const INSTRUMENT_OPTIONS = [
  { id: 0, labelKey: 'config.organ' },
  { id: 1, labelKey: 'config.harpsichord' },
  { id: 2, labelKey: 'config.piano' },
  { id: 3, labelKey: 'config.violin' },
  { id: 4, labelKey: 'config.cello' },
  { id: 5, labelKey: 'config.guitar' },
]

const SCALE_OPTIONS = [
  { id: 0, labelKey: 'config.scaleShort' },
  { id: 1, labelKey: 'config.scaleMedium' },
  { id: 2, labelKey: 'config.scaleLong' },
  { id: 3, labelKey: 'config.scaleFull' },
]

// ── Auto-stop playback on settings change ────────────────────────────────────
// When config changes during playback, stop immediately to prevent stale state.
// This gives a unified, predictable UX: change settings → stop → press play → regenerate.
watch(
  () => [
    store.config.form,
    store.config.key,
    store.config.isMinor,
    store.config.numVoices,
    store.config.bpm,
    store.config.character,
    store.config.instrument,
    store.config.scale,
  ],
  () => {
    if (player.isPlaying.value) {
      player.stop()
    }
  },
)

// ── Computed ─────────────────────────────────────────────────────────────────

const categories = computed(() => [
  { id: 'organ' as const, labelKey: 'form.organSystem' },
  { id: 'solo' as const, labelKey: 'form.soloString' },
])

const filteredForms = computed(() => getFormsByCategory(activeCategory.value))

const currentInstrumentName = computed(() => INSTRUMENT_NAMES[store.config.instrument] ?? 'organ')

const playLabel = computed(() => {
  if (isLoading.value) return t('demo.loading')
  if (generation.isGenerating.value) return t('demo.generating')
  if (player.isPlaying.value) return t('demo.stop')
  return t('demo.play')
})

const characterOptions = computed(() => {
  const chars = generation.getCharacters()
  return chars.map((c: { id: number; name: string; display?: string }) => ({
    id: c.id,
    label: c.display || c.name,
  }))
})

/** True when current settings differ from last generation. */
const configDirty = computed(() => {
  if (!store.isGenerated.value) return false
  return store.isConfigDirty()
})

// ── WASM Initialization ─────────────────────────────────────────────────────

onMounted(() => {
  // Start WASM initialization in background
  const initWasm = async () => {
    try {
      await generation.initialize()
      store.libVersion.value = generation.getVersion()
      isLoading.value = false
    } catch (e) {
      console.error('WASM initialization failed:', e)
      isLoading.value = false
    }
  }

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => { initWasm() })
  } else {
    setTimeout(() => { initWasm() }, 100)
  }
})

// ── Cleanup on page navigation ──────────────────────────────────────────────

onUnmounted(() => {
  player.stop()
  store.setGenerated(false)
  store.setEventData(null)
  store.lastGenConfig.value = null
})

// ── Generation ──────────────────────────────────────────────────────────────

async function doGenerate(): Promise<boolean> {
  try {
    const bachConfig = store.toBachConfig()
    const eventData = await generation.generate(bachConfig)
    store.setEventData(eventData)
    store.setGenerated(true)
    store.snapshotConfig()
    return true
  } catch (e) {
    console.error('Generation failed:', e)
    return false
  }
}

// ── Play / Stop ─────────────────────────────────────────────────────────────

async function handlePlay() {
  if (isLoading.value || generation.isGenerating.value) return

  if (player.isPlaying.value) {
    player.stop()
    return
  }

  try {
    // Resume AudioContext in user gesture context before any awaits
    await player.ensureAudioContext()

    if (!store.isGenerated.value || configDirty.value) {
      // First play OR settings changed → generate then play
      const ok = await doGenerate()
      if (ok && store.eventData.value) {
        await player.play(store.eventData.value, 0, currentInstrumentName.value)
      }
    } else if (store.eventData.value) {
      // Settings unchanged → replay existing piece
      await player.play(store.eventData.value, 0, currentInstrumentName.value)
    }
  } catch (e) {
    console.error('Playback failed:', e)
    player.stop()
  }
}

// ── Regenerate ──────────────────────────────────────────────────────────────

async function handleRegenerate() {
  if (generation.isGenerating.value) return

  isRegenerating.value = true
  player.stop()

  try {
    // Resume AudioContext in user gesture context
    await player.ensureAudioContext()

    // Set seed to 0 (random) for regeneration
    const prevSeed = store.config.seed
    store.config.seed = 0

    const ok = await doGenerate()

    // Restore seed in config (the actual seed used is in eventData)
    store.config.seed = prevSeed

    // Always auto-play after regeneration
    if (ok && store.eventData.value) {
      await player.play(store.eventData.value, 0, currentInstrumentName.value)
    }
  } catch (e) {
    console.error('Regeneration failed:', e)
    player.stop()
  } finally {
    isRegenerating.value = false
  }
}

// ── Form selection ──────────────────────────────────────────────────────────

function selectForm(formId: number) {
  store.config.form = formId

  // Apply form defaults for instrument and voices
  const preset = FORM_PRESETS.find(f => f.id === formId)
  if (preset) {
    const instId = INSTRUMENT_OPTIONS.find(
      i => INSTRUMENT_NAMES[i.id] === preset.defaultInstrument,
    )?.id
    if (instId !== undefined) {
      store.config.instrument = instId
    }
    store.config.numVoices = preset.defaultVoices
    store.config.bpm = preset.defaultBpm

    // Switch to the right category tab
    activeCategory.value = preset.category
  }
}

// ── Settings helpers ────────────────────────────────────────────────────────

function selectKey(index: number) {
  store.config.key = index
}

function toggleMode() {
  store.config.isMinor = !store.config.isMinor
}

function randomizeSeed() {
  store.config.seed = 0
}

// ── Download ────────────────────────────────────────────────────────────────

function handleDownload() {
  if (!store.isGenerated.value) return
  generation.downloadMidi()
}
</script>

<template>
  <div class="bach-demo">
    <!-- Header -->
    <header class="bach-demo__header">
      <div class="header-ornament">
        <span class="header-ornament__line"></span>
        <span class="header-ornament__diamond"></span>
        <span class="header-ornament__line"></span>
      </div>
      <h1 class="bach-demo__title">{{ t('demo.title') }}</h1>
      <p class="bach-demo__subtitle">{{ t('demo.subtitle') }}</p>
    </header>

    <!-- Stage: Piano Roll + Integrated Controls -->
    <div class="bach-demo__stage">
      <PianoRoll
        :eventData="store.eventData.value"
        :currentTick="player.currentTick.value"
        :isPlaying="player.isPlaying.value"
        :duration="player.duration.value"
      />

      <!-- Centered play overlay (before first generation) -->
      <Transition name="overlay-fade">
        <div v-if="!store.isGenerated.value" class="stage-center" key="center">
          <button
            class="stage-play-btn stage-play-btn--lg"
            :class="{
              'stage-play-btn--loading': isLoading || generation.isGenerating.value,
            }"
            :disabled="isLoading || generation.isGenerating.value"
            @click="handlePlay"
          >
            <span v-if="isLoading || generation.isGenerating.value" class="stage-play-btn__loader"></span>
            <svg
              v-else
              class="stage-play-btn__icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <polygon points="7,3 21,12 7,21" />
            </svg>
          </button>
          <span class="stage-label">{{ playLabel }}</span>
        </div>
      </Transition>

      <!-- Controls (after generation) -->
      <Transition name="overlay-fade">
        <div v-if="store.isGenerated.value" class="stage-controls" key="controls">
          <!-- Download — top-left corner -->
          <button
            class="ctrl-btn ctrl-btn--download"
            :title="t('demo.download')"
            @click="handleDownload"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>

          <!-- Bottom center: Play + Regenerate -->
          <div class="stage-transport">
            <button
              class="transport-btn transport-btn--play"
              :class="{
                'transport-btn--is-stop': player.isPlaying.value,
              }"
              @click="handlePlay"
            >
              <svg
                v-if="!player.isPlaying.value"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="7,3 21,12 7,21" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="5" y="5" width="14" height="14" rx="2" />
              </svg>
            </button>

            <div class="transport-divider"></div>

            <button
              class="transport-btn transport-btn--regen"
              :class="{ 'transport-btn--spinning': isRegenerating }"
              :disabled="generation.isGenerating.value || isRegenerating"
              :title="t('demo.regenerate')"
              @click="handleRegenerate"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6" />
                <path d="M2.5 22v-6h6" />
                <path d="M2.7 15.3a9 9 0 0 0 15.8 2.9l3-3" />
                <path d="M21.3 8.7a9 9 0 0 0-15.8-2.9l-3 3" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Description -->
    <p v-if="store.description.value" class="bach-demo__description">
      {{ store.description.value }}
    </p>

    <!-- Ornamental Divider -->
    <div class="bach-demo__divider">
      <span class="divider__line"></span>
      <span class="divider__diamond"></span>
      <span class="divider__line"></span>
    </div>

    <!-- Form Selector -->
    <section class="bach-demo__forms">
      <div class="category-tabs">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="category-tab"
          :class="{ 'category-tab--active': activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          {{ t(cat.labelKey) }}
        </button>
      </div>
      <div class="form-cards">
        <button
          v-for="form in filteredForms"
          :key="form.id"
          class="form-card"
          :class="{ 'form-card--selected': store.config.form === form.id }"
          @click="selectForm(form.id)"
        >
          <span class="form-card__name">{{ t(form.displayKey) }}</span>
          <span class="form-card__desc">{{ t(form.descKey) }}</span>
        </button>
      </div>
    </section>

    <!-- Settings Panel -->
    <section class="bach-demo__settings">
      <button class="settings-toggle" @click="showSettings = !showSettings">
        {{ showSettings ? t('demo.hideSettings') : t('demo.showSettings') }}
        <svg
          class="settings-toggle__chevron"
          :class="{ 'settings-toggle__chevron--open': showSettings }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <Transition name="panel-slide">
        <div v-if="showSettings" class="settings-panel">
          <!-- Key Selector -->
          <div class="settings-group">
            <label class="settings-label">{{ t('config.key') }}</label>
            <div class="key-buttons">
              <button
                v-for="(name, index) in KEY_NAMES"
                :key="index"
                class="key-btn"
                :class="{
                  'key-btn--selected': store.config.key === index,
                  'key-btn--black': [1, 3, 6, 8, 10].includes(index),
                }"
                @click="selectKey(index)"
              >
                {{ name }}
              </button>
            </div>
          </div>

          <!-- Mode: Minor / Major -->
          <div class="settings-group">
            <label class="settings-label">{{ t('config.minor') }} / {{ t('config.major') }}</label>
            <div class="seg">
              <button
                class="seg__btn"
                :class="{ 'seg__btn--active': store.config.isMinor }"
                @click="store.config.isMinor = true"
              >{{ t('config.minor') }}</button>
              <button
                class="seg__btn"
                :class="{ 'seg__btn--active': !store.config.isMinor }"
                @click="store.config.isMinor = false"
              >{{ t('config.major') }}</button>
            </div>
          </div>

          <!-- Voices -->
          <div class="settings-group">
            <label class="settings-label">{{ t('config.voices') }}</label>
            <div class="seg">
              <button
                v-for="v in [2, 3, 4, 5]"
                :key="v"
                class="seg__btn"
                :class="{ 'seg__btn--active': store.config.numVoices === v }"
                @click="store.config.numVoices = v"
              >{{ v }}</button>
            </div>
          </div>

          <!-- Instrument -->
          <div class="settings-group settings-group--full">
            <label class="settings-label">{{ t('config.instrument') }}</label>
            <div class="seg seg--wrap">
              <button
                v-for="inst in INSTRUMENT_OPTIONS"
                :key="inst.id"
                class="seg__btn"
                :class="{ 'seg__btn--active': store.config.instrument === inst.id }"
                @click="store.config.instrument = inst.id"
              >{{ t(inst.labelKey) }}</button>
            </div>
          </div>

          <!-- Character -->
          <div class="settings-group settings-group--full">
            <label class="settings-label">{{ t('config.character') }}</label>
            <div class="seg seg--wrap">
              <button
                v-for="char in characterOptions"
                :key="char.id"
                class="seg__btn"
                :class="{ 'seg__btn--active': store.config.character === char.id }"
                @click="store.config.character = char.id"
              >{{ char.label }}</button>
            </div>
          </div>

          <!-- BPM -->
          <div class="settings-group settings-group--full">
            <label class="settings-label">{{ t('config.bpm') }}: {{ store.config.bpm }}</label>
            <input
              type="range"
              class="settings-slider"
              :value="store.config.bpm"
              min="40"
              max="200"
              step="1"
              @input="store.config.bpm = Number(($event.target as HTMLInputElement).value)"
            />
          </div>

          <!-- Duration Scale -->
          <div class="settings-group settings-group--full">
            <label class="settings-label">{{ t('config.scale') }}</label>
            <div class="seg">
              <button
                v-for="s in SCALE_OPTIONS"
                :key="s.id"
                class="seg__btn"
                :class="{ 'seg__btn--active': store.config.scale === s.id }"
                @click="store.config.scale = s.id"
              >{{ t(s.labelKey) }}</button>
            </div>
          </div>

          <!-- Seed -->
          <div class="settings-group settings-group--full">
            <label class="settings-label">{{ t('config.seed') }}</label>
            <div class="seed-row">
              <input
                type="number"
                class="settings-input seed-input"
                :value="store.config.seed"
                min="0"
                @input="store.config.seed = Math.max(0, Number(($event.target as HTMLInputElement).value))"
              />
              <button class="seed-random-btn" @click="randomizeSeed">
                {{ t('config.seedRandom') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </section>
  </div>
</template>

<style scoped>
/* ── Base Container ────────────────────────────────────────────────────── */

.bach-demo {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.6rem;
  padding: 1.5rem 0;
}

/* ── Header ────────────────────────────────────────────────────────────── */

.bach-demo__header {
  text-align: center;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.header-ornament {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.3rem;
}

.header-ornament__line {
  width: 36px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(184, 146, 46, 0.35));
}

.header-ornament__line:last-child {
  background: linear-gradient(90deg, rgba(184, 146, 46, 0.35), transparent);
}

.header-ornament__diamond {
  width: 6px;
  height: 6px;
  border: 1px solid rgba(184, 146, 46, 0.4);
  transform: rotate(45deg);
  animation: breathe-diamond 4s ease-in-out infinite;
}

@keyframes breathe-diamond {
  0%, 100% { border-color: rgba(184, 146, 46, 0.25); }
  50% { border-color: rgba(184, 146, 46, 0.55); }
}

.bach-demo__title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.4rem;
  font-weight: 300;
  letter-spacing: 0.2em;
  margin: 0;
  color: #E4E0DA;
  line-height: 1.2;
}

.bach-demo__subtitle {
  margin: 0;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.68rem;
  color: rgba(228, 224, 218, 0.3);
  letter-spacing: 0.16em;
  font-weight: 500;
  text-transform: uppercase;
}

/* ── Stage: Piano Roll + Controls ─────────────────────────────────────── */

.bach-demo__stage {
  position: relative;
  width: 100%;
  height: 222px;
  box-sizing: border-box;
  border: 1px solid rgba(184, 146, 46, 0.12);
  border-radius: 10px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(10, 10, 14, 0.5),
    0 4px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(184, 146, 46, 0.06);
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}

.bach-demo__stage:hover {
  border-color: rgba(184, 146, 46, 0.18);
}

/* ── Centered Play Overlay (Pre-Generation) ───────────────────────────── */

.stage-center {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  background: rgba(13, 10, 7, 0.25);
  backdrop-filter: blur(1px);
}

.stage-play-btn {
  border-radius: 50%;
  border: 1.5px solid rgba(184, 146, 46, 0.35);
  background: rgba(13, 10, 7, 0.7);
  color: #C4B498;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  padding: 0;
}

.stage-play-btn--lg {
  width: 64px;
  height: 64px;
  animation: breathe-glow 3s ease-in-out infinite;
}

.stage-play-btn--lg:hover:not(:disabled) {
  border-color: rgba(184, 146, 46, 0.6);
  background: rgba(13, 10, 7, 0.85);
  transform: scale(1.06);
}

.stage-play-btn--lg:active:not(:disabled) {
  transform: scale(0.96);
}

.stage-play-btn--lg:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  animation: breathe-glow-loading 2s ease-in-out infinite;
}

@keyframes breathe-glow {
  0%, 100% {
    box-shadow: 0 0 16px rgba(184, 146, 46, 0.08), 0 0 32px rgba(184, 146, 46, 0.04);
  }
  50% {
    box-shadow: 0 0 22px rgba(184, 146, 46, 0.16), 0 0 44px rgba(184, 146, 46, 0.08);
  }
}

@keyframes breathe-glow-loading {
  0%, 100% {
    box-shadow: 0 0 12px rgba(184, 146, 46, 0.06);
    border-color: rgba(184, 146, 46, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(184, 146, 46, 0.12);
    border-color: rgba(184, 146, 46, 0.4);
  }
}

.stage-play-btn__icon {
  width: 22px;
  height: 22px;
  margin-left: 2px;
}

.stage-play-btn__loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(184, 146, 46, 0.12);
  border-top-color: #A89878;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stage-label {
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(228, 224, 218, 0.3);
}

/* ── Post-Generation Controls ─────────────────────────────────────────── */

.stage-controls {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

/* Download — top-left corner (secondary) */
.ctrl-btn {
  pointer-events: auto;
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(168, 152, 120, 0.2);
  background: rgba(13, 10, 7, 0.8);
  color: rgba(228, 224, 218, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
}

.ctrl-btn:hover:not(:disabled) {
  border-color: rgba(168, 152, 120, 0.45);
  color: #C4B498;
  background: rgba(13, 10, 7, 0.9);
}

.ctrl-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.ctrl-btn svg {
  width: 15px;
  height: 15px;
}

.ctrl-btn--download {
  top: 10px;
  left: 10px;
  width: 34px;
  height: 34px;
}

/* Transport bar — bottom center: Play + Regenerate paired */
.stage-transport {
  pointer-events: auto;
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(13, 10, 7, 0.82);
  border: 1px solid rgba(184, 146, 46, 0.2);
  border-radius: 28px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.stage-transport:hover {
  border-color: rgba(184, 146, 46, 0.3);
}

.transport-divider {
  width: 1px;
  height: 20px;
  background: rgba(168, 152, 120, 0.15);
  flex-shrink: 0;
}

.transport-btn {
  border: none;
  background: transparent;
  color: rgba(228, 224, 218, 0.55);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.transport-btn:hover:not(:disabled) {
  color: #C4B498;
  background: rgba(168, 152, 120, 0.1);
}

.transport-btn:active:not(:disabled) {
  transform: scale(0.9);
}

.transport-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Play / Stop — primary, larger */
.transport-btn--play {
  width: 42px;
  height: 42px;
  color: #C4B498;
}

.transport-btn--play svg {
  width: 18px;
  height: 18px;
}

.transport-btn--play:not(.transport-btn--is-stop) svg {
  margin-left: 2px;
}

.transport-btn--play:hover:not(:disabled) {
  color: #D4C8B0;
  background: rgba(184, 146, 46, 0.12);
}

.transport-btn--is-stop {
  color: rgba(107, 128, 152, 0.8);
}

.transport-btn--is-stop:hover:not(:disabled) {
  color: #6B8098;
  background: rgba(61, 74, 92, 0.15);
}

/* Regenerate — secondary, slightly smaller */
.transport-btn--regen {
  width: 38px;
  height: 38px;
}

.transport-btn--regen svg {
  width: 16px;
  height: 16px;
}

.transport-btn--spinning svg {
  animation: spin 0.8s linear infinite;
}

/* ── Overlay Transitions ──────────────────────────────────────────────── */

.overlay-fade-enter-active {
  transition: opacity 0.4s ease 0.15s;
}

.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* ── Settings Panel Transition ────────────────────────────────────────── */

.panel-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Description ───────────────────────────────────────────────────────── */

.bach-demo__description {
  width: 100%;
  margin: 0;
  padding: 0 1rem;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1rem;
  color: rgba(228, 224, 218, 0.4);
  line-height: 1.6;
  text-align: center;
  font-style: italic;
}

/* ── Ornamental Divider ───────────────────────────────────────────────── */

.bach-demo__divider {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 60%;
  padding: 0.2rem 0;
}

.divider__line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(184, 146, 46, 0.18), transparent);
}

.divider__line:first-child {
  background: linear-gradient(90deg, transparent, rgba(184, 146, 46, 0.18));
}

.divider__line:last-child {
  background: linear-gradient(90deg, rgba(184, 146, 46, 0.18), transparent);
}

.divider__diamond {
  width: 5px;
  height: 5px;
  border: 1px solid rgba(184, 146, 46, 0.25);
  transform: rotate(45deg);
  flex-shrink: 0;
}

/* ── Form Selector ─────────────────────────────────────────────────────── */

.bach-demo__forms {
  width: 100%;
}

.category-tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  padding: 0 0.25rem;
}

.category-tab {
  flex: 1;
  padding: 0.55rem 1rem;
  border: 1px solid rgba(168, 152, 120, 0.1);
  border-radius: 6px;
  background: rgba(26, 26, 34, 0.4);
  color: rgba(228, 224, 218, 0.4);
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.category-tab:hover {
  background: rgba(26, 26, 34, 0.6);
  color: rgba(228, 224, 218, 0.6);
}

.category-tab--active {
  background: rgba(168, 152, 120, 0.08);
  border-color: rgba(168, 152, 120, 0.25);
  color: #C4B498;
}

.form-cards {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding: 0.25rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(168, 152, 120, 0.15) transparent;
  -webkit-overflow-scrolling: touch;
}

.form-cards::-webkit-scrollbar {
  height: 3px;
}

.form-cards::-webkit-scrollbar-track {
  background: transparent;
}

.form-cards::-webkit-scrollbar-thumb {
  background: rgba(168, 152, 120, 0.15);
  border-radius: 3px;
}

.form-card {
  flex: 0 0 auto;
  min-width: 130px;
  max-width: 170px;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgba(168, 152, 120, 0.08);
  border-radius: 6px;
  background: rgba(26, 26, 34, 0.5);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
  transition: all 0.2s ease;
}

.form-card:hover {
  border-color: rgba(168, 152, 120, 0.2);
  background: rgba(26, 26, 34, 0.7);
}

.form-card--selected {
  border-color: rgba(168, 152, 120, 0.35);
  background: rgba(168, 152, 120, 0.06);
  box-shadow: 0 0 12px rgba(168, 152, 120, 0.06);
}

.form-card__name {
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #E4E0DA;
  line-height: 1.3;
}

.form-card--selected .form-card__name {
  color: #C4B498;
}

.form-card__desc {
  font-size: 0.68rem;
  color: rgba(228, 224, 218, 0.35);
  line-height: 1.4;
}

/* ── Settings Panel ────────────────────────────────────────────────────── */

.bach-demo__settings {
  width: 100%;
}

.settings-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border: 1px solid rgba(168, 152, 120, 0.1);
  border-radius: 6px;
  background: rgba(26, 26, 34, 0.4);
  color: rgba(228, 224, 218, 0.45);
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-toggle:hover {
  background: rgba(26, 26, 34, 0.6);
  color: rgba(228, 224, 218, 0.65);
}

.settings-toggle__chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.3s ease;
  opacity: 0.6;
}

.settings-toggle__chevron--open {
  transform: rotate(180deg);
}

.settings-panel {
  margin-top: 0.6rem;
  padding: 1.2rem 1.4rem;
  border: 1px solid rgba(168, 152, 120, 0.1);
  border-radius: 6px;
  background: rgba(26, 26, 34, 0.5);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem 1.4rem;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.settings-label {
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.68rem;
  font-weight: 600;
  color: rgba(228, 224, 218, 0.4);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Key buttons — fill available width */
.key-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.settings-group:has(.key-buttons) {
  grid-column: 1 / -1;
}

.key-btn {
  flex: 1 0 0;
  min-width: 0;
  height: 32px;
  border: 1px solid rgba(168, 152, 120, 0.12);
  border-radius: 4px;
  background: rgba(26, 26, 34, 0.5);
  color: rgba(228, 224, 218, 0.55);
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.key-btn--black {
  background: rgba(10, 10, 14, 0.7);
  color: rgba(228, 224, 218, 0.4);
}

.key-btn:hover {
  border-color: rgba(168, 152, 120, 0.3);
  color: #E4E0DA;
}

.key-btn--selected {
  background: rgba(168, 152, 120, 0.12);
  border-color: #A89878;
  color: #C4B498;
}

/* Unified segment control (.seg) */
.seg {
  display: flex;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid rgba(168, 152, 120, 0.12);
}

.seg__btn {
  flex: 1;
  padding: 0.48rem 0.55rem;
  border: none;
  background: rgba(26, 26, 34, 0.5);
  color: rgba(228, 224, 218, 0.4);
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.seg__btn + .seg__btn {
  border-left: 1px solid rgba(168, 152, 120, 0.06);
}

.seg__btn--active {
  background: rgba(168, 152, 120, 0.1);
  color: #C4B498;
}

.seg__btn:hover:not(.seg__btn--active) {
  background: rgba(26, 26, 34, 0.7);
  color: rgba(228, 224, 218, 0.6);
}

/* Wrapped fill variant — items fill width, wrap on narrow screens */
.seg--wrap {
  flex-wrap: wrap;
  gap: 4px;
  border: none;
  border-radius: 0;
  overflow: visible;
}

.seg--wrap .seg__btn {
  flex: 1 1 0;
  min-width: 60px;
  border: 1px solid rgba(168, 152, 120, 0.12);
  border-radius: 4px;
  padding: 0.42rem 0.5rem;
  font-size: 0.72rem;
}

.seg--wrap .seg__btn + .seg__btn {
  border-left: 1px solid rgba(168, 152, 120, 0.12);
}

.seg--wrap .seg__btn--active {
  border-color: #A89878;
  background: rgba(168, 152, 120, 0.12);
}

.seg--wrap .seg__btn:hover:not(.seg__btn--active) {
  border-color: rgba(168, 152, 120, 0.28);
}

/* Full-width settings group */
.settings-group--full {
  grid-column: 1 / -1;
}

/* Number input */
.settings-input {
  padding: 0.4rem 0.55rem;
  border: 1px solid rgba(168, 152, 120, 0.12);
  border-radius: 5px;
  background: rgba(26, 26, 34, 0.5);
  color: #E4E0DA;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.78rem;
  width: 100%;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  -moz-appearance: textfield;
}

.settings-input::-webkit-inner-spin-button,
.settings-input::-webkit-outer-spin-button {
  opacity: 1;
}

.settings-input:hover,
.settings-input:focus {
  border-color: rgba(168, 152, 120, 0.3);
}

/* Range slider */
.settings-slider {
  width: 100%;
  height: 3px;
  appearance: none;
  -webkit-appearance: none;
  background: rgba(168, 152, 120, 0.12);
  border-radius: 2px;
  outline: none;
  margin-top: 4px;
}

.settings-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #A89878;
  border: 2px solid #0A0A0E;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.settings-slider::-webkit-slider-thumb:hover {
  box-shadow: 0 0 8px rgba(168, 152, 120, 0.3);
}

.settings-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #A89878;
  border: 2px solid #0A0A0E;
  cursor: pointer;
}


/* Seed row */
.seed-row {
  display: flex;
  gap: 0.5rem;
}

.seed-input {
  flex: 1;
}

.seed-random-btn {
  padding: 0.4rem 0.7rem;
  border: 1px solid rgba(168, 152, 120, 0.18);
  border-radius: 5px;
  background: rgba(168, 152, 120, 0.06);
  color: #C4B498;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.seed-random-btn:hover {
  background: rgba(168, 152, 120, 0.12);
  border-color: rgba(168, 152, 120, 0.3);
}


/* ── Responsive ────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  .bach-demo {
    gap: 1.2rem;
    padding: 0.75rem 0;
  }

  .bach-demo__title {
    font-size: 1.7rem;
    letter-spacing: 0.14em;
  }

  .bach-demo__subtitle {
    font-size: 0.6rem;
  }

  .header-ornament__line {
    width: 24px;
  }

  .stage-play-btn--lg {
    width: 56px;
    height: 56px;
  }

  .stage-play-btn__icon {
    width: 18px;
    height: 18px;
  }

  .transport-btn--play {
    width: 38px;
    height: 38px;
  }

  .transport-btn--play svg {
    width: 16px;
    height: 16px;
  }

  .transport-btn--regen {
    width: 34px;
    height: 34px;
  }

  .transport-btn--regen svg {
    width: 14px;
    height: 14px;
  }

  .ctrl-btn--download {
    width: 30px;
    height: 30px;
  }

  .ctrl-btn--download svg {
    width: 13px;
    height: 13px;
  }

  .settings-panel {
    grid-template-columns: 1fr;
    gap: 0.9rem;
    padding: 1rem;
  }

  .settings-group:has(.key-buttons),
  .settings-group--full {
    grid-column: 1;
  }

  .key-buttons {
    gap: 2px;
  }

  .key-btn {
    height: 28px;
    font-size: 0.66rem;
    flex: 1 0 calc(16.666% - 2px);
  }

  .seg__btn {
    font-size: 0.7rem;
    padding: 0.4rem 0.4rem;
  }

  .seg--wrap .seg__btn {
    min-width: 50px;
    font-size: 0.68rem;
    padding: 0.38rem 0.4rem;
  }

  .form-card {
    min-width: 115px;
    max-width: 155px;
  }

  .bach-demo__divider {
    width: 50%;
  }
}
</style>
