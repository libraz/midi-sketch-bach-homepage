// js/src/internal.ts
var moduleInstance = null;
var api = null;
function getModule() {
  if (!moduleInstance) {
    throw new Error("Module not initialized. Call init() first.");
  }
  return moduleInstance;
}
function getApi() {
  if (!api) {
    throw new Error("Module not initialized. Call init() first.");
  }
  return api;
}
async function init(options) {
  if (moduleInstance) {
    return;
  }
  const createModule = await import("./bach.js");
  const moduleOpts = {};
  if (options?.wasmPath) {
    moduleOpts.locateFile = (path) => {
      if (path.endsWith(".wasm")) {
        return options.wasmPath;
      }
      return path;
    };
  }
  moduleInstance = await createModule.default(moduleOpts);
  if (!moduleInstance) {
    throw new Error("Failed to initialize WASM module");
  }
  const m = moduleInstance;
  api = {
    // Lifecycle
    create: m.cwrap("bach_create", "number", []),
    destroy: m.cwrap("bach_destroy", null, ["number"]),
    // Generation
    generateFromJson: m.cwrap("bach_generate_from_json", "number", [
      "number",
      "string",
      "number"
    ]),
    // Output
    getMidi: m.cwrap("bach_get_midi", "number", ["number"]),
    freeMidi: m.cwrap("bach_free_midi", null, ["number"]),
    getEvents: m.cwrap("bach_get_events", "number", ["number"]),
    freeEvents: m.cwrap("bach_free_events", null, ["number"]),
    getInfo: m.cwrap("bach_get_info", "number", ["number"]),
    // Form enumeration
    formCount: m.cwrap("bach_form_count", "number", []),
    formName: m.cwrap("bach_form_name", "string", ["number"]),
    formDisplay: m.cwrap("bach_form_display", "string", ["number"]),
    // Instrument enumeration
    instrumentCount: m.cwrap("bach_instrument_count", "number", []),
    instrumentName: m.cwrap("bach_instrument_name", "string", ["number"]),
    // Character enumeration
    characterCount: m.cwrap("bach_character_count", "number", []),
    characterName: m.cwrap("bach_character_name", "string", ["number"]),
    // Key enumeration
    keyCount: m.cwrap("bach_key_count", "number", []),
    keyName: m.cwrap("bach_key_name", "string", ["number"]),
    // Scale enumeration
    scaleCount: m.cwrap("bach_scale_count", "number", []),
    scaleName: m.cwrap("bach_scale_name", "string", ["number"]),
    // Default instrument
    defaultInstrumentForForm: m.cwrap("bach_default_instrument_for_form", "number", ["number"]),
    // Error handling
    errorString: m.cwrap("bach_error_string", "string", ["number"]),
    // Version
    version: m.cwrap("bach_version", "string", [])
  };
}

