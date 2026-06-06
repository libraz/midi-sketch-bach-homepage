---
title: Music Primer for Engineers
description: Minimal music vocabulary needed to read the MIDI Sketch Bach documentation - notation, beats, intervals, and keys.
---

# Music Primer for Engineers

This page defines the music terms used throughout the documentation. It assumes you can read code and data structures, but not necessarily staff notation.

::: tip How to read this page
Think of a composition as several time-aligned streams. A **voice** is one stream of notes. A **chord** is the vertical snapshot made when several streams sound together. Most counterpoint rules ask whether the streams stay independent while the vertical snapshots remain stable.
:::

## Mental Model

| Music term | Engineering analogy | Where it appears |
|------------|---------------------|------------------|
| Voice | A time-ordered stream | One MIDI track in `events.tracks` |
| Bar | A fixed-size time window | `total_bars`, `targetBars` |
| Beat | A smaller clock tick inside a bar | Validator checks strong and weak positions |
| Strong beat | The window boundary — checked strictly | `strong_beat_dissonance`, `vertical_dissonance` |
| Chord | A vertical state at a time point | Harmonic plan and chord-tone checks |
| Form | A template or state machine | `form`, voice count, meter, natural length |
| Material | Immutable or semi-fixed source data | `source: "material"` |
| Ornament | A post-processing decoration | `source: "ornament"` |

::: info The validator's basic question
For most local rules, the validator asks three things: which voices are sounding, what interval or chord they create, and whether that situation is allowed at this beat. The staff examples in the course visualize exactly that.
:::

## Reading the Staff Figures

Every figure in the course is a small two-stave score. You do not need fluent notation reading — five conventions cover everything:

1. **Vertical position is pitch.** Higher on the staff means higher pitch. The upper staff is the higher voice, the lower staff the lower voice.
2. **Left to right is time.** Notes aligned vertically sound at the same moment — that vertical pair is what "interval" rules inspect.
3. **The note shape is the duration.** A hollow head with no stem is a whole note; hollow with a stem is a half note; filled is a quarter; filled with a flag or beam is an eighth.
4. **Symbols before a note bend its pitch.** A sharp (♯) raises the note one semitone, a flat (♭) lowers it one, a natural (♮) cancels a previous alteration.
5. **Colors and marks are analysis, not music.** Red marks a violation, amber a scoped or conditional sonority, green a correct resolution. Rings, boxes, arrows, and brackets show where the validator is looking.

| Duration | Beats (in 4/4) | In event JSON |
|----------|----------------|---------------|
| Whole note | 4 | `duration: 1920` |
| Half note | 2 | `duration: 960` |
| Quarter note | 1 | `duration: 480` |
| Eighth note | 1/2 | `duration: 240` |

A **tie** is a curved line joining two notes of the same pitch: they sound as one continuous note held across the boundary. Suspensions (course chapter 3) depend on this — a note is *held over* while the harmony changes underneath it.

## Notes, Beats, and Bars

A **note** has a pitch and a duration. In MIDI Sketch Bach event JSON, this becomes a `pitch`, a `start_tick`, and a `duration`.

A **beat** is the regular pulse inside the music. A **bar** or **measure** groups beats into a repeated pattern. The **time signature** says how: `4/4` means four quarter-note beats per bar; `3/4` means three quarter-note beats per bar. The engine clocks one quarter-note beat at 480 ticks, so a 4/4 bar is 1920 ticks and a 3/4 bar is 1440.

## Strong and Weak Beats

Beats inside a bar are not equal. The first beat of each bar — the **downbeat** — feels structurally stronger than the rest: listeners hear it as a checkpoint where the harmony should be stable. Play this and count along:

<CounterpointStaff example="beatHierarchy" locale="en" />

The validator's model is deliberately binary, and it is one line of arithmetic:

```cpp
// rule_helpers.cpp — the predicate every strong-beat rule consults
bool isStrongBeat(Tick tick, Tick ticks_per_bar) {
  return (tick % ticks_per_bar) == 0;
}
```

A tick at the start of a bar is **strong**; every other position — beats 2, 3, 4 and everything between beats — is **weak**. (Performers feel a finer hierarchy, such as a secondary accent on beat 3 in 4/4, but the validator does not need it.)

Why the rules care:

- **Strong beats demand stability.** Generated notes on a downbeat must belong to the active chord, and simultaneous voice pairs there must form consonant intervals (chapter 3).
- **Weak beats tolerate passing tension.** A dissonance between two downbeats can be heard as motion from one stable point to the next — that is what passing and neighbor tones are.
- **Some rules only fire on strong beats.** `fourth_only_on_weak_beat` and `invertible_at_octave` check the checkpoint and ignore the corridor between them.

## Voice

A **voice** is an independent melodic line, whether it is sung or played by an instrument. A three-voice fugue has three simultaneous lines. In MIDI Sketch Bach, each voice is exported as a separate MIDI track.

