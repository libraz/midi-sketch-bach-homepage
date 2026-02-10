---
title: Forms
description: Detailed descriptions of all 9 musical forms available in MIDI Sketch Bach.
---

# Forms

MIDI Sketch Bach generates compositions in nine Baroque instrumental forms. Each form follows specific compositional rules and produces distinct musical structures.

## Organ System (Forms 0--6)

Seven forms covering the major genres of Bach's organ repertoire.

### 0. Fugue

A pure contrapuntal fugue -- the cornerstone of Baroque polyphony.

**Structure**: Opens with a single-voice subject statement, followed by the answer (typically at the fifth). Additional voices enter with the subject in turn (exposition). The middle section alternates episodes (free counterpoint) with subject entries in new keys. Culminates in stretto (overlapping entries) and a final statement in the home key.

- **Default instrument**: Organ
- **Default BPM**: 85
- **Default voices**: 4
- **Character**: Intellectual, architecturally rigorous

::: info Bach's Fugues
Bach's organ fugues (e.g., BWV 578 "Little" Fugue in G minor, BWV 542) are among the most celebrated works in the repertoire. The fugue is the most structured of all Baroque forms, with strict rules governing how voices enter and interact.
:::

```js
generator.generate({
  form: 'fugue',
  key: 7,        // G
  isMinor: true,
  numVoices: 4,
  character: 1
})
```

---

### 1. Prelude and Fugue

A flowing prelude paired with an elaborate fugue, following the model of Bach's Well-Tempered Clavier and organ preludes.

**Structure**: The prelude establishes the key through idiomatic keyboard figuration -- arpeggiated patterns, sequential passages, or motivic development. The fugue that follows is a complete contrapuntal work with exposition, episodes, and final entry.

- **Default instrument**: Organ
- **Default BPM**: 90
- **Default voices**: 4
- **Character**: Balanced, with a lyrical prelude and intellectual fugue

::: info Bach's Preludes and Fugues
The pairing of prelude and fugue is one of Bach's signature forms, represented in both the Well-Tempered Clavier (BWV 846--893) and the great organ preludes and fugues (BWV 532, 541, 548).
:::

```js
generator.generate({
  form: 'prelude-and-fugue',
  key: 0,        // C
  isMinor: false,
  numVoices: 4
})
```

---

### 2. Trio Sonata

A three-voice texture modeled on Bach's organ trio sonatas, where two upper voices interact over an independent bass line.

**Structure**: The two upper voices engage in imitative counterpoint, trading melodic ideas while maintaining independence. The bass voice (typically played on the organ pedals) provides a foundation with its own melodic character. Multiple movements may be generated depending on the scale setting.

- **Default instrument**: Organ
- **Default BPM**: 90
- **Default voices**: 3
- **Character**: Conversational, with two "treble" voices in dialogue

::: info Bach's Trio Sonatas
Bach's six organ trio sonatas (BWV 525--530) are among the most demanding works in the organ repertoire, requiring complete independence of both hands and feet. Each "voice" has its own manual or the pedals.
:::

```js
generator.generate({
  form: 'trio-sonata',
  key: 5,        // F
  isMinor: false,
  bpm: 90
})
```

---

### 3. Chorale Prelude

A setting of a hymn melody (chorale) with contrapuntal accompaniment.

**Structure**: A cantus firmus (the chorale melody) appears in one voice, typically the soprano, in long notes. The other voices weave around it with independent contrapuntal lines that embellish and harmonize the chorale. The result is a meditative, richly textured piece.

- **Default instrument**: Organ
- **Default BPM**: 72
- **Default voices**: 4
- **Character**: Devotional, meditative, richly layered

::: info Bach's Chorale Preludes
Bach composed over 150 chorale preludes throughout his career, from the Orgelbüchlein (BWV 599--644) to the "Leipzig" Chorales (BWV 651--668). The chorale prelude tradition was central to the Lutheran liturgy.
:::

```js
generator.generate({
  form: 'chorale-prelude',
  key: 9,        // A
  isMinor: false,
  numVoices: 4,
  bpm: 66
})
```

---

### 4. Toccata and Fugue

A dramatic two-part work combining a free-form toccata with a strict fugue.

**Structure**: The toccata section opens with virtuosic passages, dramatic scales, and sustained chords. It transitions into a fully developed fugue with subject entries in all voices, episodes, and a concluding climax.

