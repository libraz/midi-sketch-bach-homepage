<script setup lang="ts">
import type { EventData } from '@/wasm/index'
import PianoRoll from '@/components/PianoRoll.vue'

defineProps<{
  currentTick: number
  duration: number
  eventData: EventData | null
  isGenerated: boolean
  isGenerating: boolean
  isLoading: boolean
  isPaused: boolean
  isPlaying: boolean
  isRegenerating: boolean
  labels: {
    download: string
    pause: string
    play: string
    regenerate: string
    stop: string
  }
  playLabel: string
}>()

defineEmits<{
  download: []
  play: []
  regenerate: []
  seek: [targetTick: number]
  stop: []
}>()
</script>

<template>
  <div class="bach-demo__stage">
    <PianoRoll
      :eventData="eventData"
      :currentTick="currentTick"
      :isPlaying="isPlaying"
      :duration="duration"
      @seek="$emit('seek', $event)"
    />

    <Transition name="overlay-fade">
      <div v-if="!isGenerated" class="stage-center" key="center">
        <button
          class="stage-play-btn stage-play-btn--lg"
          :class="{ 'stage-play-btn--loading': isLoading || isGenerating }"
          :disabled="isLoading || isGenerating"
          @click="$emit('play')"
        >
          <svg class="stage-play-btn__tracery" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="rgba(100,120,170,0.2)" stroke-width="0.5" />
            <circle cx="40" cy="40" r="35" stroke="rgba(100,120,170,0.12)" stroke-width="0.3" />
            <line v-for="n in 12" :key="n"
              x1="40" y1="40"
              :x2="40 + 38 * Math.cos((n * 30 - 90) * Math.PI / 180)"
              :y2="40 + 38 * Math.sin((n * 30 - 90) * Math.PI / 180)"
              stroke="rgba(100,120,170,0.1)" stroke-width="0.3" />
            <circle v-for="n in 4" :key="'t'+n"
              :cx="40 + 36.5 * Math.cos((n * 90 - 90) * Math.PI / 180)"
              :cy="40 + 36.5 * Math.sin((n * 90 - 90) * Math.PI / 180)"
              r="2" stroke="rgba(100,120,170,0.15)" stroke-width="0.4" fill="none" />
          </svg>
          <span v-if="isLoading || isGenerating" class="stage-play-btn__loader"></span>
          <svg v-else class="stage-play-btn__icon" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="7,3 21,12 7,21" />
          </svg>
        </button>
        <span class="stage-label">{{ playLabel }}</span>
      </div>
    </Transition>

    <Transition name="overlay-fade">
      <div v-if="isGenerated" class="stage-controls" key="controls">
        <button
          class="ctrl-btn ctrl-btn--download"
          :title="labels.download"
          @click="$emit('download')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        <div class="stage-transport">
          <button
            class="transport-btn transport-btn--play"
            :title="isPlaying ? labels.pause : labels.play"
            @click="$emit('play')"
          >
            <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="7,3 21,12 7,21" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4.5" height="16" rx="1" />
              <rect x="13.5" y="4" width="4.5" height="16" rx="1" />
            </svg>
          </button>

          <button
            class="transport-btn transport-btn--stop"
            :disabled="!isPlaying && !isPaused"
            :title="labels.stop"
            @click="$emit('stop')"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
          </button>

          <div class="transport-divider"></div>

          <button
            class="transport-btn transport-btn--regen"
            :class="{ 'transport-btn--spinning': isRegenerating }"
            :disabled="isGenerating || isRegenerating"
            :title="labels.regenerate"
            @click="$emit('regenerate')"
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
</template>

<style scoped>
.bach-demo__stage {
  position: relative;
  width: 100%;
  height: 320px;
  box-sizing: border-box;
  border: 1px solid rgba(58, 91, 160, 0.18);
  border-radius: 10px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(10, 10, 14, 0.5),
    0 4px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(58, 91, 160, 0.1),
    0 0 40px rgba(58, 91, 160, 0.04),
    0 0 60px rgba(155, 35, 53, 0.02);
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
}

.bach-demo__stage:hover {
  border-color: rgba(58, 91, 160, 0.28);
  box-shadow:
    0 0 0 1px rgba(10, 10, 14, 0.5),
    0 4px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(58, 91, 160, 0.12),
    0 0 50px rgba(58, 91, 160, 0.06),
    0 0 80px rgba(155, 35, 53, 0.03);
}

.stage-center {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  background: rgba(7, 8, 13, 0.15);
  backdrop-filter: blur(0.5px);
}

