---
title: Forms
description: Detailed descriptions of all 10 musical forms available in MIDI Sketch Bach.
---

# Forms

MIDI Sketch Bach generates compositions in ten Baroque instrumental forms. Each form follows specific compositional rules and produces distinct musical structures.

::: info If the form names are unfamiliar
Read a form name as a **composition template**, not just a style label. The form decides the number of voices, the meter, the reference length, and which musical materials are fixed or generated. For vocabulary such as subject, ground bass, and cantus firmus, see the [Music Primer for Engineers](/docs/music-primer).
:::

::: info The form decides the voice count
Each form fixes its own number of voices, meter, and natural/reference length. The engine applies `scale` or `targetBars`, then snaps the result to the form's bar grid. A `targetBars` value of `0` uses `scale`; a positive value overrides it. Resolved output is clamped to the form's range up to 128 bars; see [Option Relationships](/docs/option-relationships) for the accepted range and snapping caveat. This makes the fugue's 42-bar reference resolve to 44 bars by default. There is no `numVoices` option — choose the form to choose the texture.
:::

::: info Character also shapes performance
`character` selects the melodic and figuration profile. Every form applies that profile to note articulation and the MIDI CC profile in the finished output. In `cello_prelude`, it also orders the figure palette used for each bar. See [Instruments](/docs/physical-models) for the instrument-specific expression output.
:::

| Form | Voices | Meter | Reference Length | Default Output | Default Instrument |
|------|--------|-------|------------------|----------------|--------------------|
| `fugue` | 3 | 4/4 | 42 bars | 44 bars | Organ |
| `prelude_and_fugue` | 3 | 4/4 | 24 bars | 24 bars | Organ |
| `trio_sonata` | 3 | 4/4 | 16 bars | 16 bars | Organ |
| `chorale_prelude` | 3 | 4/4 | 16 bars | 16 bars | Organ |
| `toccata_and_fugue` | 3 | 4/4 | 32 bars | 32 bars | Organ |
| `passacaglia` | 3 | 3/4 | 24 bars | 24 bars | Organ |
| `fantasia_and_fugue` | 3 | 4/4 | 32 bars | 32 bars | Organ |
| `cello_prelude` | 1 | 4/4 | 8 bars | 8 bars | Cello |
| `chaconne` | 3 | 3/4 | 16 bars | 16 bars | Violin |
| `goldberg_variations` | 3 | 4/4 | 20 bars | 20 bars | Harpsichord |

## Organ System (Forms 0--6)

Seven forms covering the major genres of Bach's organ repertoire.

### 0. Fugue

A pure contrapuntal fugue -- the cornerstone of Baroque polyphony.

**Structure**: Opens with a single-voice subject statement, followed by the answer (typically at the fifth). Additional voices enter with the subject in turn (exposition). In the standalone `fugue` form, each voice waits for its own thematic entry; development entries alternate with authored, motif-derived **Fortspinnung** episodes — short motifs spun into sequential continuations. The episodes thin to two voices before the final episode restores all three. See [Voice Architecture](/docs/voice-architecture) for the rest rotation and bass support. The form culminates in stretto (overlapping entries) and a final statement in the home key.

::: tip Reading the fugue description
The **subject** is the main theme. The **answer** is the same idea entering in another voice, usually shifted by a fifth. An **episode** is a freer connector between subject entries. **Stretto** means entries overlap before the previous one finishes.
:::

- **Default instrument**: Organ
- **Voices**: 3
- **Meter**: 4/4
- **Natural/reference length**: 42 bars
- **Default resolved output**: 44 bars
- **Character**: Intellectual, architecturally rigorous

::: info Bach's Fugues
Bach's organ fugues (e.g., BWV 578 "Little" Fugue in G minor, BWV 542) are among the most celebrated works in the repertoire. The fugue is the most structured of all Baroque forms, with strict rules governing how voices enter and interact.
:::

