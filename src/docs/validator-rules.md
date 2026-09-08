---
title: Validator Rule Reference
description: Complete rule ID reference for the MIDI Sketch Bach validator, with links into the counterpoint course.
---

# Validator Rule Reference

This page is the flat index of all 60 validator rules. Use the [Counterpoint Course](/docs/counterpoint) to learn the musical ideas; use this page when you see a rule ID in an error, log, or event-debugging session and need to jump straight to its explanation.

::: info How to read a rule ID
A rule ID names a specific musical contract that failed in the current validation pass. The same passage may violate several contracts at once. The validator accumulates those failures instead of stopping at the first one, and reports each with the span it blames.
:::

## Rule layers

The validator protects different layers of the composition. A local note rule and a form identity rule are both failures, but they need different context to understand.

![Nine rule layers ordered by how much of the score a rule in that layer has to see, and the three FailKind values](/images/validator-layers.svg)

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
The final-score pass audits the emitted notes, authored material included. For findings handled by the counterpoint observation recorder, a final-score finding is informational when every operand has valid authored context: a `Compose` note counts as composer-authored, a `Material` note must still match its declaration, and an `Ornament` note must remain inside its declared carrier with its realization marker. Otherwise that recorder routes the finding to the blocking-failure list with an actionable span. During generation, the recorder counts a finding as `exempted` when every operand is an immutable `Material` or `Ornament` source; otherwise it gates the finding (a `Compose` operand therefore makes it gated). Direct checks such as voice crossing, suspension validation, cadence validation, and declaration-integrity validation append failures themselves and remain blocking regardless of authored context. A per-form budget then promotes any matched vertical rule that is closed for that form to one blocking `MusicalFail` with a null span. The current public generation path aborts on blocking failures; it does not repair the score or retry generation. `getDiagnostic()` reports the blocking failures, not informational findings.
:::

## Geometry, routing, and form budgets

The generated score records counterpoint matches before routing them to failures or informational evidence. `geometry` is `linear` for a succession inside one voice and `vertical` for a relation between sounding voices or between a voice and the harmonic plan. `unclassified` is reserved for a rule ID that has no geometry-table entry. `total` counts matches before routing; `gated` counts findings sent to the blocking-failure list; `exempted` counts generation-pass findings suppressed because every operand is an immutable `Material` or `Ornament` source. For findings handled by this recorder, a final-score finding whose authored context is valid is informational, so `total - gated - exempted` is the number represented as informational evidence. Standalone informational rules can have no observation tally.

Only vertical rules participate in the form budget. An entry in the budget table is still open for that form: the match remains measured in `counterpoint_observations` and does not itself stop generation. Source rows marked `Unresolved` record outstanding repair work; rows marked `Accepted` record a measured tradeoff or a form constraint. Both are open rows, and the gate uses row presence rather than the reason. A vertical rule absent from the form's table is closed; any positive observation total appends one blocking `MusicalFail` with `span_id: null`. Linear rules are outside this budget and are routed by the normal material or authored-context rules above. The [source budget table](https://github.com/libraz/midi-sketch-bach/blob/973659e705915c2178d72663d5a65ab95d3cae4b/src/composer/counterpoint_budget.cpp) is authoritative and defines the open `(form, rule_id)` pairs for all ten forms.

The budget table is a measured compatibility surface, not a claim that an open rule is musically desirable. Removing an entry closes that rule for the form; adding an entry reopens it.