.stage-play-btn {
  position: relative;
  border-radius: 50%;
  border: 1.5px solid rgba(100, 120, 170, 0.3);
  background: rgba(7, 8, 13, 0.7);
  color: #A0B0D0;
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
  animation: breathe-glow 5s ease-in-out infinite;
}

/* Hover — the cold stone button catches candlelight */
.stage-play-btn--lg:hover:not(:disabled) {
  border-color: rgba(212, 166, 62, 0.5);
  background: rgba(12, 10, 7, 0.85);
  color: #D4B86A;
  transform: scale(1.06);
  animation: none;
  box-shadow:
    0 0 30px rgba(212, 166, 62, 0.2),
    0 0 60px rgba(212, 166, 62, 0.08),
    0 0 90px rgba(155, 35, 53, 0.05);
}

.stage-play-btn--lg:hover:not(:disabled) .stage-play-btn__tracery {
  opacity: 1;
  transform: rotate(15deg);
}

.stage-play-btn--lg:active:not(:disabled) {
  transform: scale(0.96);
}

.stage-play-btn--lg:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  animation: breathe-glow-loading 2.5s ease-in-out infinite;
}

.stage-play-btn__tracery {
  position: absolute;
  inset: -12px;
  width: calc(100% + 24px);
  height: calc(100% + 24px);
  pointer-events: none;
  opacity: 0.7;
  animation: breathe-tracery 5s ease-in-out infinite;
  transition: transform 1.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
}

@keyframes breathe-tracery {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.9; }
}

@keyframes breathe-glow {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(58, 91, 160, 0.15),
      0 0 40px rgba(155, 35, 53, 0.06),
      0 0 60px rgba(195, 155, 55, 0.04);
  }
  50% {
    box-shadow:
      0 0 30px rgba(58, 91, 160, 0.28),
      0 0 55px rgba(155, 35, 53, 0.12),
      0 0 80px rgba(195, 155, 55, 0.07);
  }
}

@keyframes breathe-glow-loading {
  0%, 100% {
    box-shadow: 0 0 12px rgba(58, 91, 160, 0.08);
    border-color: rgba(100, 120, 170, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(58, 91, 160, 0.15);
    border-color: rgba(100, 120, 170, 0.4);
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
  border: 2px solid rgba(100, 120, 170, 0.12);
  border-top-color: #8090B0;
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
  color: rgba(228, 224, 218, 0.45);
  transition: color 0.4s ease;
}

.stage-center:hover .stage-label {
  color: rgba(212, 184, 106, 0.75);
}

.stage-controls {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.ctrl-btn {
  pointer-events: auto;
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(100, 120, 170, 0.18);
  background: rgba(7, 8, 13, 0.8);
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
  border-color: rgba(100, 120, 170, 0.4);
  color: #A0B0D0;
  background: rgba(7, 8, 13, 0.9);
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

.stage-transport {
  pointer-events: auto;
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(7, 8, 13, 0.82);
  border: 1px solid rgba(100, 120, 170, 0.18);
  border-radius: 28px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.stage-transport:hover {
  border-color: rgba(100, 120, 170, 0.28);
}

.transport-divider {
  width: 1px;
  height: 20px;
  background: rgba(100, 120, 170, 0.12);
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
  color: #A0B0D0;
  background: rgba(100, 120, 170, 0.1);
}

.transport-btn:active:not(:disabled) {
  transform: scale(0.9);
}

.transport-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.transport-btn--play {
  width: 42px;
  height: 42px;
  color: #A0B0D0;
}

.transport-btn--play svg {
  width: 18px;
  height: 18px;
}

.transport-btn--play svg polygon {
  transform: translateX(1px);
}

.transport-btn--play:hover:not(:disabled) {
  color: #B0C0E0;
  background: rgba(58, 91, 160, 0.12);
}

.transport-btn--stop {
  width: 38px;
  height: 38px;
  color: rgba(107, 128, 152, 0.8);
}

.transport-btn--stop svg {
  width: 14px;
  height: 14px;
}

.transport-btn--stop:hover:not(:disabled) {
  color: #6B8098;
  background: rgba(61, 74, 92, 0.15);
}

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

@media (max-width: 768px) {
  .bach-demo__stage {
    height: 260px;
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

  .transport-btn--stop,
  .transport-btn--regen {
    width: 34px;
    height: 34px;
  }

  .transport-btn--stop svg {
    width: 12px;
    height: 12px;
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
}
</style>
