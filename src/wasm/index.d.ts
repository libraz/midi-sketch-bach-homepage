/**
 * midi-sketch-bach - Bach Instrumental MIDI Generator
 * @packageDocumentation
 */

// From types.ts
/**
 * TypeScript type definitions for Bach MIDI Generator
 */
/** Configuration for Bach generation. */
export interface BachConfig {
    /** Form type ID (0-8) or form name string. */
    form?: number | string;
    /** Key pitch class (0-11: C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B). */
    key?: number;
    /** True for minor mode, false for major. */
    isMinor?: boolean;
    /** Number of voices (2-5). */
    numVoices?: number;
    /** Tempo in BPM (40-200, 0 = default 100). */
    bpm?: number;
    /** Random seed (0 = random). */
    seed?: number;
    /** Subject character ID (0-3) or name string. */
    character?: number | string;
    /** Instrument type ID (0-5) or name string. */
    instrument?: number | string;
    /** Duration scale ID (0-3) or name string ("short", "medium", "long", "full"). */
    scale?: number | string;
    /** Target bar count (overrides scale when > 0). */
    targetBars?: number;
}
/** Generation info returned after successful generation. */
export interface BachInfo {
    /** Total number of bars. */
    totalBars: number;
    /** Total duration in MIDI ticks. */
    totalTicks: number;
    /** Tempo in BPM. */
    bpm: number;
    /** Number of tracks. */
    trackCount: number;
    /** Seed used for generation. */
    seedUsed: number;
}
/** A note event from the event data (JSON keys match C API snake_case). */
export interface NoteEvent {
    pitch: number;
    velocity: number;
    start_tick: number;
    duration: number;
    voice: number;
}
/** A track from the event data (JSON keys match C API snake_case). */
export interface TrackData {
    name: string;
    channel: number;
    program: number;
    note_count: number;
    notes: NoteEvent[];
}
/** Full event data from generation (JSON keys match C API snake_case). */
export interface EventData {
    form: string;
    key: string;
    bpm: number;
    seed: number;
    total_ticks: number;
    total_bars: number;
    description: string;
    tracks: TrackData[];
}
/** Preset info for enumerable options. */
export interface PresetInfo {
    /** Unique ID. */
    id: number;
    /** Internal name (e.g. "fugue", "organ"). */
    name: string;
    /** Display name (e.g. "Prelude and Fugue"). */
    display?: string;
}
//# sourceMappingURL=types.d.ts.map
// From presets.ts
/**
 * Preset enumeration functions for forms, instruments, characters, and keys
 */
/** Get all available form types. */
export declare function getForms(): PresetInfo[];
/** Get all available instruments. */
export declare function getInstruments(): PresetInfo[];
/** Get all available subject characters. */
export declare function getCharacters(): PresetInfo[];
/** Get all available keys. */
export declare function getKeys(): PresetInfo[];
/** Get all available duration scales. */
export declare function getScales(): PresetInfo[];
/** Get the default instrument ID for a given form type. */
export declare function getDefaultInstrumentForForm(formId: number): number;
/** Get the library version string. */
export declare function getVersion(): string;
//# sourceMappingURL=presets.d.ts.map
// From internal.ts
/**
 * Internal WASM module bindings and initialization
 * @internal
 */
export interface EmscriptenModule {
    cwrap: (name: string, returnType: string | null, argTypes: string[]) => (...args: unknown[]) => unknown;
    UTF8ToString: (ptr: number) => string;
    HEAPU8: Uint8Array;
    HEAPU32: Uint32Array;
}
export interface Api {
    create: () => number;
    destroy: (handle: number) => void;
    generateFromJson: (handle: number, json: string, length: number) => number;
    getMidi: (handle: number) => number;
    freeMidi: (ptr: number) => void;
    getEvents: (handle: number) => number;
    freeEvents: (ptr: number) => void;
    getInfo: (handle: number) => number;
    formCount: () => number;
    formName: (id: number) => string;
    formDisplay: (id: number) => string;
    instrumentCount: () => number;
    instrumentName: (id: number) => string;
    characterCount: () => number;
    characterName: (id: number) => string;
    keyCount: () => number;
    keyName: (id: number) => string;
    scaleCount: () => number;
    scaleName: (id: number) => string;
    defaultInstrumentForForm: (formId: number) => number;
    errorString: (error: number) => string;
    version: () => string;
}
/**
 * Get the WASM module instance
 * @throws Error if module not initialized
 * @internal
 */
export declare function getModule(): EmscriptenModule;
/**
 * Get the API bindings
 * @throws Error if module not initialized
 * @internal
 */
export declare function getApi(): Api;
/**
 * Initialize the WASM module
 */
export declare function init(options?: {
    wasmPath?: string;
}): Promise<void>;
//# sourceMappingURL=internal.d.ts.map
// From bach.ts
/**
 * BachGenerator - Main class for generating Bach MIDI compositions
 */
/**
 * Bach MIDI Generator
 *
 * Creates and manages a WASM-backed Bach composition generator.
 * Must call init() before constructing.
 */
export declare class BachGenerator {
    private handle;
    private destroyed;
    constructor();
    /**
     * Generate a Bach composition from config.
     * @param config Generation configuration
     * @throws Error on generation failure
     */
    generate(config?: BachConfig): void;
    /**
     * Get generated MIDI data as Uint8Array.
     * @returns MIDI binary data
     * @throws Error if no generation has been done
     */
    getMidi(): Uint8Array;
    /**
     * Get event data as parsed JSON.
     * @returns Parsed event data
     * @throws Error if no generation has been done
     */
    getEvents(): EventData;
    /**
     * Get generation info.
     * @returns BachInfo struct data
     */
    getInfo(): BachInfo;
    /**
     * Destroy this instance and free WASM resources.
     * Must be called when done to prevent memory leaks.
     */
    destroy(): void;
    private checkDestroyed;
}
//# sourceMappingURL=bach.d.ts.map
