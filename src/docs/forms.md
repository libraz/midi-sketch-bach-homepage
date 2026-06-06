---
title: Forms
description: Detailed descriptions of all 10 musical forms available in MIDI Sketch Bach.
---

# Forms

MIDI Sketch Bach generates compositions in ten Baroque instrumental forms. Each form follows specific compositional rules and produces distinct musical structures.

::: info If the form names are unfamiliar
Read a form name as a **composition template**, not just a style label. The form decides the number of voices, the meter, the default length, and which musical materials are fixed or generated. For vocabulary such as subject, ground bass, and cantus firmus, see the [Music Primer for Engineers](/docs/music-primer).
:::

::: info The form decides the voice count
Each form fixes its own number of voices, meter, and natural length. There is no `numVoices` option — choose the form to choose the texture. The `scale` and `targetBars` options stretch the length; the maximum for every form is 128 bars. See [Option Relationships](/docs/option-relationships) for details.
:::

| Form | Voices | Meter | Natural Length | Default Instrument |
|------|--------|-------|----------------|--------------------|
| `fugue` | 3 | 4/4 | 42 bars | Organ |
| `prelude_and_fugue` | 3 | 4/4 | 24 bars | Organ |
| `trio_sonata` | 3 | 4/4 | 16 bars | Organ |
| `chorale_prelude` | 2 | 4/4 | 16 bars | Organ |
| `toccata_and_fugue` | 3 | 4/4 | 32 bars | Organ |
| `passacaglia` | 2 | 3/4 | 24 bars | Organ |
| `fantasia_and_fugue` | 3 | 4/4 | 32 bars | Organ |
| `cello_prelude` | 1 | 4/4 | 8 bars | Cello |
| `chaconne` | 2 | 3/4 | 16 bars | Violin |
| `goldberg_variations` | 3 | 4/4 | 20 bars | Harpsichord |

## Organ System (Forms 0--6)

Seven forms covering the major genres of Bach's organ repertoire.

### 0. Fugue

A pure contrapuntal fugue -- the cornerstone of Baroque polyphony.

**Structure**: Opens with a single-voice subject statement, followed by the answer (typically at the fifth). Additional voices enter with the subject in turn (exposition). The middle section alternates episodes (free counterpoint) with subject entries in new keys. Culminates in stretto (overlapping entries) and a final statement in the home key.

::: tip Reading the fugue description
The **subject** is the main theme. The **answer** is the same idea entering in another voice, usually shifted by a fifth. An **episode** is a freer connector between subject entries. **Stretto** means entries overlap before the previous one finishes.
:::

- **Default instrument**: Organ
- **Voices**: 3
- **Meter**: 4/4
- **Natural length**: 42 bars
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

**Structure**: The two upper voices engage in imitative counterpoint, trading melodic ideas while maintaining independence. The bass voice (typically played on the organ pedals) provides a foundation with its own melodic character. Multiple movements may be generated depending on the scale setting.

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

**Structure**: A cantus firmus (the chorale melody) appears in one voice, typically the soprano, in long notes. The other voices weave around it with independent contrapuntal lines that embellish and harmonize the chorale. The result is a meditative, richly textured piece.

::: info Cantus firmus
A **cantus firmus** is a fixed melody in long notes. The engine treats it as source material: supporting voices can be generated around it, but the fixed line itself is not freely rewritten.
:::

- **Default instrument**: Organ
- **Voices**: 2
- **Meter**: 4/4
- **Natural length**: 16 bars
- **Character**: Devotional, meditative; cantus firmus plus one contrapuntal voice

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
The Toccata and Fugue in D minor (BWV 565) is perhaps Bach's most famous organ work. The toccata (from Italian "toccare" — to touch) showcases the player's virtuosity with free-flowing passage work before the structured fugue begins.
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

**Structure**: Opens with a bass theme statement. Successive variations layer new melodic and rhythmic material over the repeating ground bass, growing in complexity and building toward a climax near the end. The ground bass is immutable across all variations.

- **Default instrument**: Organ
- **Voices**: 2
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
Bach's organ fantasias and fugues (BWV 537, 542, 561) combine the improvisatory freedom of the fantasia — from the Italian "fantasia" (imagination) — with the intellectual discipline of the fugue. The Fantasia and Fugue in G minor (BWV 542) is considered one of the greatest organ works ever written.
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

**Structure**: A single continuous line of arpeggiated figuration that outlines harmonic progressions. Implied voices emerge from register shifts — bass notes, inner harmonies, and upper melodies interweave within one melodic line.

- **Default instrument**: Cello
- **Voices**: 1
- **Meter**: 4/4
- **Natural length**: 8 bars
- **Character**: Flowing, harmonically rich, meditative

::: info Bach's Cello Suites
The six Suites for Unaccompanied Cello (BWV 1007--1012) are cornerstones of the cello repertoire. Each suite opens with a prelude that establishes the key through arpeggiated patterns, creating the illusion of multiple voices on a single-line instrument.
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

**Structure**: Built over a repeating ground-bass harmonic cycle in 3/4, the chaconne unfolds as a series of variations that explore every expressive possibility of the instrument. The two-voice texture pairs the ground bass with an increasingly elaborate upper line.

- **Default instrument**: Violin
- **Voices**: 2
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

A theme-and-variations cycle modeled on Bach's Goldberg Variations (BWV 988), built over an immutable bass line.

**Structure**: An opening aria states the theme, followed by thirty variations over the same bass, including canons at progressively widening intervals. The bass line is fixed across the whole cycle while the upper voices are reinvented variation by variation.

- **Default instrument**: Harpsichord
- **Voices**: 3
- **Meter**: 4/4
- **Natural length**: 20 bars
- **Character**: Inventive, encyclopedic, architecturally unified

::: info Bach's Goldberg Variations
The Goldberg Variations (BWV 988) are a pinnacle of the variation form: an aria and thirty variations, with every third variation a canon at an interval one step wider than the last, all anchored to the aria's bass.
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
