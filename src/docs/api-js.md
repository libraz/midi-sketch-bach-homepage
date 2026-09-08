---
title: JavaScript API
description: Complete JavaScript API reference for MIDI Sketch Bach.
---

# JavaScript API Reference

::: info Music terms in config
`form`, `key`, `isMinor`, `character`, `scale`, and `targetBars` map API values to musical decisions. For the non-programming vocabulary behind those fields, see the [Music Primer for Engineers](/docs/music-primer) and [Option Relationships](/docs/option-relationships).
:::

## Initialization

### `init(options?)`

Loads and initializes the WASM module. Must be called before creating any `BachGenerator` instances.

::: code-group

```js [Node.js]
import { init } from '@libraz/midi-sketch-bach'

await init()
```

```js [Browser]
import { init } from '@libraz/midi-sketch-bach'

await init({ wasmPath: '/wasm/bach.wasm' })
```

:::

**Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `options.wasmPath` | `string` | Path to the `.wasm` file. Required in browser environments. |

**Returns**: `Promise<void>`

::: tip Safe to call concurrently
Overlapping `init()` calls share one in-flight load instead of instantiating the module twice, so you can call it from every entry point that needs the engine. Passing a different `wasmPath` while a load is still running throws.
:::

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
Invalid `form`, `key`, `character`, `instrument`, or `scale` values — and out-of-range `bpm` (anything other than 0 or 40--200) — throw an error instead of silently falling back to a default. Forbidden character/form and instrument/form combinations (see [Option Relationships](/docs/option-relationships#character-and-form)) also throw.

Each failure carries its own error string, for example `Invalid BPM (must be 0 or 40-200)` or `Incompatible instrument for this form`. When the composer itself fails its counterpoint validation, call [`getDiagnostic()`](#getdiagnostic) for the rule-level detail.
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
console.log(events.form)             // "fugue"
console.log(events.key)              // "D_minor"
console.log(events.bpm)              // 80
console.log(events.total_bars)       // 44
console.log(events.tempos)           // Tempo map
console.log(events.time_signatures)  // Meter map
console.log(events.tracks)           // Array of TrackData
```

::: info Event pitches match the MIDI output
The engine composes internally in C, then applies the requested key and any instrument-range octave shift to both `getEvents()` pitches and the `.mid` file from `getMidi()`. `getEvents()` and `getMidi()` also use the post-articulation playback durations. Use `getGenerated()` when you need the internal-C pitches and the notated durations captured before articulation.
:::

::: warning `bpm` alone will not place a note on the clock
`events.bpm` is only the starting tempo. Most forms add a final ritardando, but Trio Sonata does not. Prelude and Fugue, Toccata and Fugue, and Fantasia and Fugue also change tempo at the fugue entry. Walk the [tempo map](#converting-ticks-to-seconds) instead of assuming a constant tempo.
:::

**Returns**: [EventData](#eventdata)

### `getGenerated()`

Returns the `generated.v1` document: a flat, index-addressable note list intended for scoring and analysis rather than playback.

Unlike `getEvents()`, its note pitches remain in the engine's internal C before output transposition.

Its note durations are the notated snapshot captured before character-dependent articulation. `FinalScore` validation and its texture metrics use this snapshot; `getEvents()` and `getMidi()` use the shortened playback gates.

```js
const generated = generator.getGenerated()
console.log(generated.schema_version)  // "generated.v1"
console.log(generated.ticks_per_beat)  // 480
console.log(generated.notes[0])
// { index, start_tick, duration, pitch, voice, velocity }
```

**Returns**: `GeneratedData`. Throws when no successful generation has happened yet.

### `generated.v1` wire fields

`getGenerated()` returns the parsed `generated.v1` object. Its required root fields are `schema_version`, `ticks_per_beat`, `duration_ticks`, `notes`, `counterpoint_observations`, `informational_findings`, and `wave_veto`. `tempos` is optional and appears when the exporter receives a tempo map. `info` is optional and carries generated metrics such as subject features, stream segregation, or texture metrics when those metrics are available. The [generated.v1 schema](https://github.com/libraz/midi-sketch-bach/blob/973659e705915c2178d72663d5a65ab95d3cae4b/schema/generated.v1.json) is the wire contract; `info` intentionally remains an open object because its metric families are optional.

```ts
interface GeneratedV1Wire {
  schema_version: 'generated.v1'
  ticks_per_beat: number
  duration_ticks: number
  tempos?: Array<{ tick: number; bpm: number }>
  notes: Array<{
    index: number
    start_tick: number
    duration: number
    pitch: number
    voice: number
    velocity: number
  }>
  counterpoint_observations: Array<{
    rule_id: string
    geometry: 'linear' | 'vertical' | 'unclassified'
    total: number
    gated: number
    exempted: number
  }>
  informational_findings: Array<{
    span_id: number | null
    rule_id: string
    geometry: 'linear' | 'vertical' | 'unclassified'
    kind: 'StructuralFail' | 'MusicalFail' | 'ConfigFail'
  }>
  wave_veto: {
    anchor_parallel_displaced: number
    wobble_breaker_fired: number
    step_parallel_adjusted: number
    step_harsh_adjusted: number
    order_clamp_changed: number
    window_expanded: number
    anchor_fault_held: number
    total: number
  }
  info?: Record<string, unknown>
}
```

`counterpoint_observations` contains one entry for each rule that matched during validation, sorted by `rule_id`. `geometry` identifies whether the rule measures a melodic succession (`linear`) or a relation involving simultaneous voices or the harmonic plan (`vertical`). `total` is the match count before routing, `gated` counts findings routed to blocking validation failures, and `exempted` counts generation-pass findings suppressed because every operand is an immutable `Material` or `Ornament` source. For findings handled by this recorder, the difference `total - gated - exempted` is the count represented by informational findings; some standalone informational rules can have no observation tally.

`informational_findings` contains findings retained as evidence without setting a blocking validation status. Each entry carries the nullable `span_id`, the rule ID, its geometry, and its `FailKind`. A form's counterpoint budget can still promote a matched closed vertical rule to a blocking failure; that budget failure has no span and does not change the observation tally.

`wave_veto` reports how often each reactive figuration-wave layer changed a note or left an anchor fault unresolved. `total` is the sum of the six counters that changed a note; `anchor_fault_held` is reported separately because it counts an unrepairable anchor fault that was left in place. All eight fields are emitted even when every counter is zero.

The wire exporter already emits `informational_findings`, `wave_veto`, optional `tempos`, and optional `info`. The checked-in JavaScript declaration currently declares `counterpoint_observations` but not the two named fields or the optional exporter metadata. This page documents the runtime wire object; TypeScript consumers reading the undeclared fields need a local type extension or a runtime narrowing.

### `getProvenance()`

Returns the `provenance.v1` document: one record per generated note, index-parallel with `getGenerated().notes`, describing how that note was chosen.

```js
const provenance = generator.getProvenance()
const note = provenance.notes[0]
console.log(note.voice_intent)  // "SubjectCarrier"
console.log(note.source)        // "Material" | "Compose" | "Ornament"

// Rule masks are decimal strings — parse them as BigInt, never as Number
const satisfied = BigInt(note.satisfied_rules)
const high = note.satisfied_rules_high ? BigInt(note.satisfied_rules_high) : 0n
```

::: warning Rule masks are strings
`satisfied_rules` and `satisfied_rules_high` are base-10 strings because a JavaScript `number` cannot hold all 64 rule bits. Parse them with `BigInt()`. `satisfied_rules_high` (bits 64--127) is omitted entirely when no high-lane bit is set.
:::

**Returns**: `ProvenanceData`. Throws when no successful generation has happened yet.

### `getDiagnostic()`

Returns the `diagnostic.v1` document from the most recent composer validation failure, or `null` when the last generation succeeded.

```js
try {
  generator.generate({ form: 'fugue', seed: 42 })
} catch {
  const diagnostic = generator.getDiagnostic()
  for (const failure of diagnostic?.validation.failures ?? []) {
    console.log(failure.kind, failure.rule_id, failure.span_id)
  }
}
```

A successful `generate()` call does not throw, and `getDiagnostic()` returns `null` for that result. Read the diagnostic in the `catch` branch when generation reports a composer validation failure.

**Returns**: `DiagnosticData | null`

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
| `form` | `FormId \| FormName` | `"fugue"` | Musical form (0--9 or name). See [Forms](/docs/forms) and [Presets Reference](/docs/presets). |
| `key` | `KeyId \| KeyName` | `0` | Key as a pitch class (0=C, 1=C#, 2=D, ... 11=B) or its canonical name (`"C"`, `"C#"`, `"D"`, `"Eb"`, `"E"`, `"F"`, `"F#"`, `"G"`, `"Ab"`, `"A"`, `"Bb"`, `"B"`). |
| `isMinor` | `boolean` | `false` | Minor key when `true`, major when `false` |
| `bpm` | `number` | `100` | Starting tempo in BPM. `0` uses the default of 100; any other value must be in 40--200 (out of range throws). |
| `seed` | `number` | `0` | Unsigned 32-bit random seed. `0` picks a random non-zero seed, reported via `getInfo().seedUsed`. |
| `character` | `CharacterId \| CharacterName` | `"severe"` | Subject character (`"severe"`, `"playful"`, `"noble"`, `"restless"`). Invalid value throws. |
| `instrument` | `InstrumentId \| InstrumentName` | Form default | Instrument (`"organ"`, `"harpsichord"`, `"piano"`, `"violin"`, `"cello"`, `"guitar"`). Must be one the form accepts, otherwise it throws. |
| `scale` | `DurationScaleId \| DurationScaleName` | `"short"` | Length multiplier of the form's natural length: `"short"` (~1x), `"medium"` (~2x), `"long"` (~3x), `"full"` (~4x). Invalid value throws. |
| `targetBars` | `number` | -- | Recommended integer range is 0--128. `0` uses `scale`; a positive value overrides it, then is snapped to the form's granularity and clamped to `[min, 128]`. The wire accepts unsigned 16-bit values; very large values may wrap during grid snapping. See [Option Relationships](/docs/option-relationships#scale-and-targetbars) for accepted bounds and edge behavior. |

::: info Name strings are matched exactly
Form, key and scale names must match the canonical spelling — `"Fugue"`, `"g"` and `"FULL"` all throw. Character names are the exception and match case-insensitively, so the capitalized labels from `getCharacters()` can be passed straight back in.
:::

::: info Voice count follows the form
The `BachConfig` object has no `numVoices` field. The `form` determines the voice count; see the [Forms](/docs/forms) table. The raw C JSON interface separately accepts `num_voices` for compatibility, but ignores it after validating it as an unsigned 8-bit integer.
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

| Number | String | Accepted by |
|--------|--------|-------------|
| `0` | `"organ"` | Forms 0--6 |
| `1` | `"harpsichord"` | Goldberg Variations |
| `2` | `"piano"` | Goldberg Variations |
| `3` | `"violin"` | Chaconne |
| `4` | `"cello"` | Cello Prelude |
| `5` | `"guitar"` | -- |

Each form is written for a specific instrument, and the engine rejects anything outside that form's column. Omit `instrument` to take the form's default.

### Character Values

| Number | String | Description |
|--------|--------|-------------|
| `0` | `"severe"` | Strict, intellectually rigorous (default) |
| `1` | `"playful"` | Light, agile, rhythmically lively |
| `2` | `"noble"` | Stately, broad, dignified |
| `3` | `"restless"` | Driving, chromatic, dramatically charged |

The character also controls note-release articulation and the controller level. At 480 ticks per beat, the declared separations are Noble 24, Severe 40, Playful 56, and Restless 72 ticks; Cello Prelude and Chaconne halve those values, and cantus-firmus voices use zero. The controller offsets keep the arc shape unchanged.

### Scale Values

`scale` multiplies the form's natural length (see [Forms](/docs/forms)). `targetBars` overrides it.

| Number | String | Approximate Length |
|--------|--------|--------------------|
| `0` | `"short"` | ~1x natural (default) |
| `1` | `"medium"` | ~2x natural |
| `2` | `"long"` | ~3x natural |
| `3` | `"full"` | ~4x natural; Goldberg Variations uses a special complete 128-bar layout |

The natural length is a raw form value that is snapped to the form's bar grid before output. Fugue has a raw natural length of 42 bars and resolves to 44 bars for `"short"`. Goldberg Variations `"full"` is a special complete layout of 128 bars (aria, all 30 variations, and aria da capo), rather than four times its 20-bar natural layout.

---

## Response Types

### EventData

```ts
interface EventData {
  form: string          // Form name (e.g., "fugue")
  key: string           // Requested key name (e.g., "D_minor")
  bpm: number           // Starting tempo
  seed: number          // Resolved seed used for generation
  total_ticks: number   // Total duration in MIDI ticks
  total_bars: number    // Total bar count
  description: string   // Human-readable description
  tempos: Array<{ tick: number; bpm: number }>
  time_signatures: Array<{ tick: number; numerator: number; denominator: number }>
  tracks: TrackData[]   // Array of track data
}
```

`tempos` always starts with an entry at tick 0 carrying `bpm`. `time_signatures` reports the form's meter — 4/4 for most forms, 3/4 for Passacaglia and Chaconne.

### TrackData

```ts
interface TrackData {
  name: string          // Track name (e.g., "Voice 0", "Voice 1")
  channel: number       // MIDI channel (0-15)
  program: number       // General MIDI program number
  note_count: number    // Number of notes in this track
  control_changes: Array<{ tick: number; controller: number; value: number }>
  notes: NoteEvent[]    // Array of note events
}
```

`control_changes` is an already-merged, duplicate-free performance curve. Organ and harpsichord tracks use CC 7 (channel volume); piano, violin, and cello tracks use CC 11 (expression); guitar tracks have no continuous-expression profile. CC 7 changes playback level and does not select organ stops. Character offsets shift the curve relative to `Severe`: Noble +5, Severe 0, Playful -7, Restless +2.

### NoteEvent

```ts
interface NoteEvent {
  pitch: number         // MIDI note number (0-127), transposed to the output key and range
  velocity: number      // Note velocity (0-127)
  start_tick: number    // Start time in MIDI ticks
  duration: number      // Post-articulation playback gate in MIDI ticks
  voice: number         // Voice index
  source: string        // Provenance: "material" | "compose" | "ornament"
}
```

::: info Note duration and provenance
`duration` in `getEvents()` is the playback gate after character-dependent articulation. For notes shorter than an eighth (240 ticks at 480 ticks per beat), the declared release scales with the note; a final guard retains at least half of the note's duration. Each voice's final onset remains whole. `source` records how a note was created: later velocity or articulation changes do not turn an existing `material` or `compose` note into `ornament`.
:::

::: info Note provenance (`source`)
Every note carries a `source` tag recording how it was produced:
- `"material"` — fixed material assigned by the form (subjects, ground basses, cantus firmus).
- `"compose"` — selected by the candidate search against the harmonic plan.
- `"ornament"` — added by the deterministic ornament pass (trills, mordents, Nachschlag).
:::

---

## Converting Ticks to Seconds

Ticks are musical time; seconds are wall-clock time. Because the tempo changes within a piece, converting between them means walking the tempo map segment by segment.

```js
const PPQ = 480

function secondsAtTick(tick, events) {
  const tempos = [...events.tempos].sort((a, b) => a.tick - b.tick)
  let seconds = 0
  let previousTick = 0
  let bpm = tempos[0].bpm

  for (const tempo of tempos) {
    if (tempo.tick <= 0) {
      bpm = tempo.bpm
      continue
    }
    if (tempo.tick >= tick) break
    seconds += ((tempo.tick - previousTick) / PPQ) * (60 / bpm)
    previousTick = tempo.tick
    bpm = tempo.bpm
  }
  return seconds + ((tick - previousTick) / PPQ) * (60 / bpm)
}

const events = generator.getEvents()
const total = secondsAtTick(events.total_ticks, events)
const noteStart = secondsAtTick(events.tracks[0].notes[0].start_tick, events)
```

A note's duration in seconds is the difference between the two endpoints, not the duration converted on its own:

```js
const start = secondsAtTick(note.start_tick, events)
const end = secondsAtTick(note.start_tick + note.duration, events)
const durationSeconds = end - start
```

Bar and beat numbers come from the meter map the same way — `(480 * 4) / denominator` ticks per beat, times `numerator` for a bar:

```js
function timeSignatureAtTick(tick, events) {
  let active = events.time_signatures[0]
  for (const signature of events.time_signatures) {
    if (signature.tick > tick) break
    active = signature
  }
  return active
}
```

---

## Preset Enumeration Functions

These functions return arrays of `PresetInfo` objects describing available options.

The examples below assume that `await init()` has completed as shown in [Initialization](#initialization).

### `getForms()`

```js
import { getForms } from '@libraz/midi-sketch-bach'

const forms = getForms()
// [{ id: 0, name: "fugue", display: "Fugue" }, ...]
```

### `getInstruments()`

```js
import { getInstruments } from '@libraz/midi-sketch-bach'

const instruments = getInstruments()
// [{ id: 0, name: "organ" }, ...]
```

### `getCharacters()`

```js
import { getCharacters } from '@libraz/midi-sketch-bach'

const characters = getCharacters()
// [{ id: 0, name: "Severe" }, ...]
```

Character names come back capitalized for display. `character` matches them case-insensitively, so they can be passed back into `generate()` unchanged.

### `getKeys()`

```js
import { getKeys } from '@libraz/midi-sketch-bach'

const keys = getKeys()
// [{ id: 0, name: "C" }, { id: 1, name: "C#" }, ...]
```

These are the canonical key names, so either the `id` or the `name` can be passed as `key`.

### `getScales()`

```js
import { getScales } from '@libraz/midi-sketch-bach'

const scales = getScales()
// [{ id: 0, name: "short" }, ...]
```

### `getDefaultInstrumentForForm(formId: number): number`

Returns the default instrument ID for a form ID.

```js
import { getDefaultInstrumentForForm } from '@libraz/midi-sketch-bach'

const instrumentId = getDefaultInstrumentForForm(7)
// 4 (cello)
```

**Parameters**: `formId: number`

**Returns**: `number`. Valid form IDs are 0--9. Invalid or out-of-range values return `0` (organ).

### `getVersion()`

```js
import { getVersion } from '@libraz/midi-sketch-bach'

const version = getVersion()
console.log(version) // current engine version string
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
    form: form.name,
    key: 2,
    isMinor: true,
    seed: 42
  })

  // form.name is already snake_case (e.g. "prelude_and_fugue"); use form.display for a human-readable label
  const filename = `bach-${form.name}.mid`
  writeFileSync(filename, generator.getMidi())
  console.log(`Saved: ${filename}`)
}

generator.destroy()
```

### Browser: Generate and Download

```js
import { init, BachGenerator } from '@libraz/midi-sketch-bach'

await init({ wasmPath: '/wasm/bach.wasm' })

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
