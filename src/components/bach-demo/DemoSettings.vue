<script setup lang="ts">
import { INSTRUMENT_OPTIONS, SCALE_OPTIONS } from '@/data/bachDemoOptions'
import type { BachStoreConfig } from '@/stores/useBachStore'
import { KEY_NAMES } from '@/utils/midiUtils'

defineProps<{
  characterOptions: Array<{ id: number; label: string }>
  config: BachStoreConfig
  show: boolean
  t: (key: string) => string
}>()

const emit = defineEmits<{
  'update:show': [show: boolean]
  randomizeSeed: []
}>()

function readNumber(event: Event): number {
  return Number((event.target as HTMLInputElement).value)
}
</script>

<template>
  <section class="bach-demo__settings">
    <button class="settings-toggle" @click="emit('update:show', !show)">
      {{ show ? t('demo.hideSettings') : t('demo.showSettings') }}
      <svg
        class="settings-toggle__chevron"
        :class="{ 'settings-toggle__chevron--open': show }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <Transition name="panel-slide">
      <div v-if="show" class="settings-panel">
        <div class="settings-group">
          <label class="settings-label">{{ t('config.key') }}</label>
          <div class="key-buttons">
            <button
              v-for="(name, index) in KEY_NAMES"
              :key="index"
              class="key-btn"
              :class="{
                'key-btn--selected': config.key === index,
                'key-btn--black': [1, 3, 6, 8, 10].includes(index),
              }"
              @click="config.key = index"
            >
              {{ name }}
            </button>
          </div>
        </div>

        <div class="settings-group">
          <label class="settings-label">{{ t('config.minor') }} / {{ t('config.major') }}</label>
          <div class="seg">
            <button
              class="seg__btn"
              :class="{ 'seg__btn--active': config.isMinor }"
              @click="config.isMinor = true"
            >{{ t('config.minor') }}</button>
            <button
              class="seg__btn"
              :class="{ 'seg__btn--active': !config.isMinor }"
              @click="config.isMinor = false"
            >{{ t('config.major') }}</button>
          </div>
        </div>

        <div class="settings-group settings-group--full">
          <label class="settings-label">{{ t('config.instrument') }}</label>
          <div class="seg seg--wrap">
            <button
              v-for="inst in INSTRUMENT_OPTIONS"
              :key="inst.id"
              class="seg__btn"
              :class="{ 'seg__btn--active': config.instrument === inst.id }"
              @click="config.instrument = inst.id"
            >{{ t(inst.labelKey) }}</button>
          </div>
        </div>

        <div class="settings-group settings-group--full">
          <label class="settings-label">{{ t('config.character') }}</label>
          <div class="seg seg--wrap">
            <button
              v-for="char in characterOptions"
              :key="char.id"
              class="seg__btn"
              :class="{ 'seg__btn--active': config.character === char.id }"
              @click="config.character = char.id"
            >{{ char.label }}</button>
          </div>
        </div>

        <div class="settings-group settings-group--full">
          <label class="settings-label">{{ t('config.bpm') }}: {{ config.bpm }}</label>
          <input
            type="range"
            class="settings-slider"
            :value="config.bpm"
            min="40"
            max="200"
            step="1"
            @input="config.bpm = readNumber($event)"
          />
        </div>

        <div class="settings-group settings-group--full">
          <label class="settings-label">{{ t('config.scale') }}</label>
          <div class="seg">
            <button
              v-for="scale in SCALE_OPTIONS"
              :key="scale.id"
              class="seg__btn"
              :class="{ 'seg__btn--active': config.scale === scale.id }"
              @click="config.scale = scale.id"
            >{{ t(scale.labelKey) }}</button>
          </div>
        </div>

        <div class="settings-group settings-group--full">
          <label class="settings-label">{{ t('config.seed') }}</label>
          <div class="seed-row">
            <input
              type="number"
              class="settings-input seed-input"
              :value="config.seed"
              min="0"
              @input="config.seed = Math.max(0, readNumber($event))"
            />
            <button class="seed-random-btn" @click="emit('randomizeSeed')">
              {{ t('config.seedRandom') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
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
  border: 1px solid rgba(100, 120, 170, 0.1);
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
  border: 1px solid rgba(100, 120, 170, 0.1);
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

.key-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  border: 1px solid rgba(100, 120, 170, 0.12);
  border-radius: 5px;
  overflow: hidden;
  background: rgba(100, 120, 170, 0.12);
}

.settings-group:has(.key-buttons) {
  grid-column: 1 / -1;
}

.key-btn {
  flex: 1 0 0;
  min-width: 0;
  height: 32px;
  border: none;
  border-radius: 0;
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
  background: rgba(100, 120, 170, 0.08);
  color: #E4E0DA;
}

.key-btn--selected {
  background: rgba(212, 166, 62, 0.1);
  color: #D4B86A;
}

.seg {
  display: flex;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid rgba(100, 120, 170, 0.12);
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

.seg:not(.seg--wrap) > .seg__btn + .seg__btn {
  border-left: 1px solid rgba(100, 120, 170, 0.06);
}

.seg__btn--active {
  background: rgba(212, 166, 62, 0.08);
  color: #D4B86A;
}

.seg__btn:hover:not(.seg__btn--active):not(:disabled) {
  background: rgba(26, 26, 34, 0.7);
  color: rgba(228, 224, 218, 0.6);
}

.seg--wrap {
  flex-wrap: wrap;
  gap: 1px;
  background: rgba(100, 120, 170, 0.12);
}

.seg--wrap .seg__btn {
  flex: 1 1 0;
  min-width: 60px;
  border-radius: 0;
  padding: 0.42rem 0.5rem;
  font-size: 0.72rem;
}

.seg--wrap .seg__btn--active {
  background: rgba(212, 166, 62, 0.1);
}

.settings-group--full {
  grid-column: 1 / -1;
}

.settings-input {
  padding: 0.4rem 0.55rem;
  border: 1px solid rgba(100, 120, 170, 0.12);
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
  border-color: rgba(100, 120, 170, 0.3);
}

.settings-slider {
  width: 100%;
  height: 3px;
  appearance: none;
  -webkit-appearance: none;
  background: rgba(100, 120, 170, 0.12);
  border-radius: 2px;
  outline: none;
  margin-top: 4px;
}

.settings-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #C0A45C;
  border: 2px solid #08080E;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.settings-slider::-webkit-slider-thumb:hover {
  box-shadow: 0 0 8px rgba(212, 166, 62, 0.35);
}

.settings-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #C0A45C;
  border: 2px solid #08080E;
  cursor: pointer;
}

.seed-row {
  display: flex;
  gap: 0.5rem;
}

.seed-input {
  flex: 1;
}

.seed-random-btn {
  padding: 0.4rem 0.7rem;
  border: 1px solid rgba(100, 120, 170, 0.18);
  border-radius: 5px;
  background: rgba(100, 120, 170, 0.06);
  color: #A0B0D0;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.seed-random-btn:hover {
  background: rgba(100, 120, 170, 0.12);
  border-color: rgba(100, 120, 170, 0.3);
}

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

@media (max-width: 768px) {
  .settings-panel {
    grid-template-columns: 1fr;
    gap: 0.9rem;
    padding: 1rem;
  }

  .settings-group:has(.key-buttons),
  .settings-group--full {
    grid-column: 1;
  }

  .key-btn {
    height: 28px;
    font-size: 0.66rem;
    flex: 1 0 calc(16.666% - 1px);
  }

  .seg__btn {
    font-size: 0.7rem;
    padding: 0.4rem 0.4rem;
  }

  .seg--wrap .seg__btn {
    min-width: 48px;
    font-size: 0.68rem;
    padding: 0.38rem 0.4rem;
  }
}
</style>
