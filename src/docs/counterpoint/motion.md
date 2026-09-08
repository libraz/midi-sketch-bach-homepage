---
title: "Counterpoint 2: Motion & Forbidden Parallels"
description: The four types of relative motion, how the validator treats strict and hidden perfect motion, voice crossing, spacing, and invertible counterpoint.
---

# 2. Motion & Forbidden Parallels

Chapter 1 classified single sonorities. This chapter adds time: how two voices move *between* sonorities. The page describes the validator's conservative perfect-motion policy; historical direct-fifth and direct-octave teaching often focuses on the outer voices and may allow a stepwise soprano arrival, while contrary perfect motions are treated separately ([Open Music Theory](https://viva.pressbooks.pub/openmusictheorycopy/chapter/composing-in-basso-continuo-style/)).

## The four types of relative motion

Between any two consecutive sonorities, a voice pair moves in one of four ways:

| Motion | Definition | Risk level |
|--------|------------|-----------|
| Contrary | The voices move in opposite directions. | Safest — independence is audible. |
| Oblique | One voice holds while the other moves. | Safe — the held voice anchors the pair. |
| Similar | Both move in the same direction by different amounts. | Risky into perfect intervals (hidden parallels). |
| Parallel | Both move in the same direction while keeping the interval. | Fine for imperfect consonances; forbidden for perfects. |

<CounterpointStaff example="contraryOblique" locale="en" />

<CounterpointStaff example="parallelSixths" locale="en" />

Bach's Goldberg Variations 12 and 15 are canons by inversion, where the second voice is the first voice upside down. They are repertoire examples of contrary motion, not a universal rule for every passage:

<CounterpointStaff example="bachMirror" locale="en" />

## Forbidden perfect parallels

Parallel fifths and octaves make two voices sound like a single doubled line — the classic loss of voice independence. Play the two examples below and listen for it: the octave case in particular collapses into one thick voice.

::: info Why exactly fifths and octaves?
Perfect intervals blend so strongly (chapter 1) that when the *same* perfect interval is repeated by motion in both voices, the ear groups the two lines into one. A single fifth is fine; a fifth *moving to another fifth* is the violation.
:::

<CounterpointStaff example="parallelFifths" locale="en" />

<CounterpointStaff example="parallelOctaves" locale="en" />

Implementation map:

| Rule | Fires when |
|------|------------|
| `parallel_fifth` | Two voices move in the same direction and the previous and current vertical intervals are perfect fifths. |
| `parallel_octave` | Two voices move in the same direction and the previous and current intervals are unisons or octaves. |
| Oblique escape | Oblique and static motion are allowed even on repeated perfect intervals — only *both voices moving* triggers the rule. |
| Cadence exemption | Notes committed as part of a declared cadence cell are exempt. |
| Source handling | During `Generation`, an all-fixed `Material`/`Ornament` pair is recorded as an exemption; `FinalScore` audits authored material again and the form's vertical budget decides whether observed findings close the form. |

::: info What is a "cadence cell"?
The engine writes the closing gesture of a phrase as a pre-built unit and stamps its notes `CadenceCellCommitted`. The strict, hidden, and contrary perfect-motion checks on this page skip a pair when the note sounding as the current lower voice carries that bit. Melodic interval and consecutive-leap loops skip a marked current note, while the weak non-chord-tone walk skips a marked current note or the next cadence note. The dedicated `cadence_voice_leading` rule (chapter 5) judges the cadence as a whole instead; there is no blanket exemption for every validator rule.
:::

## Contrary perfect motions

The validator keeps two contrary-motion cases separate from strict same-direction parallels. `anti_parallel_perfect` fires when both voices move in opposite directions and repeat the same perfect interval class — a unison, fifth, or octave — across the two sonorities. `battuta` is narrower: contrary motion arrives at a unison from a non-unison interval, and the voice that is upper at the arrival leaps downward by more than a major second. A stepwise arrival or an upper voice that rises is outside this `battuta` predicate.

Both rules are engine contracts. They are evaluated at the same union onsets as the other pair-motion checks, then routed through the `Generation`/`FinalScore` source handling and the form's vertical budget.

## Hidden (direct) fifths and octaves

A hidden, or direct, perfect interval occurs when voices move in the same direction *into* a perfect fifth or octave. The parallel never literally happens — it is implied by the similar-motion arrival, which makes the hollow interval jump out of the texture. In this engine, the arrival is classified as hidden only when the upper voice leaps by more than a major second (more than 2 semitones); a stepwise upper voice is allowed by this particular predicate.

::: tip Hidden means "arrived by similar motion"
In a hidden fifth, the first vertical interval is not the same perfect fifth. The previous interval can be another class — for example, a fifth moving to an octave is classified as a hidden octave when the upper voice makes the required leap. The engine applies this rule to every voice pair and every union onset, a deliberately conservative scope.
:::

<CounterpointStaff example="hiddenFifth" locale="en" />

<CounterpointStaff example="hiddenOctave" locale="en" />

| Rule | Scope |
|------|-------|
| `hidden_parallel_fifth` | Similar motion lands on a perfect fifth, the previous perfect class differs, and the upper voice leaps more than 2 semitones. Cadence cells are skipped; source handling follows the `Generation`/`FinalScore` lifecycle above. |
| `hidden_parallel_octave` | Similar motion lands on a unison or octave under the same previous-class and upper-leap conditions. The engine checks every voice pair at every union onset, including weak positions. |

