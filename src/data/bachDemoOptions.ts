export const INSTRUMENT_NAMES: Record<number, string> = {
  0: 'organ',
  1: 'harpsichord',
  2: 'piano',
  3: 'violin',
  4: 'cello',
  5: 'guitar',
}

export const INSTRUMENT_OPTIONS = [
  { id: 0, labelKey: 'config.organ' },
  { id: 1, labelKey: 'config.harpsichord' },
  { id: 2, labelKey: 'config.piano' },
  { id: 3, labelKey: 'config.violin' },
  { id: 4, labelKey: 'config.cello' },
  { id: 5, labelKey: 'config.guitar' },
]

export const SCALE_OPTIONS = [
  { id: 0, labelKey: 'config.scaleShort' },
  { id: 1, labelKey: 'config.scaleMedium' },
  { id: 2, labelKey: 'config.scaleLong' },
  { id: 3, labelKey: 'config.scaleFull' },
]

export type FormCategory = 'organ' | 'solo' | 'keyboard'

export const FORM_CATEGORIES: Array<{ id: FormCategory; labelKey: string }> = [
  { id: 'organ', labelKey: 'form.organSystem' },
  { id: 'solo', labelKey: 'form.soloString' },
  { id: 'keyboard', labelKey: 'form.keyboard' },
]
