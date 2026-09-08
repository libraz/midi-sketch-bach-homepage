---
title: Architecture
description: Technical architecture of MIDI Sketch Bach - the composer engine, its pipeline, and WASM integration.
---

# Architecture

::: info Reading the musical terms
This page uses music terms as data-model terms: **voice** means a melodic stream, **harmony** means the chord plan over time, and **form** means the composition template. See the [Music Primer for Engineers](/docs/music-primer) for the short definitions.
:::

## Overview

::: info What is MIDI Sketch Bach?
MIDI Sketch Bach is an algorithmic composition engine that generates Baroque-style instrumental MIDI using rule-based composition, not machine learning. Every note is determined by a harmonic plan and counterpoint constraints, producing editable MIDI you can import into any DAW.
:::

A C++ composer engine is compiled to WebAssembly, with a JavaScript API on top:

![Three layers: the JavaScript API, the Emscripten bridge, and the composer engine compiled from C++ to WebAssembly](/images/wasm-stack.svg)

## The Composer Engine

A single composer subsystem handles every form through dedicated per-form builders. Each builder expresses its form as a **layout of voice intents** over a harmonic plan, then the composer assembles, validates, and renders that layout. The form decides the texture (voice count, meter, natural length); there is no voice-count option.

::: info Voice intent and harmonic plan
A **voice intent** is the role assigned to one melodic stream over a span of bars: subject, answer, ground bass, figuration, and so on. A **harmonic plan** is the chord roadmap used when building and validating that material.
:::

The pipeline is:

1. **Compose Request** — resolve and validate the config; resolve the seed; fix voice count / meter / length from the form.
2. **Form Director** — assign per-form voice intents (subjects, grounds, cantus firmus, figuration, variations) to bar spans.
3. **Candidate Search** — dispatch each span; all default shipped spans replay authored carrier material verbatim.
4. **Generation Validation & Initial Renderer** — accumulate counterpoint and structure failures, then render the assembled voices to initial tracks.
5. **Ornament** — apply deterministic ornaments to eligible notes.
6. **Final Validation & Expression** — run `FinalScore` and the form budget, apply velocity, save the notated snapshot, apply articulation, re-render, then add CC 7/CC 11 and tempo events.
7. **MIDI & Event Export** — transpose pitches into the output key and emit the Standard MIDI File and public event data.

The scored search branch is off by default and contributes no notes to default output. `--free-counterpoint` reroutes only `passacaglia` V1 (`voice == 1`); other forms report that free counterpoint is unavailable.

See the [Generation Pipeline](/docs/generation-pipeline) for a step-by-step breakdown.

## Design-Value Arc

Structure follows a fixed design arc — **establish → develop → climax (at ~80% of the span) → resolve** — that controls density, register, and velocity tiers. The arc is a property of the form, not something searched per seed, which keeps output musically shaped and reproducible.

![A curve rising through the establish and develop phases, peaking at about 80% of the span, then falling through the resolve phase](/images/design-arc.svg)

::: info Density, register, velocity
**Density** is how many notes happen in a span. **Register** is pitch height, such as low bass or high treble. **Velocity** is MIDI note intensity. The arc raises and lowers these values so the output has phrase shape instead of a flat stream of notes.
:::

## Form Families

The form director handles several layout families:

- **Fugal** (`fugue`, `prelude_and_fugue`, `toccata_and_fugue`, `fantasia_and_fugue`) — subject/answer entries with episodes.
- **Ground-bass variation** (`passacaglia`, `chaconne`, `goldberg_variations`) — an immutable bass with successive variation cycles; the natural 20-bar Goldberg layout contains the aria and four variations, while the full 128-bar layout contains the aria, all thirty variations, and the aria da capo. `passacaglia`/`chaconne` run their cycles in 3/4.
- **Cantus firmus** (`chorale_prelude`) — a fixed chorale line with a figuration voice and independent bass.
- **Linear / figural** (`trio_sonata`, `cello_prelude`) — interacting or continuous figuration.

## Determinism

For an explicit non-zero seed, the same config and seed produce byte-identical output. With `seed: 0`, the runtime chooses a new seed. Composition and validation run internally in C. Output serialization applies the requested key and any output-octave shift to both the MIDI file and the pitches returned by `getEvents()`. The lower-level `generated.v1` artifact retains the internal C pitches and the notated durations captured before articulation.

::: info Two event representations
Use `getEvents()` when you need the notes as they sound in the selected output key, including articulated playback durations. Use `generated.v1` for internal diagnostics whose pitches and notated durations must stay comparable across keys.
:::

## WASM Integration

- **Initialization**: `init()` loads and instantiates the WASM module.
- **Memory management**: `BachGenerator` allocates WASM memory; `destroy()` frees it.
- **Data transfer**: MIDI output is copied from WASM memory to a JavaScript `Uint8Array`; event data is serialized from WASM and parsed in JavaScript.
