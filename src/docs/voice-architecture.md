---
title: Voice Architecture
description: How MIDI Sketch Bach assigns voices - form-decided voice counts, voice intents, independence, and MIDI mapping.
---

# Voice Architecture

Each voice in a MIDI Sketch Bach composition is an independent melodic line. The **form decides how many voices there are** and what each one does; there is no voice-count option.

::: info What is a Voice?
In Baroque music, a "voice" is an independent melodic line — whether sung or played. A three-voice fugue has three simultaneous lines, each with its own rhythm, contour, and identity. In MIDI Sketch Bach, each voice becomes a separate MIDI track.
:::

::: tip Track is the export container; voice is the musical role
The MIDI file uses tracks because DAWs understand tracks. The composition engine uses voices because counterpoint rules care about independent musical lines. Usually one voice maps to one track.
:::

## The Form Decides the Voice Count

Voice count is fixed per form. Picking the form picks the texture:

| Form | Voices |
|------|--------|
| `fugue`, `prelude_and_fugue`, `trio_sonata`, `toccata_and_fugue`, `fantasia_and_fugue`, `goldberg_variations` | 3 |
| `chorale_prelude`, `passacaglia`, `chaconne` | 2 |
| `cello_prelude` | 1 |

Passing `numVoices`/`num_voices` is accepted and ignored for backward compatibility. See [Forms](/docs/forms) for the full table including meter and natural length.

## Voice Intents

The form director assigns each voice a **voice intent** over the bar spans of the piece — the role that voice plays at each point. The engine defines 30 named intents (`voice_intent.h`); they group into a handful of families:

| Family | Representative intents | Role |
|--------|------------------------|------|
| Fugal entries | `SubjectCarrier`, `AnswerCarrier`, `CountersubjectCarrier` | Fugue theme entries (tonic), their answers (dominant), and the recurring companion line |
| Development | `MiddleEntryCarrier`, `StrettoCarrier`, `PedalCarrier`, `CodaCarrier` | Related-key entries, overlapping entries, pedal points, closing material |
| Episodes | `Episode`, `FortspinnungSpan` | Sequential travel material derived from subject motifs |
| Fixed lines | `GroundCarrier`, `PassacagliaGround`, `CantusFirmusCarrier` | Immutable repeating basses and chorale melodies |
| Figural | `FigurationCarrier`, `ArpeggioFlow`, `ToccataCarrier`, `FantasiaCarrier` | Continuous idiomatic figuration and sectional solo writing |
| Variation | `VariationCarrier` and role-specific variants | Reinvented upper material over a fixed bass |
| Texture | `RhythmCarrier`, `NctCarrier`, free counterpoint | Anacrusis/hemiola rhythm shapes, declared non-chord-tone figures, and accompaniment selected by the candidate search |

Material-bearing intents (subjects, grounds, cantus firmus) are fixed; the remaining lines are filled in by the [candidate search](/docs/generation-pipeline#step-3-candidate-search).

::: info Subject, answer, ground, cantus firmus
A **subject** is the main fugue theme. An **answer** is that theme restated in another voice, usually shifted toward the dominant. A **ground bass** is a repeating low pattern. A **cantus firmus** is a fixed long-note melody.
:::

## Voice Independence

Maintaining independence between voices is a core principle of Baroque counterpoint. The engine sustains it through:

### Rhythmic Differentiation

Voices use complementary rhythmic patterns so they do not move in lockstep — when one voice sustains, another tends to be active. This complementarity is a hallmark of Bach's writing.

### Melodic Differentiation

Each voice has its own intervallic profile and directional tendencies, and develops its thematic material independently.

### Register Differentiation

Voices keep to distinct registers. Voice crossing is minimized; when voices approach each other, they tend to move apart. The candidate search anchors each beat to chord tones, keeping the harmony clear while voices stay independent.

::: info Register and voice crossing
**Register** means pitch range: bass is low, soprano-like writing is high. **Voice crossing** happens when a lower voice moves above a higher voice, or a higher voice moves below a lower one. That makes the streams harder to follow.
:::

## Voice-to-Track Mapping

Each voice maps to a separate MIDI track with its own channel and program:

```js
const events = generator.getEvents()

for (const track of events.tracks) {
  console.log(`Voice: ${track.name}`)      // track name
  console.log(`Channel: ${track.channel}`)  // MIDI channel (0-15)
  console.log(`Program: ${track.program}`)  // GM program number
  console.log(`Notes: ${track.note_count}`) // number of notes
}
```

Every note also carries a `source` provenance tag (`"material"`, `"compose"`, or `"ornament"`) — see the [JavaScript API](/docs/api-js#eventdata).

### General MIDI Program Mapping

| Instrument | GM Program | Sound |
|------------|-----------|-------|
| Organ | 19 | Church Organ |
| Harpsichord | 6 | Harpsichord |
| Piano | 0 | Acoustic Grand Piano |
| Violin | 40 | Violin |
| Cello | 42 | Cello |
| Guitar | 24 | Acoustic Guitar (Nylon) |

The output is a Type 1 Standard MIDI File with one track per voice, so you can reassign instruments per voice in your DAW.
