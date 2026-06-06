import type { StaffExampleDef } from './types'
import { RED, AMBER } from './types'

/**
 * Chapter 1 — Intervals and consonance.
 * Foundation examples: no single validator rule, but the consonance
 * classification used by every vertical check in the engine.
 */
export const intervalExamples: Record<string, StaffExampleDef> = {
  perfectConsonances: {
    ruleIds: [],
    badge: { en: 'Perfect consonance', ja: '完全協和音程' },
    title: { en: 'Perfect consonances: fifth, octave, twelfth', ja: '完全5度・完全8度・完全12度' },
    diagnosis: {
      en: 'Each upper note forms a perfect consonance with the held C.',
      ja: 'どの上声音も、保持されたCと完全協和音程を作っています。',
    },
    caption: {
      en: 'Perfect consonances are acoustically hollow and stable. They anchor beginnings and endings, but two voices that keep landing on them in parallel stop sounding independent — that is why the parallel rules in the next chapter exist.',
      ja: '完全協和音程は澄んで安定した響きですが、空虚でもあります。曲の開始や終止の支点になる一方、二声が並行してこの響きに着地し続けると声部の独立が失われます。次章の並行禁則はそのためにあります。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'g/4', annotation: 'P5' },
      { key: 'c/5', annotation: 'P8' },
      { key: 'g/5', annotation: 'P12' },
    ],
    lower: [
      { key: 'c/4' },
      { key: 'c/4' },
      { key: 'c/4' },
    ],
    issues: [],
  },

  imperfectConsonances: {
    ruleIds: [],
    badge: { en: 'Imperfect consonance', ja: '不完全協和音程' },
    title: { en: 'Thirds, sixths, and tenths', ja: '3度・6度・10度' },
    diagnosis: {
      en: 'Thirds and sixths against the held C — full but mobile sonorities.',
      ja: '保持されたCに対する3度・6度。豊かでありながら推進力のある響きです。',
    },
    caption: {
      en: 'Imperfect consonances are the workhorses of two-voice counterpoint: rich enough to sound full, unstable enough to keep moving. Unlike perfect intervals, voices may travel in parallel thirds or sixths freely.',
      ja: '不完全協和音程は二声対位法の主力です。十分に豊かでありながら、先へ進もうとする性質を残しています。完全音程と違い、3度や6度の並行は自由に使えます。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'e/4', annotation: 'M3' },
      { key: 'a/4', annotation: 'M6' },
      { key: 'e/5', annotation: 'M10' },
    ],
    lower: [
      { key: 'c/4' },
      { key: 'c/4' },
      { key: 'c/4' },
    ],
    issues: [],
  },

  dissonantIntervals: {
    ruleIds: ['vertical_dissonance'],
    badge: { en: 'Dissonance', ja: '不協和音程' },
    title: { en: 'Seconds, sevenths, and the tritone', ja: '2度・7度・三全音' },
    diagnosis: {
      en: 'Each red interval is dissonant: it demands preparation and resolution.',
      ja: '赤い音程はいずれも不協和で、準備と解決を要求します。',
    },
    caption: {
      en: 'Dissonance is not forbidden — counterpoint runs on the tension it creates. What the validator rejects is unmanaged dissonance: a clash that arrives without preparation or leaves without resolution. Chapter 3 covers the legal patterns.',
      ja: '不協和音そのものは禁止ではありません。むしろ対位法は不協和音が生む緊張で駆動します。validator が退けるのは「管理されていない」不協和、つまり準備なく現れ解決なく去る衝突です。合法的な型は第3章で扱います。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'd/4', annotation: 'M2', color: RED, issue: true },
      { key: 'b/4', annotation: 'M7', color: RED, issue: true },
      { key: 'f#/4', accidental: '#', annotation: 'A4', color: RED, issue: true },
    ],
    lower: [
      { key: 'c/4', color: RED },
      { key: 'c/4', color: RED },
      { key: 'c/4', color: RED },
    ],
    issues: [
      { kind: 'vertical', label: 'M2', upperIndex: 0, lowerIndex: 0 },
      { kind: 'vertical', label: 'M7', upperIndex: 1, lowerIndex: 1 },
      { kind: 'vertical', label: 'tritone', upperIndex: 2, lowerIndex: 2 },
    ],
  },

  fourthAmbivalent: {
    ruleIds: ['fourth_only_on_weak_beat'],
    badge: { en: 'Context-dependent', ja: '文脈依存' },
    title: { en: 'The perfect fourth: consonant or dissonant?', ja: '完全4度 — 協和か不協和か' },
    diagnosis: {
      en: 'The fourth above the bass resolves down to a third, like a dissonance.',
      ja: 'バス上の4度が、不協和音のように3度へ下行解決しています。',
    },
    caption: {
      en: 'The fourth is the boundary case of interval theory. Between upper voices over a supporting bass it sounds consonant; directly against the bass it behaves as a dissonance and resolves to a third. The engine encodes this ambivalence: its interval-class table accepts the fourth, but a scoped rule rejects strong-beat fourths in upper-voice pairs.',
      ja: '4度は音程理論の境界例です。支えとなるバスの上で上声部どうしが作る4度は協和的に響きますが、バスとの間に直接できる4度は不協和音として振る舞い、3度へ解決します。エンジンもこの両義性をそのまま実装しており、音程クラス表では4度を許容しつつ、上声部ペアの強拍4度だけを専用ルールで退けます。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'f/4', annotation: '4', color: AMBER, issue: true },
      { key: 'e/4', annotation: '3' },
    ],
    lower: [
      { key: 'c/3' },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'vertical', label: '4 -> 3', upperIndex: 0, lowerIndex: 0 },
      { kind: 'motion', label: 'resolves down', fromUpper: 0, toUpper: 1 },
    ],
  },
}
