---
title: "Counterpoint 2: Motion & Forbidden Parallels"
description: The four types of relative motion, why parallel and hidden perfects are banned, voice crossing, spacing, and invertible counterpoint.
---

# 2. Motion & Forbidden Parallels

Chapter 1 classified single sonorities. This chapter adds time: how two voices move *between* sonorities. Almost every famous counterpoint prohibition lives here, and they all protect the same asset — the audible independence of the voices.

## The four types of relative motion

Between any two consecutive sonorities, a voice pair moves in one of four ways:

| Motion | Definition | Risk level |
|--------|------------|-----------|
| Contrary | The voices move in opposite directions. | Safest — independence is audible. |
| Oblique | One voice holds while the other moves. | Safe — the held voice anchors the pair. |
| Similar | Both move the same direction by different amounts. | Risky into perfect intervals (hidden parallels). |
| Parallel | Both move the same direction keeping the interval. | Fine for imperfect consonances; forbidden for perfects. |

<CounterpointStaff example="contraryOblique" locale="en" />

<CounterpointStaff example="parallelSixths" locale="en" />

Bach promoted contrary motion from a recommendation to a structural law — twice. Variations 12 and 15 of the Goldberg Variations are canons by inversion, where the second voice is the first voice upside down:

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
| `parallel_fifth` | Two voices both move and the previous and current vertical intervals are perfect fifths. |
| `parallel_octave` | Two voices both move and the previous and current intervals are unisons or octaves. |
| Oblique escape | Oblique and static motion are allowed even on repeated perfect intervals — only *both voices moving* triggers the rule. |
| Cadence exemption | Notes committed as part of a declared cadence cell are exempt. |
| Material exemption | The check skips when **both** notes are `Material` (fixed inputs the composer cannot edit). If either voice is `Compose`, the rule fires. |

::: info What is a "cadence cell"?
The engine writes the closing gesture of a phrase as a pre-built unit and stamps its notes `CadenceCellCommitted`. Local note-pair rules skip those notes; the dedicated `cadence_voice_leading` rule (chapter 5) judges the cadence as a whole instead. Historical cadence formulas license motions that would trip the local rules — exempting the cell keeps the two layers from fighting.
:::

## Hidden (direct) fifths and octaves

A hidden, or direct, perfect interval occurs when voices move in the same direction *into* a perfect fifth or octave from some other interval. The parallel never literally happens — it is implied by the similar-motion arrival, which makes the hollow interval jump out of the texture.

::: tip Hidden means "arrived by similar motion"
In a hidden fifth, the first vertical interval is not a fifth. The problem appears at the arrival: both voices move in the same direction and land on a perfect fifth. That direct arrival can still make the voices fuse.
:::

<CounterpointStaff example="hiddenFifth" locale="en" />

<CounterpointStaff example="hiddenOctave" locale="en" />

| Rule | Scope |
|------|-------|
| `hidden_parallel_fifth` | Similar motion lands on a perfect fifth from a non-perfect interval. Cadence cells and both-material pairs are exempt. |
| `hidden_parallel_octave` | Similar motion lands on a unison or octave from a non-perfect interval. Same scope and exemptions as the fifth: every voice pair, any beat; cadence cells and both-material pairs are exempt. |

::: info Two scoping terms used in this chapter
A **strong beat** is the first beat of a bar — the engine's model is the binary `start_tick % ticks_per_bar == 0` ([primer](/docs/music-primer#strong-and-weak-beats)). An **upper-voice pair** is a pair of adjacent voices that does not include the lowest voice: in a three-voice texture, the top two. The bass is excluded because these checks exist for material that will later be inverted (see below), and the bass line is not part of that swap.
:::

## Voice crossing and spacing

Vertical writing must remain readable as separate voices even before any interval question arises. Two layout rules guarantee it:

<CounterpointStaff example="voiceCrossing" locale="en" />

Bach himself crosses voices on purpose when a stricter contract demands it. The third Goldberg variation is a canon at the unison — the follower repeats the leader at the very same pitch, so both voices share one register and tangle the moment the second enters. The engine has no page of slurs and stems to keep tangled lines readable, so it simply refuses the trade:

<CounterpointStaff example="bachVoiceCrossing" locale="en" />

<CounterpointStaff example="spacingWide" locale="en" />

In a real three-voice texture the rule splits cleanly in two — tight above, free below:

<CounterpointStaff example="spacingTrio" locale="en" />

| Rule | Scope |
|------|-------|
| `voice_crossing` | By convention, a lower voice index means a higher pitch (voice 0 is the soprano). A negative interval between any pair — every combination is checked, not just neighbors — means the voices have swapped: rejected wherever it occurs. |
| `spacing_adjacent_voices_within_octave` | In textures of three or more voices, adjacent *upper* pairs must stay within an octave (12 semitones). The bottom pair (tenor–bass) may be wider, matching four-part Bach practice. Checked at chord starts, only where the harmonic plan declares the chord (`has_degree`). |

## Invertible counterpoint at the octave

Fugues reuse two-voice combinations with the voices swapped: what was on top moves below. For that to work, every interval must survive being replaced by its octave complement — thirds become sixths, fifths become fourths, octaves become unisons. Toggle the example below: lift the lower line an octave and every third turns into a sixth, both versions equally consonant.

<CounterpointStaff example="invertibleSwap" locale="en" />

Not every interval survives so kindly. The perfect fifth — a stable consonance — inverts to a perfect fourth, which between two voices alone counts as a dissonance:

<CounterpointStaff example="octaveInversion" locale="en" />

Bach cashes in on the benign cases constantly. In the C minor fugue of WTC I, the subject and its countersubject are written so that either can sit on top. Toggle between bar 7 and bar 20 and follow the blue countersubject as it moves from above the subject to below it:

<CounterpointStaff example="bachInvertible" locale="en" />

Two scoped rules keep upper-voice pairs invertible:

<CounterpointStaff example="fourthWeakBeat" locale="en" />

| Rule | What it prevents |
|------|------------------|
| `invertible_at_octave` | Parallel octaves in an upper-voice pair on strong beats — after inversion they would become parallel *unisons*, the most extreme fusion possible. Oblique motion and weak beats are exempt. |
| `fourth_only_on_weak_beat` | A strong-beat perfect fourth in an upper-voice pair — after inversion it becomes a strong-beat fifth. Weak-beat fourths pass as transitional sonorities. |

## How the validator sees this chapter

| Rule | FailKind | Key exemptions |
|------|----------|----------------|
| `parallel_fifth`, `parallel_octave` | MusicalFail | oblique/static motion, cadence cells, both-material pairs |
| `hidden_parallel_fifth` | MusicalFail | cadence cells, both-material pairs |
| `hidden_parallel_octave` | MusicalFail | cadence cells, both-material pairs |
| `voice_crossing` | MusicalFail | none |
| `spacing_adjacent_voices_within_octave` | MusicalFail | bottom pair may exceed an octave; ≥3 voices only |
| `invertible_at_octave` | MusicalFail | oblique motion, weak beats, both-material pairs |
| `fourth_only_on_weak_beat` | MusicalFail | weak beats, both-material pairs |

Continue with [Chapter 3 — Dissonance Treatment](/docs/counterpoint/dissonance).