## Voice motion and independence

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `parallel_fifth` | [2. Motion](/docs/counterpoint/motion) | Both voices move in the same direction, and both the previous and current vertical intervals reduce to perfect fifths. |
| `parallel_octave` | [2. Motion](/docs/counterpoint/motion) | Both voices move in the same direction, and both the previous and current intervals reduce to a unison or octave. |
| `anti_parallel_perfect` | [2. Motion](/docs/counterpoint/motion) | Contrary motion leaves and enters the same perfect interval class: a perfect fifth or a unison/octave. |
| `battuta` | [2. Motion](/docs/counterpoint/motion) | Contrary motion arrives at a new unison/octave, with the upper line at the arrival leaping down by more than a whole tone. |
| `hidden_parallel_fifth` | [2. Motion](/docs/counterpoint/motion) | Same-direction motion enters a perfect fifth from a different previous interval, and the conventionally upper line leaps more than a whole tone (>2 semitones). |
| `hidden_parallel_octave` | [2. Motion](/docs/counterpoint/motion) | The same hidden-perfect test enters a unison/octave. It is checked at shared sounding ticks, not only in an upper pair or on a strong beat. |
| `voice_crossing` | [2. Motion](/docs/counterpoint/motion) | The conventionally upper, lower-indexed voice sounds below the higher-indexed lower voice. Trio Sonata may allow a momentary exchange between its two upper voices, but sustained crossing still fails and their overall registers must overlap. |
| `spacing_adjacent_voices_within_octave` | [2. Motion](/docs/counterpoint/motion) | Adjacent upper voices are spaced more than an octave apart in a 3+ voice texture. |
| `invertible_at_octave` | [2. Motion](/docs/counterpoint/motion) | An adjacent upper-voice pair creates parallel octaves on a structural accent, which would invert to parallel unisons; the bottom pair is excluded. |

When the current lower-part note in a sounding pair carries the `CadenceCellCommitted` provenance bit, the validator skips `parallel_fifth`, `parallel_octave`, `hidden_parallel_fifth`, `hidden_parallel_octave`, `anti_parallel_perfect`, and `battuta` for that tick. This cadence-cell exemption does not blanket-exempt voice crossing, spacing, or other checks.

