import type { StaffExampleDef } from './types'
import { AMBER, GREEN } from './types'

/**
 * From Bach — corpus quotations for the melody chapter.
 * Note data is transcribed from the Bach corpus and verified against it;
 * it must not be hand-authored or adjusted by ear.
 */
export const melodyBachExamples: Record<string, StaffExampleDef> = {
  bachMelodicMinor: {
    ruleIds: ['augmented_melodic'],
    badge: { en: 'From Bach', ja: 'バッハの実例' },
    title: {
      en: 'Bach: Cello Suite No. 5, Prélude — the ascent that dodges the augmented second',
      ja: 'バッハ: 無伴奏チェロ組曲第5番 プレリュード — 増2度をかわす上行',
    },
    diagnosis: {
      en: 'Climbing toward C, the line raises degrees 6 and 7 — A♮ and B♮ in C minor — so every step stays singable.',
      ja: 'C へ向かう上行で第6音と第7音を半音上げ——ハ短調の A♮ と B♮——すべてのステップを歌える幅に保ちます。',
    },
    caption: {
      en: 'The first bar of the Fifth Cello Suite (BWV 1011), in C minor. The opening C hangs in the air, then the line climbs from G straight through A♮ and B♮ back to C. The key signature says A♭ and B♭; written that way, the ascent would contain the augmented second A♭→B♮ — the leap-sized "step" the previous figure shows being rejected. Bach raises both degrees in this local ascent, matching the validator\'s key-aware spelling check. The later descent through E♭ shows one context for these raised degrees; in Bach, sixth and seventh degrees vary with harmony and voice leading rather than following an ascending-only rule. (The opening C sounds over its lower octave in the source; the double stop is omitted here.)',
      ja: '無伴奏チェロ組曲第5番（BWV 1011）の第1小節、ハ短調です。冒頭の C が空中に保持されたあと、線は G から A♮、B♮ を踏んでまっすぐ C へ登ります。調号は A♭ と B♭ を指定しています。そのまま書けば上行には A♭→B♮ の増2度——前の譜例で退けられた、跳躍サイズの「ステップ」——が含まれてしまいます。バッハはこの箇所の上行で2音を半音上げ、検証器の調を考慮した綴りの判定と対応させています。後半の E♭ への下行は、このような音高の一例です。バッハの第6音・第7音は、上行だけの規則ではなく、和声と声部進行に応じて変化します。（原曲では冒頭の C は1オクターヴ下の音との重音です。ここでは省略しています。）',
    },
    time: '4/4',
    keySignature: 'Cm',
    width: 620,
    upperClef: 'bass',
    lowerClef: 'bass',
    upperLabel: { en: 'cello', ja: 'チェロ' },
    lowerLabel: { en: 'tacet', ja: '休止' },
    verdict: 'good',
    upper: [
      { key: 'c/3', duration: 'q', tie: true },
      { key: 'c/3', duration: '16' },
      { key: 'g/2', duration: '16' },
      { key: 'a/2', duration: '16', accidental: 'n', annotation: '♮6', color: GREEN },
      { key: 'b/2', duration: '16', accidental: 'n', annotation: '♮7', color: GREEN },
      { key: 'c/3', duration: '16', annotation: '8' },
      { key: 'd/3', duration: '16' },
      { key: 'eb/3', duration: '16' },
      { key: 'f/3', duration: '16' },
      { key: 'eb/3', duration: '16' },
      { key: 'd/3', duration: '16' },
      { key: 'eb/3', duration: '16' },
      { key: 'c/3', duration: '16' },
    ],
    lower: [{ key: 'd/3', duration: 'w', rest: true }],
    issues: [
      { kind: 'bracket', label: 'raised on the way up', fromUpper: 3, toUpper: 4, color: GREEN },
    ],
  },

  bachArch: {
    ruleIds: [],
    badge: { en: 'From Bach', ja: 'バッハの実例' },
    title: {
      en: 'Bach: "Little" Fugue in G minor — one peak, then a varied return',
      ja: 'バッハ: 小フーガ ト短調 — 頂点ひとつ、変化に富む帰還',
    },
    diagnosis: {
      en: 'The subject rises to a single high D, then returns through stepwise motion and several smaller leaps.',
      ja: '主唱は高い D を頂点に、順次進行といくつかの小さな跳躍を交えて戻ります。',
    },
    caption: {
      en: 'The subject of the "Little" G minor organ fugue (BWV 578) rises from G to a high D, then returns through a mix of stepwise motion and smaller leaps: D→B♭, G→B♭, F♯→A, and the closing A→D. The single high point remains clear, while the recovery is not stepwise throughout. The optional free-counterpoint scorer rewards this broader arch.',
      ja: '小フーガ ト短調（BWV 578）の主唱は G から高い D へ上がったあと、順次進行と小さな跳躍を交えて戻ります。D→B♭、G→B♭、F♯→A、そして最後の A→D が含まれます。頂点は一つですが、戻りには順次進行だけでなく跳躍も含まれます。オプションの自由対位法スコアラーは、この幅のあるアーチを評価します。',
    },
    time: '4/4',
    bars: 2,
    keySignature: 'Gm',
    width: 640,
    upperClef: 'treble',
    lowerClef: 'treble',
    upperLabel: { en: 'subject', ja: '主唱' },
    lowerLabel: { en: 'tacet', ja: '休止' },
    verdict: 'good',
    upper: [
      { key: 'g/4', duration: 'q' },
      { key: 'd/5', duration: 'q', annotation: 'peak', color: GREEN },
      { key: 'bb/4', duration: 'qd' },
      { key: 'a/4', duration: '8' },
      { key: 'g/4', duration: '8' },
      { key: 'bb/4', duration: '8' },
      { key: 'a/4', duration: '8' },
      { key: 'g/4', duration: '8' },
      { key: 'f#/4', duration: '8', accidental: '#' },
      { key: 'a/4', duration: '8' },
      { key: 'd/4', duration: 'q' },
    ],
    lower: [
      { key: 'b/4', duration: 'w', rest: true },
      { key: 'b/4', duration: 'w', rest: true },
    ],
    issues: [
      { kind: 'motion', label: 'P5 up', fromUpper: 0, toUpper: 1, color: AMBER },
      { kind: 'note', label: 'single climax', upperIndex: 1, color: GREEN },
      { kind: 'bracket', label: 'varied return', fromUpper: 2, toUpper: 8, color: GREEN },
    ],
  },

  bachLeapResolution: {
    ruleIds: ['diminished_melodic'],
    badge: { en: 'From Bach', ja: 'バッハの実例' },
    title: {
      en: 'Bach: WTC I Fugue in C♯ minor — a spelled diminished fourth',
      ja: 'バッハ: 平均律 I 巻 嬰ハ短調フーガ — 綴りでは減4度、響きは4半音',
    },
    diagnosis: {
      en: 'B♯ up to E is a diminished fourth by spelling but spans 4 semitones in sound, the same size as a major third; the line leaves the leap by step.',
      ja: 'B♯ から E への上行は綴りでは減4度ですが、響きは4半音で長3度と同じ幅です。旋律はこの跳躍のあと順次進行します。',
    },
    caption: {
      en: 'The subject of the C♯ minor fugue (WTC I, BWV 849) contains the notated leap B♯→E. Its spelling names a diminished fourth; its sounding size is four semitones, equal to a major third in 12-tone equal temperament. This is a melodic interval, so the example does not classify a vertical dissonance. `diminished_melodic` checks the semitone span and leaves this four-semitone leap alone; the following E→D♯ moves by step. The notation keeps the chromatic voice leading visible.',
      ja: '嬰ハ短調フーガ（平均律 I 巻、BWV 849）の主唱には、記譜上 B♯→E の跳躍があります。綴りは減4度ですが、響きの幅は4半音で、12平均律では長3度と同じです。これは旋律音程なので、縦の不協和として分類する例ではありません。`diminished_melodic` は半音数を検査し、この4半音の跳躍を対象にしません。その後の E→D♯ は順次進行です。記譜は半音階的な声部進行を示します。',
    },
    time: '4/4',
    bars: 3,
    keySignature: 'C#m',
    width: 560,
    upperClef: 'bass',
    lowerClef: 'bass',
    upperLabel: { en: 'subject', ja: '主唱' },
    lowerLabel: { en: 'tacet', ja: '休止' },
    verdict: 'caution',
    upper: [
      { key: 'c#/3', duration: 'w' },
      { key: 'b#/2', duration: 'h', accidental: '#', annotation: 'LT', color: AMBER },
      { key: 'e/3', duration: 'h', color: AMBER },
      { key: 'd#/3', duration: 'w', color: GREEN },
    ],
    lower: [
      { key: 'b/2', duration: 'w', rest: true },
      { key: 'b/2', duration: 'w', rest: true },
      { key: 'b/2', duration: 'w', rest: true },
    ],
    issues: [
      {
        kind: 'motion',
        label: 'dim 4th — but only 4 semitones',
        fromUpper: 1,
        toUpper: 2,
        color: AMBER,
      },
      { kind: 'motion', label: 'left by step', fromUpper: 2, toUpper: 3, color: GREEN },
    ],
  },
}
