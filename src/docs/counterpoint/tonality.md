---
title: "Counterpoint 5: Tonal Grammar"
description: The seven cadence types, tendency-tone doubling, cross relations, secondary dominants, and pivot-chord modulation.
---

# 5. Tonal Grammar

The rules so far judge notes and lines. This chapter judges *sentences*: how phrases end, how the music borrows chords from neighboring keys, and how it travels to a new key and back. These checks need more context than an interval — the validator reads them against the declared harmonic plan.

::: info What is V to I?
Roman numerals describe chords relative to the key. In C major, **I** is C major, **IV** is F major, **V** is G major, **vi** is A minor. A **cadence** is a closing gesture; V to I is the common dominant-to-tonic closure, but the validator also checks how the individual voices arrive there.
:::

## Cadences are voice-leading contracts

A cadence is more specific than "the harmony is V then I". Each declared cadence type promises particular **outer-voice** behavior — the highest and lowest lines, the two the listener tracks most easily — at the cadence tick, and `cadence_voice_leading` verifies it. The engine knows seven types.

### Authentic: the period

<CounterpointStaff example="cadence" locale="en" />

The **perfect authentic cadence** demands the strongest close: the upper voice resolves the leading tone up to the tonic while the bass falls from dominant to tonic. The **imperfect authentic** variant relaxes the soprano requirement — same harmony, softer punctuation.

### Plagal: the amen

<CounterpointStaff example="plagalCadence" locale="en" />

### Half: the comma

<CounterpointStaff example="halfCadence" locale="en" />

### Deceptive: the feint

<CounterpointStaff example="deceptiveCadence" locale="en" />

### Phrygian: the archaic close

<CounterpointStaff example="phrygianCadence" locale="en" />

### Picardy: minor ends major

<CounterpointStaff example="picardyThird" locale="en" />

| Cadence type | Validator checks |
|--------------|------------------|
| Perfect | Leading tone resolves up by semitone to tonic; bass moves dominant → tonic. |
| Imperfect authentic | Same harmonic frame with relaxed soprano. |
| Plagal | Bass moves subdominant → tonic (IV → I). |
| Half | The phrase comes to rest on the dominant. |
| Deceptive | The bass evades the tonic, arriving on the sixth degree (V → vi). |
| Phrygian | In minor: bass descends by half step onto the dominant (iv6 → V). The stepwise rise in the upper voice is stylistic — the engine checks only the bass motion. |
| Picardy third | Leading tone resolves and the final tonic chord carries a major third. |

::: info Reading the chord symbols
This chapter's tables use three decorations on Roman numerals. A small **6** (as in `iv6`) marks **first inversion**: the chord's *third* is the lowest note instead of its root — that is how the Phrygian cadence gets its half-step bass descent. A **°** (as in `vii°`) marks a **diminished** chord, stacked from two minor thirds. A superscript **7** (as in `V7`) adds a fourth note a seventh above the root; that added note is the "chordal seventh" whose doubling is banned below. Combining the two gives `vii°7`, the **diminished seventh chord**: three minor thirds stacked, its outer span the diminished seventh (9 semitones) the chord is named after — Baroque music's most dramatic dominant substitute.
:::

## Doubling: tendency tones stay single

Some [scale degrees](/docs/music-primer#scale-degrees) carry an obligation (the leading tone wants the tonic; a chordal seventh wants to fall). Giving the same obligation to two voices guarantees one of them breaks it — or they resolve in parallel octaves.

<CounterpointStaff example="doublingLeadingTone" locale="en" />

<CounterpointStaff example="doublingSeventh" locale="en" />

## Cross relations: chromatic contradictions

<CounterpointStaff example="crossRelation" locale="en" />

When one voice sounds F♯ while (or immediately after) another sounds F♮, the listener hears the key contradict itself: one line claims the [chromatic](/docs/music-primer#diatonic-and-chromatic) form of a degree while another insists on the diatonic form. The validator window covers simultaneous notes and adjacent beats. Natural half-step pairs (E–F, B–C) are not cross relations — they are different letter names, not chromatic alterations of the same degree.

## Secondary dominants: borrowed tension

<CounterpointStaff example="secondaryDominant" locale="en" />

A secondary (applied) dominant treats a diatonic chord as a momentary tonic and approaches it with its own dominant — written with a slash and read "of": `V/V` is "the V *of* V" (in C major: D major, the dominant of G), `V/vi` the dominant of the vi chord, and so on. This is the engine's main source of legal chromaticism:

- Inside the declared applied region, the melodic rules (`augmented_melodic`, `diminished_melodic`, `tritone_melodic`) are exempt — the chromatic motion is the device.
- In exchange, `secondary_dominant_resolution` verifies the promise: the next chord must actually be the targeted degree. The rise of the borrowed leading tone is tracked descriptively via provenance, while the hard check is the degree-level resolution.

## Pivot-chord modulation

<CounterpointStaff example="pivotModulation" locale="en" />

To modulate convincingly, Baroque practice routes through a **pivot chord** — one that is diatonic in both the old key and the new key, so the ear can reinterpret it mid-phrase. For pivot-type modulations, `modulation_pivot_chord_required` verifies that the declared pivot really belongs to both keys. (The engine also models common-tone and phrase modulations, which carry their own declared shapes rather than a pivot.)

## How the validator sees this chapter

| Rule | FailKind | Check |
|------|----------|-------|
| `cadence_voice_leading` | StructuralFail / MusicalFail | Outer voices match the declared cadence type at the cadence tick (approach = one beat earlier). A malformed cadence layout (fewer than 2 voices, no distinct bass) is StructuralFail; the voice-leading mismatch itself is reported as MusicalFail. |
| `doubling_no_leading_tone` | MusicalFail | The leading-tone pitch class sounds in at most one voice when the chord contains it (V, vii°, V7, vii°7). |
| `doubling_no_seventh` | MusicalFail | A seventh-quality chord's seventh is not doubled. |
| `cross_relation` | MusicalFail | No chromatic pitch-class conflict between voices within a beat window. Both-material pairs exempt. |
| `secondary_dominant_resolution` | MusicalFail | A chord marked `V/x` is followed by degree `x`. |
| `modulation_pivot_chord_required` | MusicalFail | A pivot modulation's pivot chord is diatonic in both keys. |

Continue with [Chapter 6 — Fugal Devices](/docs/counterpoint/fugue).
