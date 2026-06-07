import type { StaffExampleDef } from './types'
import { RED, AMBER, GREEN } from './types'

/**
 * Chapter 2 — Motion between voices and the forbidden parallels.
 * Parallel/hidden perfects, crossing, spacing, and the invertible
 * counterpoint constraints (P10).
 */
export const motionExamples: Record<string, StaffExampleDef> = {
  contraryOblique: {
    ruleIds: [],
    badge: { en: 'Safe motion', ja: '安全な運動' },
    title: { en: 'Contrary and oblique motion', ja: '反行と斜行' },
    diagnosis: {
      en: 'First the voices move apart in opposite directions, then one holds while the other moves.',
      ja: 'まず両声部が逆方向に開き、次に一方が保持されたままもう一方だけが動きます。',
    },
    caption: {
      en: 'Contrary and oblique motion are the safest ways to approach any interval — even a perfect one. Independence is audible because the voices do different things. Most parallel-rule violations disappear when one voice simply moves the other way.',
      ja: '反行と斜行は、完全音程も含めどんな響きへ向かうにも最も安全な運動です。二つの声部が別々のことをしているため、独立性が耳で確認できます。並行禁則の多くは、片方の声部を逆向きに動かすだけで解消します。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'treble',
    upper: [
      { key: 'e/5', annotation: 'M10' },
      { key: 'd/5', annotation: 'M6' },
      { key: 'd/5', annotation: 'P5', color: GREEN },
    ],
    lower: [
      { key: 'c/4' },
      { key: 'f/4' },
      { key: 'g/4', color: GREEN },
    ],
    issues: [
      { kind: 'motion', label: 'contrary', fromUpper: 0, toUpper: 1, fromLower: 0, toLower: 1, color: GREEN },
      { kind: 'motion', label: 'oblique into P5 - safe', fromLower: 1, toLower: 2, color: GREEN },
    ],
  },

  parallelSixths: {
    ruleIds: [],
    badge: { en: 'Allowed pattern', ja: '許容される型' },
    title: { en: 'Parallel sixths are fine', ja: '6度の並行は問題ない' },
    diagnosis: {
      en: 'Both voices move in parallel, but the repeated interval is imperfect.',
      ja: '両声部が並行していますが、繰り返される音程は不完全協和です。',
    },
    caption: {
      en: 'The parallel prohibition applies only to perfect intervals. Chains of parallel thirds, sixths, and tenths are idiomatic Baroque writing — each sonority is rich enough that the voices keep their identity even while moving together.',
      ja: '並行禁則の対象は完全音程だけです。3度・6度・10度の並行は、バロック書法の常套句そのものです。響き自体に厚みがあるため、声部が一緒に動いても独立性は失われません。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'treble',
    upper: [
      { key: 'c/5', annotation: 'm6', color: GREEN },
      { key: 'd/5', annotation: 'M6', color: GREEN },
      { key: 'e/5', annotation: 'm6', color: GREEN },
    ],
    lower: [
      { key: 'e/4', color: GREEN },
      { key: 'f/4', color: GREEN },
      { key: 'g/4', color: GREEN },
    ],
    issues: [
      { kind: 'motion', label: 'parallel imperfects - allowed', fromUpper: 0, toUpper: 2, fromLower: 0, toLower: 2, color: GREEN },
    ],
  },

  parallelFifths: {
    ruleIds: ['parallel_fifth'],
    badge: { en: 'Forbidden', ja: '禁則' },
    title: { en: 'Parallel fifths', ja: '並行5度' },
    diagnosis: {
      en: 'Both voices move up, and the red vertical interval remains P5 at both arrivals.',
      ja: '両声部が上行し、赤い縦の音程が前後とも完全5度のままです。',
    },
    caption: {
      en: 'The red verticals show the repeated perfect fifth. The arrows show that neither voice is stationary, so this is not oblique motion.',
      ja: '赤い縦線が、前後どちらも完全5度であることを示します。矢印は両声部が動いていることを示し、斜行ではないと分かります。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'treble',
    upper: [
      { key: 'c/5', annotation: 'P5', color: RED, issue: true },
      { key: 'd/5', annotation: 'P5', color: RED, issue: true },
    ],
    lower: [
      { key: 'f/4', color: RED, issue: true },
      { key: 'g/4', color: RED, issue: true },
    ],
    issues: [
      { kind: 'vertical', label: 'P5', upperIndex: 0, lowerIndex: 0 },
      { kind: 'vertical', label: 'P5', upperIndex: 1, lowerIndex: 1 },
      { kind: 'motion', label: 'similar motion', fromUpper: 0, toUpper: 1, fromLower: 0, toLower: 1 },
    ],
  },

  parallelOctaves: {
    ruleIds: ['parallel_octave'],
    badge: { en: 'Forbidden', ja: '禁則' },
    title: { en: 'Parallel octaves', ja: '並行8度' },
    diagnosis: {
      en: 'Both voices move in the same direction while the interval remains an octave.',
      ja: '両声部が同方向へ動き、縦の音程がオクターヴのまま反復されます。',
    },
    caption: {
      en: 'The octave frame is repeated by motion in both voices, collapsing two lines into one doubled contour.',
      ja: 'オクターヴの枠が、二声の移動によってそのまま繰り返されています。二つの声部が一つの重複旋律のように聞こえる状態です。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'treble',
    upper: [
      { key: 'c/5', annotation: '8', color: RED, issue: true },
      { key: 'd/5', annotation: '8', color: RED, issue: true },
    ],
    lower: [
      { key: 'c/4', color: RED, issue: true },
      { key: 'd/4', color: RED, issue: true },
    ],
    issues: [
      { kind: 'vertical', label: '8ve', upperIndex: 0, lowerIndex: 0 },
      { kind: 'vertical', label: '8ve', upperIndex: 1, lowerIndex: 1 },
      { kind: 'motion', label: 'parallel motion', fromUpper: 0, toUpper: 1, fromLower: 0, toLower: 1 },
    ],
  },

  hiddenFifth: {
    ruleIds: ['hidden_parallel_fifth'],
    badge: { en: 'Forbidden arrival', ja: '禁じられた到達' },
    title: { en: 'Hidden fifth', ja: '隠伏5度' },
    diagnosis: {
      en: 'Similar motion moves from an imperfect interval directly into P5.',
      ja: '不完全音程から同方向へ進み、完全5度へ直接到達しています。',
    },
    caption: {
      en: 'The first sonority is imperfect; the second is the red perfect fifth. Similar motion makes the perfect arrival sound exposed.',
      ja: '最初の響きは不完全協和、次の響きは赤い完全5度です。同方向に入るため、隠れた並行として扱われます。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'treble',
    upper: [
      { key: 'a/4', annotation: 'M3' },
      { key: 'd/5', annotation: 'P5', color: RED, issue: true },
    ],
    lower: [
      { key: 'f/4' },
      { key: 'g/4', color: RED, issue: true },
    ],
    issues: [
      { kind: 'vertical', label: 'lands on P5', upperIndex: 1, lowerIndex: 1 },
      { kind: 'motion', label: 'similar approach', fromUpper: 0, toUpper: 1, fromLower: 0, toLower: 1 },
    ],
  },

  hiddenOctave: {
    ruleIds: ['hidden_parallel_octave'],
    badge: { en: 'Forbidden arrival', ja: '禁じられた到達' },
    title: { en: 'Hidden octave', ja: '隠伏8度' },
    diagnosis: {
      en: 'Both voices move upward into a perfect octave by similar motion.',
      ja: '両声部が同方向に上行し、完全8度へ到達しています。',
    },
    caption: {
      en: 'Landing on an octave by similar motion makes the empty interval jump out of the texture. The engine checks every voice pair at every onset, with the same exemptions as the hidden fifth: cadence cells and both-material pairs.',
      ja: '同方向の運動でオクターヴに着地すると、空虚な響きがテクスチュアから飛び出して聞こえます。エンジンはすべての声部ペアをすべての発音点で検査し、免除は隠伏5度と同じ——終止セルと両 Material のペアです。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'treble',
    upper: [
      { key: 'c/5', annotation: 'm6' },
      { key: 'g/5', annotation: 'P8', color: RED, issue: true },
    ],
    lower: [
      { key: 'e/4' },
      { key: 'g/4', color: RED, issue: true },
    ],
    issues: [
      { kind: 'vertical', label: 'lands on P8', upperIndex: 1, lowerIndex: 1 },
      { kind: 'motion', label: 'similar approach', fromUpper: 0, toUpper: 1, fromLower: 0, toLower: 1 },
    ],
  },

  voiceCrossing: {
    ruleIds: ['voice_crossing'],
    badge: { en: 'Forbidden', ja: '禁則' },
    title: { en: 'Voice crossing', ja: '声部交差' },
    diagnosis: {
      en: 'The lower voice rises above the upper voice at the red arrival.',
      ja: '赤い到達点で下声が上声を越えています。',
    },
    caption: {
      en: 'Voice order is part of the texture contract. Crossing makes the lines ambiguous.',
      ja: '声部の上下関係もテクスチュアの契約です。交差すると各線の役割が曖昧になります。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'treble',
    upper: [
      { key: 'e/4' },
      { key: 'c/4', color: RED, issue: true },
    ],
    lower: [
      { key: 'c/4' },
      { key: 'e/4', color: RED, issue: true },
    ],
    issues: [
      { kind: 'vertical', label: 'voices reversed', upperIndex: 1, lowerIndex: 1 },
      { kind: 'motion', label: 'crossing', fromUpper: 0, toUpper: 1, fromLower: 0, toLower: 1 },
    ],
  },

  spacingWide: {
    ruleIds: ['spacing_adjacent_voices_within_octave'],
    badge: { en: 'Spacing', ja: '間隔' },
    title: { en: 'Upper voices too far apart', ja: '上声部間が広すぎる' },
    diagnosis: {
      en: 'The adjacent upper voices exceed an octave.',
      ja: '隣接する上声部の間隔がオクターヴを超えています。',
    },
    caption: {
      en: 'For three or more voices, upper adjacent pairs stay within an octave. The bottom pair may be wider in four-voice writing.',
      ja: '三声以上では、上の隣接声部はオクターヴ以内に保ちます。四声体のテノール-バス間だけは広くなり得ます。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'treble',
    upper: [
      { key: 'g/5', annotation: '>8ve', color: RED, issue: true },
      { key: 'f/5' },
    ],
    lower: [
      { key: 'c/4', color: RED, issue: true },
      { key: 'd/4' },
    ],
    issues: [
      { kind: 'vertical', label: 'upper spacing > octave', upperIndex: 0, lowerIndex: 0 },
    ],
  },

  spacingTrio: {
    ruleIds: ['spacing_adjacent_voices_within_octave'],
    badge: { en: 'Spacing', ja: '間隔' },
    title: { en: 'Three-voice spacing: tight on top, free below', ja: '三声の間隔 — 上は密に、下は自由に' },
    diagnosis: {
      en: 'The soprano-alto gap stays within an octave; the alto-bass gap may exceed it.',
      ja: 'ソプラノとアルトの間隔はオクターヴ以内、アルトとバスの間隔は超えてもかまいません。',
    },
    caption: {
      en: 'This is the rule as it actually applies — to real three-voice texture. Upper adjacent pairs are kept within an octave so the chord sounds connected; the bottom pair is allowed to spread because a wide gap above the bass is exactly how Bach voices keyboard music. The validator checks the spacing at each chord start.',
      ja: 'このルールが本来適用される、実際の三声テクスチュアでの形です。上の隣接ペアをオクターヴ以内に保つことで和音はひとつながりに響きます。一方、最下ペアは広がってよく、バスの上に広い空間を取るのはまさにバッハの鍵盤書法そのものです。検証器は各和音の開始点で間隔を検査します。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    middleClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'soprano', ja: 'ソプラノ' },
    middleLabel: { en: 'alto', ja: 'アルト' },
    lowerLabel: { en: 'bass', ja: 'バス' },
    upper: [
      { key: 'e/5', color: GREEN },
      { key: 'd/5' },
      { key: 'c/5' },
    ],
    middle: [
      { key: 'g/4', color: GREEN },
      { key: 'f/4' },
      { key: 'e/4' },
    ],
    lower: [
      { key: 'c/3', color: GREEN },
      { key: 'd/3' },
      { key: 'e/3' },
    ],
    issues: [
      { kind: 'vertical', label: 'within an octave', upperIndex: 0, middleIndex: 0, color: GREEN },
      { kind: 'vertical', label: 'bottom pair may spread', middleIndex: 2, lowerIndex: 2, color: AMBER },
    ],
  },

  octaveInversion: {
    ruleIds: ['invertible_at_octave'],
    badge: { en: 'Invertible counterpoint', ja: '転回対位法' },
    title: { en: 'Inversion at the octave: 5 becomes 4', ja: '8度の転回 — 5度は4度になる' },
    diagnosis: {
      en: 'The same two pitch classes form a fifth, then a fourth once the lower note moves up an octave.',
      ja: '同じ二つの音が、下の音をオクターヴ上げると5度から4度に変わります。',
    },
    caption: {
      en: 'Invertible counterpoint means two lines still work after swapping registers. Every interval maps to its complement: 5ths become 4ths, octaves become unisons. That is why the engine bans strong-beat fourths and parallel octaves in upper-voice pairs — after inversion they would become strong-beat fifths and parallel unisons.',
      ja: '転回対位法とは、二つの旋律の上下を入れ替えても成立する書法のことです。転回するとすべての音程が補数に写ります。5度は4度に、オクターヴはユニゾンに変わります。エンジンが上声部ペアの強拍4度と並行8度を退けるのはこのためで、転回後にそれぞれ強拍5度・並行ユニゾンになってしまうからです。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'treble',
    upper: [
      { key: 'c/5', annotation: 'P5', color: AMBER },
      { key: 'f/5', annotation: 'P4', color: AMBER, issue: true },
    ],
    lower: [
      { key: 'f/4', annotation: 'F' },
      { key: 'c/5', annotation: 'F+8ve' },
    ],
    issues: [
      { kind: 'vertical', label: 'P5', upperIndex: 0, lowerIndex: 0, color: AMBER },
      { kind: 'vertical', label: 'inverts to P4', upperIndex: 1, lowerIndex: 1, color: AMBER },
    ],
  },

  fourthWeakBeat: {
    ruleIds: ['fourth_only_on_weak_beat'],
    badge: { en: 'Scoped rule', ja: '適用範囲あり' },
    title: { en: 'Strong-beat fourth between upper voices', ja: '上声部間の強拍4度' },
    diagnosis: {
      en: 'The red fourth is on a strong beat in an upper-voice pair.',
      ja: '赤い4度が、上声部ペアの強拍に置かれています。',
    },
    caption: {
      en: 'A fourth can pass on a weak beat, but the scoped upper pair cannot use it as a strong-beat pillar.',
      ja: '4度は経過的な響きとして扱えますが、上声部では強拍の柱としては拒否されます。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'treble',
    upper: [
      { key: 'f/5', annotation: '4', color: AMBER, issue: true },
      { key: 'e/5', annotation: '3' },
    ],
    lower: [
      { key: 'c/5', color: AMBER, issue: true },
      { key: 'c/5' },
    ],
    issues: [
      { kind: 'vertical', label: 'strong-beat 4th', upperIndex: 0, lowerIndex: 0 },
    ],
  },
}
