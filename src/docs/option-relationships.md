---
title: Option Relationships
description: How MIDI Sketch Bach configuration options interact - dependencies, constraints, and validation rules.
---

# Option Relationships

MIDI Sketch Bach's configuration options interact with each other in specific ways. Understanding these relationships helps you craft configurations that produce the results you want.

::: info Two layers of options
`form`, `isMinor`, and `character` affect the internal composition. `character` also affects note articulation and the MIDI CC profile in the finished output. `key` transposes that result for output, while `instrument`, `bpm`, and `seed` control rendering or reproducibility. The [Music Primer for Engineers](/docs/music-primer) explains the musical terms used here.
:::

## Dependency Overview

![Two bands: form, character, isMinor and seed change the notes; key, instrument and bpm change only the output](/images/option-graph.svg)

## Form Decides the Voice Count

The `form` is the most influential option. It **fixes** the number of voices, the meter, and the natural length, and it selects the default `instrument`.

![Three forms as voice lanes: the fugue's three staggered entries, the cello prelude's single line, and the chaconne's three declared lanes for variation, middle material and ground](/images/form-texture.svg)

::: warning `numVoices` was removed
There is no voice-count option anymore — pick the form to pick the texture (see the [Forms](/docs/forms) table). Passing `num_voices`/`numVoices` is accepted and ignored for backward compatibility; it never errors and has no effect.
:::

### Default Cascade

When you specify a form, the engine fills in unspecified fields:

```js
// You specify:
generator.generate({ form: 'fugue', key: 2, isMinor: true })

// Engine resolves to:
// {
//   form: 'fugue',
//   key: 2,
//   isMinor: true,
//   instrument: 'organ',  ← form default
//   bpm: 100,             ← default
//   seed: 0,              ← random (resolved seed in getInfo().seedUsed)
//   character: 'severe',  ← default
//   scale: 'short',       ← default (≈ natural length)
// }
// Voice count (3), meter (4/4), and reference length (42 bars) come from the form.
// The 4-bar grid resolves the default output to 44 bars.
```

Any field you explicitly set overrides the default:

```js
// Override BPM and length
generator.generate({
  form: 'fugue',
  bpm: 72,          // overrides default 100
  scale: 'medium'   // overrides default 'short'
})
```

See the [Forms](/docs/forms) table for per-form voice counts and the [Presets Reference](/docs/presets) for the full default table.

## Instrument Is Chosen by the Form

Each form is written for a specific instrument, and the engine accepts only what that form was written for:

| Form | Default Instrument | Also accepted |
|------|--------------------|---------------|
| `fugue`, `prelude_and_fugue`, `trio_sonata`, `chorale_prelude`, `toccata_and_fugue`, `passacaglia`, `fantasia_and_fugue` | Organ | -- |
| `cello_prelude` | Cello | -- |
| `chaconne` | Violin | -- |
| `goldberg_variations` | Harpsichord | Piano |

The `instrument` choice affects the General MIDI program, the playable range used to fit the completed output, and the ornament density of the post-pass. Each form has an explicit set of compatible instruments; requesting one outside that set throws, as does an unknown instrument string.

::: tip
The Goldberg Variations is the one form with a real choice. `harpsichord` gives the crisp attack that keeps the variation texture transparent; `piano` gives a warmer, more sustained reading of the same material.
:::

Whole-score octave displacement keeps the output inside the instrument's compass: rather than clamping individual notes that fall outside the range, the engine shifts the entire piece by octaves so the internal voice leading survives intact.

## Scale and targetBars

`scale` and `targetBars` both set the output length. `scale` is a multiplier of the form's natural length. `targetBars: 0` uses `scale`, while a positive `targetBars` is an explicit override. Use `targetBars` values from `0` through `128`. The API accepts integers up to `65535`, but values near the upper limit can overflow while the bar count is aligned and return the form's minimum length.

![The natural length is multiplied by scale, snapped to the form's bar grid, then clamped; targetBars enters at the raw-target stage and still passes through both](/images/length-resolution.svg)

| Configuration | Behavior |
|--------------|----------|
| `scale` only | Length = form's natural length × the scale multiplier |
| `targetBars: 0` | Uses `scale` (zero is the sentinel for no explicit override) |
| Positive `targetBars` | Engine targets that bar count and ignores `scale` |
| Both specified | A positive `targetBars` wins; `scale` is ignored |
| Neither specified | Default: `scale: "short"` (≈ natural length) |

The scale multipliers are approximately `short` ≈ 1x, `medium` ≈ 2x, `long` ≈ 3x, `full` ≈ 4x of the form's natural length. The Goldberg Variations is the exception: `scale: "full"` when no positive `targetBars` is supplied selects the complete compressed 128-bar layout rather than 20 × 4 = 80 bars.

::: tip
Positive values are snapped to the form's granularity (e.g. the ground-bass period) and clamped to `[form minimum, 128]`. Every form caps at 128 bars. Use `scale` for a general size category; use `targetBars` for a specific length.
:::

```js
// Length as a multiple of the form's natural length
generator.generate({ form: 'fugue', scale: 'long' })   // 42 × 3 = 126, snapped to 128 bars

// Specific length (snapped and clamped)
generator.generate({ form: 'fugue', targetBars: 48 })

// targetBars wins when both specified
generator.generate({
  form: 'fugue',
  scale: 'short',      // ignored
  targetBars: 48        // this is used
})
```

## Seed Behavior

The `seed` parameter controls deterministic output:

| Seed Value | Behavior |
|-----------|----------|
| `0` (default) | A random non-zero seed is chosen; the resolved value is reported via `getInfo().seedUsed` |
| Any positive integer | Deterministic — same config + same seed = byte-identical output |

::: tip Reproducing a random run
After a `seed: 0` run, read `getInfo().seedUsed` and pass it back as `seed` to regenerate the exact same piece.
:::

::: warning Reproducibility
Deterministic reproduction requires the same version of MIDI Sketch Bach. The internal algorithms may change between versions, so the same seed may produce different output after an upgrade. If you need to preserve specific outputs, save the generated MIDI files rather than relying on seed reproducibility across versions.
:::

```js
// Random each time
generator.generate({ form: 'fugue', seed: 0 })

// Always produces the same result
generator.generate({ form: 'fugue', key: 2, isMinor: true, seed: 42 })

// Different key = transposed MIDI/getEvents output; internal generated.v1 is unchanged
generator.generate({ form: 'fugue', key: 0, isMinor: true, seed: 42 })
```

## Key and Mode

The engine composes internally in C. `isMinor` selects the internal C-major or C-minor harmonic plan; `key` does not alter that plan. Instead, `key` transposes the finished MIDI and `getEvents()` note pitches and labels their output-key metadata.

::: info Tonal center
The **tonal center** is the pitch that feels like home in the output. `key` chooses its pitch class, while `isMinor` chooses whether the internally composed plan and the output-key label are major or minor.
:::

```js
// D major
generator.generate({ key: 2, isMinor: false })

// D minor — by pitch class or by canonical name
generator.generate({ key: 2, isMinor: true })
generator.generate({ key: 'D', isMinor: true })
```

| Parameter | Range | Default |
|-----------|-------|---------|
| `key` | 0--11 (pitch class) or a canonical name (`"C"`, `"C#"`, `"D"`, `"Eb"`, `"E"`, `"F"`, `"F#"`, `"G"`, `"Ab"`, `"A"`, `"Bb"`, `"B"`) | 0 (C) |
| `isMinor` | `true` / `false` | `false` (major) |

Names are matched exactly — `"g"` and `"Db"` both throw. Use `getKeys()` to enumerate the accepted spellings.

Changing only `key` changes the output transposition and key metadata. It does not change the harmonic vocabulary or modulation plan, so `getGenerated()` keeps the same internal-C pitches for the same form, mode, character, and seed. `getEvents()` exposes the transposed/output-key pitches instead.

## Character and Form

The `character` parameter (`severe`, `playful`, `noble`, `restless`) shapes the primary thematic material. Its impact varies by form, and some combinations are forbidden:

::: info Character is not genre
`character` changes the melodic profile of the subject or primary material: interval size, rhythmic energy, chromatic tendency, and contour. It also changes note articulation and the MIDI CC profile in every form. In `cello_prelude`, it orders the figure palette used for each bar. See [Instruments](/docs/physical-models) for the instrument-specific expression output. It does not switch the form. A `restless` fugue is still a fugue.
:::

| Form Type | Character Impact |
|-----------|-----------------|
| Fugal forms (`fugue`, `prelude_and_fugue`, `toccata_and_fugue`, `fantasia_and_fugue`) | **Strong** — directly shapes the fugue subject, which defines the entire piece |
| Variation forms (`passacaglia`, `chaconne`, `goldberg_variations`) | **Moderate** — colours the variations over the fixed bass |
| Chorale Prelude | **Moderate** — affects the contrapuntal voice; cantus firmus is fixed |
| Trio Sonata | **Moderate** — shapes the motivic material for the upper voices |
| Cello Prelude | **Moderate** — influences figuration patterns |

::: warning Forbidden character/form pairs (these throw)
- `chorale_prelude` rejects `playful` and `restless`.
- `toccata_and_fugue` rejects `noble`.

Requesting a forbidden pair throws instead of silently substituting a character.
:::

::: tip
`severe` is a solid default for most situations. Try `restless` for Toccata and Fugue, or `noble` for Chorale Prelude.
:::

## Validation Rules

Complete validation constraints for all configuration fields. Note that several fields now **throw** on invalid input rather than clamping:

::: info Config validation vs musical validation
This table covers API/config validation: whether option values are accepted. Counterpoint and form-structure failures are separate musical validator rules; see [Validator Rule Reference](/docs/validator-rules).
:::

| Field | Type | Range | Default | Validation |
|-------|------|-------|---------|------------|
| `form` | number or string | 0--9 / name | `"fugue"` | Unknown name / out-of-range number throws |
| `key` | number or string | 0--11 / canonical name | 0 | Out-of-range number or unknown name throws |
| `isMinor` | boolean | true/false | false | Non-boolean throws |
| `bpm` | number | 0 or 40--200 | 100 | 0 uses default 100; any other out-of-range value throws |
| `seed` | number | 0+ | 0 | 0 = random; resolved value in `getInfo().seedUsed` |
| `character` | string or number | name / 0--3 | `"severe"` | Unknown value throws; forbidden form pairs throw |
| `instrument` | string or number | name / 0--5 | Form default | Unknown value throws; an instrument the form does not accept throws |
| `scale` | string or number | name / 0--3 | `"short"` | Unknown value throws |
| `targetBars` | integer | 0--65535 | 0 | 0 uses `scale`; positive values override it, then snap to form granularity and clamp to `[min, 128]` |
| `numVoices` | number | -- | -- | Accepted and ignored (form decides voices) |

Each rejection carries its own message — `Invalid BPM (must be 0 or 40-200)`, `Incompatible instrument for this form`, and so on — so a failure identifies the field that caused it.
