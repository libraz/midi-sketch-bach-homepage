---
title: "Counterpoint 7: Form-Specific Constraints"
description: Immutable grounds and cantus firmi, figuration harmony, implied voices in solo string writing, phrase grids, and texture contracts.
---

# 7. Form-Specific Constraints

The previous chapters apply to every generated piece. This chapter covers the contracts that exist because of *what kind of piece* is being built: a passacaglia promises its ground will never change; a chorale prelude promises the hymn tune survives its decoration; a cello prelude promises that a single instrumental line implies coherent multi-voice counterpoint. The engine encodes each promise as material carriers plus a validating rule.

## Immutable material: the ground

<CounterpointStaff example="groundBass" locale="en" />

Passacaglia and chaconne are **ground-bass forms**: a short bass theme repeats unchanged for the entire piece while the upper texture varies cycle by cycle. Two rules — `ground_bass_immutable` (chaconne, modeled on the BWV 1004 Chaconne) and `passacaglia_ground_immutable` (the organ passacaglia's 8-bar ground, modeled on BWV 582) — verify byte-exact replay of the ground on every cycle via **provenance bits**: the per-note origin tags the engine carries alongside each note, the same machinery that exports `source: "material" | "compose" | "ornament"` in the event JSON. They are `StructuralFail`s: a changed ground is not bad counterpoint, it is a different piece.

::: info BWV numbers
**BWV** (Bach-Werke-Verzeichnis) is the standard catalogue of Bach's works — BWV 582 is the C minor Passacaglia for organ, BWV 1004 the violin partita whose final movement is the Chaconne. When a rule says it is "modeled on" a BWV number, the engine's form template encodes the proportions of that specific piece.
:::

A related rule keeps the *variation layer* honest: `variation_role_ornament_constraint` prevents a variation span that plays the ground role from subdividing below quarter notes — the ground must stay recognizable as a slow line even when restated by another voice.

The most famous ground in Bach is not in a passacaglia at all — it carries the Goldberg Variations. The Aria's bass walks a scheme that thirty variations then restate — switch the excerpt above the score to hear two of those variations walk the same skeleton:

<CounterpointStaff example="bachGroundBass" locale="en" />

## Immutable material: the cantus firmus

<CounterpointStaff example="cantusFirmus" locale="en" />

The chorale prelude carries a hymn tune (**cantus firmus**) in long notes while another voice embroiders. `cantus_firmus_immutable` checks each bar's [downbeat](/docs/music-primer#strong-and-weak-beats) against the declared skeleton tone — embellishment between downbeats is free, the skeleton is not. Like the grounds, the cantus-firmus voice is excluded from the ornament pass entirely.

That is precisely the Orgelbüchlein's plan. In "Ich ruf zu dir" the tune floats untouched above a sixteenth-note inner voice and a murmuring pedal:

<CounterpointStaff example="bachCantusFirmus" locale="en" />

## Figuration harmony

The free-prelude style (think BWV 543's opening) runs continuous figuration over a slow **harmonic rhythm** — the rate at which the underlying chords change, here typically one chord per bar. `figuration_harmonic_consistency` anchors it: the note that opens each bar must be a chord tone of that bar's chord. Off-downbeat notes are unconstrained — that freedom is what makes it figuration and not chorale writing. Pedal notes are exempt.

<CounterpointStaff example="figurationHarmony" locale="en" />

The purest illustration in the repertoire opens WTC I — two bars of the C major prelude, where a single line of sixteenths over two held notes spells out one chord per bar:

<CounterpointStaff example="bachFiguration" locale="en" />

## Solo strings: counterpoint inside one line

A solo cello or violin cannot sound four voices at once, but Bach's solo writing makes the ear *hear* several. The cello prelude is the engine's only single-voice form, and these rules are how one voice still gets counterpoint validation.

The reconstruction is three concrete steps. The engine collects the arpeggio line's notes in onset order, partitions them into contiguous **cells** of the declared `group_size`, then takes each cell's *lowest* pitch as the implied bass stream and its *highest* as the implied top stream. Register decides, not slot position — in the BWV 1007 figuration the perceived melody note sits in the *middle* of the written cell, and the min/max extraction still finds it:

<CounterpointStaff example="impliedStreams" locale="en" />

And here is the original behind that figure — the opening of the first cello suite, with the extraction the engine computes written out underneath:

<CounterpointStaff example="bachImpliedVoices" locale="en" />

The extracted streams are then held to the same standards as real voices. The two reductions below show the streams alone — first failing, then passing:

<CounterpointStaff example="arpeggioParallel" locale="en" />

<CounterpointStaff example="arpeggioContrary" locale="en" />

| Rule | Contract |
|------|----------|
| `implicit_voice_counterpoint` | Between consecutive cells, the implied bass and top streams obey the melodic-leap rules from chapter 4 — the same forbidden-leap predicate that judges the organ's Compose voices. |
| `arpeggio_no_parallel_perfect` | Consecutive cells must not frame the same perfect interval (fifth or octave) with both streams moving in the same direction. Oblique, contrary, and static motion are permitted — exactly the escape hatches real voices get in chapter 2. |

The physical side of solo-string writing — each instrument's playable range — lives in [Instruments](/docs/physical-models).

## Phrase architecture

Two rules keep generated music on the Baroque bar grid. An **anacrusis** (upbeat) is the short lead-in that sounds *before* a downbeat — the "and-a" pickup before bar 1:

<CounterpointStaff example="anacrusisUpbeat" locale="en" />

Bach's dance movements live on this gesture — the Courante of the first cello suite spends one eighth note getting airborne:

<CounterpointStaff example="bachAnacrusis" locale="en" />

| Rule | Contract |
|------|----------|
| `phrase_periodicity_4_or_8_bar` | Consecutive declared phrase starts are exactly 4 or 8 bars apart — the dance-derived regularity underneath most Baroque movements. |
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

## How the validator sees this chapter

| Rule | FailKind |
|------|----------|
| `ground_bass_immutable`, `passacaglia_ground_immutable`, `cantus_firmus_immutable` | **StructuralFail** |
| `variation_role_ornament_constraint`, `figuration_harmonic_consistency`, `toccata_archetype_compatible` | MusicalFail |
| `implicit_voice_counterpoint`, `arpeggio_no_parallel_perfect` | MusicalFail |
| `phrase_periodicity_4_or_8_bar`, `anacrusis_consistent` | MusicalFail |
| `pedal_range_soft_penalty`, `voice_independence_threshold`, `section_contrast_required` | MusicalFail |

This concludes the course. For the flat rule index, see the [Validator Rule Reference](/docs/validator-rules); for how these rules interact with the generation pipeline, see [Generation Pipeline](/docs/generation-pipeline).
