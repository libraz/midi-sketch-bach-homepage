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

Three interval qualities are banned as direct melodic motion in generated lines: augmented, diminished, and the tritone. They are exactly the leaps a Baroque singer would stumble over — the distances that do not fit the scale the ear is tracking.

::: info Augmented and diminished, in one line
An interval is **augmented** when it is one semitone wider than its perfect or major form, **diminished** when one semitone narrower ([legend](/docs/music-primer#interval-names-and-qualities)). An augmented second spans 3 semitones — the *same sound* as a harmless minor third, but spelled across adjacent letter names, so the ear hears a stretched, unsingable step rather than a leap.
:::

<CounterpointStaff example="melodicTritone" locale="en" />

<CounterpointStaff example="augmentedSecond" locale="en" />

The augmented second deserves its own example because it arises so naturally in minor keys: harmonic minor raises the seventh degree (the leading tone), leaving a three-semitone gap from the natural sixth. Bach's lines avoid it by choosing the melodic-minor forms on the way up and down; the candidate search reaches the same outcome because the validator rejects the interval.

::: info The three flavors of minor
A minor key has one chord vocabulary but three melodic spellings of its scale: **natural** minor (no raised notes), **harmonic** minor (7th degree raised a semitone — this manufactures the leading tone that cadences need), and **melodic** minor (6th *and* 7th raised on the way up, natural on the way down). The raised 7th of harmonic minor is what opens the augmented-second trap between degrees 6 and 7; the melodic form exists precisely to walk around it.
:::

That walk-around is not a theory abstraction — it is the first bar of the Fifth Cello Suite:

<CounterpointStaff example="bachMelodicMinor" locale="en" />

::: tip The applied-harmony exemption
Inside a declared secondary-dominant region (chapter 5), chromatic motion is the *point* — so `augmented_melodic`, `diminished_melodic`, and `tritone_melodic` are all exempt there. The borrowed leading tone gets to behave like a leading tone.
:::

::: info Where is the diminished seventh?
In MIDI, a diminished seventh (9 semitones — G♯ up to F in A minor) is byte-identical to a major sixth, a perfectly legal consonant leap, so `diminished_melodic` cannot and does not flag it. (Conveniently, Bach *uses* the d7 leap as an expressive device anyway.) The rule covers the spans that are unambiguous in semitones: 6 (the tritone / diminished fifth) and 11 (major seventh or diminished octave — unsingable under either name). The one case where spelling truly changes the verdict — the forbidden augmented second versus the harmless minor third, both 3 semitones — is resolved from the key: the leap is flagged when its two notes sit on *adjacent scale degrees*, which is how a "second" is recognized without letter names. (A 3-semitone leap touching a note foreign to the scale is flagged conservatively as well — though in practice such chromatic notes usually sit inside the secondary-dominant exemption.)
:::

Bach shows what that scope leaves open. The C♯ minor fugue's subject leaps a *written* diminished fourth — four semitones, the sound of a major third — and handles it with the care the rule is really about:

<CounterpointStaff example="bachLeapResolution" locale="en" />

## Leaps need recovery

Even consonant leaps are rationed. A **step** moves to the adjacent scale note; anything larger is a **leap** ([primer](/docs/music-primer#steps-and-leaps)). A leap spends melodic energy; stepwise motion in the opposite direction pays it back. Two large leaps back to back with no recovery make the line stop sounding like a voice:

<CounterpointStaff example="consecutiveLeaps" locale="en" />

<CounterpointStaff example="leapRecovery" locale="en" />

## Contour: one peak per phrase

<CounterpointStaff example="melodicArch" locale="en" />

No single rule enforces the arch — it emerges from the candidate search scoring, which rewards stepwise motion and chord-tone arrivals. But it is worth knowing the target shape when you read generated voices: a line that rises to one clear high point and settles is the engine behaving well.

Bach wrote the reference implementation. The subject of the "Little" G minor organ fugue spends its one leap immediately, touches its peak once, and walks the rest of the way home by step:

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
| `diminished_melodic` | MusicalFail | Flags 6- and 11-semitone leaps (diminished fifth; diminished octave / major seventh). The 9-semitone diminished seventh is indistinguishable from a major sixth and is not flagged. Exempt in secondary-dominant regions. |
| `tritone_melodic` | MusicalFail | No direct 6-semitone leaps. Exempt in secondary-dominant regions. |
| `consecutive_leaps` | MusicalFail | No two consecutive leaps of a fifth or more, regardless of direction. Cadence-cell notes exempt. |
| `leading_tone_resolution` | MusicalFail | A note marked as a leading tone must step up to the tonic pitch class in the same voice's next note. |
| `voice_range_integrity` | MusicalFail | Every note stays inside its voice's declared `[lo, hi]` MIDI range. |

Continue with [Chapter 5 — Tonal Grammar](/docs/counterpoint/tonality).
