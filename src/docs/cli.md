---
title: CLI Reference
description: Command-line interface reference for MIDI Sketch Bach.
---

# CLI Reference

MIDI Sketch Bach includes a command-line tool for generating Bach-style MIDI files directly from the terminal.

::: info Reading musical options
CLI options such as `--form`, `--key`, `--character`, `--scale`, and `--bars` are music-structure choices. If the terminology is unfamiliar, start with the [Music Primer for Engineers](/docs/music-primer).
:::

## Installation

```bash
# Run without installing
npx @libraz/midi-sketch-bach [options]

# Or install globally
npm install -g @libraz/midi-sketch-bach
@libraz/midi-sketch-bach [options]
```

## Usage

```
@libraz/midi-sketch-bach [options]
```

## Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--form <value>` | | string | `fugue` | Musical form name |
| `--key <value>` | | string | `c_major` | Key name such as `c_major`, `g_minor`, `F_major` |
| `--character <value>` | | string | `severe` | Subject character (`severe`, `playful`, `noble`, `restless`) |
| `--instrument <value>` | | string | Form default | Instrument the form accepts (`organ`, `harpsichord`, `piano`, `violin`, `cello`, `guitar`) |
| `--bpm <value>` | | number | `100` | Starting tempo in BPM (40--200) |
| `--seed <value>` | | number | `0` | Random seed (0 = random; resolved seed is reported) |
| `--scale <value>` | | string | `short` | Length multiplier (`short`, `medium`, `long`, `full`) |
| `--bars <value>` | | number | -- | Target bar count (overrides `--scale`) |
| `--free-counterpoint` | | boolean | `false` | Experimental: generate the Passacaglia secondary counterline by scored search. Other forms exit with an unavailable diagnostic |
| `-o <path>` | | string | `output.mid` | Output file path |
| `--json` | | boolean | `false` | Write event data beside the MIDI file as `.json` |
| `--generated-json` | | boolean | `false` | Emit `generated.v1` + `provenance.v1` JSON for scoring (developer) |
| `--composer-phase <value>` | | string | -- | Developer harness mode for pinned composer phases. Cannot be combined with the options above |
| `--help` | `-h` | boolean | -- | Show usage |

::: warning Removed flags
`--voices`, `--minor`, `--analyze`, `--strict`, and `--toccata-style` no longer exist. The voice count is decided by the form, and mode is encoded in `--key` (`c_major`, `d_minor`, etc.). Invalid `--form`/`--key`/`--character`/`--instrument`/`--scale` values, an option with a missing value, and out-of-range `--bpm` exit with an error instead of falling back to a default.
:::

::: info The form picks the instrument
Each form is written for one instrument — organ for forms 0--6, cello for the Cello Prelude, violin for the Chaconne, harpsichord or piano for the Goldberg Variations. `--instrument` selects among what the form accepts; anything else exits with an incompatible-instrument error.
:::

## Form Names

Use these names with the `--form` option:

| Name |
|------|
| `fugue` |
| `prelude_and_fugue` |
| `trio_sonata` |
| `chorale_prelude` |
| `toccata_and_fugue` |
| `passacaglia` |
| `fantasia_and_fugue` |
| `cello_prelude` |
| `chaconne` |
| `goldberg_variations` |

## Character Names

| Name |
|------|
| `severe` |
| `playful` |
| `noble` |
| `restless` |

## Instrument Names

| Name |
|------|
| `organ` |
| `harpsichord` |
| `piano` |
| `violin` |
| `cello` |
| `guitar` |

## Examples

### Basic Generation

Generate the default piece (Fugue in C major):

```bash
@libraz/midi-sketch-bach -o fugue.mid
```

### Fugue in D Minor

```bash
@libraz/midi-sketch-bach --form fugue --key d_minor --character severe --bpm 76 -o fugue-dm.mid
```

### Prelude and Fugue in C Major

```bash
@libraz/midi-sketch-bach --form prelude_and_fugue --key c_major -o prelude-fugue.mid
```

### Trio Sonata in F Major

