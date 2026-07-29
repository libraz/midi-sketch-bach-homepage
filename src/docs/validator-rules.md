---
title: Validator Rule Reference
description: Complete rule ID reference for the MIDI Sketch Bach validator, with links into the counterpoint course.
---

# Validator Rule Reference

This page is the flat index of all 57 validator rules. Use the [Counterpoint Course](/docs/counterpoint) to learn the musical ideas; use this page when you see a rule ID in an error, log, or event-debugging session and need to jump straight to its explanation.

::: info How to read a rule ID
A rule ID names a specific musical contract that failed in the current validation pass. The same passage may violate several contracts at once. The validator accumulates those failures instead of stopping at the first one, and reports each with the span it blames.
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
| Declaration integrity | Emitted notes match what the form declared | Provenance records and authored spans |

Every failure also carries a `FailKind`: `MusicalFail` (counterpoint/harmony contract, the default), `StructuralFail` (the form's structural promise — immutable carriers and malformed cadence layouts), or `ConfigFail` (invalid request, reported before composition).

::: info Blocking failures vs informational findings
The final-score pass audits the emitted notes, authored material included. When every note involved in a violation is immutable authored material, the finding is recorded as informational evidence instead of blocking the run. If any searched or ornamented note is involved, it stays a blocking failure with an actionable span. The current public generation path aborts on blocking failures; it does not repair the score or retry generation. `getDiagnostic()` reports the blocking failures.
:::

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

## Dissonance treatment

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `strong_beat_dissonance` | [3. Dissonance](/docs/counterpoint/dissonance) | A downbeat note is outside the active triad. |
| `vertical_dissonance` | [3. Dissonance](/docs/counterpoint/dissonance) | Simultaneous voices form an unsupported dissonant interval on a strong beat. |
| `unprepared_dissonance` | [3. Dissonance](/docs/counterpoint/dissonance) | A weak-beat dissonance is not approached and left by step. |
| `suspension_preparation` | [3. Dissonance](/docs/counterpoint/dissonance) | A suspension's preparation is not consonant against the lowest sounding partner. |
| `suspension_preparation_duration` | [3. Dissonance](/docs/counterpoint/dissonance) | The preparation is shorter than the suspension it prepares. |
| `suspension_metrical_accent` | [3. Dissonance](/docs/counterpoint/dissonance) | The suspension does not land on a stronger beat than its preparation. |
| `suspension_resolution_step_down` | [3. Dissonance](/docs/counterpoint/dissonance) | A suspension fails to resolve by step in its prescribed direction (down for 4-3/7-6/9-8, up for 2-3). |
| `suspension_interval` | [3. Dissonance](/docs/counterpoint/dissonance) | The suspension and resolution intervals above the lowest sounding partner do not match the declared type (4-3, 7-6, 9-8, 2-3). |
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
| `imitation_entry_realization` | [6. Fugue](/docs/counterpoint/fugue) | The emitted notes do not actually realize the declared leader/follower entry in the carrier voices. |
| `countersubject_invertible` | [6. Fugue](/docs/counterpoint/fugue) | A countersubject forms a perfect fifth against the subject on a strong beat, so the pair does not invert at the octave. **Informational only** — free-style countersubjects do this legitimately, so it never blocks a run. |
| `middle_entry_in_related_key` | [6. Fugue](/docs/counterpoint/fugue) | A development entry is not in V/vi/IV/ii, or strays from that key's scale. |
| `stretto_overlap_valid` | [6. Fugue](/docs/counterpoint/fugue) | Stretto entries do not overlap, or the follower is not an exact transposition. |
| `pedal_point_tonic_or_dominant` | [6. Fugue](/docs/counterpoint/fugue) | A pedal point sits on a degree other than tonic or dominant. |

## Phrase, texture, and physical bounds

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `phrase_periodicity_4_or_8_bar` | [7. Form](/docs/counterpoint/form-constraints) | Declared phrase starts are not a whole number of bars from 3 through 8 apart. The stable rule ID retains its older 4-or-8 wording. |
| `anacrusis_consistent` | [7. Form](/docs/counterpoint/form-constraints) | Upbeat metadata and phrase-start metadata disagree. |
| `pedal_range_soft_penalty` | [7. Form](/docs/counterpoint/form-constraints) | An organ pedal note leaves the playable compass (MIDI 12–62). |
| `voice_independence_threshold` | [7. Form](/docs/counterpoint/form-constraints) | Trio-sonata voices score below 0.6 pairwise independence. |
| `trio_upper_register_overlap` | [7. Form](/docs/counterpoint/form-constraints) | The two trio-sonata upper voices never share a register, so they read as separate manuals rather than one exchanging pair. |
| `section_contrast_required` | [7. Form](/docs/counterpoint/form-constraints) | Adjacent fantasia sections do not contrast in density or register. |

## Form identity

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `ground_bass_immutable` | [7. Form](/docs/counterpoint/form-constraints) | A chaconne ground bass changed between cycles. **StructuralFail.** |
| `passacaglia_ground_immutable` | [7. Form](/docs/counterpoint/form-constraints) | The passacaglia's 8-bar ground changed between cycles. **StructuralFail.** |
| `cantus_firmus_immutable` | [7. Form](/docs/counterpoint/form-constraints) | A chorale-prelude downbeat does not restate the declared skeleton tone. **StructuralFail.** |
| `goldberg_aria_bass_immutable` | [7. Form](/docs/counterpoint/form-constraints) | A Goldberg variation does not restate the aria bass exactly. **StructuralFail.** |
| `variation_role_ornament_constraint` | [7. Form](/docs/counterpoint/form-constraints) | A ground-role variation subdivides below quarter notes. |
| `figuration_harmonic_consistency` | [7. Form](/docs/counterpoint/form-constraints) | A figuration bar opens on a non-chord tone. |
| `toccata_archetype_compatible` | [7. Form](/docs/counterpoint/form-constraints) | The toccata's sectional archetype conflicts with the declared character. |
| `implicit_voice_counterpoint` | [7. Form](/docs/counterpoint/form-constraints) | A solo-string arpeggio's implied bass/top streams break the melodic rules. |
| `arpeggio_no_parallel_perfect` | [7. Form](/docs/counterpoint/form-constraints) | Implied streams move in parallel perfect intervals across cells. |

## Declaration integrity

These run only in the final-score pass, and check the emitted score against the provenance record rather than against a musical contract. They are all **StructuralFail**: seeing one means the output does not match what the form declared, so no amount of re-composing the notes would fix it.

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `note_provenance_alignment` | -- | The note list and the provenance list have different lengths, so no note can be attributed. |
| `carrier_declaration_integrity` | [7. Form](/docs/counterpoint/form-constraints) | A note claiming an authored carrier does not match that carrier's declared start, duration, or pitch. |
| `ornament_declaration_integrity` | [7. Form](/docs/counterpoint/form-constraints) | The same mismatch for an ornament note against the carrier it decorates. |
| `ornament_group_integrity` | [7. Form](/docs/counterpoint/form-constraints) | An ornament expansion does not cover its authored carrier exactly: a gap, an overlap, or an ending on something other than the main tone. |

## Debugging checklist

1. Identify the rule ID and its `FailKind`.
2. Check whether the offending note is `source: "material"`, `"compose"`, or `"ornament"` in the event JSON.
3. For local rules, inspect the previous and current note pair.
4. For structural rules, inspect the declared form, material span, phrase span, or harmonic plan.
5. If the rule is musical rather than API-level, read the linked course chapter.

::: tip Useful mental model
The form director declares what kind of musical object is being built. By default, material carriers replay every authored span; the scored branch is used only by opt-in free counterpoint. The validator reports every detected breach of the declared musical contract, and the public generation path aborts on blocking failures.
:::
