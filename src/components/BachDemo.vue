<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { useBachDemoController } from '@/composables/useBachDemoController'
import DemoHeader from './bach-demo/DemoHeader.vue'
import DemoSettings from './bach-demo/DemoSettings.vue'
import DemoStage from './bach-demo/DemoStage.vue'
import FormSelector from './bach-demo/FormSelector.vue'
import OrnamentalDivider from './bach-demo/OrnamentalDivider.vue'

const { t } = useI18n()
const demo = useBachDemoController(t)

function randomizeSeed() {
  demo.store.config.seed = 0
}
</script>

<template>
  <div class="bach-demo">
    <DemoHeader
      :title="t('demo.title')"
      :subtitle="t('demo.subtitle')"
      :notice="t('demo.notice')"
    />

    <DemoStage
      :eventData="demo.store.eventData.value"
      :currentTick="demo.player.currentTick.value"
      :isPlaying="demo.player.isPlaying.value"
      :isPaused="demo.player.isPaused.value"
      :duration="demo.player.duration.value"
      :isGenerated="demo.store.isGenerated.value"
      :isLoading="demo.isLoading.value"
      :isGenerating="demo.generation.isGenerating.value"
      :isRegenerating="demo.isRegenerating.value"
      :playLabel="demo.playLabel.value"
      :labels="{
        download: t('demo.download'),
        pause: t('demo.pause'),
        play: t('demo.play'),
        regenerate: t('demo.regenerate'),
        restart: t('demo.restart'),
        stop: t('demo.stop'),
      }"
      @seek="demo.handleSeek"
      @play="demo.handlePlay"
      @stop="demo.handleStop"
      @restart="demo.handleRestart"
      @regenerate="demo.handleRegenerate"
      @download="demo.handleDownload"
    />

    <p v-if="demo.store.description.value" class="bach-demo__description">
      {{ demo.store.description.value }}
    </p>

    <OrnamentalDivider />

    <FormSelector
      v-model:activeCategory="demo.activeCategory.value"
      :selectedForm="demo.store.config.form"
      :t="t"
      @select="demo.selectForm"
    />

    <DemoSettings
      v-model:show="demo.showSettings.value"
      :config="demo.store.config"
      :characterOptions="demo.characterOptions.value"
      :t="t"
      @randomizeSeed="randomizeSeed"
    />
  </div>
</template>

<style scoped>
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

/* Orchestrated page entrance — each block rises in sequence, like voices entering a fugue */
.bach-demo > * {
  animation: demo-rise 0.85s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.bach-demo > :nth-child(1) { animation-delay: 0s; }
.bach-demo > :nth-child(2) { animation-delay: 0.18s; }
.bach-demo > :nth-child(3) { animation-delay: 0.32s; }
.bach-demo > :nth-child(4) { animation-delay: 0.44s; }
.bach-demo > :nth-child(5) { animation-delay: 0.54s; }
.bach-demo > :nth-child(6) { animation-delay: 0.62s; }

@keyframes demo-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bach-demo__description {
  width: 100%;
  margin: 0;
  padding: 0 1rem;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1rem;
  color: rgba(228, 224, 218, 0.5);
  line-height: 1.6;
  text-align: center;
  font-style: italic;
}

@media (max-width: 768px) {
  .bach-demo {
    gap: 1.2rem;
    padding: 0.75rem 0;
  }
}
</style>
