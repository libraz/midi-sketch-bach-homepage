---
title: Getting Started
description: Quick start guide for MIDI Sketch Bach - algorithmic Bach-style instrumental MIDI generator.
---

# Getting Started

MIDI Sketch Bach is an algorithmic composition engine that generates Bach-style instrumental MIDI. Built on Baroque music theory and counterpoint rules, it produces editable MIDI data featuring fugues, toccatas, passacaglias, and other Baroque forms.

::: info New to Baroque or notation terms?
You do not need to read staff notation to use the library. If terms such as **voice**, **bar**, **key**, **fugue**, or **counterpoint** are new, start with the [Music Primer for Engineers](/docs/music-primer).
:::

## Install

::: warning Alpha — not yet published to npm
This package is in alpha and has **not been published to the npm registry yet**. The commands below will not work until the first public release. Until then, try it in the [live demo](/) on this site.
:::

::: code-group

```bash [npm]
npm install @libraz/midi-sketch-bach
```

```bash [yarn]
yarn add @libraz/midi-sketch-bach
```

```bash [pnpm]
pnpm add @libraz/midi-sketch-bach
```

```bash [bun]
bun add @libraz/midi-sketch-bach
```

:::

## Quick Example

```js
import { init, BachGenerator } from '@libraz/midi-sketch-bach'
import { writeFileSync } from 'fs'

// Initialize the WASM module
await init()

// Create a generator and produce a fugue in D minor
const generator = new BachGenerator()
generator.generate({
  form: 'fugue',
  key: 2,
  isMinor: true,
  character: 'severe',
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
// Note: examples use ESM imports — set "type": "module" in package.json (or use .mjs)
```

## CLI Quick Start

Generate a MIDI file directly from the command line:

```bash
npx @libraz/midi-sketch-bach --form fugue --key d_minor -o output.mid
```

Generate a Toccata and Fugue in D minor:

```bash
npx @libraz/midi-sketch-bach --form toccata_and_fugue --key d_minor -o toccata.mid
```

::: tip Defaults differ between the JS API and the CLI
When `bpm` is omitted, the JS API defaults to 100 while the CLI defaults to 72. The CLI also falls back to `--scale medium` for fugue when `--scale` is omitted (the JS API default is always `short`). See the [CLI reference](/docs/cli) for the full list of CLI defaults.
:::

## What You Can Generate

MIDI Sketch Bach supports 10 musical forms across three systems:

**Organ System** -- Fugue, Prelude and Fugue, Trio Sonata, Chorale Prelude, Toccata and Fugue, Passacaglia, Fantasia and Fugue

**Solo Instrument System** -- Cello Prelude, Chaconne

**Variation System** -- Goldberg Variations

Each form follows authentic Baroque compositional rules for voice leading, counterpoint, and harmonic structure.

## Next Steps

1. [Music Primer for Engineers](/docs/music-primer) -- Minimal music vocabulary used by the docs
2. [Features](/docs/features) -- Overview of all capabilities
3. [Forms](/docs/forms) -- Choose the composition template you want
4. [Counterpoint Course](/docs/counterpoint) -- Why the validator accepts or rejects notes
5. [Installation](/docs/installation) -- Detailed installation options
6. [JavaScript API](/docs/api-js) or [CLI Reference](/docs/cli) -- Use the package from code or the terminal
7. [Architecture](/docs/architecture) -- How it works under the hood
