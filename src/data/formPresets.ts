/**
 * Static metadata for Bach musical forms
 */

export interface FormPreset {
  id: number
  name: string
  displayKey: string
  descKey: string
  bwv: string
  category: 'organ' | 'solo' | 'keyboard'
  defaultInstrument: string
  defaultBpm: number
  defaultVoices: number
  minVoices: number
  maxVoices: number
}

export const FORM_PRESETS: FormPreset[] = [
  // ── Organ forms ──────────────────────────────────────────────────────
  {
    id: 0,
    name: 'fugue',
    displayKey: 'form.fugue',
    descKey: 'form.fugueDesc',
    bwv: 'BWV 578',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 85,
    defaultVoices: 4,
    minVoices: 2,
    maxVoices: 5,
  },
  {
    id: 1,
    name: 'prelude_and_fugue',
    displayKey: 'form.preludeAndFugue',
    descKey: 'form.preludeAndFugueDesc',
    bwv: 'BWV 543',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 90,
    defaultVoices: 4,
    minVoices: 2,
    maxVoices: 5,
  },
  {
    id: 2,
    name: 'trio_sonata',
    displayKey: 'form.trioSonata',
    descKey: 'form.trioSonataDesc',
    bwv: 'BWV 525',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 90,
    defaultVoices: 3,
    minVoices: 3,
    maxVoices: 3,
  },
  {
    id: 3,
    name: 'chorale_prelude',
    displayKey: 'form.choralePrelude',
    descKey: 'form.choralePreludeDesc',
    bwv: 'BWV 645',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 72,
    defaultVoices: 4,
    minVoices: 3,
    maxVoices: 5,
  },
  {
    id: 4,
    name: 'toccata_and_fugue',
    displayKey: 'form.toccataAndFugue',
    descKey: 'form.toccataAndFugueDesc',
    bwv: 'BWV 565',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 100,
    defaultVoices: 4,
    minVoices: 3,
    maxVoices: 5,
  },
  {
    id: 5,
    name: 'passacaglia',
    displayKey: 'form.passacaglia',
    descKey: 'form.passacagliaDesc',
    bwv: 'BWV 582',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 76,
    defaultVoices: 4,
    minVoices: 3,
    maxVoices: 5,
  },
  {
    id: 6,
    name: 'fantasia_and_fugue',
    displayKey: 'form.fantasiaAndFugue',
    descKey: 'form.fantasiaAndFugueDesc',
    bwv: 'BWV 542',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 88,
    defaultVoices: 4,
    minVoices: 3,
    maxVoices: 5,
  },
  // ── Solo forms ───────────────────────────────────────────────────────
  {
    id: 7,
    name: 'cello_prelude',
    displayKey: 'form.celloPrelude',
    descKey: 'form.celloPreludeDesc',
    bwv: 'BWV 1007',
    category: 'solo',
    defaultInstrument: 'cello',
    defaultBpm: 80,
    defaultVoices: 3,
    minVoices: 2,
    maxVoices: 3,
  },
  {
    id: 8,
    name: 'chaconne',
    displayKey: 'form.chaconne',
    descKey: 'form.chaconneDesc',
    bwv: 'BWV 1004',
    category: 'solo',
    defaultInstrument: 'violin',
    defaultBpm: 76,
    defaultVoices: 3,
    minVoices: 2,
    maxVoices: 4,
  },
  // ── Keyboard forms ──────────────────────────────────────────────────────
  {
    id: 9,
    name: 'goldberg_variations',
    displayKey: 'form.goldbergVariations',
    descKey: 'form.goldbergVariationsDesc',
    bwv: 'BWV 988',
    category: 'keyboard',
    defaultInstrument: 'harpsichord',
    defaultBpm: 60,
    defaultVoices: 2,
    minVoices: 2,
    maxVoices: 4,
  },
]

export function getFormPreset(id: number): FormPreset | undefined {
  return FORM_PRESETS.find(f => f.id === id)
}

export function getFormsByCategory(category: 'organ' | 'solo' | 'keyboard'): FormPreset[] {
  return FORM_PRESETS.filter(f => f.category === category)
}
