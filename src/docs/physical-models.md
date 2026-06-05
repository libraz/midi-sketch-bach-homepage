---
title: Instruments
description: How MIDI Sketch Bach handles instruments - General MIDI program, playable range, and ornament density per instrument.
---

# Instruments

::: warning Per-instrument physical modeling was removed
Earlier versions included detailed physical performer models (bow direction, hand spans, fret positions, fatigue, harmonics, and so on) that scored how playable each note was. The composer engine does **not** use these. Instrument handling is now intentionally simpler: a General MIDI program, a playable range, and an ornament-density profile. This page describes what the engine actually does today.
:::

## What an Instrument Selects

Choosing an `instrument` affects three things:

1. **General MIDI program** — the sound written into the MIDI file.
2. **Playable range** — the pitch window the candidate search keeps the generated lines within. Notes are folded back into range rather than modeled for ergonomic difficulty.
3. **Ornament density** — how heavily the opt-in ornament pass decorates the line (combined with the `character`).

The voice count, meter, and structure come from the `form`, not from the instrument. Each form has a default instrument, but any instrument may be substituted.

## General MIDI Programs

| Instrument | String | GM Program | Sound |
|------------|--------|-----------|-------|
| Organ | `"organ"` | 19 | Church Organ |
| Harpsichord | `"harpsichord"` | 6 | Harpsichord |
| Piano | `"piano"` | 0 | Acoustic Grand Piano |
| Violin | `"violin"` | 40 | Violin |
| Cello | `"cello"` | 42 | Cello |
| Guitar | `"guitar"` | 24 | Acoustic Guitar (Nylon) |

An unknown instrument string is rejected (it throws) rather than silently falling back to a default.

## Default Instrument per Form

| Form | Default Instrument |
|------|--------------------|
| `fugue`, `prelude_and_fugue`, `trio_sonata`, `chorale_prelude`, `toccata_and_fugue`, `passacaglia`, `fantasia_and_fugue` | Organ |
| `cello_prelude` | Cello |
| `chaconne` | Violin |
| `goldberg_variations` | Harpsichord |

## Ornament Density

The deterministic ornament pass adds trills, mordents, and Nachschlag. How densely it decorates depends on both the `character` and the `instrument`, and some lines are never ornamented:

- Ground-bass lines (passacaglia, chaconne, Goldberg bass) are never ornamented.
- Cantus-firmus lines (chorale prelude) are never ornamented.

Notes added here carry the `source: "ornament"` provenance tag.

## Expression Output

Beyond ornaments, the engine writes form-appropriate expression:

- **Organ registration** — a CC#7/#11 curve that follows the form's energy arc.
- **Closing ritardando** — tempo events that slow the final cadence.
- **Time signature** — 3/4 for passacaglia and chaconne, 4/4 otherwise.

::: tip
See [Voice Architecture](/docs/voice-architecture) for how voices map to instruments and tracks, and the [Generation Pipeline](/docs/generation-pipeline) for where the ornament and expression passes sit.
:::
