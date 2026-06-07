/** Voice color palette and color helpers for the piano roll. */

/** Voice color palette (Bach: voice-based, not track-based). */
export const VOICE_COLORS: Record<number, string> = {
  0: '#D4A63E', // Soprano - Gold
  1: '#8A2E3E', // Alto - Burgundy
  2: '#4A8B6B', // Tenor - Green
  3: '#6B7BB5', // Bass - Steel blue
}
/** Bronze for voice 4+. */
export const VOICE_COLOR_DEFAULT = '#B57A4A'

/** Gothic stained-glass voice tones for the idle tracery. */
export const GOTHIC_VOICES = [
  { r: 195, g: 155, b: 55 },  // Soprano — Amber
  { r: 155, g: 35,  b: 53 },  // Alto    — Ruby
  { r: 45,  g: 122, b: 95 },  // Tenor   — Emerald
  { r: 58,  g: 91,  b: 160 }, // Bass    — Sapphire
]

/** Get the color for a voice index. */
export function getVoiceColor(voice: number): string {
  return VOICE_COLORS[voice] ?? VOICE_COLOR_DEFAULT
}

/** Parse a `#rrggbb` color into RGB components. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = hex.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!result) return { r: 0, g: 0, b: 0 }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}