::: info Voice is not the same as instrument
An organ can play three voices at once. A solo cello can imply multiple voices by jumping between low and high registers. The documentation uses **voice** for the musical line, and **instrument** for the playback sound.
:::

The course also speaks of **upper voices** and **outer voices**. The lowest voice is the **bass**; everything above it is an upper voice. The **outer voices** are the highest and lowest lines — the ones listeners track most easily, which is why cadence rules inspect them specifically.

## Pitch, Key, and Scale

A **pitch** is the height of a note, such as C, D, or E. The smallest distance between two pitches is a **semitone** — one MIDI number; two semitones make a **whole tone**. An **octave** is 12 semitones, and notes an octave apart share a letter name. `pitch % 12` gives the **pitch class** — the letter identity with the octave stripped — and many validator checks work on pitch classes.

A **key** is the tonal center: C major means C feels like home; D minor means D feels like home in a minor mode.

A key name has two parts: the tonic pitch class and the **mode** — **major** or **minor**. The mode is the pattern of whole tones (W) and semitones (H) the scale climbs from the tonic. Play the major version and watch where the two semitones fall:

<CounterpointStaff example="majorScaleSteps" locale="en" />

The minor mode rearranges the same seven steps into a different pattern:

```
major  W W H W W W H  →  C major:  C D E F G A B
minor  W H W W H W W  →  A minor:  A B C D E F G
```

That step pattern is the entire structural difference, yet major keys read as bright and grounded while minor keys read as darker and more tense. Hear it directly — the same scale on the same tonic, major first, then minor:

<CounterpointStaff example="majorVsMinor" locale="en" />

C major and A minor in the pattern table share all seven notes and differ only in which one is home — such pairs are called **relative keys** (they return in chapter 6, where fugues modulate to them). Any of the 12 pitch classes can be the tonic, and each supports both modes, so there are 24 keys in total; MIDI Sketch Bach generates in all of them (`key` plus `isMinor` in the JS API, `c_major` / `d_minor` style values in the CLI). On a printed staff, the key is announced by the **key signature** — the sharps or flats stacked at the start of each line so they need not be repeated on every note.

In practice the minor mode is not one fixed scale: counterpoint routinely raises its 7th degree to manufacture a leading tone (**harmonic minor**), and melodies raise degrees 6 and 7 when ascending and revert them when descending (**melodic minor**). Chapter 4 of the course shows what the validator does with this.

A **scale** is the ordered set of pitches used around that center — the two patterns above are the Baroque defaults. One API caveat: in MIDI Sketch Bach, `scale` means the length multiplier (`short`, `medium`, `long`, `full`), not a musical scale. The musical key is selected by `key`.

## Scale Degrees

Positions in the scale are numbered from the tonic — a 1-based index into the scale array. Each degree has a name, and two of them carry obligations the validator enforces:

| Degree | Name | In C major | Role |
|--------|------|------------|------|
| 1 | Tonic | C | Home — phrases want to end here. |
| 2 | Supertonic | D | |
| 3 | Mediant | E | |
| 4 | Subdominant | F | Bass of the plagal cadence. |
| 5 | Dominant | G | The strongest pull back to the tonic; cadences run V → I. |
| 6 | Submediant | A | The deceptive cadence lands here. |
| 7 | Leading tone | B | One semitone below the tonic — obligated to resolve up to it. |

Roman numerals (**I**, **IV**, **V**, **vi**...) name the *chords built on* these degrees: in C major, **V** is the chord G-B-D rooted on degree 5. Uppercase numerals are major chords, lowercase minor.

## Chord and Harmony

A **chord** is a group of notes understood as one vertical sonority. A C major triad contains C, E, and G — its **root**, **third**, and **fifth**. **Harmony** is the sequence of chords over time.

::: info Chord tone and non-chord tone
A **chord tone** belongs to the active chord. In C major, C, E, and G are chord tones. A **non-chord tone** does not belong to the chord; it can still be valid when it behaves as a passing tone, suspension, or other controlled tension.
:::

## Interval and Degree

An **interval** is the distance between two notes. The documentation often means a vertical interval: the distance between two voices sounding at the same time.

