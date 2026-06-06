---
title: "Counterpoint 3: Dissonance Treatment"
description: Strong-beat consonance, passing and neighbor tones, and the four suspension figures the engine validates.
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

## Strong beats demand chord tones

The downbeat of a bar is a structural anchor. The engine's definition of "strong beat" is exactly that and nothing more: a position where `start_tick % ticks_per_bar == 0` ([primer](/docs/music-primer#strong-and-weak-beats)). The engine requires generated notes there to belong to the active **triad** — the chord's root, third, and fifth ([primer](/docs/music-primer#chord-and-harmony)) — and simultaneous voice pairs on strong beats to form consonant intervals.

<CounterpointStaff example="strongBeatDissonance" locale="en" />

<CounterpointStaff example="verticalDissonance" locale="en" />

| Rule | Fires when |
|------|------------|
| `strong_beat_dissonance` | A Compose-source note on beat 1 of a bar is not the root, third, or fifth of the active chord at that tick. |
| `vertical_dissonance` | A voice pair sounding together on a strong beat forms an interval outside the consonant set `{0, 3, 4, 5, 7, 8, 9}`. Both-material pairs are exempt; blame falls on the Compose side. |

## Weak beats tolerate legible dissonance

Between downbeats, a dissonant non-chord tone is acceptable when the line makes its function audible — approached and left by [step](/docs/music-primer#steps-and-leaps) (motion to the adjacent scale note, at most 2 semitones). The two classic shapes:

<CounterpointStaff example="passingTone" locale="en" />

<CounterpointStaff example="neighborTone" locale="en" />

A **passing tone** fills the gap between two chord tones a third apart; a **neighbor tone** steps off a chord tone and returns. Both read as ornamentation of a stable frame. The same dissonance without that frame fails:

<CounterpointStaff example="unpreparedDissonance" locale="en" />

| Rule | Fires when |
|------|------------|
| `unprepared_dissonance` | A weak-beat non-chord tone is approached or left by more than 2 semitones — it neither passes nor neighbors. Compose-source notes only. A voice's very first and last notes are exempt: with no neighbor on one side, "approached by step" cannot even be evaluated. |

## Suspensions: dissonance by appointment

A suspension is the most deliberate dissonance in tonal music — a three-stage figure that the engine's material model declares explicitly:

::: info Suspension in plain language
A note that was safe gets **held** while the harmony underneath changes, becomes temporarily tense, then resolves by step. Think of it as a delayed update: the old value remains for one beat, then catches up.
:::

1. **Preparation** — the note sounds as a consonance.
2. **Suspension** — the note is held over (a **tie** — one continuous sound across the boundary) while the other voice moves, creating the declared dissonance.
3. **Resolution** — the suspended voice moves by a single diatonic step in the prescribed direction.

The engine supports the four classical figures. Each is named by the dissonant interval over the bass and the interval it resolves to:

<CounterpointStaff example="suspension43" locale="en" />

<CounterpointStaff example="suspension76" locale="en" />

<CounterpointStaff example="suspension98" locale="en" />

<CounterpointStaff example="suspension23" locale="en" />

Chained, the suspension stops being an event and becomes a texture — each resolution doubles as the next preparation:

<CounterpointStaff example="suspensionChain" locale="en" />

| Figure | Dissonance → resolution | Direction | Typical home |
|--------|-------------------------|-----------|--------------|
| 4-3 | fourth over the bass → third | down | cadences |
| 7-6 | seventh → sixth | down | sequential chains (the "7-6 chain") |
| 9-8 | ninth → octave | down | moments of settling; resolves into a perfect interval |
| 2-3 | second (suspended bass) → third | **up** | bass suspensions; the engine validates the ascending step |

## How the validator sees this chapter

| Rule | FailKind | Check |
|------|----------|-------|
| `strong_beat_dissonance` | MusicalFail | Downbeat pitch class must be in the active triad. Compose notes only. |
| `vertical_dissonance` | MusicalFail | Strong-beat simultaneities must be consonant. Both-material pairs exempt. |
| `unprepared_dissonance` | MusicalFail | Weak-beat NCTs must be approached and left by step (≤2 semitones). |
| `suspension_preparation` | MusicalFail | The preparation pitch is consonant against the lowest sounding voice and ties (same pitch) into the suspension. |
| `suspension_resolution_step_down` | MusicalFail | The resolution is a 1–2 semitone step in the prescribed direction: down for 4-3 / 7-6 / 9-8, up for 2-3. |
| `suspension_seventh_sixth` | MusicalFail | A declared 7-6 figure must form a genuine seventh over the lowest sounding voice and resolve to a genuine sixth (verified via provenance bits, so the rule is inert where no suspension carrier shipped). |

Continue with [Chapter 4 — Melodic Writing](/docs/counterpoint/melody).
