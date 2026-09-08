---
title: "Counterpoint 1: Intervals & Consonance"
description: How the validator classifies vertical intervals — perfect, imperfect, dissonant, and the ambivalent fourth.
---

# 1. Intervals & Consonance

Counterpoint starts with one measurement: the vertical distance between two voices sounding at the same time. Everything else in this course — parallels, dissonance treatment, cadences — is built on how that distance is classified.

::: info What is an interval?
An **interval** is the distance between two notes. Count letter names inclusively from the lower note to the upper note: C-D-E-F-G is five letter steps, so C to G is a **fifth**. MIDI stores pitches as semitones, so the engine also sees that C to G is 7 semitones. The validator works in semitones modulo 12 — an octave plus a third is still "a third" for consonance purposes.
:::

## The three families

Baroque practice sorts intervals into three families, and the engine encodes exactly this taxonomy in its consonant interval-class set `{0, 3, 4, 5, 7, 8, 9}` (semitones mod 12):

| Family | Intervals | Semitones (mod 12) | Engine treatment |
|--------|-----------|--------------------|------------------|
| Perfect consonance | unison, 5th, octave | 0, 7 | Stable pillars — but repeating them by parallel motion is forbidden (chapter 2). |
| Imperfect consonance | 3rds, 6ths | 3, 4, 8, 9 | The everyday contrapuntal sound; may move in parallel freely. |
| Dissonance | 2nds, 7ths, tritone | 1, 2, 6, 10, 11 | Needs a declared or recognizable job: passing motion, suspension, pedal context (chapter 3). |
| Special case | perfect 4th | 5 | Bass-sensitive: dissonant above the actual bass, but legal between upper voices when both are consonant above that bass. |

The staff figures label intervals with the standard shorthand — `P5` (perfect fifth), `M3` (major third), `m10` (minor tenth), `A4` (augmented fourth, the tritone). If the letters are new, the [interval name legend](/docs/music-primer#interval-names-and-qualities) in the primer decodes them all.

### Perfect consonances: stable but hollow

<CounterpointStaff example="perfectConsonances" locale="en" />

In just intonation, perfect intervals have simple frequency ratios (2:1 for the octave, 3:2 for the fifth). MIDI's usual 12-tone equal temperament gives the fifth the ratio `2^(7/12)`, so it is not exactly 3:2. Bach-era practice did not prescribe one universally accepted temperament; this page describes semitone classes, not a historical tuning. See the [Oxford Early Music discussion of Bach-era temperament](https://academic.oup.com/em/article-abstract/33/3/545/2928360). Two voices locked in perfect intervals blend so well that the ear stops hearing two voices. Counterpoint wants stability *at anchor points* (openings, cadences) and independence everywhere else.

### Imperfect consonances: the workhorses

<CounterpointStaff example="imperfectConsonances" locale="en" />

Thirds, sixths, and their compounds (tenths, thirteenths) are full but mobile. Most of the vertical sonorities in a generated two-voice texture are imperfect consonances, and chains of parallel thirds or sixths are idiomatic — the engine never penalizes them.

Bach exploits that license in two short runs. In bar 32 of the E♭ major prelude from WTC I, two sixteenth-note lines move in strict parallel tenths at positions 1–7 and 9–15, with rests at positions 0 and 8:

<CounterpointStaff example="bachParallelTenths" locale="en" />

And one bar of the C minor prelude shows the two families dividing the labor — perfect consonances standing as pillars on the strong positions, sixths carrying all the motion between them:

<CounterpointStaff example="bachPillars" locale="en" />

### Dissonances: tension with an obligation

<CounterpointStaff example="dissonantIntervals" locale="en" />

::: info Consonance and dissonance are roles, not aesthetics
**Consonance** means the interval can stand as a structural sonority. **Dissonance** means the interval needs a job: passing motion, suspension, preparation, or resolution. The validator is not judging "nice" versus "ugly"; it is checking whether an unstable interval has a declared musical reason. Chapter 3 catalogs the legal jobs.
:::

### The fourth: counterpoint's boundary case

<CounterpointStaff example="fourthAmbivalent" locale="en" />

The perfect fourth has been argued about for centuries, and the engine's treatment mirrors the historical compromise:

- **Against the actual lowest sounding voice**, a fourth is dissonant at a [structural accent](/docs/music-primer#strong-and-weak-beats). `vertical_dissonance` rejects it unless a fully declared 4-3 suspension or cadential 6/4 supplies the required preparation and resolution.
- **Between upper voices** over a supporting bass, a fourth is legal when each upper note is consonant above that bass. It is not rejected merely because octave inversion would turn it into a fifth (chapter 2).

## How the validator sees this chapter

The interval families are not a rule themselves; they are the lookup table that the vertical rules consult.

| Concept | Where it is enforced |
|---------|----------------------|
| Consonant interval-class set `{0, 3, 4, 5, 7, 8, 9}` plus bass-sensitive treatment of class 5 | `vertical_dissonance` (chapter 3), suspension preparation checks |
| Perfect intervals (0, 7 mod 12) | parallel and hidden-parallel rules (chapter 2) |
| Fourth above the actual bass | `vertical_dissonance`, with declared suspension and cadential 6/4 licenses (chapter 3) |

Continue with [Chapter 2 — Motion & Forbidden Parallels](/docs/counterpoint/motion).