```js
generator.generate({
  form: 'fugue',
  key: 7,        // G
  isMinor: true,
  character: 'playful'
})
```

---

### 1. Prelude and Fugue

A flowing prelude paired with an elaborate fugue, following the model of Bach's Well-Tempered Clavier and organ preludes.

**Structure**: The prelude establishes the key through idiomatic keyboard figuration -- arpeggiated patterns, sequential passages, or motivic development. The fugue that follows is a complete contrapuntal work with exposition, episodes, and final entry.

- **Default instrument**: Organ
- **Voices**: 3
- **Meter**: 4/4
- **Natural length**: 24 bars
- **Character**: Balanced, with a flowing prelude and intellectual fugue

::: info Bach's Preludes and Fugues
The pairing of prelude and fugue is one of Bach's signature forms, represented in both the Well-Tempered Clavier (BWV 846--893) and the great organ preludes and fugues (BWV 532, 541, 548).
:::

```js
generator.generate({
  form: 'prelude_and_fugue',
  key: 0,        // C
  isMinor: false
})
```

---

### 2. Trio Sonata

A three-voice texture modeled on Bach's organ trio sonatas, where two upper voices interact over an independent bass line.

**Structure**: The two upper voices engage in imitative counterpoint, trading melodic ideas while maintaining independence. The bass voice (typically played on the organ pedals) provides a foundation with its own melodic character. A longer scale setting extends this continuous layout and its internal periods; it does not add separate movements.

- **Default instrument**: Organ
- **Voices**: 3
- **Meter**: 4/4
- **Natural length**: 16 bars
- **Character**: Conversational, with two "treble" voices in dialogue

::: info Bach's Trio Sonatas
Bach's six organ trio sonatas (BWV 525--530) are among the most demanding works in the organ repertoire, requiring complete independence of both hands and feet. Each "voice" has its own manual or the pedals.
:::

```js
generator.generate({
  form: 'trio_sonata',
  key: 5,        // F
  isMinor: false,
  bpm: 90
})
```

---

### 3. Chorale Prelude

A setting of a hymn melody (chorale) with contrapuntal accompaniment.

**Structure**: A cantus firmus (the chorale melody) appears in long notes. A running figuration voice moves above it while an independent bass supports it below.

::: info Cantus firmus
A **cantus firmus** is a fixed melody in long notes. The engine treats it as source material: supporting voices can be generated around it, but the fixed line itself is not freely rewritten.
:::

- **Default instrument**: Organ
- **Voices**: 3
- **Meter**: 4/4
- **Natural length**: 16 bars
- **Character**: Devotional, meditative; cantus firmus, figuration, and bass

::: warning Character restriction
`playful` and `restless` characters are rejected for the chorale prelude — generation throws. Use `severe` or `noble` for this devotional form.
:::

::: info Bach's Chorale Preludes
Bach composed over 150 chorale preludes throughout his career, from the Orgelbüchlein (BWV 599--644) to the "Leipzig" Chorales (BWV 651--668). The chorale prelude tradition was central to the Lutheran liturgy.
:::

```js
generator.generate({
  form: 'chorale_prelude',
  key: 9,        // A
  isMinor: false,
  character: 'noble',
  bpm: 66
})
```

---

### 4. Toccata and Fugue

A dramatic two-part work combining a free-form toccata with a strict fugue.

**Structure**: The toccata section opens with virtuosic passages, dramatic scales, and sustained chords. It transitions into a fully developed fugue with subject entries in all voices, episodes, and a concluding climax.

- **Default instrument**: Organ
- **Voices**: 3
- **Meter**: 4/4
- **Natural length**: 32 bars
- **Character**: Grand, dramatic, and virtuosic

::: warning Character restriction
The `noble` character is rejected for the toccata and fugue — generation throws. The form's virtuosic energy suits `severe`, `playful`, or `restless`.
:::

