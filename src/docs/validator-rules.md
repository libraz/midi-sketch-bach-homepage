---
title: Validator Rule Reference
description: Complete rule ID reference for the MIDI Sketch Bach validator, with links into the counterpoint course.
---

# Validator Rule Reference

This page is the flat index of all 47 validator rules. Use the [Counterpoint Course](/docs/counterpoint) to learn the musical ideas; use this page when you see a rule ID in an error, log, or event-debugging session and need to jump straight to its explanation.

::: info How to read a rule ID
A rule ID names a specific musical contract that failed in the current validation pass. The same bad musical passage may violate several contracts at once; each violation is reported with the span it blames, so start from the first failure in the report.
:::

## Rule layers

The validator protects different layers of the composition. A local note rule and a form identity rule are both failures, but they need different context to understand.

| Layer | What it protects | Typical context needed |
|-------|------------------|------------------------|
| Local vertical sound | Stable intervals and chord membership | Two voices at one beat |
| Melodic plausibility | Natural movement inside one voice | Previous and current notes in one voice |
| Voice independence | Separate readable lines | Two voices across two time points |
| Tonal syntax | Cadences, applied dominants, modulation | Harmonic plan and phrase position |
| Fugal structure | Subject, answer, countersubject, imitation | Declared material and entry spans |
| Phrase structure | Bar-grid consistency | Phrase metadata and meter |
| Form identity | Fixed grounds, cantus firmus, figuration roles | Material carriers and form layout |
| Physical bounds | Playable range and instrument compass | Voice range, pedal range, instrument profile |

