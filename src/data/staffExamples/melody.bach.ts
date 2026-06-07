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
      en: 'The first bar of the Fifth Cello Suite (BWV 1011), in C minor. The opening C hangs in the air, then the line climbs from G straight through A♮ and B♮ back to C. The key signature says A♭ and B♭; written that way, the ascent would contain the augmented second A♭→B♮ — the leap-sized "step" the previous figure shows being rejected. Bach raises both degrees on the way up, exactly the melodic-minor practice the validator\'s key-aware spelling check encodes. Descending later in the bar, the line relaxes back onto E♭ — the raised notes exist only to serve the climb. (The opening C sounds over its lower octave in the source; the double stop is omitted here.)',
      ja: '無伴奏チェロ組曲第5番（BWV 1011）の第1小節、ハ短調です。冒頭の C が空中に保持されたあと、線は G から A♮、B♮ を踏んでまっすぐ C へ登ります。調号は A♭ と B♭ を指定しています。そのまま書けば上行には A♭→B♮ の増2度——前の譜例で退けられた、跳躍サイズの「ステップ」——が含まれてしまう。バッハは上りの2音をどちらも半音上げます。検証器が調を考慮した綴りの判定で符号化しているのは、まさにこの旋律的短音階の実践です。小節の後半で下行に転じると、線は E♭ へ緩みます——引き上げられた音は、登りに奉仕するためだけに存在するのです。（原曲では冒頭の C は1オクターヴ下の音との重音です。ここでは省略しています。）',
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
    lower: [
      { key: 'd/3', duration: 'w', rest: true },
    ],
    issues: [
      { kind: 'bracket', label: 'raised on the way up', fromUpper: 3, toUpper: 4, color: GREEN },
    ],
  },

  bachArch: {
    ruleIds: [],
    badge: { en: 'From Bach', ja: 'バッハの実例' },
    title: {
      en: 'Bach: "Little" Fugue in G minor — one peak, then the line pays it back',
      ja: 'バッハ: 小フーガ ト短調 — 頂点はひとつ、あとは線が返済する',
    },
    diagnosis: {
      en: 'One leap to the high D — the only one — and the rest of the subject walks back down by step.',
      ja: '高い D への跳躍は一度きり。主唱の残りはすべて、順次進行で降りていきます。',
    },
    caption: {
      en: 'The subject of the "Little" G minor organ fugue (BWV 578), one of the most singable themes Bach ever wrote — and a model of the leap economy. The line spends its entire melodic budget in the first two notes: a clean fifth up to D, the peak, touched once and never regained. Everything after is repayment — B♭-A, then G-B♭-A-G-F♯ stepping down through the octave, until the cadence figure A→D closes the curve where it began. One climax, stepwise recovery, a clear arch: the shape the candidate search\'s scoring rewards, written in 1700 or so.',
      ja: '小フーガ ト短調（BWV 578）の主唱——バッハが書いた最も歌いやすい主題のひとつであり、跳躍の経済学の手本です。旋律の予算は最初の2音で使い切られます。D への完全5度の跳躍、それが頂点で、二度と取り戻されません。その後はすべて返済です。B♭-A、つづいて G-B♭-A-G-F♯ とオクターヴの中を順次に降り、終止音型の A→D が曲線を出発点で閉じます。頂点ひとつ、順次進行での回復、明確なアーチ——候補探索のスコアリングが評価するその形が、1700年頃にすでに書かれています。',
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
      { kind: 'bracket', label: 'stepwise payback', fromUpper: 2, toUpper: 8, color: GREEN },
    ],
  },

  bachLeapResolution: {
    ruleIds: ['diminished_melodic'],
    badge: { en: 'From Bach', ja: 'バッハの実例' },
    title: { en: 'Bach: WTC I Fugue in C♯ minor — a leap that is dissonant only on paper', ja: 'バッハ: 平均律 I 巻 嬰ハ短調フーガ — 紙の上だけ不協和な跳躍' },
    diagnosis: {
      en: 'B♯ up to E is a diminished fourth in spelling — but only 4 semitones in sound, identical to a major third, and the line resolves it by step.',
      ja: 'B♯ から E への上行は綴りの上では減4度——しかし響きは4半音、長3度と同一で、旋律は順次進行でこれを解決します。',
    },
    caption: {
      en: 'The subject of the C♯ minor fugue (WTC I, BWV 849) — four notes, among the most analyzed in the literature. On paper the leap B♯→E is a diminished fourth; in semitones it spans 4, byte-identical to a plain major third, so `diminished_melodic` has nothing to flag — and the ear agrees, hearing a consonant leap. What gives the subject its dark intensity is the spelling and the handling: the leap is approached by half step and left by step, every note a tendency tone. The rule bans only the spans unsingable under any name (6 and 11 semitones); this is Bach working expressively inside everything the ban leaves open.',
      ja: '嬰ハ短調フーガ（平均律 I 巻、BWV 849）の主唱——わずか4音、文献で最も分析されてきた主題の一つです。紙の上では B♯→E の跳躍は減4度。しかし半音数では4、ただの長3度とバイト単位で同一なので、`diminished_melodic` には検出するものがありません——耳も同じ意見で、協和な跳躍として聞きます。この主題の暗い張力を生むのは、綴りと扱い方です。跳躍は半音で近づかれ、順次進行で離れ、すべての音が傾向音。ルールが禁じるのは、どんな名前でも歌えない幅（6半音と11半音）だけです。禁止が開けたままにした空間の中で、バッハは表現として存分に書いています。',
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
      { kind: 'motion', label: 'dim 4th — but only 4 semitones', fromUpper: 1, toUpper: 2, color: AMBER },
      { kind: 'motion', label: 'left by step', fromUpper: 2, toUpper: 3, color: GREEN },
    ],
  },
}
