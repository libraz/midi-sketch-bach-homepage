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

## The countersubject

<CounterpointStaff example="countersubjectContinuous" locale="en" />

A countersubject is only useful if it actually accompanies. `countersubject_continuous` samples every quarter-beat of the answer's window and requires a sounding note from the countersubject voice at each one. (Since the pair is designed to be reused with voices swapped, the invertible-counterpoint rules from chapter 2 — `invertible_at_octave`, `fourth_only_on_weak_beat` — police the same passage.)

## Episodes and sequences

Episodes are where fugues travel. Their material is not free improvisation: it must be derived from a declared slice of the subject by a declared transform — **restatement** re-anchors the slice verbatim at its new position, **inversion** mirrors the contour upside down, **retrograde** plays it backwards, and **augmentation/diminution** stretch or compress every duration (not to be confused with augmented *intervals* from chapter 4). It usually moves as a **sequence** — the same seed restated on successively higher or lower steps.

<CounterpointStaff example="sequenceSteps" locale="en" />

The declared transform can also flip the seed upside down — play these in sequence and hear the mirror:

<CounterpointStaff example="motifInversion" locale="en" />

| Rule | Contract |
|------|----------|
| `episode_motif_derived` | Every note emitted for an episode fragment matches the expected output of the declared motif operation applied to the declared source slice — pitch, duration, and tick. |
| `sequence_pattern_consistency` | Each step of a sequence is a verbatim transposition of the seed by the declared offset. Paraphrases fail. |

## Imitation

<CounterpointStaff example="imitationEntry" locale="en" />

Imitation generalizes the subject/answer idea to any material: a follower restates the leader's fragment at a declared time distance and interval. `imitation_entry_match` verifies both numbers — enter at `leader.tick + distance`, pitched at `leader.pitch + interval`.

## Development devices

### Middle entries

After the exposition, the subject returns in **related keys** — the dominant (V), the relative (vi), the subdominant (IV), the supertonic (ii). `middle_entry_in_related_key` restricts the declared entry key to that family and requires every note of the entry to stay diatonic in it.

::: info What makes a key "related"?
Two keys are related when their scales share most of their notes, so the ear can slide between them without a jolt. The dominant and subdominant keys differ from home by a single accidental; the **relative** key (vi of a major key — A minor for C major) uses the *same* notes with a different center.
:::

<CounterpointStaff example="middleEntry" locale="en" />

### Stretto

<CounterpointStaff example="strettoOverlap" locale="en" />

### Pedal point

<CounterpointStaff example="pedalPoint" locale="en" />

The pedal point usually arrives near the end — a dominant pedal building tension before the final cadence, or a tonic pedal confirming arrival. Notice the rule's direction: it does not police the dissonances *above* the pedal (those are licensed by the device), it polices the pedal pitch itself.

## How the validator sees this chapter

| Rule | FailKind | Check |
|------|----------|-------|
| `tonal_answer_dominant_mapping` | MusicalFail | Tonal answer's head maps the subject's opening pitch class I↔V. |
| `countersubject_continuous` | MusicalFail | The countersubject voice sounds at every quarter-beat of the answer window. |
| `episode_motif_derived` | MusicalFail | Episode notes equal the declared motif transform of the declared source slice. |
| `sequence_pattern_consistency` | MusicalFail | Each sequence step is an exact transposition of the seed by the declared offset. |
| `imitation_entry_match` | MusicalFail | Follower enters at the declared tick distance and interval from the leader. |
| `middle_entry_in_related_key` | MusicalFail | Entry key ∈ {V, vi, IV, ii} of the home tonic; entry notes diatonic in that key. |
| `stretto_overlap_valid` | MusicalFail | Follower starts strictly inside the leader's subject window and is an exact transposition. |
| `pedal_point_tonic_or_dominant` | MusicalFail | Every pedal pitch class is the home tonic or dominant. |

Continue with [Chapter 7 — Form-Specific Constraints](/docs/counterpoint/form-constraints).
