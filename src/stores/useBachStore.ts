import { reactive, ref } from 'vue'
import { getFormPreset } from '@/data/formPresets'
import type {
  BachConfig,
  CharacterId,
  DurationScaleId,
  EventData,
  FormId,
  InstrumentId,
  KeyId,
} from '@/wasm/index'

/**
 * Reactive store for Bach demo state (non-Pinia).
 * Singleton pattern via module-level state.
 */

export interface BachStoreConfig {
  form: number
  key: number
  isMinor: boolean
  bpm: number
  seed: number
  character: number
  instrument: number
  scale: number
}

const DEFAULT_CONFIG: BachStoreConfig = {
  form: 0, // Fugue
  key: 0, // C
  isMinor: false, // C major
  bpm: 85,
  seed: 0,
  character: 0,
  instrument: 0, // Organ
  scale: 3, // Full
}

const config = reactive<BachStoreConfig>({ ...DEFAULT_CONFIG })
const isGenerated = ref(false)
const eventData = ref<EventData | null>(null)
const description = ref('')

// Snapshot of config at last generation (seed excluded — seed=0 is "random")
const lastGenConfig = ref<Omit<BachStoreConfig, 'seed'> | null>(null)

export function useBachStore() {
  function resetConfig() {
    Object.assign(config, DEFAULT_CONFIG)
  }

  function setGenerated(value: boolean) {
    isGenerated.value = value
  }

  /** Save current config as the "last generated" baseline (excludes seed). */
  function snapshotConfig() {
    const { seed: _, ...rest } = { ...config }
    lastGenConfig.value = rest
  }

  /** True when current config differs from what was last generated. */
  function isConfigDirty(): boolean {
    const last = lastGenConfig.value
    if (!last) return true
    return (
      config.form !== last.form ||
      config.key !== last.key ||
      config.isMinor !== last.isMinor ||
      config.bpm !== last.bpm ||
      config.character !== last.character ||
      config.instrument !== last.instrument ||
      config.scale !== last.scale
    )
  }

  function setEventData(data: EventData | null) {
    eventData.value = data
    if (data) {
      description.value = data.description || ''
    } else {
      description.value = ''
    }
  }

  function toBachConfig(overrideSeed?: number): BachConfig {
    const preset = getFormPreset(config.form)
    const isOrgan = preset?.category === 'organ'

    // seed=0 means "random" — generate a random seed in JS to guarantee variety
    // (avoids relying on WASM's internal random seeding which may be deterministic)
    let seedValue = overrideSeed ?? config.seed
    if (seedValue === 0) {
      seedValue = Math.floor(Math.random() * 2147483647) + 1
    }

    // The engine types its preset ids as literal unions, while the enumeration
    // APIs that populate the UI hand back plain numbers — narrow at this boundary.
    const cfg: BachConfig = {
      form: config.form as FormId,
      key: config.key as KeyId,
      isMinor: config.isMinor,
      bpm: config.bpm,
      seed: seedValue,
      instrument: config.instrument as InstrumentId,
      scale: config.scale as DurationScaleId,
    }

    // Only include organ-specific options for organ forms
    if (isOrgan) {
      cfg.character = config.character as CharacterId
    }

    return cfg
  }

  return {
    config,
    isGenerated,
    eventData,
    description,
    lastGenConfig,
    resetConfig,
    setGenerated,
    snapshotConfig,
    isConfigDirty,
    setEventData,
    toBachConfig,
  }
}
