---
title: JavaScript API
description: Complete JavaScript API reference for MIDI Sketch Bach.
---

# JavaScript API Reference

## Initialization

### `init(options?)`

Loads and initializes the WASM module. Must be called before creating any `BachGenerator` instances.

```js
import { init } from 'midi-sketch-bach'

// Node.js (WASM path resolved automatically)
await init()

// Browser (specify WASM path)
await init({ wasmPath: '/wasm/midisketch.wasm' })
```

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `options.wasmPath` | `string` | Path to the `.wasm` file. Required in browser environments. |

**Returns**: `Promise<void>`

---

## BachGenerator

The main class for generating Bach-style compositions.

### Constructor

```js
const generator = new BachGenerator()
```

Creates a new generator instance. Call `init()` before creating any instances.

### `generate(config?)`

Generates a composition based on the provided configuration.

```js
generator.generate({
  form: 'fugue',
  key: 2,
  isMinor: true,
  numVoices: 4,
  bpm: 80,
  seed: 42
})
```

**Parameters**: See [BachConfig](#bachconfig) below.

**Returns**: `void`

### `getMidi()`

Returns the generated composition as Standard MIDI File data.

```js
const midi = generator.getMidi()
// midi is a Uint8Array containing a valid .mid file
```

**Returns**: `Uint8Array`

### `getEvents()`

Returns structured event data with metadata and individual note events.

```js
const events = generator.getEvents()
console.log(events.form)        // "Fugue"
console.log(events.key)         // "D minor"
console.log(events.bpm)         // 80
console.log(events.total_bars)  // 32
console.log(events.tracks)      // Array of TrackData
```

**Returns**: [EventData](#eventdata)

### `getInfo()`

Returns information about the generator and its current state.

```js
const info = generator.getInfo()
```

**Returns**: `BachInfo`

### `destroy()`

Frees WASM memory allocated by this generator. Always call this when done.

```js
generator.destroy()
```

::: warning
After calling `destroy()`, the generator instance must not be used again. Create a new `BachGenerator` if you need to generate another piece.
:::

---

## BachConfig

Configuration object passed to `generate()`. All fields are optional.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `form` | `number \| string` | `0` | Musical form (0--8 or name). See [Forms](/docs/forms) and [Presets Reference](/docs/presets). |
| `key` | `number` | `0` | Key (0--11 pitch class: 0=C, 1=C#, 2=D, ... 11=B) |
| `isMinor` | `boolean` | `false` | Minor key when `true`, major when `false` |
| `numVoices` | `number` | Form default | Number of voices (2--5) |
| `bpm` | `number` | `100` | Tempo in BPM (40--200, 0 uses default of 100) |
| `seed` | `number` | `0` | Random seed (0 = random) |
| `character` | `number \| string` | `0` | Subject character type (0--3) |
| `instrument` | `number \| string` | Form default | Instrument preset (0--5) |
| `scale` | `number \| string` | `1` | Duration scale (0=short, 1=medium, 2=long, 3=full) |
| `targetBars` | `number` | -- | Target bar count (overrides scale) |

### Form Values

Forms can be specified by number or name string:

| Number | String |
|--------|--------|
| `0` | `"fugue"` |
| `1` | `"prelude-and-fugue"` |
| `2` | `"trio-sonata"` |
| `3` | `"chorale-prelude"` |
| `4` | `"toccata-and-fugue"` |
| `5` | `"passacaglia"` |
| `6` | `"fantasia-and-fugue"` |
| `7` | `"cello-prelude"` |
| `8` | `"chaconne"` |

### Instrument Values

| Number | String |
|--------|--------|
| `0` | `"organ"` |
| `1` | `"harpsichord"` |
| `2` | `"piano"` |
| `3` | `"violin"` |
| `4` | `"cello"` |
| `5` | `"guitar"` |

### Character Values

| Number | Description |
|--------|-------------|
| `0` | Default balanced |
| `1` | Lyrical, stepwise |
| `2` | Energetic, wider intervals |
| `3` | Dramatic, rhythmically varied |

### Scale Values

| Number | String | Description |
|--------|--------|-------------|
| `0` | `"short"` | Compact |
| `1` | `"medium"` | Standard (default) |
| `2` | `"long"` | Extended |
| `3` | `"full"` | Maximum length |

---

## Response Types

### EventData

```ts
interface EventData {
  form: string          // Form name (e.g., "Fugue")
  key: string           // Key description (e.g., "D minor")
  bpm: number           // Tempo
  seed: number          // Seed used for generation
  total_ticks: number   // Total duration in MIDI ticks
  total_bars: number    // Total bar count
  description: string   // Human-readable description
  tracks: TrackData[]   // Array of track data
}
```

### TrackData

```ts
interface TrackData {
  name: string          // Track name (e.g., "Soprano", "Bass")
  channel: number       // MIDI channel (0-15)
  program: number       // General MIDI program number
  note_count: number    // Number of notes in this track
  notes: NoteEvent[]    // Array of note events
}
```

### NoteEvent

```ts
interface NoteEvent {
  pitch: number         // MIDI note number (0-127)
  velocity: number      // Note velocity (0-127)
  start_tick: number    // Start time in MIDI ticks
  duration: number      // Duration in MIDI ticks
  voice: number         // Voice index
}
```

---

## Preset Enumeration Functions

These functions return arrays of `PresetInfo` objects describing available options.

### `getForms()`

```js
import { getForms } from 'midi-sketch-bach'

const forms = getForms()
// [{ index: 0, name: "Fugue", ... }, ...]
```

### `getInstruments()`

```js
import { getInstruments } from 'midi-sketch-bach'

const instruments = getInstruments()
// [{ index: 0, name: "Organ", ... }, ...]
```

### `getCharacters()`

```js
import { getCharacters } from 'midi-sketch-bach'

const characters = getCharacters()
```

### `getKeys()`

```js
import { getKeys } from 'midi-sketch-bach'

const keys = getKeys()
// [{ index: 0, name: "C", ... }, { index: 1, name: "C#", ... }, ...]
```

### `getScales()`

```js
import { getScales } from 'midi-sketch-bach'

const scales = getScales()
// [{ index: 0, name: "Short", ... }, ...]
```

### `getVersion()`

```js
import { getVersion } from 'midi-sketch-bach'

const version = getVersion()
// "1.0.0"
```

---

## Complete Examples

### Generate and Save a Fugue

```js
import { init, BachGenerator } from 'midi-sketch-bach'
import { writeFileSync } from 'fs'

await init()

const generator = new BachGenerator()
generator.generate({
  form: 'fugue',
  key: 2,
  isMinor: true,
  numVoices: 4,
  bpm: 76,
  seed: 12345
})

writeFileSync('fugue-d-minor.mid', generator.getMidi())

const events = generator.getEvents()
console.log(`Generated: ${events.description}`)
console.log(`Bars: ${events.total_bars}, Tracks: ${events.tracks.length}`)

for (const track of events.tracks) {
  console.log(`  ${track.name}: ${track.note_count} notes`)
}

generator.destroy()
```

### Generate All Forms

```js
import { init, BachGenerator, getForms } from 'midi-sketch-bach'
import { writeFileSync } from 'fs'

await init()

const forms = getForms()
const generator = new BachGenerator()

for (const form of forms) {
  generator.generate({
    form: form.index,
    key: 2,
    isMinor: true,
    seed: 42
  })

  const filename = `bach-${form.name.toLowerCase().replace(/\s+/g, '-')}.mid`
  writeFileSync(filename, generator.getMidi())
  console.log(`Saved: ${filename}`)
}

generator.destroy()
```

### Browser: Generate and Download

```js
import { init, BachGenerator } from 'midi-sketch-bach'

await init({ wasmPath: '/wasm/midisketch.wasm' })

const generator = new BachGenerator()
generator.generate({
  form: 'fugue',
  key: 0,
  isMinor: false
})

const midi = generator.getMidi()
const blob = new Blob([midi], { type: 'audio/midi' })
const url = URL.createObjectURL(blob)

const a = document.createElement('a')
a.href = url
a.download = 'bach-fugue.mid'
a.click()

URL.revokeObjectURL(url)
generator.destroy()
```