The word **degree** in "5th" or "8th" means counted scale-letter positions, not semitones. C to G is a fifth because counting C-D-E-F-G gives five letters. C to the next C is an octave or eighth because counting C-D-E-F-G-A-B-C gives eight letters. (Do not confuse this with *scale degrees* above: an interval number counts the span between two notes; a scale degree numbers one note's position in the key.)

::: tip Why fifths and octaves matter
Fifths and octaves sound especially fused. If two voices move in parallel fifths or octaves, they can stop sounding like independent lines. That is why the validator treats parallel perfect intervals as a structural problem.
:::

## Interval Names and Qualities

The labels in the staff figures use standard shorthand: a quality letter plus the degree number — `P5`, `M3`, `m10`, `A4`. The degree number counts letters (previous section); the quality letter pins down the exact semitone count:

| Letter | Quality | Applies to | Example |
|--------|---------|------------|---------|
| P | Perfect | unison, 4th, 5th, octave | P5 = 7 semitones |
| M | Major | 2nd, 3rd, 6th, 7th | M3 = 4 semitones |
| m | Minor | one semitone narrower than major | m3 = 3 semitones |
| A | Augmented | one semitone wider than perfect/major | A4 = 6 semitones |
| d | Diminished | one semitone narrower than perfect/minor | d5 = 6 semitones |

The full lookup for one octave:

```
semitones  0   1   2   3   4   5   6      7   8   9   10  11  12
name       P1  m2  M2  m3  M3  P4  A4/d5  P5  m6  M6  m7  M7  P8
```

Four things worth noticing:

- **P1 (unison)** is two voices on the same pitch — distance zero.
- **6 semitones** has two spellings, `A4` and `d5`. Either way it is the **tritone** — three whole tones, the F-to-B distance, the one interval that is dissonant no matter how you name it.
- **Other counts are ambiguous too**: 9 semitones is usually a major sixth but can be spelled as a diminished seventh (`d7`); 3 is a minor third or an augmented second (`A2`). MIDI cannot tell spellings apart. In the one case where the difference changes a verdict — `A2` is a forbidden melodic leap, `m3` is fine — the validator reconstructs the spelling from the key's scale degrees (course chapter 4).
- **Compound intervals add 12**: `M10` = `M3` + octave (16 semitones). The validator classifies intervals mod 12, so a tenth behaves like a third.

## Steps and Leaps

A melodic interval — one voice moving to its own next note — is either a **step** or a **leap**. A step moves to the adjacent scale note (1–2 semitones); anything larger is a leap.

<CounterpointStaff example="stepsAndLeaps" locale="en" />

The distinction does real work in the rules: dissonant non-chord tones must be approached *and* left by step (chapter 3), and consecutive large leaps are rejected because the line stops sounding like a singable voice (chapter 4).

## Consonance and Dissonance

A **consonance** is a stable-sounding interval or chord. A **dissonance** is a tense interval or chord that usually needs placement and resolution.

In this documentation, dissonance is not "bad sound." It is controlled tension. The validator rejects dissonance when it appears in the wrong metric position, lacks preparation, or fails to resolve.

## Motion

When two voices move from one note to the next, their relationship is called **motion**.

| Term | Meaning |
|------|---------|
| Parallel motion | Both voices move in the same direction by the same interval type. |
| Similar motion | Both voices move in the same direction, but not necessarily by the same size. |
| Contrary motion | The voices move in opposite directions. |
| Oblique motion | One voice holds while another moves. |

::: tip Motion is about pairs of time steps
A single vertical fifth is not automatically a problem. A parallel fifth needs two snapshots: the previous interval and the current interval are both fifths, and both voices moved in the same direction.
:::

## Cadence

A **cadence** is a phrase ending. In tonal music, the strongest common ending moves from **V** to **I**: dominant to tonic.

::: info What are I and V?
Roman numerals name chords by their position in the key. In C major, **I** is the tonic chord C-E-G. **V** is the dominant chord G-B-D. A V-to-I cadence is roughly "away from home, then home."
:::

## Diatonic and Chromatic

A note is **diatonic** when it belongs to the current key's scale, and **chromatic** when it has been altered with a sharp or flat from outside the scale. Baroque counterpoint is mostly diatonic; chromatic notes are allowed where a device licenses them — secondary dominants borrow a chromatic leading tone, and the minor mode raises its seventh degree. Unlicensed chromatic contradictions between voices are rejected as cross relations (chapter 5).

## Fugue Terms

A **fugue** is a form built from a main theme that enters in different voices.

| Term | Meaning |
|------|---------|
| Subject | The main theme of a fugue. |
| Answer | The subject restated in another voice, usually shifted toward the dominant. |
| Countersubject | A recurring line that accompanies the subject. |
| Episode | A freer passage between subject entries. |
| Stretto | Overlapping subject entries before the previous entry has finished. |

## Fixed Material

Some forms contain material the engine treats as fixed.

| Term | Meaning |
|------|---------|
| Ground bass | A repeating bass pattern used as the foundation of variations. |
| Cantus firmus | A fixed long-note melody, often a chorale tune. |
| Pedal point | A held or repeated bass note while harmony changes above it. |

These fixed lines are marked as `"material"` in event data. Generated supporting notes are marked as `"compose"`, and decorative added notes are marked as `"ornament"`.

## Where to Go Next

This page is chapter 0 of the [Counterpoint Course](/docs/counterpoint) — the natural continuation is [Chapter 1: Intervals & Consonance](/docs/counterpoint/intervals).

For the engine side instead:

1. [Features](/docs/features) for what the generator can produce.
2. [Forms](/docs/forms) to choose a composition template.
3. [Voice Architecture](/docs/voice-architecture) to see how voices become MIDI tracks.
4. [Generation Pipeline](/docs/generation-pipeline) to connect the musical terms to the engine stages.
