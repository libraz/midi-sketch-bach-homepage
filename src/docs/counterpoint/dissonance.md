---
title: "Counterpoint 3: Dissonance Treatment"
description: Structural-accent consonance, passing and neighbor tones, and the four suspension figures the engine validates.
---

# 3. Dissonance Treatment

Dissonance is not forbidden — counterpoint runs on the tension it creates and releases. What the validator rejects is *unmanaged* dissonance. This chapter catalogs the legal patterns, from the metric rules that govern where dissonance may sit, to the suspension figures that stage it deliberately.

The engine distinguishes three questions:

1. Is the vertical interval dissonant? (chapter 1's classification)
2. Is the note a chord tone at a structurally strong point?
3. If it is not stable, is there preparation and resolution?

::: info Chord tone and non-chord tone
A **chord tone** is part of the active harmony. In a C major triad, C, E, and G are chord tones. A note such as D or F can still be musical, but it needs a function such as passing between stable notes — hence "non-chord tone" (NCT).
:::

## Structural accents demand chord tones

The downbeat is always a structural anchor, and meter adds medium-strength anchors: beat 3 in 4/4, dotted pulses in compound meter, beat 2 in a Sarabande, and the midpoint of longer even simple meters ([primer](/docs/music-primer#strong-and-weak-beats)). The engine requires generated notes at every such accent to belong to the active **chord** — the root, third, fifth, and a declared seventh when the harmony includes one ([primer](/docs/music-primer#chord-and-harmony)) — and simultaneous voice pairs there to be consonant against the actual bass.

<CounterpointStaff example="strongBeatDissonance" locale="en" />

<CounterpointStaff example="verticalDissonance" locale="en" />

| Rule | Fires when |
|------|------------|
| `strong_beat_dissonance` | A Compose-source note at a structural accent is not a tone of the active chord at that tick; a declared seventh counts when the chord has one. |
| `vertical_dissonance` | A voice pair sounding together at a structural accent is dissonant. The base consonant set is `{0, 3, 4, 5, 7, 8, 9}`, but a fourth above the actual bass is dissonant unless a declared suspension or cadential 6/4 licenses it; a fourth between upper voices can be legal. Fixed-source handling follows the `Generation`/`FinalScore` lifecycle and the form's vertical budget. |

The seventh distinction is deliberate. On a strong position, a seventh that the active chord declares is a chord tone. On a weak position, the non-chord-tone check uses the triad root, third, and fifth; an active chordal seventh therefore still needs the appropriate stepwise preparation and resolution when it is treated as a non-chord tone there.

## Weak positions tolerate legible dissonance

Between structural accents, a dissonant non-chord tone is acceptable when the line makes its function audible — approached and left by [step](/docs/music-primer#steps-and-leaps) (motion to the adjacent scale note, at most 2 semitones). The two classic shapes:

<CounterpointStaff example="passingTone" locale="en" />

<CounterpointStaff example="neighborTone" locale="en" />

A **passing tone** fills the gap between two chord tones a third apart; a **neighbor tone** steps off a chord tone and returns. Both read as ornamentation of a stable frame.

Bach runs the pattern at sixteenth-note speed. In bar 2 of the C major fugue (WTC I), the running line clashes twice with the answer above it — a fourth, then a seventh — and both clashes pass the contract:

<CounterpointStaff example="bachPassingTones" locale="en" />

The same dissonance without that frame fails:

<CounterpointStaff example="unpreparedDissonance" locale="en" />

| Rule | Fires when |
|------|------------|
| `unprepared_dissonance` | During `Generation`, a weak-position non-chord tone is approached or left by more than 2 semitones — it neither passes nor neighbors. `FinalScore` audits all sources. A voice's very first and last notes are exempt: with no neighbor on one side, "approached by step" cannot even be evaluated. |

## Suspensions: dissonance by appointment

A suspension is the most deliberate dissonance in tonal music — a three-stage figure that the engine's material model declares explicitly:

::: info Suspension in plain language
A note that was safe gets **held** while the harmony underneath changes, becomes temporarily tense, then resolves by step. Think of it as a delayed update: the old value remains for one beat, then catches up.
:::

1. **Preparation** — the note sounds as a consonance.
2. **Suspension** — the note is held over (a **tie** — one continuous sound across the boundary) while the other voice moves, creating the declared dissonance.
3. **Resolution** — the suspended voice moves by a single diatonic step in the prescribed direction.

The engine validates four declared patterns. The 4–3, 7–6, and 9–8 labels correspond to familiar suspension figures; its `2–3` carrier is an engine-specific direction contract rather than the usual historical lower-voice 2–3 suspension, which is described as a downward resolution in [Open Music Theory](https://viva.pressbooks.pub/openmusictheorycopy/chapter/fourth-species-counterpoint/). Each name identifies the dissonant interval over the bass and the interval it resolves to:

<CounterpointStaff example="suspension43" locale="en" />

<CounterpointStaff example="suspension76" locale="en" />

<CounterpointStaff example="suspension98" locale="en" />

The Bach excerpt below shows a 9–8 suspension whose bass drops an octave at the resolution, so the example keeps the actual bass motion visible rather than treating the interval label as a complete analysis.

<CounterpointStaff example="bachSuspensionNineEight" locale="en" />

<CounterpointStaff example="suspension23" locale="en" />

Chained, the suspension stops being an event and becomes a texture — each resolution doubles as the next preparation:

<CounterpointStaff example="suspensionChain" locale="en" />

Bach opens the B minor prelude that closes WTC I with exactly this texture — except the suspensions are handed back and forth between two voices over a walking bass:

<CounterpointStaff example="bachSuspensionChain" locale="en" />

| Figure | Dissonance → resolution | Direction | Typical home |
|--------|-------------------------|-----------|--------------|
| 4-3 | fourth over the bass → third | down | cadences |
| 7-6 | seventh → sixth | down | sequential chains (the "7-6 chain") |
| 9-8 | ninth → octave | down | moments of settling; resolves into a perfect interval |
| 2-3 | second (suspended bass) → third | **up in this engine** | the engine's bass-suspension carrier; historical lower-voice 2–3 suspensions normally resolve down as the bass falls |

## How the validator sees this chapter

| Rule | FailKind | Check |
|------|----------|-------|
| `strong_beat_dissonance` | MusicalFail | During `Generation`, a Compose-source pitch class at a structural accent must be in the active chord; a declared seventh is included. `FinalScore` audits every source. |
| `vertical_dissonance` | MusicalFail | Structural-accent simultaneities must be bass-sensitively consonant or carry a valid suspension/cadential 6/4 license; source handling continues through `FinalScore` and the form budget. |
| `unprepared_dissonance` | MusicalFail | Weak-position NCTs must be approached and left by step (≤2 semitones). |
| `suspension_preparation` | MusicalFail | The preparation pitch is consonant against the lowest sounding voice and ties (same pitch) into the suspension. |
| `suspension_preparation_duration` | MusicalFail | The preparation lasts at least as long as the suspension it prepares. |
| `suspension_metrical_accent` | MusicalFail | The suspension must land on a stronger metrical position than its preparation. |
| `suspension_resolution_step_down` | MusicalFail | The resolution is a 1–2 semitone step in the prescribed direction: down for 4-3 / 7-6 / 9-8, up for 2-3. |
| `suspension_interval` | MusicalFail | The intervals between the suspended voice and the lowest sounding other voice must match the declared type: 4-3, 7-6, 9-8, or 2-3; for 2-3, the suspended voice is the bass and the interval is measured upward from it. |
| `suspension_seventh_sixth` | MusicalFail | A declared 7-6 figure must form a genuine seventh over the lowest sounding voice and resolve to a genuine sixth (verified via provenance bits, so the rule is inert where no suspension carrier shipped). |

Continue with [Chapter 4 — Melodic Writing](/docs/counterpoint/melody).
