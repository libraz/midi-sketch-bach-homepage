import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useBachGeneration } from '@/composables/useBachGeneration'
import { useBachPlayer } from '@/composables/useBachPlayer'
import { useBachStore } from '@/stores/useBachStore'
import { getFormPreset } from '@/data/formPresets'
import {
  INSTRUMENT_NAMES,
  INSTRUMENT_OPTIONS,
  type FormCategory,
} from '@/data/bachDemoOptions'

export function useBachDemoController(t: (key: string) => string) {
  const generation = useBachGeneration()
  const player = useBachPlayer()
  const store = useBachStore()

  const showSettings = ref(false)
  const activeCategory = ref<FormCategory>('organ')
  const isLoading = ref(true)
  const isRegenerating = ref(false)

  const currentInstrumentName = computed(() => (
    INSTRUMENT_NAMES[store.config.instrument] ?? 'organ'
  ))

  const playLabel = computed(() => {
    if (isLoading.value) return t('demo.loading')
    if (generation.isGenerating.value) return t('demo.generating')
    if (player.isPlaying.value) return t('demo.pause')
    return t('demo.play')
  })

  const characterOptions = computed(() => {
    const chars = generation.getCharacters()
    return chars.map((c: { id: number; name: string; display?: string }) => ({
      id: c.id,
      label: c.display || c.name,
    }))
  })

  const configDirty = computed(() => {
    if (!store.isGenerated.value) return false
    return store.isConfigDirty()
  })

  watch(
    () => [
      store.config.form,
      store.config.key,
      store.config.isMinor,
      store.config.bpm,
      store.config.character,
      store.config.instrument,
      store.config.scale,
    ],
    () => {
      if (player.isPlaying.value || player.isPaused.value) {
        player.stop()
      }
    },
  )

  onMounted(() => {
    const initWasm = async () => {
      try {
        await generation.initialize()
      } catch (e) {
        console.error('WASM initialization failed:', e)
      } finally {
        isLoading.value = false
      }
    }

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => { initWasm() })
    } else {
      setTimeout(() => { initWasm() }, 100)
    }
  })

  onUnmounted(() => {
    player.stop()
    store.setGenerated(false)
    store.setEventData(null)
    store.lastGenConfig.value = null
  })

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

  async function handlePlay() {
    if (isLoading.value || generation.isGenerating.value) return

    if (player.isPlaying.value) {
      player.pause()
      return
    }

    try {
      await player.ensureAudioContext()

      if (player.isPaused.value && !configDirty.value) {
        await player.resume()
      } else if (!store.isGenerated.value || configDirty.value) {
        const ok = await doGenerate()
        if (ok && store.eventData.value) {
          await player.play(store.eventData.value, 0, currentInstrumentName.value)
        }
      } else if (store.eventData.value) {
        await player.play(store.eventData.value, 0, currentInstrumentName.value)
      }
    } catch (e) {
      console.error('Playback failed:', e)
      player.stop()
    }
  }

  function handleStop() {
    player.stop()
  }

  async function handleRegenerate() {
    if (generation.isGenerating.value) return

    isRegenerating.value = true
    const resumeTick = player.currentTick.value
    player.stop()

    try {
      await player.ensureAudioContext()

      const prevSeed = store.config.seed
      store.config.seed = 0

      const ok = await doGenerate()
      store.config.seed = prevSeed

      if (ok && store.eventData.value) {
        const fromTick = Math.min(resumeTick, store.eventData.value.total_ticks)
        await player.play(store.eventData.value, fromTick, currentInstrumentName.value)
      }
    } catch (e) {
      console.error('Regeneration failed:', e)
      player.stop()
    } finally {
      isRegenerating.value = false
    }
  }

  function selectForm(formId: number) {
    store.config.form = formId

    const preset = getFormPreset(formId)
    if (preset) {
      const instId = INSTRUMENT_OPTIONS.find(
        i => INSTRUMENT_NAMES[i.id] === preset.defaultInstrument,
      )?.id
      if (instId !== undefined) {
        store.config.instrument = instId
      }
      store.config.bpm = preset.defaultBpm
      activeCategory.value = preset.category
    }
  }

  async function handleSeek(targetTick: number) {
    if (!store.eventData.value) return

    try {
      await player.ensureAudioContext()
      player.stop()
      await player.play(store.eventData.value, targetTick, currentInstrumentName.value)
    } catch (e) {
      console.error('Seek failed:', e)
    }
  }

  function handleDownload() {
    if (!store.isGenerated.value) return
    generation.downloadMidi()
  }

  return {
    activeCategory,
    characterOptions,
    generation,
    handleDownload,
    handlePlay,
    handleRegenerate,
    handleSeek,
    handleStop,
    isLoading,
    isRegenerating,
    player,
    playLabel,
    selectForm,
    showSettings,
    store,
  }
}
