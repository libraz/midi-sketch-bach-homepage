/**
 * Static metadata for Bach musical forms
 */

export interface FormPreset {
  id: number
  name: string
  displayKey: string
  descKey: string
  category: 'organ' | 'solo'
  defaultInstrument: string
  defaultBpm: number
  defaultVoices: number
}

export const FORM_PRESETS: FormPreset[] = [
  // ── Organ forms ──────────────────────────────────────────────────────
  {
    id: 0,
    name: 'fugue',
    displayKey: 'form.fugue',
    descKey: 'form.fugueDesc',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 85,
    defaultVoices: 4,
  },
  {
    id: 1,
    name: 'prelude_and_fugue',
    displayKey: 'form.preludeAndFugue',
    descKey: 'form.preludeAndFugueDesc',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 90,
    defaultVoices: 4,
  },
  {
    id: 2,
    name: 'trio_sonata',
    displayKey: 'form.trioSonata',
    descKey: 'form.trioSonataDesc',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 90,
    defaultVoices: 3,
  },
  {
    id: 3,
    name: 'chorale_prelude',
    displayKey: 'form.choralePrelude',
    descKey: 'form.choralePreludeDesc',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 72,
    defaultVoices: 4,
  },
  {
    id: 4,
    name: 'toccata_and_fugue',
    displayKey: 'form.toccataAndFugue',
    descKey: 'form.toccataAndFugueDesc',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 100,
    defaultVoices: 4,
  },
  {
    id: 5,
    name: 'passacaglia',
    displayKey: 'form.passacaglia',
    descKey: 'form.passacagliaDesc',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 76,
    defaultVoices: 4,
  },
  {
    id: 6,
    name: 'fantasia_and_fugue',
    displayKey: 'form.fantasiaAndFugue',
    descKey: 'form.fantasiaAndFugueDesc',
    category: 'organ',
    defaultInstrument: 'organ',
    defaultBpm: 88,
    defaultVoices: 4,
  },
  // ── Solo forms ───────────────────────────────────────────────────────
  {
    id: 7,
    name: 'cello_prelude',
    displayKey: 'form.celloPrelude',
    descKey: 'form.celloPreludeDesc',
    category: 'solo',
    defaultInstrument: 'cello',
    defaultBpm: 80,
    defaultVoices: 3,
  },
  {
    id: 8,
    name: 'chaconne',
    displayKey: 'form.chaconne',
    descKey: 'form.chaconneDesc',
    category: 'solo',
    defaultInstrument: 'violin',
    defaultBpm: 76,
    defaultVoices: 3,
  },
]

export function getFormPreset(id: number): FormPreset | undefined {
  return FORM_PRESETS.find(f => f.id === id)
}

export function getFormsByCategory(category: 'organ' | 'solo'): FormPreset[] {
  return FORM_PRESETS.filter(f => f.category === category)
}