::: info Two scoping terms used in this chapter
A **structural accent** is a Strong or Medium position in the meter: the downbeat, beat 3 in 4/4, each dotted pulse in compound meter, or beat 2 in a Sarabande ([primer](/docs/music-primer#strong-and-weak-beats)). An **upper-voice pair** is a pair of adjacent voices that does not include the lowest voice: in a three-voice texture, the top two. The bass is excluded from `invertible_at_octave` because that check protects material whose upper voices may later exchange registers.
:::

## Voice crossing and spacing

Vertical writing must remain readable as separate voices even before any interval question arises. Two layout rules guarantee it:

<CounterpointStaff example="voiceCrossing" locale="en" />

Bach himself crosses voices on purpose when a stricter contract demands it. The third Goldberg variation is a canon at the unison — the follower repeats the leader at the very same pitch, so both voices share one register and tangle the moment the second enters. The engine has no page of slurs and stems to keep tangled lines readable, so its ordinary crossing check refuses that trade; the explicit upper-trio exception appears below:

<CounterpointStaff example="bachVoiceCrossing" locale="en" />

<CounterpointStaff example="spacingWide" locale="en" />

In a real three-voice texture the rule splits cleanly in two — tight above, free below:

<CounterpointStaff example="spacingTrio" locale="en" />

| Rule | Scope |
|------|-------|
| `voice_crossing` | By convention, a lower voice index means a higher pitch (voice 0 is the soprano). A negative interval between any pair — every combination is checked, not just neighbors — means the voices have swapped; the momentary upper-trio exception below is the only policy allowance. |
| `spacing_adjacent_voices_within_octave` | In textures of three or more voices, adjacent *upper* pairs must stay within an octave (12 semitones). The bottom pair (tenor–bass) may be wider, matching four-part Bach practice. Checked at chord starts, only where the harmonic plan declares the chord (`has_degree`). |

The trio-sonata policy has one explicit crossing allowance. When both upper notes are `TrioVoiceCarrier` material and the harmonic plan enables `AllowTrioUpperMomentary`, one union-onset exchange may cross the upper pair if the pair was ordered at the previous onset. A crossing that persists into the next onset still fails `voice_crossing`; the policy also requires the two upper register ranges to overlap, otherwise `trio_upper_register_overlap` is reported.

## Invertible counterpoint at the octave

Fugues reuse two-voice combinations with the voices swapped: what was on top moves below. For that to work, every interval must survive being replaced by its octave complement — thirds become sixths, fifths become fourths, octaves become unisons. Toggle the example below: lift the lower line an octave and every third turns into a sixth, both versions equally consonant.

<CounterpointStaff example="invertibleSwap" locale="en" />

Not every interval survives so kindly. The perfect fifth — a stable consonance — inverts to a perfect fourth, which between two voices alone counts as a dissonance:

<CounterpointStaff example="octaveInversion" locale="en" />

Bach cashes in on the benign cases constantly. In the C minor fugue of WTC I, the subject and its countersubject are written so that either can sit on top. Toggle between bar 7 and bar 20 and follow the blue countersubject as it moves from above the subject to below it:

<CounterpointStaff example="bachInvertible" locale="en" />

One scoped rule tests one failure mode in that exchange:

| Rule | What it prevents |
|------|------------------|
| `invertible_at_octave` | Parallel octaves in an upper-voice pair at structural accents — after inversion they would become parallel *unisons*, the most extreme fusion possible. Oblique motion and weak positions are exempt. This is not a proof of complete octave-invertible counterpoint: fifth/fourth treatment, suspensions, and the bass context are checked by other rules. |

A fourth is not intrinsically illegal in an upper-voice pair. The vertical validator finds the actual lowest sounding pitch: a fourth above that bass is dissonant unless a declared suspension or cadential 6/4 licenses it, while a fourth between upper voices is legal when both notes are consonant above the bass.

<CounterpointStaff example="bassSensitiveFourth" locale="en" />

## How the validator sees this chapter

| Rule | FailKind | Key exemptions |
|------|----------|----------------|
| `parallel_fifth`, `parallel_octave` | MusicalFail | oblique/static motion, cadence cells; fixed-source handling follows the validation lifecycle |
| `anti_parallel_perfect` | MusicalFail | contrary motion is checked separately from strict parallels; cadence cells and fixed-source handling follow the lifecycle |
| `battuta` | MusicalFail | contrary arrival to a unison with a downward leap in the arriving upper voice; cadence cells and fixed-source handling follow the lifecycle |
| `hidden_parallel_fifth` | MusicalFail | cadence cells; all-pair/all-onset scope is an engine policy |
| `hidden_parallel_octave` | MusicalFail | cadence cells; all-pair/all-onset scope is an engine policy |
| `voice_crossing` | MusicalFail | one momentary upper-trio exchange may be allowed by policy |
| `trio_upper_register_overlap` | MusicalFail | only emitted when the momentary upper-trio policy is enabled |
| `spacing_adjacent_voices_within_octave` | MusicalFail | bottom pair may exceed an octave; ≥3 voices only |
| `invertible_at_octave` | MusicalFail | only adjacent upper pairs at structural accents; this rule checks parallel octaves, not complete invertibility |

Continue with [Chapter 3 — Dissonance Treatment](/docs/counterpoint/dissonance).