Every failure also carries a `FailKind`: `MusicalFail` (counterpoint/harmony contract, the default), `StructuralFail` (the form's structural promise — immutable carriers and malformed cadence layouts), or `ConfigFail` (invalid request, reported before composition).

## Voice motion and independence

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `parallel_fifth` | [2. Motion](/docs/counterpoint/motion) | Two voices both move, and the previous and current vertical intervals are perfect fifths. |
| `parallel_octave` | [2. Motion](/docs/counterpoint/motion) | Two voices both move, and the previous and current intervals are unisons or octaves. |
| `hidden_parallel_fifth` | [2. Motion](/docs/counterpoint/motion) | Similar motion lands on a perfect fifth from a non-fifth interval. |
| `hidden_parallel_octave` | [2. Motion](/docs/counterpoint/motion) | Similar motion lands on an octave in an upper-voice pair on a strong beat. |
| `voice_crossing` | [2. Motion](/docs/counterpoint/motion) | A lower voice moves above a higher voice (voice order is part of the texture contract). |
| `spacing_adjacent_voices_within_octave` | [2. Motion](/docs/counterpoint/motion) | Adjacent upper voices are spaced more than an octave apart in a 3+ voice texture. |
| `invertible_at_octave` | [2. Motion](/docs/counterpoint/motion) | An upper-voice pair creates strong-beat parallel octaves, which would invert to parallel unisons. |
| `fourth_only_on_weak_beat` | [2. Motion](/docs/counterpoint/motion) | A perfect fourth appears as a strong-beat pillar in an upper-voice pair. |

## Dissonance treatment

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `strong_beat_dissonance` | [3. Dissonance](/docs/counterpoint/dissonance) | A downbeat note is outside the active triad. |
| `vertical_dissonance` | [3. Dissonance](/docs/counterpoint/dissonance) | Simultaneous voices form an unsupported dissonant interval on a strong beat. |
| `unprepared_dissonance` | [3. Dissonance](/docs/counterpoint/dissonance) | A weak-beat dissonance is not approached and left by step. |
| `suspension_preparation` | [3. Dissonance](/docs/counterpoint/dissonance) | A suspension's preparation is not consonant, or does not tie into the suspension. |
| `suspension_resolution_step_down` | [3. Dissonance](/docs/counterpoint/dissonance) | A suspension fails to resolve by step in its prescribed direction (down for 4-3/7-6/9-8, up for 2-3). |
| `suspension_seventh_sixth` | [3. Dissonance](/docs/counterpoint/dissonance) | A declared 7-6 suspension does not form a genuine seventh resolving to a genuine sixth over the bass. |

## Melodic rules

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `augmented_melodic` | [4. Melody](/docs/counterpoint/melody) | A voice moves by an augmented melodic interval (exempt in secondary-dominant regions). |
| `diminished_melodic` | [4. Melody](/docs/counterpoint/melody) | A voice moves by a diminished melodic interval (same exemption). |
| `tritone_melodic` | [4. Melody](/docs/counterpoint/melody) | A voice leaps a tritone (same exemption). |
| `consecutive_leaps` | [4. Melody](/docs/counterpoint/melody) | Two consecutive large leaps (a fifth or more each, in any direction). |
| `leading_tone_resolution` | [4. Melody](/docs/counterpoint/melody) | A marked leading tone does not step up to the tonic. |
| `voice_range_integrity` | [4. Melody](/docs/counterpoint/melody) | A note falls outside its voice's declared MIDI range. |

## Tonal syntax

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `cadence_voice_leading` | [5. Tonality](/docs/counterpoint/tonality) | The outer voices do not match the declared cadence type (perfect, imperfect authentic, plagal, half, deceptive, Phrygian, Picardy). **StructuralFail** when the cadence layout is malformed (fewer than two voices, no distinct bass); the voice-leading mismatch itself is MusicalFail. |
| `doubling_no_leading_tone` | [5. Tonality](/docs/counterpoint/tonality) | The leading tone is doubled in a chord that contains it. |
| `doubling_no_seventh` | [5. Tonality](/docs/counterpoint/tonality) | A chordal seventh is doubled. |
| `cross_relation` | [5. Tonality](/docs/counterpoint/tonality) | Voices contradict the same scale degree chromatically within a beat window. |
| `secondary_dominant_resolution` | [5. Tonality](/docs/counterpoint/tonality) | An applied dominant is not followed by its target degree. |
| `modulation_pivot_chord_required` | [5. Tonality](/docs/counterpoint/tonality) | A pivot modulation's pivot chord is not diatonic in both keys. |

## Fugal structure

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `tonal_answer_dominant_mapping` | [6. Fugue](/docs/counterpoint/fugue) | A tonal answer's head does not map the subject's opening pitch class I↔V. |
| `countersubject_continuous` | [6. Fugue](/docs/counterpoint/fugue) | The countersubject falls silent during the answer's window. |
| `episode_motif_derived` | [6. Fugue](/docs/counterpoint/fugue) | Episode notes do not equal the declared motif transform of the declared source slice. |
| `sequence_pattern_consistency` | [6. Fugue](/docs/counterpoint/fugue) | A sequence step is not an exact transposition of the seed by the declared offset. |
| `imitation_entry_match` | [6. Fugue](/docs/counterpoint/fugue) | A follower entry misses the declared time distance or interval from the leader. |
| `middle_entry_in_related_key` | [6. Fugue](/docs/counterpoint/fugue) | A development entry is not in V/vi/IV/ii, or strays from that key's scale. |
| `stretto_overlap_valid` | [6. Fugue](/docs/counterpoint/fugue) | Stretto entries do not overlap, or the follower is not an exact transposition. |
| `pedal_point_tonic_or_dominant` | [6. Fugue](/docs/counterpoint/fugue) | A pedal point sits on a degree other than tonic or dominant. |

## Phrase, texture, and physical bounds

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `phrase_periodicity_4_or_8_bar` | [7. Form](/docs/counterpoint/form-constraints) | Declared phrase starts are not 4 or 8 bars apart. |
| `anacrusis_consistent` | [7. Form](/docs/counterpoint/form-constraints) | Upbeat metadata and phrase-start metadata disagree. |
| `pedal_range_soft_penalty` | [7. Form](/docs/counterpoint/form-constraints) | An organ pedal note leaves the playable compass (MIDI 12–62). |
| `voice_independence_threshold` | [7. Form](/docs/counterpoint/form-constraints) | Trio-sonata voices score below 0.6 pairwise independence. |
| `section_contrast_required` | [7. Form](/docs/counterpoint/form-constraints) | Adjacent fantasia sections do not contrast in density or register. |

## Form identity

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `ground_bass_immutable` | [7. Form](/docs/counterpoint/form-constraints) | A chaconne ground bass changed between cycles. **StructuralFail.** |
| `passacaglia_ground_immutable` | [7. Form](/docs/counterpoint/form-constraints) | The passacaglia's 8-bar ground changed between cycles. **StructuralFail.** |
| `cantus_firmus_immutable` | [7. Form](/docs/counterpoint/form-constraints) | A chorale-prelude downbeat does not restate the declared skeleton tone. **StructuralFail.** |
| `variation_role_ornament_constraint` | [7. Form](/docs/counterpoint/form-constraints) | A ground-role variation subdivides below quarter notes. |
| `figuration_harmonic_consistency` | [7. Form](/docs/counterpoint/form-constraints) | A figuration bar opens on a non-chord tone. |
| `toccata_archetype_compatible` | [7. Form](/docs/counterpoint/form-constraints) | The toccata's sectional archetype conflicts with the declared character. |
| `implicit_voice_counterpoint` | [7. Form](/docs/counterpoint/form-constraints) | A solo-string arpeggio's implied bass/top streams break the melodic rules. |
| `arpeggio_no_parallel_perfect` | [7. Form](/docs/counterpoint/form-constraints) | Implied streams move in parallel perfect intervals across cells. |

## Debugging checklist

1. Identify the rule ID and its `FailKind`.
2. Check whether the offending note is `source: "material"`, `"compose"`, or `"ornament"` in the event JSON.
3. For local rules, inspect the previous and current note pair.
4. For structural rules, inspect the declared form, material span, phrase span, or harmonic plan.
5. If the rule is musical rather than API-level, read the linked course chapter.

::: tip Useful mental model
The form director declares what kind of musical object is being built. Candidate search fills editable spans. Material carriers replay fixed spans. The validator rejects results that break the declared musical contract.
:::
