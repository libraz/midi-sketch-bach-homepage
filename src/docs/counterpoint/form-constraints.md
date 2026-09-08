---
title: "Counterpoint 7: Form-Specific Constraints"
description: Immutable grounds and cantus firmi, figuration harmony, implied voices in solo string writing, phrase grids, and texture contracts.
---

# 7. Form-Specific Constraints

The previous chapters apply to every generated piece. This chapter covers contracts that arise from *what kind of piece* is being built. Historically, passacaglia and chaconne labels can describe an ostinato scheme realized through varied voicings; this engine chooses stricter carrier contracts. A chorale prelude keeps its cantus-firmus skeleton, and a cello prelude uses one instrumental line to imply coherent multi-voice counterpoint. The engine encodes each promise as material carriers plus a validating rule.

## Immutable material: the ground

<CounterpointStaff example="groundBass" locale="en" />

Passacaglia and chaconne are historically related **ostinato forms**: a bass scheme may be transferred, voiced, varied, or ornamented in actual repertoire. This engine deliberately tightens that idea into a carrier contract. `ground_bass_immutable` (the solo-string form inspired by the BWV 1004 Chaconne) and `passacaglia_ground_immutable` (the organ form inspired by BWV 582) compare the replayed ground's **bar-head pitch skeleton** with the canonical material at the same cycle-relative positions. Off-downbeat pitches are not part of this skeleton, and rhythmic subdivision can be admitted; this is not byte-exact replay of every sounding event. The comparison uses **provenance bits**, the origin tags carried beside each note. The `provenance.v1` sidecar serializes them as `source: "Material" | "Compose" | "Ornament"`; `generated.v1` note records omit provenance/source, while observations and other validation metadata are exported separately. These violations are `StructuralFail`s because they break the engine's declared carrier identity.

::: info BWV numbers
**BWV** (Bach-Werke-Verzeichnis) is the standard catalogue of Bach's works — BWV 582 is the C minor Passacaglia for organ, BWV 1004 the violin partita whose final movement is the Chaconne. When a rule says it is "inspired by" a BWV number, the engine's form template borrows selected proportions or surface material; it does not claim to reproduce the work's historical instrumentation or every sounding event.
:::

A related rule keeps the *variation layer* honest: `variation_role_ornament_constraint` prevents a variation span that plays the ground role from subdividing below quarter notes — the ground must stay recognizable as a slow line even when restated by another voice.

The Goldberg Variations preserve the Aria's underlying bass and harmonic scheme, while their written bass events can vary in pitch placement and duration. The engine represents that distinction with a dedicated `goldberg_aria_bass_immutable` declaration for each non-coda variation block. Switch the excerpt above the score to hear two variations walk the same scheme:

<CounterpointStaff example="bachGroundBass" locale="en" />

The Bach excerpt below shows a return to the passacaglia bass after a variation cycle; it illustrates scheme-level continuity alongside the engine's stricter bar-head carrier check.

<CounterpointStaff example="bachPassacagliaReturn" locale="en" />

## Immutable material: the cantus firmus

<CounterpointStaff example="cantusFirmus" locale="en" />

The chorale prelude carries a hymn tune (**cantus firmus**) in long notes while another voice embroiders. `cantus_firmus_immutable` checks each bar's [downbeat](/docs/music-primer#strong-and-weak-beats) against the declared skeleton tone — bar-head pitches are fixed, while eligible within-bar notes may be embellished. The ornament pass therefore keeps cantus bar heads plain; under the `Severe` character the whole cantus line stays plain, while other characters can decorate eligible within-bar tones.

That is precisely the Orgelbüchlein's plan. In "Ich ruf zu dir" the tune floats untouched above a sixteenth-note inner voice and a murmuring pedal:

<CounterpointStaff example="bachCantusFirmus" locale="en" />

## Figuration harmony

