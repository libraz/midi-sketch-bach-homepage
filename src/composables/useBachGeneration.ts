import { ref } from 'vue'
import type { BachConfig, EventData, BachGenerator } from '@/wasm/index'

/**
 * Singleton WASM instance management for Bach generator.
 */

let _module: typeof import('../wasm/index.js') | null = null
let _instance: BachGenerator | null = null
let _isInitialized = false
let _initPromise: Promise<void> | null = null

export function useBachGeneration() {
  const isInitializing = ref(false)
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  /**
   * Initialize the WASM module (no BachGenerator instance created here).
   */
  async function initialize(): Promise<void> {
    if (_isInitialized) return

    if (_initPromise) {
      await _initPromise
      return
    }

    isInitializing.value = true
    error.value = null

    _initPromise = (async () => {
      try {
        const mod = await import('../wasm/index.js')
        _module = mod
        const wasmPath = new URL('../wasm/bach.wasm', import.meta.url).href
        await mod.init({ wasmPath })
        _isInitialized = true
      } catch (e: any) {
        error.value = e.message
        throw e
      } finally {
        isInitializing.value = false
        _initPromise = null
      }
    })()

    await _initPromise
  }

  /**
   * Generate a Bach composition from config.
   * Creates a fresh BachGenerator instance each time to match
   * the original demo behavior and avoid WASM state leaks.
   */
  async function generate(config: BachConfig): Promise<EventData> {
    await initialize()

    if (!_module) {
      throw new Error('WASM module not initialized')
    }

    isGenerating.value = true
    error.value = null

    try {
      // Destroy previous instance and create fresh one (matches original demo)
      if (_instance) {
        _instance.destroy()
      }
      _instance = new _module.BachGenerator()

      _instance.generate(config)
      const events = _instance.getEvents()
      return events
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isGenerating.value = false
    }
  }

  /**
   * Get MIDI data as Uint8Array.
   */
  function getMidi(): Uint8Array {
    if (!_instance) {
      throw new Error('No instance available')
    }
    return _instance.getMidi()
  }

  /**
   * Get event data from last generation.
   */
  function getEvents(): EventData | null {
    if (!_instance) return null
    try {
      return _instance.getEvents()
    } catch {
      return null
    }
  }

  /**
   * Download MIDI file.
   */
  function downloadMidi(filename?: string): void {
    const midiData = getMidi()
    let finalFilename = filename
    if (!finalFilename) {
      const now = new Date()
      const ts = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') + '_' +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0')
      finalFilename = `bach-${ts}.mid`
    }

    const blob = new Blob([new Uint8Array(midiData)], { type: 'audio/midi' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = finalFilename
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Get library version string.
   */
  function getVersion(): string | null {
    if (!_module) return null
    try {
      return _module.getVersion()
    } catch {
      return null
    }
  }

  /**
   * Get available presets from WASM.
   */
  function getForms() {
    return _module?.getForms() ?? []
  }

  function getInstruments() {
    return _module?.getInstruments() ?? []
  }

  function getCharacters() {
    return _module?.getCharacters() ?? []
  }

  function getScales() {
    return _module?.getScales() ?? []
  }

  function getDefaultInstrumentForForm(formId: number): number {
    return _module?.getDefaultInstrumentForForm(formId) ?? 0
  }

  return {
    isInitializing,
    isGenerating,
    error,
    initialize,
    generate,
    getMidi,
    getEvents,
    downloadMidi,
    getVersion,
    getForms,
    getInstruments,
    getCharacters,
    getScales,
    getDefaultInstrumentForForm,
  }
}