::: info Bach's Toccatas and Fugues
The Toccata and Fugue in D minor (BWV 565) is traditionally attributed to Bach, although its authorship has been debated. The toccata (from Italian "toccare" — to touch) showcases the player's virtuosity with free-flowing passage work before the structured fugue begins. See the [Netherlands Bach Society's BWV 565 notes](https://www.bachvereniging.nl/en/bwv/bwv-565).
:::

```js
generator.generate({
  form: 'toccata_and_fugue',
  key: 2,        // D
  isMinor: true,
  character: 'restless',
  bpm: 80
})
```

---

### 5. Passacaglia

A variation form built over a repeating bass theme (ostinato).

**Structure**: Historically, passacaglia and chaconne labels overlap, and recurring bass or harmonic frameworks can be revoiced and ornamented across variations ([SFCM's ostinato analysis](https://sfcm.edu/study/majors/academics/music-theory-and-musicianship/sfcm-theory/online-materials/analysis-lectures/ostinato-and-variation)). In this engine, the form opens with a bass carrier, then adds a principal variation line and a middle counterline over it. That carrier is deliberately immutable across the generated variations.

- **Default instrument**: Organ
- **Voices**: 3
- **Meter**: 3/4
- **Natural length**: 24 bars
- **Character**: Building intensity, monumental

::: info Bach's Passacaglia
Bach's Passacaglia and Fugue in C minor (BWV 582) is a masterpiece of the variation form, building 20 variations over an 8-bar bass theme before culminating in a double fugue. The form originated in 17th-century Spain and Italy.
:::

```js
generator.generate({
  form: 'passacaglia',
  key: 0,        // C
  isMinor: true,
  scale: 'long'
})
```

---

### 6. Fantasia and Fugue

A pairing of a free-form fantasia with a structured fugue.

**Structure**: The fantasia section features improvisatory, rhapsodic writing — bold harmonic explorations, unexpected modulations, and dramatic gestures unconstrained by strict form. This leads into a fully developed fugue that provides contrapuntal rigor and formal closure.

- **Default instrument**: Organ
- **Voices**: 3
- **Meter**: 4/4
- **Natural length**: 32 bars
- **Character**: Imaginative fantasia, disciplined fugue

::: info Bach's Fantasias and Fugues
Bach's organ fantasias and fugues (for example, BWV 537 and 542) combine the improvisatory freedom of the fantasia — from the Italian "fantasia" (imagination) — with the intellectual discipline of the fugue. The Fantasia and Fugue in G minor (BWV 542) is considered one of the greatest organ works ever written.
:::

```js
generator.generate({
  form: 'fantasia_and_fugue',
  key: 7,        // G
  isMinor: true,
  bpm: 88
})
```

---

## Solo Instrument System (Forms 7--8)

Two forms for unaccompanied string instruments.

### 7. Cello Prelude

A flowing prelude for solo cello, modeled on the opening movements of Bach's Cello Suites.

**Structure**: A single continuous line can outline harmonic progressions through broken chords and other figuration. Implied voices emerge from register shifts — bass notes, inner harmonies, and upper melodies interweave within one melodic line. The character orders the builder's figure palette for each bar, so its surface pattern changes while the voice count stays one.

- **Default instrument**: Cello
- **Voices**: 1
- **Meter**: 4/4
- **Natural length**: 8 bars
- **Character**: Flowing, harmonically rich, meditative

::: info Bach's Cello Suites
The six Suites for Unaccompanied Cello (BWV 1007--1012) are cornerstones of the cello repertoire, but their preludes use different textures. The First Suite opens with flowing broken-chord writing, while the Fifth Suite (BWV 1011) begins with a slow French-overture texture before its faster continuation. These idiomatic solo lines can imply several voices without all being arpeggiated; see the [Netherlands Bach Society's BWV 1011 notes](https://www.bachvereniging.nl/en/bwv/bwv-1011).
:::

```js
generator.generate({
  form: 'cello_prelude',
  key: 7,        // G
  isMinor: false,
  instrument: 'cello'
})
```

---

### 8. Chaconne

A monumental variation form for solo violin, inspired by the Chaconne from Bach's Partita No. 2 in D minor.

**Structure**: The engine declares three lanes for its repeating 3/4 cycle: V0 carries the variation, V1 is a middle line that realises the ground's implied harmony when clean register space is available, and V2 carries the ground. V1 starts as a rest and may withdraw from individual bars or whole cycles where no clean placement exists. Bach's BWV 1004 Chaconne realizes its recurring harmonic and bass framework through double stops, arpeggiated figuration, and implied voices, so the historical texture is richer than the engine's three-lane abstraction.

- **Default instrument**: Violin
- **Voices**: 3
- **Meter**: 3/4
- **Natural length**: 16 bars
- **Character**: Epic, intensely expressive, architecturally grand

::: info Bach's Chaconne
The Chaconne from Partita No. 2 in D minor (BWV 1004) is widely regarded as one of the greatest achievements in all of music. In approximately 15 minutes, Bach builds an entire world from a simple harmonic framework, exploring every register and technique available to the violin.
:::

```js
generator.generate({
  form: 'chaconne',
  key: 2,        // D
  isMinor: true,
  instrument: 'violin'
})
```

---

## Variation System (Form 9)

### 9. Goldberg Variations

A theme-and-variations cycle modeled on Bach's Goldberg Variations (BWV 988), with a repeated four-bar immutable carrier in the engine's abstraction.

**Structure**: Bach's Aria establishes a fundamental-bass and harmonic framework that the thirty variations preserve while changing surface notes, durations, and textures. Every third variation from 3 through 27 is a canon, progressing from unison through the ninth; Variation 30 is a Quodlibet rather than a tenth canon. The engine's default 20-bar layout contains five four-bar variation blocks; its immutable aria-bass carrier repeats on each four-bar block. `scale: "full"` when no positive `targetBars` is supplied selects the complete compressed Goldberg layout at 128 bars rather than a literal 20 × 4 = 80 bars; a positive `targetBars` overrides the scale. See the [Bach-Archiv Leipzig overview](https://www.bachmuseumleipzig.de/de/node/21950) and the [Netherlands Bach Society's BWV 988 notes](https://www.bachvereniging.nl/en/bwv/bwv-988).

- **Default instrument**: Harpsichord
- **Voices**: 3
- **Meter**: 4/4
- **Natural length**: 20 bars
- **Character**: Inventive, encyclopedic, architecturally unified

::: info Bach's Goldberg Variations
The Goldberg Variations (BWV 988) are a pinnacle of the variation form: an aria and thirty variations, with canons at every third variation from 3 through 27 and a Quodlibet at 30. The variations share the aria's fundamental-bass and harmonic framework, while their sounding bass lines and textures change.
:::

```js
generator.generate({
  form: 'goldberg_variations',
  key: 7,        // G
  isMinor: false,
  instrument: 'harpsichord'
})
```

---

## Form Selection by Use Case

| Use Case | Recommended Forms |
|----------|-------------------|
| Grand organ work | Toccata and Fugue, Fantasia and Fugue, Prelude and Fugue |
| Studying counterpoint | Fugue, Trio Sonata |
| Solo cello piece | Cello Prelude |
| Solo violin piece | Chaconne |
| Meditative/devotional | Chorale Prelude |
| Variation techniques | Passacaglia, Chaconne |
| Chamber ensemble texture | Trio Sonata |
| Theme and variations | Goldberg Variations |
| Complex polyphony | Fugue, Fantasia and Fugue |
| Dramatic, virtuosic work | Toccata and Fugue, Fantasia and Fugue |

::: tip
See the [Presets Reference](/docs/presets) for complete default values and valid ranges for each form.
:::