The free-prelude style (think BWV 543's opening) runs continuous figuration over a slow **harmonic rhythm** — the rate at which the underlying chords change, here typically one chord per bar. `figuration_harmonic_consistency` anchors it: the note that opens each bar must be a tone of that bar's chord, including a declared seventh. Off-downbeat notes are unconstrained — that freedom is what makes it figuration and not chorale writing. Pedal notes are exempt, as are `FigurationAnchorRelaxed` notes when the builder has proved that no playable chord tone satisfied the full set of constraints.

<CounterpointStaff example="figurationHarmony" locale="en" />

The purest illustration in the repertoire opens WTC I — two bars of the C major prelude, where a single line of sixteenths over two held notes spells out one chord per bar:

<CounterpointStaff example="bachFiguration" locale="en" />

## Solo strings: counterpoint inside one line

A solo cello or violin can sound a four-note chord, but it cannot sustain four independent lines at once; Bach's solo writing nevertheless makes the ear *hear* several. The cello prelude is the engine's only single-voice form, and these rules are how one voice still gets counterpoint validation.

The reconstruction is three concrete steps. The engine collects the arpeggio line's notes in onset order, partitions them into contiguous **cells** of the declared `group_size`, then takes each cell's *lowest* pitch as the implied bass stream and its *highest* as the implied top stream. Register decides, not slot position — in the BWV 1007 figuration the perceived melody note sits in the *middle* of the written cell, and the min/max extraction still finds it:

<CounterpointStaff example="impliedStreams" locale="en" />

And here is the original behind that figure — the opening of the first cello suite, with the extraction the engine computes written out underneath:

<CounterpointStaff example="bachImpliedVoices" locale="en" />

The extracted streams are then held to the same standards as real voices. The two reductions below show the streams alone — first failing, then passing:

<CounterpointStaff example="arpeggioParallel" locale="en" />

<CounterpointStaff example="arpeggioContrary" locale="en" />

| Rule | Contract |
|------|----------|
| `implicit_voice_counterpoint` | Between consecutive cells, the implied bass and top streams obey the melodic-leap rules from chapter 4 — the same forbidden-leap predicate used for scored Compose notes. |
| `arpeggio_no_parallel_perfect` | Consecutive cells must not frame the same perfect interval (fifth or octave) with both streams moving in the same direction. Oblique, contrary, and static motion are permitted — exactly the escape hatches real voices get in chapter 2. |

The physical side of solo-string writing — each instrument's playable range — lives in [Instruments](/docs/physical-models).

## Phrase architecture

Two rules keep generated music on the Baroque bar grid. An **anacrusis** (upbeat) is the short lead-in that sounds *before* a downbeat — the "and-a" pickup before bar 1:

<CounterpointStaff example="anacrusisUpbeat" locale="en" />

Bach's dance movements live on this gesture — the Courante of the first cello suite spends one eighth note getting airborne:

<CounterpointStaff example="bachAnacrusis" locale="en" />

| Rule | Contract |
|------|----------|
| `phrase_periodicity_4_or_8_bar` | Consecutive declared phrase starts are 3 through 8 whole bars apart. The stable rule ID keeps its older, narrower name, but every integer bar gap in that inclusive range passes. |
| `anacrusis_consistent` | If the piece declares an upbeat (anacrusis), every upbeat fragment begins exactly that distance before a phrase start; if not declared, no stray upbeat material exists. |

## Texture and instrument contracts

The trio sonata's independence contract is the one texture rule whose *target* can be drawn on staves. The violation itself is a property of whole sections, but this — three voices on three rhythmic grids — is the texture the engine scores toward:

<CounterpointStaff example="trioIndependence" locale="en" />

The organ trio sonatas are this rule pursued for six works straight. Three bars in, the first of them already shows the full texture:

<CounterpointStaff example="bachTrio" locale="en" />

| Rule | Form | Contract |
|------|------|----------|
| `pedal_range_soft_penalty` | organ forms | Pedal notes stay inside the physically playable compass (hard bounds MIDI 12–62; the comfortable C1–D3 target is preferred at scoring time). |
| `voice_independence_threshold` | trio sonata | The two manual voices plus pedal stay pairwise independent (score ≥ 0.6), measured by rhythmic offset and contrary/oblique motion at note boundaries. A trio sonata whose voices shadow each other has failed at its one job. |
| `section_contrast_required` | fantasia | Adjacent sections differ audibly in density (≥2 notes/bar) or register (≥5 semitones mean pitch) — the fantasia's defining drama of contrasts. |
| `toccata_archetype_compatible` | toccata | The selected sectional archetype fits the declared character (the `noble` character is rejected for toccata forms at config time; incompatible archetype pairings fail here). |

The remaining structural rules have no single staff moment to point at — the violation is a property of whole sections — so they are documented as tables rather than examples. When one fires, inspect the section layout in the event JSON rather than individual notes.

A declared doubling is checked before any exemption is applied. It must name two distinct voices and a valid, nonempty half-open `[start_tick, end_tick)` window containing at least one lead note. Inside that window, the doubled voice must have the same note count, onsets, and durations as the lead voice, with every pitch offset by the declared `semitones`. A mismatch emits `declared_doubling_integrity` as a **StructuralFail**. A verified window treats only two-voice vertical findings inside it as one line; linear checks and vertical findings outside the window still apply.

## How the validator sees this chapter

| Rule | FailKind |
|------|----------|
| `declared_doubling_integrity` | **StructuralFail** |
| `ground_bass_immutable`, `passacaglia_ground_immutable`, `goldberg_aria_bass_immutable`, `cantus_firmus_immutable` | **StructuralFail** |
| `variation_role_ornament_constraint`, `figuration_harmonic_consistency`, `toccata_archetype_compatible` | MusicalFail |
| `implicit_voice_counterpoint`, `arpeggio_no_parallel_perfect` | MusicalFail |
| `phrase_periodicity_4_or_8_bar`, `anacrusis_consistent` | MusicalFail |
| `pedal_range_soft_penalty`, `voice_independence_threshold`, `section_contrast_required` | MusicalFail |

This concludes the course. For the flat rule index, see the [Validator Rule Reference](/docs/validator-rules); for how these rules interact with the generation pipeline, see [Generation Pipeline](/docs/generation-pipeline).
