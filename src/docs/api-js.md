---
title: JavaScript API
description: Complete JavaScript API reference for MIDI Sketch Bach.
---

# JavaScript API Reference

## Initialization

### `init(options?)`

Loads and initializes the WASM module. Must be called before creating any `BachGenerator` instances.

```js
import { init } from '@libraz/midi-sketch-bach'

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
  character: 'severe',
  bpm: 80,
  seed: 42
})
```

**Parameters**: See [BachConfig](#bachconfig) below.

**Returns**: `void`

::: warning Strict validation
Invalid `form`, `character`, `instrument`, or `scale` strings — and out-of-range `bpm` (anything other than 0 or 40--200) — now throw an error instead of silently falling back to a default. Forbidden character/form combinations (see [Option Relationships](/docs/option-relationships#character-and-form)) also throw.
:::

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
console.log(events.form)        // "fugue"
console.log(events.key)         // pitch class used (0 = C)
console.log(events.bpm)         // 80
console.log(events.total_bars)  // 42
console.log(events.tracks)      // Array of TrackData
```

::: info Pitches are generated in C
The engine composes internally in C; the requested `key` is applied when the MIDI file is written. The events JSON therefore reports pitches in C, while the `.mid` file from `getMidi()` is transposed to your chosen key.
:::

**Returns**: [EventData](#eventdata)

### `getInfo()`

Returns information about the generator and its current state.

```js
const info = generator.getInfo()
console.log(info.seedUsed)    // resolved seed (non-zero, even when seed: 0 was requested)
console.log(info.totalBars)   // resolved bar count
console.log(info.bpm)         // actual BPM used
console.log(info.trackCount)  // number of tracks
```

When you pass `seed: 0` (random), the actual seed chosen for this run is reported as `getInfo().seedUsed`. Reuse that value to reproduce the same output.

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
| `form` | `number \| string` | `"fugue"` | Musical form (0--9 or name). See [Forms](/docs/forms) and [Presets Reference](/docs/presets). |
| `key` | `number` | `0` | Key (0--11 pitch class: 0=C, 1=C#, 2=D, ... 11=B) |
| `isMinor` | `boolean` | `false` | Minor key when `true`, major when `false` |
| `bpm` | `number` | `100` | Tempo in BPM. `0` uses the default of 100; any other value must be in 40--200 (out of range throws). |
| `seed` | `number` | `0` | Random seed. `0` picks a random non-zero seed, reported via `getInfo().seedUsed`. |
| `character` | `string \| number` | `"severe"` | Subject character (`"severe"`, `"playful"`, `"noble"`, `"restless"`). Invalid value throws. |
| `instrument` | `string \| number` | Form default | Instrument (`"organ"`, `"harpsichord"`, `"piano"`, `"violin"`, `"cello"`, `"guitar"`). Invalid value throws. |
| `scale` | `string \| number` | `"short"` | Length multiplier of the form's natural length: `"short"` (~1x), `"medium"` (~2x), `"long"` (~3x), `"full"` (~4x). Invalid value throws. |
| `targetBars` | `number` | -- | Explicit bar count. When `> 0` it overrides `scale`; the value is snapped to the form's granularity and clamped to `[min, 128]`. |

::: warning `numVoices` was removed
The voice count is now decided by the `form` — see the [Forms](/docs/forms) table. Passing `num_voices`/`numVoices` is accepted and ignored for backward compatibility; it is never an error and has no effect.
:::

### Form Values

Forms can be specified by number or name string:

| Number | String |
|--------|--------|
| `0` | `"fugue"` |
| `1` | `"prelude_and_fugue"` |
| `2` | `"trio_sonata"` |
| `3` | `"chorale_prelude"` |
| `4` | `"toccata_and_fugue"` |
| `5` | `"passacaglia"` |
| `6` | `"fantasia_and_fugue"` |
| `7` | `"cello_prelude"` |
| `8` | `"chaconne"` |
| `9` | `"goldberg_variations"` |

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

| Number | String | Description |
|--------|--------|-------------|
| `0` | `"severe"` | Strict, intellectually rigorous (default) |
| `1` | `"playful"` | Light, agile, rhythmically lively |
| `2` | `"noble"` | Stately, broad, dignified |
| `3` | `"restless"` | Driving, chromatic, dramatically charged |

### Scale Values

`scale` multiplies the form's natural length (see [Forms](/docs/forms)). `targetBars` overrides it.

| Number | String | Approximate Length |
|--------|--------|--------------------|
| `0` | `"short"` | ~1x natural (default) |
| `1` | `"medium"` | ~2x natural |
| `2` | `"long"` | ~3x natural |
| `3` | `"full"` | ~4x natural |

---

## Response Types

### EventData

```ts
interface EventData {
  form: string          // Form name (e.g., "fugue")
  key: number           // Pitch class (events JSON stays in C)
  bpm: number           // Tempo
  seed: number          // Resolved seed used for generation
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
  pitch: number         // MIDI note number (0-127), generated in C
  velocity: number      // Note velocity (0-127)
  start_tick: number    // Start time in MIDI ticks
  duration: number      // Duration in MIDI ticks
  voice: number         // Voice index
  source: string        // Provenance: "material" | "compose" | "ornament"
}
```

::: info Note provenance (`source`)
Every note carries a `source` tag recording how it was produced:
- `"material"` — fixed material assigned by the form (subjects, ground basses, cantus firmus).
- `"compose"` — selected by the candidate search against the harmonic plan.
- `"ornament"` — added by the deterministic ornament pass (trills, mordents, Nachschlag).
:::

---

## Preset Enumeration Functions

These functions return arrays of `PresetInfo` objects describing available options.

### `getForms()`

```js
import { getForms } from '@libraz/midi-sketch-bach'

const forms = getForms()
// [{ index: 0, name: "Fugue", ... }, ...]
```

### `getInstruments()`

```js
import { getInstruments } from '@libraz/midi-sketch-bach'

const instruments = getInstruments()
// [{ index: 0, name: "Organ", ... }, ...]
```

### `getCharacters()`

```js
import { getCharacters } from '@libraz/midi-sketch-bach'

const characters = getCharacters()
```

### `getKeys()`

```js
import { getKeys } from '@libraz/midi-sketch-bach'

const keys = getKeys()
// [{ index: 0, name: "C", ... }, { index: 1, name: "C#", ... }, ...]
```

### `getScales()`

```js
import { getScales } from '@libraz/midi-sketch-bach'

const scales = getScales()
// [{ index: 0, name: "Short", ... }, ...]
```

### `getVersion()`

```js
import { getVersion } from '@libraz/midi-sketch-bach'

const version = getVersion()
// "1.0.0"
```

---

## Complete Examples

### Generate and Save a Fugue

```js
import { init, BachGenerator } from '@libraz/midi-sketch-bach'
import { writeFileSync } from 'fs'

await init()

const generator = new BachGenerator()
generator.generate({
  form: 'fugue',
  key: 2,
  isMinor: true,
  character: 'severe',
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
import { init, BachGenerator, getForms } from '@libraz/midi-sketch-bach'
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
import { init, BachGenerator } from '@libraz/midi-sketch-bach'

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
