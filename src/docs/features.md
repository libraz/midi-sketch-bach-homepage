---
title: Features
description: Feature overview of MIDI Sketch Bach - algorithmic Bach-style MIDI generation.
---

# Features

## 9 Musical Forms

MIDI Sketch Bach generates compositions in nine distinct Baroque instrumental forms, organized into two systems:

### Organ System (Forms 0--6)

| ID | Form | Voices | Description |
|----|------|--------|-------------|
| 0 | Fugue | 4 | Pure contrapuntal fugue with subject, answer, and episodes |
| 1 | Prelude and Fugue | 4 | Flowing prelude paired with an elaborate fugue |
| 2 | Trio Sonata | 3 | Three independent voices: two upper parts over a bass line |
| 3 | Chorale Prelude | 4 | Hymn melody with contrapuntal accompaniment |
| 4 | Toccata and Fugue | 4 | Dramatic virtuosic toccata followed by a strict fugue |
| 5 | Passacaglia | 4 | Continuous variations over a repeating bass theme |
| 6 | Fantasia and Fugue | 4 | Free-form fantasia paired with a structured fugue |

### Solo Instrument System (Forms 7--8)

| ID | Form | Voices | Description |
|----|------|--------|-------------|
| 7 | Cello Prelude | 3 | Flowing prelude for solo cello |
| 8 | Chaconne | 3 | Monumental variation form for solo violin |

::: tip
See [Forms](/docs/forms) for detailed descriptions and Baroque historical context for each form.
:::

## Counterpoint and Polyphony

- **2 to 5 independent voices** with proper voice leading
- Rule-based counterpoint following Baroque compositional principles
- Authentic voice independence -- each voice has its own melodic identity
- Proper interval handling: consonance, dissonance, and resolution
- Subject-answer relationships in fugal forms
- Forbidden parallel fifths and octaves avoidance

::: info
See [Counterpoint & Voice Leading](/docs/counterpoint) for the full set of rules governing voice interaction.
:::

## Multiple Instruments

Six instrument presets shape the MIDI output:

| Instrument | Typical Forms |
|-----------|---------------|
| Organ | Fugue, Prelude and Fugue, Trio Sonata, Chorale Prelude, Toccata and Fugue, Passacaglia, Fantasia and Fugue |
| Harpsichord | Any organ form (alternative voicing) |
| Piano | Any form |
| Violin | Chaconne |
| Cello | Cello Prelude |
| Guitar | Cello Prelude, Chaconne (alternative voicing) |

Each instrument maps to appropriate General MIDI program numbers and voice ranges.

## Subject Characters

Four character types influence the melodic character of fugue subjects and thematic material:

| Character | Style |
|-----------|-------|
| 0 | Default balanced character |
| 1 | Lyrical, stepwise motion |
| 2 | Energetic, wider intervals |
| 3 | Dramatic, rhythmically varied |

## Deterministic Generation

Every generation is controlled by a **seed** value. The same configuration with the same seed always produces the exact same output:

```js
// These two calls produce identical MIDI
generator.generate({ form: 'fugue', key: 0, seed: 42 })
generator.generate({ form: 'fugue', key: 0, seed: 42 })
```

Set `seed: 0` (or omit it) for random generation.

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
// events.form        - "Fugue"
// events.key         - "D minor"
// events.bpm         - 85
// events.total_bars  - 32
// events.tracks      - Array of TrackData with individual notes
```

## Duration Control

Four scale modes control the length of generated compositions:

| Scale | Description |
|-------|-------------|
| Short | Compact compositions, fewer variations |
| Medium | Standard length (default) |
| Long | Extended compositions with more development |
| Full | Maximum length with full formal structure |

You can also set a specific bar count with `targetBars`.

::: tip
See [Option Relationships](/docs/option-relationships) for how `targetBars` interacts with the `scale` setting and other configuration options.
:::

## Additional Capabilities

- **All 12 keys** supported (C through B), both major and minor
- **Tempo control** from 40 to 200 BPM
- **Cross-platform**: runs in Node.js and all modern browsers via WebAssembly
- **Standard MIDI output**: compatible with every DAW and MIDI tool
- **Apache-2.0 license**: free for commercial and personal use
