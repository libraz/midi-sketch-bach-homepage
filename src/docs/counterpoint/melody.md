---
title: "Counterpoint 4: Melodic Writing"
description: Each generated voice judged as a line — forbidden leaps, leap recovery, contour, and the leading tone's obligation.
---

# 4. Melodic Writing

A note can be vertically legal and still wreck the piece. Counterpoint demands that every voice, read alone, remain a plausible melody — historically, a *singable* one. The validator therefore checks melodic intervals inside each voice, not only vertical sonorities between voices.

::: info Vertical interval vs melodic interval
A **vertical interval** compares two voices at the same time. A **melodic interval** compares one voice against its own next note. The validator checks both dimensions; this chapter is about the second.
:::

## Forbidden leaps

The engine conservatively bans three interval categories as direct melodic motion in generated lines: augmented, diminished, and tritone spans. Historical acceptability depends on interval spelling, scale context, and musical setting.

::: info Augmented and diminished, in one line
An interval is **augmented** when it is one semitone wider than its perfect or major form. It is **diminished** when it is one semitone narrower than its perfect form or, for a major/minor interval, one semitone narrower than its minor form ([legend](/docs/music-primer#interval-names-and-qualities)). An augmented second spans 3 semitones; in 12-tone equal temperament that is the same semitone distance as a minor third, while the letter spelling and tonal context determine the written interval and its treatment.
:::

<CounterpointStaff example="melodicTritone" locale="en" />

<CounterpointStaff example="augmentedSecond" locale="en" />

The augmented second deserves its own example because it arises so naturally in minor keys: harmonic minor raises the seventh degree (the leading tone), leaving a three-semitone gap from the natural sixth. In historical tonal writing, however, scale-degree alterations follow harmony and voice leading; raised sixths and sevenths can occur in either direction. The familiar ascending/descending melodic-minor pattern is a useful teaching model, not a rule Bach applies mechanically. MIDI Sketch Bach's form builders choose carrier material for this interval check, and the validator rejects a forbidden leap if one reaches the final score. See the [common-practice scale overview](https://open.lib.umn.edu/musiccomposition/chapter/common-practice-era-scales-intervals-and-chord-functions/).

::: info The three flavors of minor
A minor key has one chord vocabulary but three useful textbook spellings of its scale: **natural** minor (no raised notes), **harmonic** minor (7th degree raised a semitone to supply a leading tone), and **melodic** minor (often described as 6th *and* 7th raised on the way up and natural on the way down). These labels describe common patterns rather than three exclusive scales: Bach and other composers alter degrees 6 and 7 in either direction when the harmony or voice leading calls for it. The raised 7th of harmonic minor opens the augmented-second gap between degrees 6 and 7; the melodic form is one way to avoid that gap.
:::

That walk-around is not a theory abstraction — it is the first bar of the Fifth Cello Suite:

<CounterpointStaff example="bachMelodicMinor" locale="en" />

This Fifth Suite excerpt is one ascending realization of that pattern, not a general rule for every Bach descent. Bach also uses chromatic inflection inside a subject:

<CounterpointStaff example="bachChromaticSubject" locale="en" />

::: tip The applied-harmony exemption
Inside a declared secondary-dominant region (chapter 5), chromatic motion is the *point* — so `augmented_melodic`, `diminished_melodic`, and `tritone_melodic` are all exempt there. The borrowed leading tone gets to behave like a leading tone.
:::

::: info Where is the diminished seventh?
MIDI records semitone distance, not letter spelling. A diminished seventh (9 semitones — G♯ up to F in A minor) therefore cannot be distinguished from a major sixth by this data, so `diminished_melodic` cannot and does not flag that spelling. The validator treats 6- and 11-semitone melodic spans conservatively in its melodic rules; a semitone count alone does not determine one written interval, and chromatic context can change the musical interpretation. For the 3-semitone A2/m3 cases, the engine uses the key: it flags the leap when the endpoints occupy *adjacent scale degrees* and treats a span touching a foreign note conservatively. Secondary-dominant regions remain exempt.
:::

Bach shows what that scope leaves open. The C♯ minor fugue's subject leaps a *written* diminished fourth — four semitones, the same equal-tempered semitone span as a major third — and handles it with the care the rule is really about:

<CounterpointStaff example="bachLeapResolution" locale="en" />

## Leaps need recovery

Even consonant leaps are rationed. A **step** moves to the adjacent scale note; anything larger is a **leap** ([primer](/docs/music-primer#steps-and-leaps)). A leap spends melodic energy; stepwise motion in the opposite direction pays it back. Two large leaps back to back with no recovery make the line stop sounding like a voice:

<CounterpointStaff example="consecutiveLeaps" locale="en" />

<CounterpointStaff example="leapRecovery" locale="en" />

## Contour: one peak per phrase

<CounterpointStaff example="melodicArch" locale="en" />

No single rule enforces the arch. In the default path, the contour comes from the line authored by the form builder and replayed by its carrier. Scored search is not responsible for default melodic shape; it is available only for the opt-in Passacaglia counterline. The arch is still useful when reading a generated voice: a line that rises to one clear high point and settles has a coherent phrase shape.

The opening subject of Bach's "Little" Fugue in G minor (BWV 578) shows a compact arch with an early high point and a return toward its opening register:

<CounterpointStaff example="bachArch" locale="en" />

## The leading tone's obligation

The seventh [scale degree](/docs/music-primer#scale-degrees) — one semitone below the tonic — is called the **leading tone** because it leads. Once a voice sounds it in a dominant context, the listener expects the tonic next. Material can mark a note as a leading tone, and the validator holds the voice to the promise:

<CounterpointStaff example="leadingTone" locale="en" />

## Range integrity

Each voice also declares a playable range in its texture plan (soprano, alto, tenor, bass — or manual and pedal compass for organ writing). Any note outside the inclusive MIDI bounds fails `voice_range_integrity`. This is less a stylistic rule than a physical one; it pairs with the instrument-specific ranges described in [Instruments](/docs/physical-models).

<CounterpointStaff example="voiceRange" locale="en" />

## How the validator sees this chapter

| Rule | FailKind | Check |
|------|----------|-------|
| `augmented_melodic` | MusicalFail | Flags 6-semitone leaps, and 3-semitone leaps whose endpoints sit on adjacent scale degrees or off the scale (the augmented second; spelling reconstructed from the key). Exempt in secondary-dominant regions. |
| `diminished_melodic` | MusicalFail | Conservatively flags 6- and 11-semitone melodic spans (possible spellings include A4/d5 and M7/d8). The 9-semitone diminished seventh/major sixth span is indistinguishable in MIDI and is not flagged. Exempt in secondary-dominant regions. |
| `tritone_melodic` | MusicalFail | No direct 6-semitone leaps. Exempt in secondary-dominant regions. |
| `consecutive_leaps` | MusicalFail | No two consecutive leaps of a fifth or more, regardless of direction. Cadence-cell notes exempt. |
| `leading_tone_resolution` | MusicalFail | A note marked as a leading tone must step up to the tonic pitch class in the same voice's next note. |
| `voice_range_integrity` | MusicalFail | Every note stays inside its voice's declared `[lo, hi]` MIDI range. |

Continue with [Chapter 5 — Tonal Grammar](/docs/counterpoint/tonality).
