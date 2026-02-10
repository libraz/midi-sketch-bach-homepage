---
title: Getting Started
description: Quick start guide for MIDI Sketch Bach - algorithmic Bach-style instrumental MIDI generator.
---

# Getting Started

MIDI Sketch Bach is an algorithmic composition engine that generates Bach-style instrumental MIDI. Built on Baroque music theory and counterpoint rules, it produces editable MIDI data featuring fugues, toccatas, passacaglias, and other Baroque forms.

## Install

```bash
npm install midi-sketch-bach
```

## Quick Example

```js
import { init, BachGenerator } from 'midi-sketch-bach'
import { writeFileSync } from 'fs'

// Initialize the WASM module
await init()

// Create a generator and produce a fugue in D minor
const generator = new BachGenerator()
generator.generate({
  form: 'fugue',
  key: 2,
  isMinor: true,
  numVoices: 4,
  bpm: 80
})

// Get MIDI file data and save
const midi = generator.getMidi()
writeFileSync('bach-fugue.mid', midi)

// Get structured event data
const events = generator.getEvents()
console.log(events.description)
console.log(`${events.total_bars} bars, ${events.tracks.length} tracks`)

// Clean up
generator.destroy()
```

## CLI Quick Start

Generate a MIDI file directly from the command line:

```bash
npx midi-sketch-bach --form fugue --key 2 --minor -o output.mid
```

Generate a Toccata and Fugue in D minor:

```bash
npx midi-sketch-bach --form "toccata-and-fugue" --key 2 --minor -o toccata.mid
```

## What You Can Generate

MIDI Sketch Bach supports 9 musical forms across two systems:

**Organ System** -- Fugue, Prelude and Fugue, Trio Sonata, Chorale Prelude, Toccata and Fugue, Passacaglia, Fantasia and Fugue

**Solo Instrument System** -- Cello Prelude, Chaconne

Each form follows authentic Baroque compositional rules for voice leading, counterpoint, and harmonic structure.

## Next Steps

- [Features](/docs/features) -- Overview of all capabilities
- [Installation](/docs/installation) -- Detailed installation options
- [Forms](/docs/forms) -- Learn about each musical form
- [Counterpoint & Voice Leading](/docs/counterpoint) -- Baroque music theory behind the engine
- [JavaScript API](/docs/api-js) -- Full API reference
- [CLI Reference](/docs/cli) -- Command-line usage
- [Architecture](/docs/architecture) -- How it works under the hood