// js/src/bach.ts
function configToJson(config) {
  const obj = {};
  if (config.form !== void 0) {
    obj.form = config.form;
  }
  if (config.key !== void 0) {
    obj.key = config.key;
  }
  if (config.isMinor !== void 0) {
    obj.is_minor = config.isMinor;
  }
  if (config.numVoices !== void 0) {
    obj.num_voices = config.numVoices;
  }
  if (config.bpm !== void 0) {
    obj.bpm = config.bpm;
  }
  if (config.seed !== void 0) {
    obj.seed = config.seed;
  }
  if (config.character !== void 0) {
    obj.character = config.character;
  }
  if (config.instrument !== void 0) {
    obj.instrument = config.instrument;
  }
  if (config.scale !== void 0) {
    obj.scale = config.scale;
  }
  if (config.targetBars !== void 0) {
    obj.target_bars = config.targetBars;
  }
  return JSON.stringify(obj);
}
var BachGenerator = class {
  constructor() {
    this.destroyed = false;
    const api2 = getApi();
    this.handle = api2.create();
  }
  /**
   * Generate a Bach composition from config.
   * @param config Generation configuration
   * @throws Error on generation failure
   */
  generate(config = {}) {
    this.checkDestroyed();
    const api2 = getApi();
    const json = configToJson(config);
    const error = api2.generateFromJson(this.handle, json, json.length);
    if (error !== 0) {
      throw new Error(`Generation failed: ${api2.errorString(error)}`);
    }
  }
  /**
   * Get generated MIDI data as Uint8Array.
   * @returns MIDI binary data
   * @throws Error if no generation has been done
   */
  getMidi() {
    this.checkDestroyed();
    const api2 = getApi();
    const m = getModule();
    const ptr = api2.getMidi(this.handle);
    if (ptr === 0) {
      throw new Error("No MIDI data available. Call generate() first.");
    }
    const dataPtr = m.HEAPU32[ptr >> 2];
    const size = m.HEAPU32[(ptr >> 2) + 1];
    const result = new Uint8Array(size);
    result.set(m.HEAPU8.subarray(dataPtr, dataPtr + size));
    api2.freeMidi(ptr);
    return result;
  }
  /**
   * Get event data as parsed JSON.
   * @returns Parsed event data
   * @throws Error if no generation has been done
   */
  getEvents() {
    this.checkDestroyed();
    const api2 = getApi();
    const m = getModule();
    const ptr = api2.getEvents(this.handle);
    if (ptr === 0) {
      throw new Error("No event data available. Call generate() first.");
    }
    const jsonPtr = m.HEAPU32[ptr >> 2];
    const jsonStr = m.UTF8ToString(jsonPtr);
    api2.freeEvents(ptr);
    return JSON.parse(jsonStr);
  }
  /**
   * Get generation info.
   * @returns BachInfo struct data
   */
  getInfo() {
    this.checkDestroyed();
    const api2 = getApi();
    const m = getModule();
    const ptr = api2.getInfo(this.handle);
    const view = new DataView(m.HEAPU8.buffer, ptr, 16);
    return {
      totalBars: view.getUint16(0, true),
      totalTicks: view.getUint32(4, true),
      bpm: view.getUint16(8, true),
      trackCount: view.getUint8(10),
      seedUsed: view.getUint32(12, true)
    };
  }
  /**
   * Destroy this instance and free WASM resources.
   * Must be called when done to prevent memory leaks.
   */
  destroy() {
    if (!this.destroyed) {
      const api2 = getApi();
      api2.destroy(this.handle);
      this.destroyed = true;
    }
  }
  checkDestroyed() {
    if (this.destroyed) {
      throw new Error("BachGenerator has been destroyed");
    }
  }
};

// js/src/presets.ts
function getForms() {
  const api2 = getApi();
  const count = api2.formCount();
  const forms = [];
  for (let i = 0; i < count; i++) {
    forms.push({
      id: i,
      name: api2.formName(i),
      display: api2.formDisplay(i)
    });
  }
  return forms;
}
function getInstruments() {
  const api2 = getApi();
  const count = api2.instrumentCount();
  const instruments = [];
  for (let i = 0; i < count; i++) {
    instruments.push({
      id: i,
      name: api2.instrumentName(i)
    });
  }
  return instruments;
}
function getCharacters() {
  const api2 = getApi();
  const count = api2.characterCount();
  const characters = [];
  for (let i = 0; i < count; i++) {
    characters.push({
      id: i,
      name: api2.characterName(i)
    });
  }
  return characters;
}
function getKeys() {
  const api2 = getApi();
  const count = api2.keyCount();
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push({
      id: i,
      name: api2.keyName(i)
    });
  }
  return keys;
}
function getScales() {
  const api2 = getApi();
  const count = api2.scaleCount();
  const scales = [];
  for (let i = 0; i < count; i++) {
    scales.push({
      id: i,
      name: api2.scaleName(i)
    });
  }
  return scales;
}
function getDefaultInstrumentForForm(formId) {
  return getApi().defaultInstrumentForForm(formId);
}
function getVersion() {
  return getApi().version();
}
export {
  BachGenerator,
  getCharacters,
  getDefaultInstrumentForForm,
  getForms,
  getInstruments,
  getKeys,
  getScales,
  getVersion,
  init
};