- **Default instrument**: Organ
- **Default BPM**: 100
- **Default voices**: 4
- **Character**: Grand, dramatic, and virtuosic

::: info Bach's Toccatas and Fugues
The Toccata and Fugue in D minor (BWV 565) is perhaps Bach's most famous organ work. The toccata (from Italian "toccare" — to touch) showcases the player's virtuosity with free-flowing passage work before the structured fugue begins.
:::

```js
generator.generate({
  form: 'toccata-and-fugue',
  key: 2,        // D
  isMinor: true,
  numVoices: 4,
  bpm: 80
})
```

---

### 5. Passacaglia

A variation form built over a repeating bass theme (ostinato).

**Structure**: Opens with a bass theme statement, typically 4 or 8 bars long. Successive variations layer new melodic and rhythmic material over the repeating bass, growing in complexity. The texture thickens from a single voice to full polyphony. May conclude with a fugue based on the bass theme.

- **Default instrument**: Organ
- **Default BPM**: 76
- **Default voices**: 4
- **Character**: Building intensity, monumental

::: info Bach's Passacaglia
Bach's Passacaglia and Fugue in C minor (BWV 582) is a masterpiece of the variation form, building 20 variations over an 8-bar bass theme before culminating in a double fugue. The form originated in 17th-century Spain and Italy.
:::

```js
generator.generate({
  form: 'passacaglia',
  key: 0,        // C
  isMinor: true,
  numVoices: 4,
  scale: 'long'
})
```

---

### 6. Fantasia and Fugue

A pairing of a free-form fantasia with a structured fugue.

**Structure**: The fantasia section features improvisatory, rhapsodic writing — bold harmonic explorations, unexpected modulations, and dramatic gestures unconstrained by strict form. This leads into a fully developed fugue that provides contrapuntal rigor and formal closure.

- **Default instrument**: Organ
- **Default BPM**: 88
- **Default voices**: 4
- **Character**: Imaginative fantasia, disciplined fugue

::: info Bach's Fantasias and Fugues
Bach's organ fantasias and fugues (BWV 537, 542, 561) combine the improvisatory freedom of the fantasia — from the Italian "fantasia" (imagination) — with the intellectual discipline of the fugue. The Fantasia and Fugue in G minor (BWV 542) is considered one of the greatest organ works ever written.
:::

```js
generator.generate({
  form: 'fantasia-and-fugue',
  key: 7,        // G
  isMinor: true,
  numVoices: 4,
  bpm: 88
})
```

---

## Solo Instrument System (Forms 7--8)

Two forms for unaccompanied string instruments.

### 7. Cello Prelude

A flowing prelude for solo cello, modeled on the opening movements of Bach's Cello Suites.

**Structure**: Continuous, arpeggiated figuration that outlines harmonic progressions through a single melodic line. Multiple implied voices emerge from the cello's register shifts — bass notes, inner harmonies, and upper melodies interweave within a single instrument's capabilities.

- **Default instrument**: Cello
- **Default BPM**: 80
- **Default voices**: 3
- **Character**: Flowing, harmonically rich, meditative

::: info Bach's Cello Suites
The six Suites for Unaccompanied Cello (BWV 1007--1012) are cornerstones of the cello repertoire. Each suite opens with a prelude that establishes the key through arpeggiated patterns, creating the illusion of multiple voices on a single-line instrument.
:::

```js
generator.generate({
  form: 'cello-prelude',
  key: 7,        // G
  isMinor: false,
  instrument: 'cello'
})
```

---

### 8. Chaconne

A monumental variation form for solo violin, inspired by the Chaconne from Bach's Partita No. 2 in D minor.

**Structure**: Built over a repeating harmonic progression (typically 4 or 8 bars), the chaconne unfolds as a series of variations that explore every expressive possibility of the instrument. Multiple implied voices — chordal writing, arpeggiated passages, and single-line melodies — create a symphonic texture on a solo instrument.

- **Default instrument**: Violin
- **Default BPM**: 76
- **Default voices**: 3
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
| Quick generation | Fugue (compact with 3 voices) |
| Complex polyphony | Passacaglia, Fugue (4 voices) |
| Dramatic, virtuosic work | Toccata and Fugue, Fantasia and Fugue |

::: tip
See the [Presets Reference](/docs/presets) for complete default values and valid ranges for each form.
:::
