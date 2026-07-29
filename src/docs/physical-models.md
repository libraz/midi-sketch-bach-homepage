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
2. **Playable range** — the pitch window the candidate search keeps the generated lines within, and the compass the finished score is fitted to. Notes are folded back into range rather than modeled for ergonomic difficulty; a score that sits outside the compass is displaced by whole octaves instead of having individual notes clamped.
3. **Ornament density** — how heavily the opt-in ornament pass decorates the line (combined with the `character`).

The voice count, meter, and structure come from the `form`, not from the instrument. Because the range feeds back into the composition itself, each form accepts only the instrument it was written for — see [Default Instrument per Form](#default-instrument-per-form).

::: info Instrument vs voice
An **instrument** is the playback sound and range profile. A **voice** is the musical line being generated. A single instrument, such as organ, can carry several voices.
:::

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

| Form | Default Instrument | Also accepted |
|------|--------------------|---------------|
| `fugue`, `prelude_and_fugue`, `trio_sonata`, `chorale_prelude`, `toccata_and_fugue`, `passacaglia`, `fantasia_and_fugue` | Organ | -- |
| `cello_prelude` | Cello | -- |
| `chaconne` | Violin | -- |
| `goldberg_variations` | Harpsichord | Piano |

Guitar has a General MIDI program and a range profile but is not currently accepted by any form. Requesting an instrument outside a form's row throws an incompatible-instrument error.

## Ornament Density

The deterministic ornament pass adds trills, mordents, and Nachschlag. How densely it decorates depends on both the `character` and the `instrument`, and some lines are never ornamented:

::: info Trill, mordent, Nachschlag
These are short Baroque decorative figures around a structural note. They are added after the main composition is validated, so they are tagged as `source: "ornament"` rather than `"material"` or `"compose"`.
:::

- Ground-bass lines (passacaglia, chaconne, Goldberg bass) are never ornamented.
- Cantus-firmus lines (chorale prelude) are never ornamented.

Notes added here carry the `source: "ornament"` provenance tag.

## Expression Output

Beyond ornaments, the engine writes form-appropriate expression, and all of it is readable from the event data as well as the MIDI file:

- **Registration curve** — CC 7 and CC 11 points following the form's energy arc, reported per track as `control_changes` with duplicates already merged.
- **Tempo map** — the closing ritardando, plus a section tempo change at the fugue entry of the prelude, toccata and fantasia forms. Reported as `tempos`.
- **Time signature** — 3/4 for passacaglia and chaconne, 4/4 otherwise. Reported as `time_signatures`.

Because tempo varies within a piece, use the tempo map rather than `bpm` when placing events on the clock — see [Converting Ticks to Seconds](/docs/api-js#converting-ticks-to-seconds).

::: tip
See [Voice Architecture](/docs/voice-architecture) for how voices map to instruments and tracks, and the [Generation Pipeline](/docs/generation-pipeline) for where the ornament and expression passes sit.
:::
