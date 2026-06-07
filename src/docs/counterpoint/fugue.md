---
title: "Counterpoint 6: Fugal Devices"
description: Subject and answer, countersubject continuity, episodes and sequences, imitation, stretto, and pedal points — as validated contracts.
---

# 6. Fugal Devices

A fugue is not a form like a sonata — it is a *procedure*: one theme (the subject) enters voice by voice, travels through related keys, and returns intensified. Every device in that procedure is a contract between declared material and emitted notes, and the validator checks each one. These rules sit above the local interval rules from chapters 2–3, which keep applying throughout.

::: info The fugue procedure at a glance
**Exposition**: each voice enters in turn with the subject or its answer, accompanied by the countersubject. **Episodes**: sequential passages derived from subject motifs travel between keys. **Development**: middle entries restate the subject in related keys; stretto and pedal points raise the temperature toward the close.
:::

## Subject and answer

When the second voice enters, it carries the subject transposed to the dominant — the **answer**. A literal transposition is a *real answer*. But if the subject opens by outlining tonic→dominant, literal transposition would immediately yank the music out of the home key. The fix, used constantly by Bach, is the **tonal answer**: adjust the head so tonic maps to dominant and dominant maps back to tonic, then transpose the tail normally.

<CounterpointStaff example="realVsTonalAnswer" locale="en" />

`tonal_answer_dominant_mapping` checks exactly this head mapping when the material declares a tonal answer: the subject's opening pitch class must map I↔V. Subjects that open on neither tonic nor dominant pass vacuously — they need no adjustment.

Here is the textbook case in Bach's own hand — the opening of the C minor fugue from WTC I. Play the two lines in turn and listen for the single bent note:

<CounterpointStaff example="bachTonalAnswer" locale="en" />

## The countersubject

<CounterpointStaff example="countersubjectContinuous" locale="en" />

A countersubject is only useful if it actually accompanies. `countersubject_continuous` samples every quarter-beat of the answer's window and requires a sounding note from the countersubject voice at each one. (Since the pair is designed to be reused with voices swapped, the invertible-counterpoint rules from chapter 2 — `invertible_at_octave`, `fourth_only_on_weak_beat` — police the same passage.)

In the same C minor fugue, the countersubject enters the moment the answer does — and never stops sounding under it:

<CounterpointStaff example="bachCountersubject" locale="en" />

## Episodes and sequences

Episodes are where fugues travel. Their material is not free improvisation: it must be derived from a declared slice of the subject by a declared transform — **restatement** re-anchors the slice verbatim at its new position, **inversion** mirrors the contour upside down, **retrograde** plays it backwards, and **augmentation/diminution** stretch or compress every duration (not to be confused with augmented *intervals* from chapter 4). It usually moves as a **sequence** — the same seed restated on successively higher or lower steps.

<CounterpointStaff example="sequenceSteps" locale="en" />

The declared transform can also flip the seed upside down — play these in sequence and hear the mirror:

<CounterpointStaff example="motifInversion" locale="en" />

Bach builds whole stretches of fugue from exactly this transform. In the D♯ minor fugue the subject and its mirror are full partners — the inverted form quoted below even arrives in stretto with another inverted entry:

<CounterpointStaff example="bachInversion" locale="en" />

The C minor fugue puts both contracts on display the moment its exposition pauses. Bars 5–6 — between the answer and the bass entry — sequence the subject's own head figure upward, one step per half bar:

<CounterpointStaff example="bachEpisode" locale="en" />

| Rule | Contract |
|------|----------|
| `episode_motif_derived` | Every note emitted for an episode fragment matches the expected output of the declared motif operation applied to the declared source slice — pitch, duration, and tick. |
| `sequence_pattern_consistency` | Each step of a sequence is a verbatim transposition of the seed by the declared offset. Paraphrases fail. |

## Imitation

<CounterpointStaff example="imitationEntry" locale="en" />

Imitation generalizes the subject/answer idea to any material: a follower restates the leader's fragment at a declared time distance and interval. `imitation_entry_match` verifies both numbers — enter at `leader.tick + distance`, pitched at `leader.pitch + interval`.

Bach wrote a whole laboratory for this contract: the Goldberg canons. In the last of them, both declared numbers are audible — one bar, one ninth:

<CounterpointStaff example="bachCanon" locale="en" />

## Development devices

### Middle entries

After the exposition, the subject returns in **related keys** — the dominant (V), the relative (vi), the subdominant (IV), the supertonic (ii). `middle_entry_in_related_key` restricts the declared entry key to that family and requires every note of the entry to stay diatonic in it.

::: info What makes a key "related"?
Two keys are related when their scales share most of their notes, so the ear can slide between them without a jolt. The dominant and subdominant keys differ from home by a single accidental; the **relative** key (vi of a major key — A minor for C major) uses the *same* notes with a different center.
:::

::: info What about minor keys?
The related-key set is defined as fixed distances from the home tonic — V, vi, IV, ii — whatever the home mode, and the diatonic check reads the entry against the *major* scale on the declared key. A minor-mode fugue therefore states its middle entries in related major keys (the engine restates the subject in its major-mode shape for the entry). The destinations classical minor-key practice favors most — the relative major (III: E♭ for C minor, where Bach takes the C minor fugue's first middle entry) and the minor dominant (v) — sit outside the current set.
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

| Rule | FailKind | Check |
|------|----------|-------|
| `tonal_answer_dominant_mapping` | MusicalFail | Tonal answer's head maps the subject's opening pitch class I↔V. |
| `countersubject_continuous` | MusicalFail | The countersubject voice sounds at every quarter-beat of the answer window. |
| `episode_motif_derived` | MusicalFail | Episode notes equal the declared motif transform of the declared source slice. |
| `sequence_pattern_consistency` | MusicalFail | Each sequence step is an exact transposition of the seed by the declared offset. |
| `imitation_entry_match` | MusicalFail | Follower enters at the declared tick distance and interval from the leader. |
| `middle_entry_in_related_key` | MusicalFail | Entry key ∈ {V, vi, IV, ii} of the home tonic; entry notes diatonic in that key's major scale, whatever the home mode. |
| `stretto_overlap_valid` | MusicalFail | Follower starts strictly inside the leader's subject window and is an exact transposition. |
| `pedal_point_tonic_or_dominant` | MusicalFail | Every pedal pitch class is the home tonic or dominant. |

Continue with [Chapter 7 — Form-Specific Constraints](/docs/counterpoint/form-constraints).
