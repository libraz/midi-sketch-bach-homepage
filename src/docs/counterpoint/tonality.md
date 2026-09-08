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

A cadence is more specific than "the harmony is V then I". In polyphonic music, each declared type promises particular **outer-voice** behavior — the highest and lowest sounding lines at the cadence. In a monophonic form, `cadence_voice_leading` checks the single line as a melodic cadence instead of requiring a separate bass. The engine knows seven types.

The two approaches are sampled differently. The upper line is read at `cadence.tick - 1`, immediately before the arrival, so a diminished run inside the final beat is preserved. The bass remains structural and is read one quarter-note beat earlier.

### Authentic: the period

<CounterpointStaff example="cadence" locale="en" />

In standard tonal theory, a **perfect authentic cadence (PAC)** has three conditions: V–I harmony, both chords in root position, and scale degree 1 in the highest voice of the final tonic chord. The soprano may approach that tonic by step from scale degree 2 as well as from the leading tone 7. Within an authentic V–I close, if any one of those conditions is missing — for example, an inverted chord or a final soprano other than scale degree 1 — the close is an **imperfect authentic cadence (IAC)**. See the [three PAC conditions and IAC distinction](https://musictheory.pugetsound.edu/mt21c/PerfectAuthenticCadence.html).

The engine keeps a separate, narrower contract for its named perfect cadence cell: the sampled upper line must use the 7→1 leading-tone resolution, and the bass must move V→I. The figure above shows that implementation subset; it is not the definition of every PAC.

Bach’s Goldberg Aria includes a close with this 7→1 realization:

<CounterpointStaff example="bachCadence" locale="en" />

### Plagal: the amen

<CounterpointStaff example="plagalCadence" locale="en" />

### Half: the comma

<CounterpointStaff example="halfCadence" locale="en" />

### Deceptive: the feint

<CounterpointStaff example="deceptiveCadence" locale="en" />

Here is the feint in the wild — three voices of the F major fugue assemble a complete V7, the upper voices resolve exactly as promised, and only the bass slips upward to vi:

<CounterpointStaff example="bachDeceptive" locale="en" />

### Phrygian: the archaic close

<CounterpointStaff example="phrygianCadence" locale="en" />

Bach ends an entire movement this way. The Largo of the fifth organ trio sonata closes on V — phrygian descent in the pedal, a pair of suspensions resolving above — and hands the open door to the finale:

<CounterpointStaff example="bachPhrygian" locale="en" />

### Picardy: minor ends major

<CounterpointStaff example="picardyThird" locale="en" />

And here is the convention at work — the very last bar of the C minor fugue from WTC I, dominant tension over a tonic pedal melting into a major chord:

<CounterpointStaff example="bachPicardy" locale="en" />

| Cadence type | Validator checks |
|--------------|------------------|
| Perfect authentic | Standard PAC: V–I, both chords in root position, and scale degree 1 in the final highest voice. The engine’s perfect cell additionally checks the sampled upper 7→1 motion and bass V→I. |
| Imperfect authentic | Standard IAC: a V–I close that misses at least one PAC condition. The engine evaluates its separately declared IAC contract. |
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

When one voice sounds F♯ while another sounds F♮, the listener hears the key contradict itself: one line claims the [chromatic](/docs/music-primer#diatonic-and-chromatic) form of a degree while another insists on the diatonic form. The completed-score validator checks simultaneous notes and adjacent note onsets. For an adjacent pair, neither voice may start another note strictly between the two onsets, regardless of their distance in ticks; the pair is judged in the local key at the later onset. Natural half-step pairs (E–F, B–C in major; D–E♭, G–A♭ in minor) are not cross relations — they are different scale degrees, not chromatic alterations of the same degree. The candidate-placement helper still uses a beat-wide pre-check because the rest of a partial score is not known yet.

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
| `cadence_voice_leading` | StructuralFail / MusicalFail | At the cadence tick, polyphonic outer voices or the single monophonic line match the declared cadence type. The upper approach is sampled one tick before arrival; a distinct bass is sampled one beat before. A missing cadence voice or a cadence earlier than one beat is StructuralFail; a voice-leading mismatch is MusicalFail. |
| `doubling_no_leading_tone` | MusicalFail | The leading-tone pitch class sounds in at most one voice when the chord contains it (V, vii°, V7, vii°7). |
| `doubling_no_seventh` | MusicalFail | A seventh-quality chord's seventh is not doubled. |
| `cross_relation` | MusicalFail | Voices sound the same scale degree in the local key at the later onset, with different inflections, either simultaneously or at adjacent note onsets (neither voice has another onset strictly between them). Natural semitone pairs between different degrees are excluded. The partial-placement pre-check remains beat-wide; FinalScore uses completed-score onset adjacency. Both-material pairs are exempt during Generation only; FinalScore audits every source, and the form's vertical budget decides whether observed findings close the form. |
| `secondary_dominant_resolution` | MusicalFail | A chord marked `V/x` is followed by degree `x`. |
| `modulation_pivot_chord_required` | MusicalFail | A pivot modulation's pivot chord is diatonic in both keys. |

Continue with [Chapter 6 — Fugal Devices](/docs/counterpoint/fugue).
