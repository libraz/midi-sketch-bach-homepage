import type { StaffExampleDef } from './types'
import { RED, AMBER, GREEN } from './types'

/**
 * Chapter 3 — Dissonance treatment.
 * Strong-beat consonance, weak-beat non-chord tones, and the four
 * declared suspension figures.
 */
export const dissonanceExamples: Record<string, StaffExampleDef> = {
  strongBeatDissonance: {
    ruleIds: ['strong_beat_dissonance'],
    badge: { en: 'Strong beat', ja: '強拍' },
    title: { en: 'Strong-beat non-chord tone', ja: '強拍の非和声音' },
    diagnosis: {
      en: 'The red downbeat note is not root, third, or fifth of the active triad.',
      ja: '赤い小節頭の音が、その場の三和音の根音・第3音・第5音ではありません。',
    },
    caption: {
      en: 'Downbeats are structural anchors. Generated notes are expected to belong to the active triad there.',
      ja: '小節頭は構造的な支点です。生成音はその場の三和音に属する必要があります。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'f/4', annotation: 'NCT', color: RED, issue: true },
      { key: 'e/4' },
    ],
    lower: [
      { key: 'c/3' },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'note', label: 'not in C-E-G', upperIndex: 0 },
    ],
  },

  verticalDissonance: {
    ruleIds: ['vertical_dissonance'],
    badge: { en: 'Vertical', ja: '縦の響き' },
    title: { en: 'Unsupported vertical dissonance', ja: '支えのない垂直的不協和' },
    diagnosis: {
      en: 'The simultaneous red interval is dissonant and has no declared suspension or passing-tone context.',
      ja: '赤い同時音程が不協和で、掛留や経過音としての文脈を持っていません。',
    },
    caption: {
      en: 'This check samples simultaneous voices on strong beats and blames the editable Compose side of the pair.',
      ja: '強拍で同時に鳴る声部をサンプリングし、修正可能な Compose 側を問題として扱います。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'd/4', annotation: '2nd', color: RED, issue: true },
      { key: 'e/4' },
    ],
    lower: [
      { key: 'c/3', color: RED, issue: true },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'vertical', label: 'unsupported dissonance', upperIndex: 0, lowerIndex: 0 },
    ],
  },

  passingTone: {
    ruleIds: ['unprepared_dissonance'],
    verdict: 'good',
    badge: { en: 'Allowed weak beat', ja: '許容される弱拍' },
    title: { en: 'Prepared passing dissonance', ja: '準備された経過的不協和' },
    diagnosis: {
      en: 'The middle non-chord tone is approached and left by step.',
      ja: '中央の非和声音は、前後を順次進行でつないでいます。',
    },
    caption: {
      en: 'The same dissonance would be unsafe as a structural arrival; stepwise context makes it a passing tone.',
      ja: '同じ不協和でも、構造的な到達点なら危険です。順次進行の文脈があるため経過音として読めます。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'e/4', annotation: '3' },
      { key: 'd/4', annotation: 'PT', color: AMBER, issue: true },
      { key: 'c/4', annotation: '8' },
    ],
    lower: [
      { key: 'c/3' },
      { key: 'c/3', color: AMBER, issue: true },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'vertical', label: 'weak dissonance', upperIndex: 1, lowerIndex: 1 },
      { kind: 'motion', label: 'stepwise in/out', fromUpper: 0, toUpper: 2 },
    ],
  },

  neighborTone: {
    ruleIds: ['unprepared_dissonance'],
    verdict: 'good',
    badge: { en: 'Allowed weak beat', ja: '許容される弱拍' },
    title: { en: 'Neighbor tone', ja: '刺繍音' },
    diagnosis: {
      en: 'The line steps down to a dissonance and returns to the same note.',
      ja: '同じ音から半音下の不協和音へ降り、元の音へ戻っています。',
    },
    caption: {
      en: 'A neighbor tone decorates one pitch by stepping away and back. Like the passing tone, it is legible because both the approach and the departure are steps — the validator accepts it on a weak beat.',
      ja: '刺繍音は、一つの音から順次進行で離れてすぐ戻る装飾です。経過音と同じく、出入りがどちらも順次進行なので意味が聞き取れます。弱拍であれば 検証器も許容します。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'c/4', annotation: '8' },
      { key: 'b/3', annotation: 'N', color: AMBER, issue: true },
      { key: 'c/4', annotation: '8' },
    ],
    lower: [
      { key: 'c/3' },
      { key: 'c/3', color: AMBER, issue: true },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'vertical', label: 'weak dissonance', upperIndex: 1, lowerIndex: 1 },
      { kind: 'motion', label: 'step away, step back', fromUpper: 0, toUpper: 2 },
    ],
  },

  unpreparedDissonance: {
    ruleIds: ['unprepared_dissonance'],
    badge: { en: 'Weak beat', ja: '弱拍' },
    title: { en: 'Unprepared dissonance', ja: '準備されない不協和' },
    diagnosis: {
      en: 'The weak-beat dissonance is left by leap, so it does not read as a passing tone.',
      ja: '弱拍の不協和から跳躍で離れており、経過音として読めません。',
    },
    caption: {
      en: 'Weak-beat non-chord tones are accepted only when approach and departure make the pattern legible.',
      ja: '弱拍の非和声音は、前後の線が準備と解決を明確にしている場合だけ許容されます。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'e/4' },
      { key: 'd/4', annotation: 'NCT', color: RED, issue: true },
      { key: 'g/4', annotation: 'leap', color: RED, issue: true },
    ],
    lower: [
      { key: 'c/3' },
      { key: 'c/3', color: RED },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'vertical', label: 'dissonance', upperIndex: 1, lowerIndex: 1 },
      { kind: 'motion', label: 'leaves by leap', fromUpper: 1, toUpper: 2 },
    ],
  },

  suspension43: {
    ruleIds: ['suspension_preparation', 'suspension_resolution_step_down'],
    badge: { en: 'Allowed pattern', ja: '許容される型' },
    title: { en: '4-3 suspension', ja: '4-3の掛留' },
    diagnosis: {
      en: 'The held note becomes a fourth over the new bass, then resolves down by step to a third.',
      ja: '保持された音が新しいバスとの4度になり、順次下行して3度へ解決します。',
    },
    caption: {
      en: 'The most common suspension at cadences. Preparation: the note is consonant. Suspension: the bass moves underneath, turning it into a fourth. Resolution: the voice falls one step to the third of the chord.',
      ja: '終止で最もよく使われる掛留です。準備で協和していた音の下でバスが動き、4度の不協和が生まれ、声部が一音下がって和音の3度へ解決します。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'f/4', annotation: 'prep', tie: true },
      { key: 'f/4', annotation: '4', color: AMBER, issue: true },
      { key: 'e/4', annotation: '3', color: GREEN },
    ],
    lower: [
      { key: 'd/3' },
      { key: 'c/3', color: AMBER, issue: true },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'bracket', label: 'prep - suspension - resolution', fromUpper: 0, toUpper: 2 },
      { kind: 'vertical', label: '4 -> 3', upperIndex: 1, lowerIndex: 1 },
      { kind: 'motion', label: 'step down', fromUpper: 1, toUpper: 2 },
    ],
  },

  suspension76: {
    ruleIds: ['suspension_preparation', 'suspension_resolution_step_down', 'suspension_seventh_sixth'],
    badge: { en: 'Allowed pattern', ja: '許容される型' },
    title: { en: '7-6 suspension', ja: '7-6の掛留' },
    diagnosis: {
      en: 'Preparation ties into the dissonance, then resolves down by step from 7 to 6.',
      ja: '準備音が保持され、7度の不協和を作ったあと、順次下行して6度へ解決します。',
    },
    caption: {
      en: 'The bracket marks the three points the material declaration requires: preparation, suspension, resolution. The dedicated rule additionally verifies a genuine seventh above the bass that resolves to a genuine sixth.',
      ja: '括弧は素材宣言が要求する三点、準備・掛留・解決を示します。専用ルールはさらに、バス上に本物の7度ができ、本物の6度へ解決することまで確認します。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'b/4', annotation: 'prep', tie: true },
      { key: 'b/4', annotation: '7', color: AMBER, issue: true },
      { key: 'a/4', annotation: '6', color: GREEN },
    ],
    lower: [
      { key: 'g/3' },
      { key: 'c/3', color: AMBER, issue: true },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'bracket', label: 'prep - suspension - resolution', fromUpper: 0, toUpper: 2 },
      { kind: 'vertical', label: '7 -> 6', upperIndex: 1, lowerIndex: 1 },
      { kind: 'motion', label: 'step down', fromUpper: 1, toUpper: 2 },
    ],
  },

  suspension98: {
    ruleIds: ['suspension_preparation', 'suspension_resolution_step_down'],
    badge: { en: 'Allowed pattern', ja: '許容される型' },
    title: { en: '9-8 suspension', ja: '9-8の掛留' },
    diagnosis: {
      en: 'The held note forms a ninth over the bass and resolves down into the octave.',
      ja: '保持された音がバスとの9度を作り、順次下行してオクターヴへ解決します。',
    },
    caption: {
      en: 'The 9-8 suspension resolves into a perfect interval, so it sounds more final than 7-6 or 4-3. Bach often reserves it for moments where the texture settles.',
      ja: '9-8の掛留は完全音程へ解決するため、7-6や4-3よりも収束感が強く響きます。テクスチュアが落ち着く場面でよく使われる型です。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'd/5', annotation: 'prep', tie: true },
      { key: 'd/5', annotation: '9', color: AMBER, issue: true },
      { key: 'c/5', annotation: '8', color: GREEN },
    ],
    lower: [
      { key: 'g/3' },
      { key: 'c/3', color: AMBER, issue: true },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'bracket', label: 'prep - suspension - resolution', fromUpper: 0, toUpper: 2 },
      { kind: 'vertical', label: '9 -> 8', upperIndex: 1, lowerIndex: 1 },
      { kind: 'motion', label: 'step down', fromUpper: 1, toUpper: 2 },
    ],
  },

  suspensionChain: {
    ruleIds: ['suspension_seventh_sixth', 'suspension_resolution_step_down'],
    badge: { en: 'Allowed pattern', ja: '許容される型' },
    title: { en: 'The 7-6 chain', ja: '7-6の連鎖' },
    diagnosis: {
      en: 'Each resolution becomes the preparation of the next suspension as the bass walks down.',
      ja: 'バスが順次下行するあいだ、各解決音がそのまま次の掛留の準備音になります。',
    },
    caption: {
      en: 'Chained, the 7-6 figure becomes a vehicle: the upper voice is tied over each bass step, clashes at a seventh, resolves to a sixth — and that sixth is already the preparation for the next seventh. The syncopated upper line against the steadily falling bass is one of the most recognizable sounds in Baroque sequences.',
      ja: '連鎖させると 7-6 は乗り物になります。上声はバスの一歩ごとにタイで持ち越され、7度でぶつかり、6度へ解決します——そしてその6度が、もう次の7度の準備音です。着実に下りるバスに対して上声がシンコペーションで遅れてゆくこの響きは、バロックのゼクエンツで最も耳に残る音のひとつです。',
    },
    time: '4/4',
    bars: 2,
    width: 680,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'c/5', duration: 'h', annotation: 'prep', tie: true },
      { key: 'c/5', annotation: '7', color: AMBER },
      { key: 'b/4', annotation: '6', color: GREEN, tie: true },
      { key: 'b/4', annotation: '7', color: AMBER },
      { key: 'a/4', annotation: '6', color: GREEN, tie: true },
      { key: 'a/4', annotation: '7', color: AMBER },
      { key: 'g/4', annotation: '6', color: GREEN },
    ],
    lower: [
      { key: 'e/3', duration: 'h' },
      { key: 'd/3', duration: 'h' },
      { key: 'c/3', duration: 'h' },
      { key: 'b/2', duration: 'h' },
    ],
    issues: [
      { kind: 'bracket', label: '7-6 rides the falling bass', fromUpper: 1, toUpper: 6, color: AMBER },
      { kind: 'motion', label: 'bass steps down', fromLower: 0, toLower: 3, color: GREEN },
    ],
  },

  suspension23: {
    ruleIds: ['suspension_preparation', 'suspension_resolution_step_down'],
    badge: { en: 'Allowed pattern', ja: '許容される型' },
    title: { en: '2-3 suspension (ascending resolution)', ja: '2-3の掛留（上行解決）' },
    diagnosis: {
      en: 'The suspended lower note clashes at a second, then resolves up by step to a third.',
      ja: '保持された下声が2度でぶつかり、順次上行して3度へ解決します。',
    },
    caption: {
      en: 'The one suspension figure in the engine that resolves upward. The suspended voice is the lower one: it holds while the other voice moves onto it, then rises one step to restore consonance. The validator enforces the direction per figure: 4-3, 7-6, and 9-8 fall; 2-3 rises.',
      ja: 'エンジンが扱う掛留のうち、唯一上行解決する型です。保持されるのは下の声部で、相手声部が動いて2度の衝突が生まれたあと、一音上がって協和を取り戻します。検証器は型ごとに解決方向を区別し、4-3・7-6・9-8 は下行、2-3 は上行を要求します。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'd/4', annotation: 'm3' },
      { key: 'c/4', annotation: '2', color: AMBER },
      { key: 'e/4', annotation: '3', color: GREEN },
    ],
    lower: [
      { key: 'b/2', annotation: 'prep', tie: true },
      { key: 'b/2', annotation: 'held', color: AMBER, issue: true },
      { key: 'c/3', annotation: 'up', color: GREEN },
    ],
    issues: [
      { kind: 'bracket', label: 'prep - suspension - resolution', fromUpper: 0, toUpper: 2 },
      { kind: 'vertical', label: '2 -> 3', upperIndex: 1, lowerIndex: 1 },
      { kind: 'motion', label: 'step up', fromLower: 1, toLower: 2, color: GREEN },
    ],
  },
}
