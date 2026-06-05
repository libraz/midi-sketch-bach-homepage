---
title: CLI Reference
description: Command-line interface reference for MIDI Sketch Bach.
---

# CLI Reference

MIDI Sketch Bach includes a command-line tool for generating Bach-style MIDI files directly from the terminal.

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
| `--form <value>` | `-f` | string/number | `fugue` | Musical form (name or 0--9) |
| `--key <value>` | `-k` | number | `0` | Key as pitch class (0=C, 1=C#, ... 11=B) |
| `--minor` | `-m` | boolean | `false` | Use minor key |
| `--character <value>` | `-c` | string/number | `severe` | Subject character (severe/playful/noble/restless) |
| `--instrument <value>` | `-i` | string/number | Form default | Instrument (name or 0--5) |
| `--bpm <value>` | `-b` | number | `100` | Tempo in BPM (0 = default 100, otherwise 40--200) |
| `--seed <value>` | `-s` | number | `0` | Random seed (0 = random; resolved seed is reported) |
| `--scale <value>` | | string/number | `short` | Length multiplier (short/medium/long/full or 0--3) |
| `--bars <value>` | | number | -- | Target bar count (overrides `--scale`) |
| `-o <path>` | | string | `output.mid` | Output file path |
| `--json` | | boolean | `false` | Output event data as JSON to stdout |

::: warning Removed flags
`--voices`, `--analyze`, `--strict`, and `--toccata-style` no longer exist. The voice count is decided by the form; invalid `--form`/`--character`/`--instrument`/`--scale` values and out-of-range `--bpm` now exit with an error instead of falling back to a default.
:::

## Form Names

Use these names with the `--form` option:

| Name | Number |
|------|--------|
| `fugue` | 0 |
| `prelude_and_fugue` | 1 |
| `trio_sonata` | 2 |
| `chorale_prelude` | 3 |
| `toccata_and_fugue` | 4 |
| `passacaglia` | 5 |
| `fantasia_and_fugue` | 6 |
| `cello_prelude` | 7 |
| `chaconne` | 8 |
| `goldberg_variations` | 9 |

## Character Names

| Name | Number |
|------|--------|
| `severe` | 0 |
| `playful` | 1 |
| `noble` | 2 |
| `restless` | 3 |

## Instrument Names

| Name | Number |
|------|--------|
| `organ` | 0 |
| `harpsichord` | 1 |
| `piano` | 2 |
| `violin` | 3 |
| `cello` | 4 |
| `guitar` | 5 |

## Examples

### Basic Generation

Generate a default piece (Fugue in C major):

```bash
@libraz/midi-sketch-bach -o fugue.mid
```

### Fugue in D Minor

```bash
@libraz/midi-sketch-bach --form fugue --key 2 --minor --character severe --bpm 76 -o fugue-dm.mid
```

### Prelude and Fugue in C Major

```bash
@libraz/midi-sketch-bach --form prelude_and_fugue --key 0 -o prelude-fugue.mid
```

### Trio Sonata in F Major

```bash
@libraz/midi-sketch-bach --form trio_sonata --key 5 --bpm 90 -o trio-sonata.mid
```

### Chorale Prelude in A Major

```bash
@libraz/midi-sketch-bach --form chorale_prelude --key 9 --character noble --bpm 66 -o chorale.mid
```

### Toccata and Fugue in D Minor

```bash
@libraz/midi-sketch-bach --form toccata_and_fugue --key 2 --minor --character restless -o toccata-fugue.mid
```

### Passacaglia in C Minor

```bash
@libraz/midi-sketch-bach --form passacaglia --key 0 --minor --scale long -o passacaglia.mid
```

### Fantasia and Fugue in G Minor

```bash
@libraz/midi-sketch-bach --form fantasia_and_fugue --key 7 --minor -o fantasia-fugue.mid
```

### Cello Prelude in G Major

```bash
@libraz/midi-sketch-bach --form cello_prelude --key 7 --instrument cello -o cello-prelude.mid
```

### Chaconne in D Minor

```bash
@libraz/midi-sketch-bach --form chaconne --key 2 --minor --instrument violin -o chaconne.mid
```

### Goldberg Variations in G Major

```bash
@libraz/midi-sketch-bach --form goldberg_variations --key 7 --instrument harpsichord -o goldberg.mid
```

### Deterministic Output with Seed

```bash
@libraz/midi-sketch-bach --form fugue --key 7 --minor --seed 42 -o fugue-seed42.mid
```

### Full-Scale Passacaglia

```bash
@libraz/midi-sketch-bach --form passacaglia --key 2 --minor --scale full -o passacaglia-full.mid
```

### Target a Specific Bar Count

```bash
@libraz/midi-sketch-bach --form fugue --key 0 --bars 24 -o fugue-24bars.mid
```

### Output JSON Event Data

```bash
@libraz/midi-sketch-bach --form fugue --key 2 --minor --json > fugue-events.json
```

### Generate with npx

No installation required:

```bash
npx @libraz/midi-sketch-bach --form fugue --key 2 --minor -o fugue.mid
```

## JSON Output Format

When using `--json`, the output follows the [EventData](/docs/api-js#eventdata) structure:

The events JSON reports pitches in C (the requested key is applied only in the `.mid` file), and every note carries a `source` provenance tag (`"material"`, `"compose"`, or `"ornament"`).

```json
{
  "form": "fugue",
  "key": 2,
  "bpm": 80,
  "seed": 12345,
  "total_ticks": 80640,
  "total_bars": 42,
  "description": "Fugue, 3 voices",
  "tracks": [
    {
      "name": "Soprano",
      "channel": 0,
      "program": 19,
      "note_count": 128,
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

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Invalid arguments or generation error |
