---
title: Counterpoint Course
description: A staff-notation course on the Baroque counterpoint rules enforced by the MIDI Sketch Bach validator.
---

# Counterpoint Course

MIDI Sketch Bach does not treat counterpoint as decorative theory text. The composer builds material, searches for playable candidate notes, then validates the result against explicit musical constraints — 47 named rules in the current validator. This course teaches those constraints the way the engine sees them: as small, checkable contracts, each shown on staff notation you can also listen to.

::: tip Start here if the words are new
The course defines each rule locally, but it assumes the basic nouns **voice**, **bar**, **chord**, **interval**, **fifth**, **cadence**, and **strong beat**. The short foundation — including how to read the staff figures and why beat 1 of a bar is special — is [Music Primer for Engineers](/docs/music-primer).
:::

## Why a course, not a rule list

A rule ID such as `parallel_fifth` is the *end* of a chain of musical reasoning. Reading the chain backwards — "this is forbidden because the voices fuse, and voices fusing matters because counterpoint is the art of simultaneous independent lines" — is what makes a validation report readable instead of arbitrary. The course walks that chain forward:

| Chapter | What you learn | Rules covered |
|---------|----------------|---------------|
| [1. Intervals & Consonance](/docs/counterpoint/intervals) | How two simultaneous notes are classified: perfect, imperfect, dissonant, and the ambivalent fourth | foundation for all vertical rules |
| [2. Motion & Forbidden Parallels](/docs/counterpoint/motion) | The four types of relative motion; why parallel and hidden perfects are banned; crossing, spacing, invertible counterpoint | `parallel_fifth`, `parallel_octave`, `hidden_parallel_fifth`, `hidden_parallel_octave`, `voice_crossing`, `spacing_adjacent_voices_within_octave`, `invertible_at_octave`, `fourth_only_on_weak_beat` |
| [3. Dissonance Treatment](/docs/counterpoint/dissonance) | Strong beats demand chord tones; weak beats tolerate passing and neighbor tones; the four suspension figures | `strong_beat_dissonance`, `vertical_dissonance`, `unprepared_dissonance`, `suspension_preparation`, `suspension_resolution_step_down`, `suspension_seventh_sixth` |
| [4. Melodic Writing](/docs/counterpoint/melody) | Each voice judged as a line: forbidden leaps, leap recovery, the leading tone's obligation | `augmented_melodic`, `diminished_melodic`, `tritone_melodic`, `consecutive_leaps`, `leading_tone_resolution`, `voice_range_integrity` |
| [5. Tonal Grammar](/docs/counterpoint/tonality) | The seven cadence types, tendency-tone doubling, cross relations, applied dominants, pivot modulation | `cadence_voice_leading`, `doubling_no_leading_tone`, `doubling_no_seventh`, `cross_relation`, `secondary_dominant_resolution`, `modulation_pivot_chord_required` |
| [6. Fugal Devices](/docs/counterpoint/fugue) | Subject and answer, countersubject, episodes and sequences, imitation, stretto, pedal points | `tonal_answer_dominant_mapping`, `countersubject_continuous`, `episode_motif_derived`, `sequence_pattern_consistency`, `imitation_entry_match`, `middle_entry_in_related_key`, `stretto_overlap_valid`, `pedal_point_tonic_or_dominant` |
| [7. Form-Specific Constraints](/docs/counterpoint/form-constraints) | Immutable grounds and cantus firmi, figuration harmony, implied voices in solo strings, phrase grids, texture rules | `ground_bass_immutable`, `passacaglia_ground_immutable`, `cantus_firmus_immutable`, `variation_role_ornament_constraint`, `figuration_harmonic_consistency`, `toccata_archetype_compatible`, `implicit_voice_counterpoint`, `arpeggio_no_parallel_perfect`, `phrase_periodicity_4_or_8_bar`, `anacrusis_consistent`, `pedal_range_soft_penalty`, `voice_independence_threshold`, `section_contrast_required` |

For the flat, debugging-oriented index of every rule ID, see the [Validator Rule Reference](/docs/validator-rules).

## Reading the examples

Every chapter teaches with staff examples rendered by the same component. They use two staves even when the real engine generates more voices: like a unit test, each example isolates one rule in the smallest musical situation that triggers (or legally avoids) it.

<CounterpointStaff example="parallelFifths" locale="en" />

::: info If you do not read notation yet
Read the staff examples as diagrams. A **voice** is one independent line, like one stream in a concurrent program. The upper staff is the higher line; the lower staff is the lower line. Colored labels, rings, boxes, and arrows show the exact place the validator is explaining; they are analysis overlays, not extra musical notes.
:::

How to inspect an example:

1. Read the **title** and the **rule chips** (the red monospace tags are validator rule IDs).
2. Press the **play button** in the header to hear it — the sounding notes light up on the staff as it plays, so the eye and the ear stay synchronized. Forbidden patterns are usually audible: parallel octaves really do sound like one voice.
3. Find the colored overlay. Red marks a violation, amber marks a scoped or conditionally allowed sonority, green marks the correct resolution.
4. For motion rules, compare the previous note pair with the current note pair. For dissonance rules, ask whether the marked note belongs to the chord and whether it resolves by step.

## How the engine applies these rules

The public generation path is `bach_generate_from_json`: parse config, resolve the form and bar count, build a form fixture, run the composer, validate it, optionally apply ornaments (never on immutable ground or cantus-firmus voices), assign instruments, then export MIDI and event JSON. Counterpoint validation lives in `../midi-sketch-bach/src/composer/validator.cpp`; material declarations live in `material.h`.

The validator separates local sonority from source ownership:

| Term | Meaning in the engine |
|------|-----------------------|
| Compose note | A note chosen by candidate search and therefore fixable by the composer. |
| Material note | A predeclared subject, answer, ground bass, cantus firmus, variation, or other carrier payload. |
| Immutable carrier | Ground bass, passacaglia ground, or cantus firmus. These voices are exempt from the ornament pass so the structural line stays recognizable. |
| Strong beat | The downbeat of a bar — literally `start_tick % ticks_per_bar == 0`. The engine checks chord membership more strictly here ([primer](/docs/music-primer#strong-and-weak-beats)). |
| Weak beat | A non-downbeat position where prepared non-chord tones can function as passing or ornamental tones. |

Several checks are skipped when **both** notes of a pair are immutable material, because the composer cannot rewrite fixed inputs. If either side is a generated Compose note, the problem is considered fixable and the rule fires, blaming the Compose side.

## Failure kinds

Every reported failure carries a `FailKind` that tells you which layer broke:

| Kind | Meaning | Rules that use it |
|------|---------|-------------------|
| `MusicalFail` | A counterpoint or harmony contract was violated. The default for almost all rules. | parallels, dissonance, melodic, doubling, fugal, phrase, and texture rules |
| `StructuralFail` | The form's structural promise was broken. | `ground_bass_immutable`, `passacaglia_ground_immutable`, `cantus_firmus_immutable`; also `cadence_voice_leading` when the cadence layout itself is malformed |
| `ConfigFail` | The request itself was invalid (reported before composition). | configuration validation, not counterpoint rules |

::: tip Practical mental model
The form director declares what kind of musical object is being built. Candidate search fills editable spans. Material carriers replay fixed spans. The validator rejects results that break the declared musical contract.
:::

Continue with [Chapter 1 — Intervals & Consonance](/docs/counterpoint/intervals).
