---
title: Instruments
description: How MIDI Sketch Bach handles instruments - General MIDI program, output compass, and ornament density per instrument.
---

# Instruments

The engine represents an instrument with a General MIDI program, an output compass, and an ornament-density profile. It does not simulate performer ergonomics such as bow direction, hand span, fret position, or fatigue.

## What an Instrument Selects

Choosing an `instrument` affects five things:

1. **General MIDI program** — the sound written into the MIDI file.
2. **Output compass** — the range preference used after composition. Once the requested key is applied, the engine first tries a whole-score octave displacement that fits every note; it does not clamp individual notes, and chooses the nearest compass when no single shift can contain the whole score.
3. **Ornament density** — how heavily the ornament pass decorates the line (combined with the `character`).
4. **Velocity curve** — organ and harpsichord keep the fixed default velocity; piano, violin, cello, and guitar receive the phrase-aware curve.
5. **Controller profile** — organ and harpsichord use CC 7 level events, piano, violin, and cello use CC 11 expression events, and guitar has no continuous-expression profile.

The voice count, meter, and structure come from the `form`, not from the instrument. Each form has an explicit set of compatible instruments — see [Default Instrument per Form](#default-instrument-per-form).

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

## Output Compasses

These are the MIDI ranges used by the product's instrument profiles. The violin and cello profiles are intentionally broad so a complete generated texture or ground-bass movement can remain on one output instrument; they are not claims about the lowest comfortable note of an unaccompanied solo part.

| Instrument | MIDI compass |
|------------|--------------|
| Organ | C1–C7 (24–96) |
| Harpsichord | C2–C7 (36–96) |
| Piano | A0–C8 (21–108) |
| Violin | C2–C7 (36–96) |
| Cello | C1–C7 (24–96) |
| Guitar | E2–B5 (40–83) |

## Default Instrument per Form

| Form | Default Instrument | Also accepted |
|------|--------------------|---------------|
| `fugue`, `prelude_and_fugue`, `trio_sonata`, `chorale_prelude`, `toccata_and_fugue`, `passacaglia`, `fantasia_and_fugue` | Organ | -- |
| `cello_prelude` | Cello | -- |
| `chaconne` | Violin | -- |
| `goldberg_variations` | Harpsichord | Piano |

Guitar has a General MIDI program and a range profile but is not currently accepted by any form. Requesting an instrument outside a form's row throws an incompatible-instrument error.

## Ornament Density

The deterministic ornament pass adds trills (including cadential openings and a closing Nachschlag), appoggiaturas, turns, slides, and mordents. How densely it decorates depends on both the `character` and the `instrument`, and some lines or notes are protected:

::: info Ornament vocabulary and protection
These are short decorative figures around a structural note. They are added after the main composition is validated, so they are tagged as `source: "ornament"` rather than `"material"` or `"compose"`. Subject, answer, stretto, augmented, diminished, and inverted subject statements stay plain; middle entries remain eligible. Ground carriers are exempt. Cantus-firmus bar heads stay plain, while eligible within-bar notes can be decorated; `Severe` keeps the whole cantus line plain.
:::

- Ground-bass lines (passacaglia, chaconne, Goldberg bass) are never ornamented.

Notes added here carry the `source: "ornament"` provenance tag.

## Articulation

After final-score validation and the velocity pass, the engine applies a character-dependent release to eligible notes. The declared separation is measured on a 480-tick quarter-note grid:

| Character | Declared separation |
|-----------|---------------------|
| Noble | 24 ticks |
| Severe | 40 ticks |
| Playful | 56 ticks |
| Restless | 72 ticks |

Eligibility follows the next onset in the same voice: it must start at the current note's end or earlier, so it immediately follows or overlaps the note. A repeated pitch is eligible at any duration. A move wider than two semitones is eligible only when the current duration is at least an eighth (240 ticks). One- or two-semitone steps, wider moves on shorter notes, notes followed by a rest, and each voice's final onset keep their full notated duration.

Cello Prelude and Chaconne use half these values because their default instruments are bowed. Cantus-firmus voices use zero separation. For notes shorter than an eighth (240 ticks at this grid), the declared release scales with the note; a final guard retains at least half of the note's duration. Validation and analysis use the notated durations; MIDI and public event data use the shortened playback gates.

## Velocity

Organ and harpsichord notes keep the fixed default velocity. Piano, violin, cello, and guitar use the deterministic curve: a base of 70, beat and phrase accents, a small pre-cadence reduction, and a final clamp to 50–110. This is MIDI shaping, not a model of touch, bow pressure, or registration changes.

## Expression Output

Beyond ornaments, the engine writes deterministic MIDI control and tempo events from the selected instrument and form profiles, and all of it is readable from the event data as well as the MIDI file:

- **MIDI level and expression** — organ and harpsichord receive CC 7 arc points and discrete level terraces; piano, violin, and cello receive CC 11 phrase events. These are playback automation events, not physical organ-stop selection, and the harpsichord profile does not use continuous key-touch dynamics. The guitar receives the velocity curve without a continuous-expression profile. All events are reported per track as `control_changes` with duplicates already merged.
- **Tempo map** — a closing ritardando for every form except `trio_sonata`, plus a section tempo change at the fugue entry of `prelude_and_fugue`, `toccata_and_fugue`, and `fantasia_and_fugue`. Reported as `tempos`.
- **Time signature** — 3/4 for passacaglia and chaconne, 4/4 otherwise. Reported as `time_signatures`.

Character shifts the whole controller curve without changing its shape. The offsets are relative to `Severe`:

| Character | Level offset |
|-----------|--------------|
| Noble | +5 |
| Severe | 0 |
| Playful | -7 |
| Restless | +2 |

For organ and harpsichord these offsets shift CC 7 channel-volume levels; for piano, violin, and cello they shift CC 11 expression levels. CC 7 changes MIDI playback level; it does not select organ stops, which depend on the synthesizer's instrument setup.

Because tempo varies within a piece, use the tempo map rather than `bpm` when placing events on the clock — see [Converting Ticks to Seconds](/docs/api-js#converting-ticks-to-seconds).

::: tip
See [Voice Architecture](/docs/voice-architecture) for how voices map to instruments and tracks, and the [Generation Pipeline](/docs/generation-pipeline) for where the ornament and expression passes sit.
:::
