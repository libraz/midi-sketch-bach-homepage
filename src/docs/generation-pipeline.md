---
title: Generation Pipeline
description: How the composer engine turns a config into a Bach-style composition - form director, candidate search, validator, renderer, and post passes.
---

# Generation Pipeline

When you call `generator.generate(config)`, the composer engine runs a fixed pipeline that turns the request into a complete, deterministic composition.

::: info Musical vocabulary in this pipeline
The pipeline treats music as structured data: forms allocate voices and authored note carriers, harmony supplies chord targets, and validation rejects illegal voice interactions. The compact glossary is in [Music Primer for Engineers](/docs/music-primer).
:::

![The seven steps from a BachConfig to MIDI and event data, with a side branch showing that a blocking failure aborts the run](/images/pipeline.svg)

The whole pipeline is deterministic for an explicit non-zero seed: the same config and seed yield byte-identical output. With `seed: 0`, the request asks the runtime to choose a new seed.

## Step 1: Compose Request

The raw config is resolved into a compose request. Defaults are filled in, the seed is resolved (a `seed` of `0` becomes a concrete non-zero value, reported via `getInfo().seedUsed`), and the request is validated.

Validation is strict: unknown `form`/`character`/`instrument`/`scale` values and out-of-range `bpm` are rejected, as are forbidden character/form pairs (`chorale_prelude` rejects `playful`/`restless`; `toccata_and_fugue` rejects `noble`). The `form` fixes the voice count, meter, and natural length; `scale`/`targetBars` resolve the final bar count (snapped to the form's granularity and clamped to `[min, 128]`).

## Step 2: Form Director

The form director lays out the piece. For the chosen form it assigns **voice intents** to bar spans — subjects and answers, ground basses, cantus firmus, figuration, variation material — across the resolved length.

::: info Bar span and material
A **bar span** is a range of measures. **Material** is authored musical content, such as a fugue subject, a counterline, or a repeating ground bass, that a carrier replays verbatim.
:::

![The four layout families drawn as voice lanes: fugal, ground-bass variation, cantus firmus, and linear or figural](/images/form-families.svg)

The layout follows a **design-value arc** — establish, develop, climax at roughly 80% of the span, then resolve — that drives the density, register, and velocity tiers used downstream. The arc is fixed by the form, not searched.

## Step 3: Candidate Search

Candidate search dispatches every voice-intent span. In all default shipped forms, those spans are carriers: they replay the notes assembled by the form builder verbatim. This carrier-assembly path produces every default note; the scored search branch contributes zero.

The scored branch is an off-by-default diagnostic option. `bach_cli --free-counterpoint` reroutes only the Passacaglia V1 (`voice == 1`) counterline to per-beat, chord-tone-anchored search. The ground and principal variation remain carriers. No other form has an eligible span, so requesting free counterpoint for another form returns `FreeCounterpointUnavailable`.

When a free Compose span exhausts every candidate at a position, the engine emits a rest and increments `saturated_positions`; it does not choose a fallback pitch. Saturation is a density signal, not itself a validation failure. Carrier spans never saturate.

::: info Chords, modulation, cadences
**Chords** are the vertical targets at each point in time. **Modulation** means moving the tonal center to another key. A **cadence** is a phrase ending, usually a dominant-to-tonic arrival such as V to I.
:::

## Step 4: Rule Validator

The validator checks the assembled voices against counterpoint and structure rules. It accumulates the failures found during the pass and reports each with a rule identifier so the responsible span can be located. Learn the musical ideas in [Counterpoint Course](/docs/counterpoint), then use the [Validator Rule Reference](/docs/validator-rules) when you need to look up a specific rule ID.

::: info What happens after a blocking generation failure
The public generation path aborts and returns the validation report. It does not repair the score, retry the search, or choose a different candidate. The later `FinalScore` audit has its own failure point after ornaments are applied.
:::

## Step 5: Renderer

As the final part of `Composer::run()`, the assembled voices are rendered into initial tracks — one track per voice — with channels and note timings. After the public `FinalScore` and budget checks succeed, the generation path applies the instrument-specific velocity curve, captures the notated notes, applies character-dependent articulation, and re-renders the tracks with the General MIDI program.

::: info Source tags survive rendering
Rendered notes keep their provenance: `"material"` for carrier material, `"compose"` for notes from the opt-in scored search, and `"ornament"` for notes added later. This is useful when locating the source of a validation finding.
:::

## Step 6: Finalize & Express (post-pass)

The public generation path runs these operations in order after `Composer::run()`: apply ornaments, run `FinalScore` validation, apply the form's counterpoint budget, apply the velocity curve, save the notated note snapshot for `generated.v1`, apply articulation, re-render the tracks, add controller events, add tempo events, then export MIDI and public event data. A blocking `FinalScore` or closed-budget failure aborts before velocity, articulation, controller, tempo, MIDI, or public event output.

- **Ornaments** — trills (including cadential openings and a closing Nachschlag), appoggiaturas, turns, slides, and mordents, with density depending on character and instrument. Subject, answer, stretto, augmented, diminished, and inverted subject statements remain plain so their identity survives; middle entries remain eligible. Ground carriers are exempt. Cantus-firmus bar heads remain plain, while eligible within-bar notes can be decorated except under `Severe`, which keeps the whole cantus line plain.
- **Velocity** — an instrument-aware phrase curve applied after final validation; the tracks are re-rendered so MIDI and `getEvents()` expose the updated values.
- **Expression** — MIDI CC 7 level terraces and arc points for organ and harpsichord, and CC 11 continuous expression for piano, violin, and cello. These are playback level/expression events; CC 7 does not select organ stops, and the guitar profile receives the velocity curve without a continuous-expression profile.
- **Tempo** — a form-dependent closing ritardando (none for the Trio Sonata) and, for the prelude, toccata, and fantasia forms, a section tempo change at the fugue entry.

Only notes inserted by the ornament pass carry the `source: "ornament"` provenance tag. Velocity and articulation modify existing notes without changing their `source`, while CC and tempo passes add events rather than notes.

::: info Validation uses notated durations
`FinalScore` validation and its texture metrics run before articulation, on the notated note array. `generated.v1` preserves those notated durations; the public event stream and MIDI use the shortened articulation gates.
:::

::: info Ornament
An **ornament** is a small decorative figure added around a structural note. It is not the source melody itself, so event data marks it separately with `source: "ornament"`.
:::

## Step 7: MIDI Writer

The internal representation is composed and validated in C. The output writers apply the requested `key` and any output-octave shift. The MIDI writer also writes time signatures (3/4 for passacaglia and chaconne, 4/4 otherwise) and produces a Type 1 Standard MIDI File. The public event writer applies the same pitch transformation.

```js
const midi = generator.getMidi()       // Uint8Array (transposed to your key)
const events = generator.getEvents()   // Event data (pitches in the output key)
```

::: tip
`getEvents()` reports output-key pitches and tags every note with its `source`. The lower-level `generated.v1` diagnostic artifact keeps internal C pitches. See the [JavaScript API](/docs/api-js#eventdata) for the public event type definitions.
:::

## Beyond the pipeline: how quality is measured

The seven steps above are everything that happens at runtime. By default, the pipeline never searches for a "more Bach-like" candidate while generating: the form builder authors the carrier material, and the validator rejects illegal results. So how do we know those design values actually produce Bach-like output?

The answer is **development-side quality gates**. Whenever a form or figuration in the engine changes, the generated output is run through two families of automated checks. Both ship as public Python tooling in the engine repository (the `texture-gate` and `closure` commands of `bach_tools.py`).

### The corpus statistics model

Five distributions are extracted from a generated piece's event data and scored by their distance (negative log-likelihood) from reference distributions estimated over a corpus of real works. A distance beyond a calibrated threshold fails the gate.

| Feature | What it captures |
|---------|------------------|
| Pitch class | How often each note name is used |
| Melodic interval | The distribution of distances between adjacent notes within a voice |
| Duration | The distribution of note lengths |
| Beat position | Where in the bar notes are attacked |
| Vertical interval class | The distribution of intervals between simultaneously sounding notes |

The most heavily weighted of these is the **melodic interval**. In Bach's actual writing the dominant melodic interval is overwhelmingly the **step** (a move of one or two semitones to a neighboring scale tone — see the [primer](/docs/music-primer#steps-and-leaps)), so a leap-heavy line widens this distance immediately.

### The tension between horizontal steps and vertical consonance

This is where the core tension of figuration design lives.

- **Horizontally**: a line matches the corpus better the more stepwise it is — scalar runs, wave figures.
- **Vertically**: beat onsets sound consonant against a sustained bass the more they are anchored to the bar's chord tones (see also [Leaps need recovery](/docs/counterpoint/melody)).

Implemented naively, the two collide: a freely running scale line steps onto non-chord tones at beat onsets, while jumping every beat to the nearest chord tone produces a leap-riddled line. The engine's figures (scalar wave, sawtooth, broken chord) are written to keep both — landing on chord tones that lie *ahead in the running direction*, and choosing oscillation partners from bass-consonant neighbor tones before resorting to a leap.

![Three eight-note figures over one sustained bass: a scale that lands off the chord, a chord-tone line that leaps, and a stepwise line that stays consonant on the beat](/images/step-vs-consonance.svg)

### Texture gates

Alongside the statistics model, a seed × form sweep checks structural metrics directly — per-voice activity, silence ratios, repeated-note run lengths, parallel perfect intervals, and the model score threshold above. If a single case fails, the change does not merge.

::: info These are not part of generate()
Neither the corpus model nor the texture gates run at runtime. Generation is always a deterministic single shot; quality is guaranteed on the side that produces it — in the design values, at development time.
:::