```bash
@libraz/midi-sketch-bach --form trio_sonata --key f_major --bpm 90 -o trio-sonata.mid
```

### Chorale Prelude in A Major

```bash
@libraz/midi-sketch-bach --form chorale_prelude --key a_major --character noble --bpm 66 -o chorale.mid
```

### Toccata and Fugue in D Minor

```bash
@libraz/midi-sketch-bach --form toccata_and_fugue --key d_minor --character restless -o toccata-fugue.mid
```

### Passacaglia in C Minor

```bash
@libraz/midi-sketch-bach --form passacaglia --key c_minor --scale long -o passacaglia.mid
```

### Fantasia and Fugue in G Minor

```bash
@libraz/midi-sketch-bach --form fantasia_and_fugue --key g_minor -o fantasia-fugue.mid
```

### Cello Prelude in G Major

```bash
@libraz/midi-sketch-bach --form cello_prelude --key g_major --instrument cello -o cello-prelude.mid
```

### Chaconne in D Minor

```bash
@libraz/midi-sketch-bach --form chaconne --key d_minor --instrument violin -o chaconne.mid
```

### Goldberg Variations in G Major

```bash
@libraz/midi-sketch-bach --form goldberg_variations --key g_major --instrument harpsichord -o goldberg.mid
```

### Deterministic Output with Seed

```bash
@libraz/midi-sketch-bach --form fugue --key g_minor --seed 42 -o fugue-seed42.mid
```

### Full-Scale Passacaglia

```bash
@libraz/midi-sketch-bach --form passacaglia --key d_minor --scale full -o passacaglia-full.mid
```

### Target a Specific Bar Count

```bash
@libraz/midi-sketch-bach --form fugue --key c_major --bars 24 -o fugue-24bars.mid
```

### Output JSON Event Data

```bash
@libraz/midi-sketch-bach --form fugue --key d_minor --json -o fugue.mid
```

This writes `fugue.mid` and `fugue.json`. `--generated-json` adds `fugue.generated.json` and `fugue.provenance.json`. When `-o` already ends in `.json`, the sidecars are appended to that name rather than replacing its extension, so the output file is never overwritten by its own sidecar.

### Generate with npx

No installation required:

```bash
npx @libraz/midi-sketch-bach --form fugue --key d_minor -o fugue.mid
```

## JSON Output Format

When using `--json`, the sidecar JSON follows the [EventData](/docs/api-js#eventdata) structure:

The events JSON reports pitches in C (the requested key is applied only in the `.mid` file), and every note carries a `source` provenance tag (`"material"`, `"compose"`, or `"ornament"`).

```json
{
  "form": "fugue",
  "key": "D minor",
  "bpm": 80,
  "seed": 12345,
  "total_ticks": 80640,
  "total_bars": 42,
  "description": "Fugue, 3 voices",
  "tempos": [
    { "tick": 0, "bpm": 80 },
    { "tick": 80640, "bpm": 78 }
  ],
  "time_signatures": [
    { "tick": 0, "numerator": 4, "denominator": 4 }
  ],
  "tracks": [
    {
      "name": "Soprano",
      "channel": 0,
      "program": 19,
      "note_count": 128,
      "control_changes": [
        { "tick": 0, "controller": 7, "value": 75 }
      ],
      "notes": [
        {
          "pitch": 72,
          "velocity": 80,
          "start_tick": 0,
          "duration": 480,
          "voice": 0,
          "source": "material"
        }
      ]
    }
  ]
}
```

`bpm` is only the starting tempo — see [Converting Ticks to Seconds](/docs/api-js#converting-ticks-to-seconds) for placing these ticks on the clock.

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `2` | Usage error — unknown option, missing value, or an incompatible option combination |
| `3` | Generation error — invalid configuration, an incompatible character/instrument, or composer validation failure |
| `4` | Output error — the MIDI file or a JSON sidecar could not be written |

When `--generated-json` is set and composer validation fails, a `.diagnostic.json` sidecar is written alongside the intended output before the run exits with code `3`.
