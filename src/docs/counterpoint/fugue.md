---
title: "Counterpoint 6: Fugal Devices"
description: Subject and answer, countersubject continuity, episodes and sequences, imitation, stretto, and pedal points — as validated contracts.
---

# 6. Fugal Devices

A fugue is not a form like a sonata — it is a *procedure*: one theme (the subject) enters voice by voice, travels through related keys, and returns intensified. Every device in that procedure is a contract between declared material and emitted notes, and the validator checks each one. These rules sit above the local interval rules from chapters 2–3, which keep applying throughout.

::: info The fugue procedure at a glance
**Exposition**: each voice enters in turn with the subject or its answer; a countersubject may accompany those entries. **Episodes**: passages often use sequences or subject-related ideas to travel between keys, but their material can vary. **Development**: middle entries restate the subject in related keys; stretto and pedal points raise the temperature toward the close.
:::

These labels describe common procedures rather than universal requirements; see [Open Music Theory's exposition overview](https://viva.pressbooks.pub/openmusictheorycopy/chapter/high-baroque-fugal-exposition/) and [Puget Sound's fugue analysis guide](https://musictheory.pugetsound.edu/mt21c/FugueAnalysis.html).

## Subject and answer

When the second voice enters, it usually carries the subject toward the dominant — the **answer**. A literal transposition is a *real answer*; the exact interval can be a fifth up or a fourth down, depending on the entering voice. A **tonal answer** makes small intervallic adjustments where a literal transposition would destabilize the tonal center. The adjustments depend on the subject and its context; they are not limited to an I↔V head followed by an untouched tail.

<CounterpointStaff example="realVsTonalAnswer" locale="en" />

`tonal_answer_dominant_mapping` is a narrower engine contract. When material declares a tonal answer, it checks the subject's opening pitch class for the I↔V mapping; subjects that open on neither tonic nor dominant pass that particular check without requiring a mapping. The contract does not claim that every historical tonal answer uses only this head adjustment.

Here is the textbook case in Bach's own hand — the opening of the C minor fugue from WTC I. Play the two lines in turn and listen for the single bent note:

<CounterpointStaff example="bachTonalAnswer" locale="en" />

A contrasting real answer appears in Bach’s G-minor “Little” Fugue (BWV 578): the displayed alto entry is a literal transposition of the quoted soprano opening, a perfect fourth below. It needs no tonal head correction:

<CounterpointStaff example="bachRealAnswer" locale="en" />

## The countersubject

<CounterpointStaff example="countersubjectContinuous" locale="en" />

A countersubject is a recurring companion in some fugues, but it is not a required part of every fugue. When material declares one, `countersubject_continuous` samples every quarter-beat of the answer's window and requires a sounding note from the countersubject voice at each one. Since the pair is designed to be reused with voices swapped, `invertible_at_octave` also checks it at structural accents; fourths are judged against the actual bass by `vertical_dissonance`.

In the same C minor fugue, the countersubject enters the moment the answer does — and never stops sounding under it:

<CounterpointStaff example="bachCountersubject" locale="en" />

## Episodes and sequences

Episodes are where fugues travel. Historical episodes often develop fragments of the subject or countersubject, and sequences are common, but they can also use free counterpoint or another salient idea. In this engine, only material explicitly declared as a motif transform must be derived from a source slice — **restatement** re-anchors the slice at its new position, **inversion** mirrors the contour upside down, **retrograde** plays it backwards, and **augmentation/diminution** stretch or compress every duration (not to be confused with augmented *intervals* from chapter 4). A declared sequence uses the same seed on successively higher or lower steps.

<CounterpointStaff example="sequenceSteps" locale="en" />

The declared transform can also flip the seed upside down — play these in sequence and hear the mirror:

<CounterpointStaff example="motifInversion" locale="en" />

Bach builds whole stretches of fugue from exactly this transform. In the D♯ minor fugue the subject and its mirror are full partners — the inverted form quoted below even arrives in stretto with another inverted entry:

<CounterpointStaff example="bachInversion" locale="en" />

The C minor fugue puts both contracts on display the moment its exposition pauses. Bars 5–6 — between the answer and the bass entry — sequence the subject's own head figure upward, one step per half bar:

<CounterpointStaff example="bachEpisode" locale="en" />

| Rule | Contract |
|------|----------|
| `episode_motif_derived` | For a declared episode fragment, every note matches the expected output of the declared motif operation applied to the declared source slice — pitch, duration, and tick. |
| `sequence_pattern_consistency` | For a declared sequence, each step is a verbatim transposition of the seed by the declared offset. Paraphrases fail this engine contract. |

## Imitation

<CounterpointStaff example="imitationEntry" locale="en" />

Imitation generalizes the subject/answer idea to any material: a follower restates the leader's fragment at a declared time distance and interval. `imitation_entry_match` verifies both numbers — enter at `leader.tick + distance`, pitched at `leader.pitch + interval`.

Bach wrote a whole laboratory for this contract: the Goldberg canons. In the last of them, both declared numbers are audible — one bar, one ninth:

<CounterpointStaff example="bachCanon" locale="en" />

## Development devices

### Middle entries

After the exposition, the subject returns in **related keys**. In major mode, the allowed stations are the dominant (V), relative (vi), subdominant (IV), and supertonic (ii); in minor mode, they are the minor dominant (v), relative major (III), and minor subdominant (iv). `middle_entry_in_related_key` restricts the declared entry key to the mode-specific family and checks every entry pitch against the corresponding collection.

::: info What makes a key "related"?
Two keys are related when their scales share most of their notes, so the ear can slide between them without a jolt. The dominant and subdominant keys differ from home by a single accidental; the **relative** key (vi of a major key — A minor for C major) uses the *same* notes with a different center.
:::

::: info What about minor keys?
Minor mode uses the related-key set {v, III, iv}. The validator checks every entry pitch against the home minor collection: pitch-class offsets {0, 2, 3, 5, 7, 8, 10, 11} from the tonic, which includes the natural-minor flat seventh and the raised leading tone.
:::

<CounterpointStaff example="middleEntry" locale="en" />

### Stretto

<CounterpointStaff example="strettoOverlap" locale="en" />

No fugue demonstrates the device like the C major fugue that opens WTC I — Bach builds nearly the whole piece from strettos. By bar 7 the subject is already chasing itself at one beat's distance:

<CounterpointStaff example="bachStretto" locale="en" />

### Pedal point

<CounterpointStaff example="pedalPoint" locale="en" />

The pedal point usually arrives near the end — a dominant pedal building tension before the final cadence, or a tonic pedal confirming arrival. Notice the rule's direction: it does not police the dissonances *above* the pedal (those are licensed by the device), it polices the pedal pitch itself.

The first prelude of WTC I shows the device at its barest. Before the ending, Bach spends eight bars hammering nothing but the dominant in the bass — here are two of them:

<CounterpointStaff example="bachPedalPoint" locale="en" />

## How the validator sees this chapter

| Rule | Outcome | Check |
|------|----------|-------|
| `tonal_answer_dominant_mapping` | MusicalFail | Tonal answer's head maps the subject's opening pitch class I↔V. |
| `countersubject_continuous` | MusicalFail | The countersubject voice sounds at every quarter-beat of the answer window. |
| `countersubject_invertible` | Informational | A strong-beat perfect fifth between a marked countersubject and an overlapping subject or answer would become a fourth under octave inversion. This observation is informational and never blocks generation. |
| `episode_motif_derived` | MusicalFail | Episode notes equal the declared motif transform of the declared source slice. |
| `sequence_pattern_consistency` | MusicalFail | Each sequence step is an exact transposition of the seed by the declared offset. |
| `imitation_entry_match` | MusicalFail | Follower enters at the declared tick distance and interval from the leader. |
| `imitation_entry_realization` | MusicalFail | During `Generation`, emitted Material notes must match the declared leader/follower windows in pitch, onset, duration, voice, and intent; both entry heads need the realization marker. |
| `middle_entry_in_related_key` | MusicalFail | In major mode, entry key ∈ {V, vi, IV, ii}; notes are diatonic in the related station's major scale, except vi uses the home major collection. In minor mode, entry key ∈ {v, III, iv}; notes use home-minor pitch-class offsets {0, 2, 3, 5, 7, 8, 10, 11}. |
| `stretto_overlap_valid` | MusicalFail | Follower starts strictly inside the leader's subject window and is an exact transposition. |
| `pedal_point_tonic_or_dominant` | MusicalFail | Every pedal pitch class is the home tonic or dominant. |

Continue with [Chapter 7 — Form-Specific Constraints](/docs/counterpoint/form-constraints).