## Dissonance treatment

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `strong_beat_dissonance` | [3. Dissonance](/docs/counterpoint/dissonance) | A note on a structural accent is outside the active chord tones. A declared chordal seventh counts as a chord tone. |
| `vertical_dissonance` | [3. Dissonance](/docs/counterpoint/dissonance) | Simultaneous voices form an unsupported dissonant interval on a strong beat. |
| `unprepared_dissonance` | [3. Dissonance](/docs/counterpoint/dissonance) | A non-triad tone on a weak beat is not approached and left by step (at most two semitones). |
| `suspension_preparation` | [3. Dissonance](/docs/counterpoint/dissonance) | A suspension's preparation is not consonant against the lowest sounding partner. |
| `suspension_preparation_duration` | [3. Dissonance](/docs/counterpoint/dissonance) | The preparation is shorter than the suspension it prepares. |
| `suspension_metrical_accent` | [3. Dissonance](/docs/counterpoint/dissonance) | The suspension does not land on a stronger beat than its preparation. |
| `suspension_resolution_step_down` | [3. Dissonance](/docs/counterpoint/dissonance) | A suspension fails to resolve by step in its prescribed direction (down for 4-3/7-6/9-8; the engine's `Sus2_3` is upward). Historical lower-voice 2-3 suspensions are commonly described with downward resolution; see [Open Music Theory](https://viva.pressbooks.pub/openmusictheorycopy/chapter/fourth-species-counterpoint/). |
| `suspension_interval` | [3. Dissonance](/docs/counterpoint/dissonance) | The intervals between the suspended voice and the lowest sounding other voice do not match the declared type (4-3, 7-6, 9-8, 2-3); for 2-3, the suspended voice is the bass and the interval is measured upward from it. |
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
| `cadence_voice_leading` | [5. Tonality](/docs/counterpoint/tonality) | The cadential voices do not match the declared cadence type (perfect, imperfect authentic, plagal, half, deceptive, Phrygian, Picardy). **StructuralFail** only when no voice reaches the cadence or the cadence is declared before the first beat; a one-voice form is checked as a melodic cadence. The voice-leading mismatch itself is MusicalFail. |
| `doubling_no_leading_tone` | [5. Tonality](/docs/counterpoint/tonality) | The leading tone is doubled in a chord that contains it. |
| `doubling_no_seventh` | [5. Tonality](/docs/counterpoint/tonality) | A chordal seventh is doubled. |
| `cross_relation` | [5. Tonality](/docs/counterpoint/tonality) | Voices sound the same scale degree in the local key at the later onset with different inflections, either simultaneously or at adjacent note onsets with no intervening onset in either voice. Natural semitone pairs between different degrees are excluded. |
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
| `ground_bass_immutable` | [7. Form](/docs/counterpoint/form-constraints) | A chaconne replay changes the canonical ground's bar-head pitch skeleton at the same cycle-relative position. Offbeat subdivisions are not compared. **StructuralFail.** |
| `passacaglia_ground_immutable` | [7. Form](/docs/counterpoint/form-constraints) | A passacaglia replay changes the 8-bar ground's bar-head pitch skeleton at the same cycle-relative position. Offbeat subdivisions are not compared. **StructuralFail.** |
| `cantus_firmus_immutable` | [7. Form](/docs/counterpoint/form-constraints) | A chorale-prelude downbeat does not restate the declared skeleton tone. **StructuralFail.** |
| `goldberg_aria_bass_immutable` | [7. Form](/docs/counterpoint/form-constraints) | A Goldberg variation block does not replay every declared aria-bass onset with the same cycle-relative onset, duration, and pitch. A terminal `CodaCarrier` tonic cadence may replace the final block window. **StructuralFail.** |
| `variation_role_ornament_constraint` | [7. Form](/docs/counterpoint/form-constraints) | A ground-role variation subdivides below quarter notes. |
| `figuration_harmonic_consistency` | [7. Form](/docs/counterpoint/form-constraints) | A figuration bar opens on a non-chord tone. |
| `toccata_archetype_compatible` | [7. Form](/docs/counterpoint/form-constraints) | The toccata's sectional archetype conflicts with the declared character. |
| `implicit_voice_counterpoint` | [7. Form](/docs/counterpoint/form-constraints) | A solo-string arpeggio's implied bass/top streams break the melodic rules. |
| `arpeggio_no_parallel_perfect` | [7. Form](/docs/counterpoint/form-constraints) | Implied streams move in parallel perfect intervals across cells. |

## Declaration integrity

These checks use the emitted score and its declarations rather than a musical contract. The provenance checks run only in the final-score pass; `declared_doubling_integrity` also validates a declared doubling before the validator honors it. They are all **StructuralFail**: seeing one means the output does not match a declaration, so inspect the declaration and emitted notes before retrying.

| Rule ID | Course chapter | How to read it |
|---------|----------------|----------------|
| `note_provenance_alignment` | -- | The note list and the provenance list have different lengths, so no note can be attributed. |
| `carrier_declaration_integrity` | [7. Form](/docs/counterpoint/form-constraints) | A note claiming an authored carrier does not match that carrier's declared start, duration, or pitch. |
| `ornament_declaration_integrity` | [7. Form](/docs/counterpoint/form-constraints) | The same mismatch for an ornament note against the carrier it decorates. |
| `ornament_group_integrity` | [7. Form](/docs/counterpoint/form-constraints) | An ornament expansion does not cover its authored carrier exactly: a gap, an overlap, or an ending on something other than the main tone. |
| `declared_doubling_integrity` | [7. Form](/docs/counterpoint/form-constraints) | A declared doubling must name two distinct voices and a valid, nonempty half-open window containing a lead note; inside it, the emitted note count, onsets, durations, and pitch transposition must match. **StructuralFail.** |

## Debugging checklist

1. Identify the rule ID and its `FailKind`.
2. Check whether the offending note is `source: "material"`, `"compose"`, or `"ornament"` in the event JSON.
3. For local rules, inspect the previous and current note pair.
4. For structural rules, inspect the declared form, material span, phrase span, or harmonic plan.
5. If the rule is musical rather than API-level, read the linked course chapter.

::: tip Useful mental model
The form director declares what kind of musical object is being built. By default, material carriers replay every authored span; the scored branch is used only by opt-in free counterpoint. The validator reports every detected breach of the declared musical contract, and the public generation path aborts on blocking failures.
:::
