---
title: Presets Reference
description: Complete reference tables for all forms, instruments, characters, scales, and keys in MIDI Sketch Bach.
---

# Presets Reference

Complete reference for all configurable presets in MIDI Sketch Bach.

::: info Reading these tables
`ID` and `String` are API values. **Voices**, **meter**, **raw natural bars**, **key**, and **character** are musical structure choices. If those terms are new, keep the [Music Primer for Engineers](/docs/music-primer) open while reading this page.
:::

## Forms Reference

### All 10 Forms

| ID | Name | String | Category | Default Instrument | Voices | Meter | Raw Natural Bars | Short Output Bars |
|----|------|--------|----------|--------------------|--------|-------|------------------|-------------------|
| 0 | Fugue | `"fugue"` | Organ | Organ | 3 | 4/4 | 42 | 44 |
| 1 | Prelude and Fugue | `"prelude_and_fugue"` | Organ | Organ | 3 | 4/4 | 24 | 24 |
| 2 | Trio Sonata | `"trio_sonata"` | Organ | Organ | 3 | 4/4 | 16 | 16 |
| 3 | Chorale Prelude | `"chorale_prelude"` | Organ | Organ | 3 | 4/4 | 16 | 16 |
| 4 | Toccata and Fugue | `"toccata_and_fugue"` | Organ | Organ | 3 | 4/4 | 32 | 32 |
| 5 | Passacaglia | `"passacaglia"` | Organ | Organ | 3 | 3/4 | 24 | 24 |
| 6 | Fantasia and Fugue | `"fantasia_and_fugue"` | Organ | Organ | 3 | 4/4 | 32 | 32 |
| 7 | Cello Prelude | `"cello_prelude"` | Solo | Cello | 1 | 4/4 | 8 | 8 |
| 8 | Chaconne | `"chaconne"` | Solo | Violin | 3 | 3/4 | 16 | 16 |
| 9 | Goldberg Variations | `"goldberg_variations"` | Variation | Harpsichord | 3 | 4/4 | 20 | 20 |

::: info Bar counts
"Raw Natural Bars" is the form's base length before snapping. `scale` multiplies that value (~1x/2x/3x/4x), then the result snaps to the form's bar grid. Fugue's raw 42 bars therefore produce 44 bars with `scale: "short"`. `targetBars: 0` uses `scale`; a positive `targetBars` overrides it. See [Option Relationships](/docs/option-relationships) for the accepted range and snapping caveat. Goldberg's `scale: "full"` is a special complete 128-bar layout rather than 20 × 4 = 80 bars.
:::

::: tip Natural bars are not seconds
A bar count is musical length, not wall-clock duration. Playback time also depends on `bpm` and meter. A 44-bar fugue at 80 BPM lasts longer than the same 44 bars at 140 BPM.
:::

### Form Selection Flowchart

![Pick the instrument first: organ opens onto seven forms, while solo cello, solo violin and harpsichord each lead to one; the chaconne has three declared lanes](/images/form-selection.svg)

::: info Organ System (Forms 0--6)
The seven organ forms cover the major genres of Bach's organ repertoire. All default to the `organ` instrument and use three voices.
:::

