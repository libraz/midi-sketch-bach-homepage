---
title: Features
description: Feature overview of MIDI Sketch Bach - algorithmic Bach-style MIDI generation.
---

# Features

::: info New to music terms?
If terms such as **voice**, **bar**, **chord**, **fifth**, **cadence**, or **fugue subject** are unfamiliar, read the [Music Primer for Engineers](/docs/music-primer) first. This page still gives short explanations where the terms first matter.
:::

## 10 Musical Forms

MIDI Sketch Bach generates compositions in ten distinct Baroque instrumental forms, organized into three systems. Each form fixes its own voice count, meter, and natural length — there is no voice-count option.

::: info Form, voice, meter, natural length
A **form** is a composition plan such as fugue or passacaglia. A **voice** is one independent melodic line. **Meter** is the beat pattern, such as `4/4` or `3/4`. **Natural length** is the form's default bar count before `scale` or `targetBars` changes it.
:::

::: tip Quick chooser
Choose `fugue` to hear strict line-against-line writing, `prelude_and_fugue` for a balanced default, `chorale_prelude` for slower hymn-based material, `passacaglia` or `chaconne` for variation over a repeating bass, and `cello_prelude` for a single flowing solo line.
:::

### Organ System (Forms 0--6)

| ID | Form | Voices | Description |
|----|------|--------|-------------|
| 0 | Fugue | 3 | Pure contrapuntal fugue with subject, answer, and episodes |
| 1 | Prelude and Fugue | 3 | Flowing prelude paired with an elaborate fugue |
| 2 | Trio Sonata | 3 | Three independent voices: two upper parts over a bass line |
| 3 | Chorale Prelude | 2 | Hymn melody with a contrapuntal voice |
| 4 | Toccata and Fugue | 3 | Dramatic virtuosic toccata followed by a strict fugue |
| 5 | Passacaglia | 2 | Continuous variations over a repeating ground bass (3/4) |
| 6 | Fantasia and Fugue | 3 | Free-form fantasia paired with a structured fugue |

### Solo Instrument System (Forms 7--8)

| ID | Form | Voices | Description |
|----|------|--------|-------------|
| 7 | Cello Prelude | 1 | Flowing single-line prelude for solo cello |
| 8 | Chaconne | 2 | Monumental ground-bass variation form for solo violin (3/4) |

### Variation System (Form 9)

| ID | Form | Voices | Description |
|----|------|--------|-------------|
| 9 | Goldberg Variations | 3 | Aria and variations over an immutable bass, incl. canons |

::: tip
See [Forms](/docs/forms) for detailed descriptions and Baroque historical context for each form.
:::

## Counterpoint and Polyphony

- **Form-decided voice count** (1--3 voices) with proper voice leading
- Rule-based counterpoint validated against per-beat chord-tone anchoring
- Authentic voice independence -- each voice has its own melodic identity
- Proper interval handling: consonance, dissonance, and resolution
- Subject-answer relationships in fugal forms
- Forbidden parallel fifths and octaves avoidance

::: info Counterpoint and polyphony
**Polyphony** means several independent lines sounding at once. **Counterpoint** is the rule system for making those lines fit together: each line should make melodic sense, and the vertical intervals between lines should stay controlled.
:::

::: info
See [Counterpoint Course](/docs/counterpoint) for the full set of rules governing voice interaction.
:::

## Multiple Instruments

Six instrument presets shape the MIDI output:

| Instrument | Typical Forms |
|-----------|---------------|
| Organ | Fugue, Prelude and Fugue, Trio Sonata, Chorale Prelude, Toccata and Fugue, Passacaglia, Fantasia and Fugue |
| Harpsichord | Goldberg Variations, any organ form (alternative voicing) |
| Piano | Any form |
| Violin | Chaconne |
| Cello | Cello Prelude |
| Guitar | Cello Prelude, Chaconne (alternative voicing) |

Each instrument maps to a General MIDI program number and a playable range, and shapes how densely the ornament pass decorates the line.

## Subject Characters

Four character types influence the melodic character of fugue subjects and thematic material:

::: info Subject
A **subject** is the main theme of a fugue. The `character` option changes the contour and rhythmic profile of that theme and related material; it does not select an instrument or output style.
:::

| Character | Style |
|-----------|-------|
| `severe` | Strict, intellectually rigorous (default) |
| `playful` | Light, agile, rhythmically lively |
| `noble` | Stately, broad, dignified |
| `restless` | Driving, chromatic, dramatically charged |

::: info
Some character/form combinations are forbidden and throw: `chorale_prelude` rejects `playful`/`restless`, and `toccata_and_fugue` rejects `noble`.
:::

## Deterministic Generation

Every generation is controlled by a **seed** value. The same configuration with the same seed always produces byte-identical output:

```js
// These two calls produce identical MIDI
generator.generate({ form: 'fugue', key: 0, seed: 42 })
generator.generate({ form: 'fugue', key: 0, seed: 42 })
```

Set `seed: 0` (or omit it) for random generation; the resolved seed is reported via `getInfo().seedUsed` so you can reproduce the run.

::: warning
Deterministic reproduction requires the same version of MIDI Sketch Bach. Different versions may produce different output for the same seed due to algorithm improvements.
:::

## Multiple Output Formats

### MIDI File

Get standard MIDI file data as a `Uint8Array`, ready to write to disk or create a download link:

```js
const midi = generator.getMidi()
```

### Structured Event Data

Get detailed event data including track information, note events, and metadata:

```js
const events = generator.getEvents()
// events.form        - "fugue"
// events.key         - pitch class (events JSON stays in C)
// events.bpm         - 100
// events.total_bars  - 42
// events.tracks      - Array of TrackData; each note carries a "source" tag
```

Each note's `source` records its provenance: `"material"` (subjects, grounds, cantus firmus), `"compose"` (candidate search), or `"ornament"` (the ornament pass).

## Duration Control

Four scale modes set the length as a multiple of each form's natural length:

| Scale | Description |
|-------|-------------|
| Short | ~1x natural length (default) |
| Medium | ~2x natural length |
| Long | ~3x natural length |
| Full | ~4x natural length |

You can also set a specific bar count with `targetBars`, which overrides `scale` and is clamped to `[form minimum, 128]`.

::: tip
See [Option Relationships](/docs/option-relationships) for how `targetBars` interacts with the `scale` setting and other configuration options.
:::

## Additional Capabilities

- **All 12 keys** supported (C through B), both major and minor
- **Tempo control** from 40 to 200 BPM
- **Cross-platform**: runs in Node.js and all modern browsers via WebAssembly
- **Standard MIDI output**: compatible with every DAW and MIDI tool
- **Dual-licensed**: AGPL-3.0 — free to use, modify, and redistribute, including commercially, under its copyleft terms; a separate commercial license is available for closed-source products and proprietary SaaS. Generated MIDI is yours to use freely, including commercially
