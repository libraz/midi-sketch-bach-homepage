---
title: CLI Reference
description: Command-line interface reference for MIDI Sketch Bach.
---

# CLI Reference

MIDI Sketch Bach includes a command-line tool for generating Bach-style MIDI files directly from the terminal.

## Installation

```bash
# Run without installing
npx midi-sketch-bach [options]

# Or install globally
npm install -g midi-sketch-bach
midi-sketch-bach [options]
```

## Usage

```
midi-sketch-bach [options]
```

## Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--form <value>` | `-f` | string/number | `0` | Musical form (name or 0--8) |
| `--key <value>` | `-k` | number | `0` | Key as pitch class (0=C, 1=C#, ... 11=B) |
| `--minor` | `-m` | boolean | `false` | Use minor key |
| `--voices <value>` | `-v` | number | Form default | Number of voices (2--5) |
| `--bpm <value>` | `-b` | number | `100` | Tempo in BPM (40--200) |
| `--seed <value>` | `-s` | number | `0` | Random seed (0 = random) |
| `--instrument <value>` | `-i` | string/number | Form default | Instrument (name or 0--5) |
| `--character <value>` | `-c` | number | `0` | Subject character type (0--3) |
| `--scale <value>` | | string/number | `1` | Duration scale (short/medium/long/full or 0--3) |
| `--target-bars <value>` | | number | -- | Target number of bars |
| `--output <path>` | `-o` | string | `output.mid` | Output file path |
| `--json` | | boolean | `false` | Output event data as JSON to stdout |

## Form Names

Use these names with the `--form` option:

| Name | Number |
|------|--------|
| `fugue` | 0 |
| `prelude-and-fugue` | 1 |
| `trio-sonata` | 2 |
| `chorale-prelude` | 3 |
| `toccata-and-fugue` | 4 |
| `passacaglia` | 5 |
| `fantasia-and-fugue` | 6 |
| `cello-prelude` | 7 |
| `chaconne` | 8 |

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
midi-sketch-bach -o fugue.mid
```

### Fugue in D Minor

```bash
midi-sketch-bach --form fugue --key 2 --minor --voices 4 --bpm 76 -o fugue-dm.mid
```

### Prelude and Fugue in C Major

```bash
midi-sketch-bach --form prelude-and-fugue --key 0 --voices 4 -o prelude-fugue.mid
```

### Trio Sonata in F Major

```bash
midi-sketch-bach --form trio-sonata --key 5 --bpm 90 -o trio-sonata.mid
```

### Chorale Prelude in A Major

```bash
midi-sketch-bach --form chorale-prelude --key 9 --voices 4 --bpm 66 -o chorale.mid
```

### Toccata and Fugue in D Minor

```bash
midi-sketch-bach --form toccata-and-fugue --key 2 --minor --voices 4 -o toccata-fugue.mid
```

### Passacaglia in C Minor

```bash
midi-sketch-bach --form passacaglia --key 0 --minor --voices 4 --scale long -o passacaglia.mid
```

### Fantasia and Fugue in G Minor

```bash
midi-sketch-bach --form fantasia-and-fugue --key 7 --minor --voices 4 -o fantasia-fugue.mid
```

### Cello Prelude in G Major

```bash
midi-sketch-bach --form cello-prelude --key 7 --instrument cello -o cello-prelude.mid
```

### Chaconne in D Minor

```bash
midi-sketch-bach --form chaconne --key 2 --minor --instrument violin -o chaconne.mid
```

### Deterministic Output with Seed

```bash
midi-sketch-bach --form fugue --key 7 --minor --seed 42 -o fugue-seed42.mid
```

### Full-Scale Passacaglia

```bash
midi-sketch-bach --form passacaglia --key 2 --minor --scale full --voices 5 -o passacaglia-full.mid
```

### Target a Specific Bar Count

```bash
midi-sketch-bach --form invention --key 0 --target-bars 24 -o invention-24bars.mid
```

### Output JSON Event Data

```bash
midi-sketch-bach --form fugue --key 2 --minor --json > fugue-events.json
```

### Generate with npx

No installation required:

```bash
npx midi-sketch-bach --form fugue --key 2 --minor -o fugue.mid
```

## JSON Output Format

When using `--json`, the output follows the [EventData](/docs/api-js#eventdata) structure:

```json
{
  "form": "Fugue",
  "key": "D minor",
  "bpm": 80,
  "seed": 12345,
  "total_ticks": 30720,
  "total_bars": 32,
  "description": "Fugue in D minor, 4 voices",
  "tracks": [
    {
      "name": "Soprano",
      "channel": 0,
      "program": 19,
      "note_count": 128,
      "notes": [
        {
          "pitch": 74,
          "velocity": 80,
          "start_tick": 0,
          "duration": 480,
          "voice": 0
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