::: info Solo Instrument System (Forms 7--8)
The two solo forms generate music for unaccompanied string instruments. The cello prelude is a single continuous line. The chaconne preset declares three lanes: V0 carries the variation, V1 adds a middle line when clean register space is available, and V2 carries the low-register ground. V1 starts as a rest and may withdraw from individual bars or whole cycles where no clean placement exists. Historical chaconnes and passacaglias can transfer, vary, or ornament an ostinato instead of repeating identical pitch-duration events; the preset's immutable carrier is an engine constraint. [SFCM's discussion of ostinato forms](https://sfcm.edu/study/majors/academics/music-theory-and-musicianship/sfcm-theory/online-materials/analysis-lectures/ostinato-and-variation) describes the overlapping historical labels.
:::

::: info Variation System (Form 9)
The Goldberg Variations form uses an immutable bass event sequence as its engine carrier and defaults to harpsichord. With `scale: "full"` and no positive `targetBars`, it selects the complete compressed 128-bar layout rather than 20 × 4 = 80 bars; a positive `targetBars` overrides the scale. Historically, the variations preserve the Aria's fundamental-bass and harmonic scheme while the sounding bass can change; the API's event-level immutability is stricter. See the [Netherlands Bach Society's BWV 988 overview](https://www.bachvereniging.nl/en/bwv/bwv-988) and [Oxford Bibliographies' discussion of ostinato variation](https://academic.oup.com/reference/62400/reference-article-abstract/555408310).
:::

::: details BWV References by Form
| Form | Notable Bach Works |
|------|-------------------|
| Fugue | BWV 578 (G minor "Little" Fugue), BWV 542/2 |
| Prelude and Fugue | BWV 532, 541, 548, 846--893 (Well-Tempered Clavier) |
| Trio Sonata | BWV 525--530 (Six Trio Sonatas) |
| Chorale Prelude | BWV 599--644 (Orgelbüchlein), BWV 651--668 |
| Toccata and Fugue | [BWV 565 (D minor; traditionally attributed, authorship debated)](https://www.bachvereniging.nl/en/bwv/bwv-565), BWV 540 |
| Passacaglia | BWV 582 (C minor) |
| Fantasia and Fugue | BWV 537, 542 |
| Cello Prelude | BWV 1007--1012 (Cello Suites) |
| Chaconne | BWV 1004/5 (Partita No. 2 in D minor) |
| Goldberg Variations | BWV 988 |
:::

## Instruments Reference

| ID | Name | String | GM Program | Sound | Accepted by |
|----|------|--------|-----------|-------|-------------|
| 0 | Organ | `"organ"` | 19 | Church Organ | Organ forms (0--6) |
| 1 | Harpsichord | `"harpsichord"` | 6 | Harpsichord | Goldberg Variations (9) |
| 2 | Piano | `"piano"` | 0 | Acoustic Grand Piano | Goldberg Variations (9) |
| 3 | Violin | `"violin"` | 40 | Violin | Chaconne (8) |
| 4 | Cello | `"cello"` | 42 | Cello | Cello Prelude (7) |
| 5 | Guitar | `"guitar"` | 24 | Nylon Guitar | -- |

::: info Instrument does not decide the composition
The `instrument` selects MIDI sound, playable range, and ornament density. It does not change voice count, meter, form layout, or validator rules; those come from `form`.
:::

::: warning The form fixes the instrument
Every form except the Goldberg Variations accepts exactly one instrument — the one it was written for. Requesting another throws an incompatible-instrument error rather than transcribing the piece. The Goldberg Variations is the one form that offers a choice, between `harpsichord` and `piano`.
:::

## Subject Characters

| ID | Name | String | Effect |
|----|------|--------|--------|
| 0 | Severe | `"severe"` | Strict, intellectually rigorous (default) |
| 1 | Playful | `"playful"` | Light, agile, rhythmically lively |
| 2 | Noble | `"noble"` | Stately, broad, dignified |
| 3 | Restless | `"restless"` | Driving, chromatic, dramatically charged |

::: info
The character parameter affects the melodic profile of the fugue subject or primary thematic material. It has the most noticeable effect on fugal forms, where the subject defines the character of the entire piece. It also changes note articulation and the MIDI CC profile in every form. In `cello_prelude`, it orders the figure palette used for each bar. See [Instruments](/docs/physical-models) for the instrument-specific expression output. Two combinations are forbidden and throw: `chorale_prelude` rejects `playful`/`restless`, and `toccata_and_fugue` rejects `noble`.
:::

## Scale Modes

`scale` multiplies the form's natural length. `targetBars: 0` uses `scale`, while a positive `targetBars` overrides it. Goldberg's `scale: "full"` when no positive `targetBars` is supplied selects the complete compressed 128-bar layout.

| ID | Name | String | Approximate Length |
|----|------|--------|--------------------|
| 0 | Short | `"short"` | ~1x natural (default) |
| 1 | Medium | `"medium"` | ~2x natural |
| 2 | Long | `"long"` | ~3x natural |
| 3 | Full | `"full"` | ~4x natural; Goldberg uses its complete 128-bar layout |

::: tip
The actual output length depends on each form's natural length (see the Forms Reference table above): the same `scale` produces different bar counts for different forms because each scales from its own natural length. For `targetBars` semantics, accepted range, and output clamping, see [Option Relationships](/docs/option-relationships).
:::

## Key Reference

The key table lists the canonical API names and their pitch-class IDs. `key` accepts either the ID or the name.

| ID (pitch class) | Canonical API name |
|------------------|--------------------|
| 0 | `"C"` |
| 1 | `"C#"` |
| 2 | `"D"` |
| 3 | `"Eb"` |
| 4 | `"E"` |
| 5 | `"F"` |
| 6 | `"F#"` |
| 7 | `"G"` |
| 8 | `"Ab"` |
| 9 | `"A"` |
| 10 | `"Bb"` |
| 11 | `"B"` |

::: info Key names, spelling, and temperament
`key` chooses a pitch class and `isMinor` chooses major or minor. For example, `key: 2, isMinor: false` is D major; `key: 2, isMinor: true` is D minor. The API's 12 IDs use canonical key names and do not encode enharmonic spelling, historical temperament, or tuning. Period accounts of key character conflict and do not map cleanly onto this table; see [Mattheson's discussion of key character](https://revistas.usp.br/revistamusica/en/article/view/55111) and the [Library of Congress copy of the 1713 source](https://www.loc.gov/item/07013014/).
:::

All keys work with both `isMinor: false` (major) and `isMinor: true` (minor).

## Default Mapping

Cross-reference of form defaults (voices and meter are fixed by the form; BPM defaults to 100 unless you set it):

| Form | Instrument | Voices | Meter | Short Output Bars |
|------|-----------|--------|-------|-------------------|
| Fugue | Organ (0) | 3 | 4/4 | 44 |
| Prelude and Fugue | Organ (0) | 3 | 4/4 | 24 |
| Trio Sonata | Organ (0) | 3 | 4/4 | 16 |
| Chorale Prelude | Organ (0) | 3 | 4/4 | 16 |
| Toccata and Fugue | Organ (0) | 3 | 4/4 | 32 |
| Passacaglia | Organ (0) | 3 | 3/4 | 24 |
| Fantasia and Fugue | Organ (0) | 3 | 4/4 | 32 |
| Cello Prelude | Cello (4) | 1 | 4/4 | 8 |
| Chaconne | Violin (3) | 3 | 3/4 | 16 |
| Goldberg Variations | Harpsichord (1) | 3 | 4/4 | 20 |

## Programmatic Access

Use the preset enumeration functions to access these values at runtime:

```js
import {
  init,
  getForms,
  getInstruments,
  getCharacters,
  getDefaultInstrumentForForm,
  getKeys,
  getScales,
  getVersion
} from '@libraz/midi-sketch-bach'

await init()

// List all forms
const forms = getForms()
for (const form of forms) {
  console.log(`${form.id}: ${form.display ?? form.name}`)
}
// 0: Fugue
// 1: Prelude and Fugue
// 2: Trio Sonata
// 3: Chorale Prelude
// 4: Toccata and Fugue
// 5: Passacaglia
// 6: Fantasia and Fugue
// 7: Cello Prelude
// 8: Chaconne
// 9: Goldberg Variations

// List all instruments
const instruments = getInstruments()
// [{ id: 0, name: "organ" }, ...]

// List all keys
const keys = getKeys()
// [{ id: 0, name: "C" }, { id: 1, name: "C#" }, ...]

// Look up a form's default instrument ID
const celloPreludeInstrument = getDefaultInstrumentForForm(7)
// 4 (cello)
```

::: tip
These functions are useful for building UI components like dropdowns or form selectors. The demo on this site uses them to populate the form selection interface.
:::

`getDefaultInstrumentForForm(formId: number): number` accepts form IDs 0--9. Invalid or out-of-range values return `0` (organ).
