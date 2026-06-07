import type { StaffExampleDef } from './types'
import { AMBER, GREEN } from './types'

/**
 * From Bach — corpus quotations for the dissonance chapter.
 * Note data is transcribed from the Bach corpus and verified against it;
 * it must not be hand-authored or adjusted by ear.
 */
export const dissonanceBachExamples: Record<string, StaffExampleDef> = {
  bachPassingTones: {
    ruleIds: ['unprepared_dissonance'],
    badge: { en: 'From Bach', ja: 'バッハの実例' },
    title: {
      en: 'Bach: WTC I Fugue in C major — passing tones in the wild',
      ja: 'バッハ: 平均律 I 巻 ハ長調フーガ — 実戦の経過音',
    },
    diagnosis: {
      en: 'A fourth and a seventh sound against the answer — both on weak sixteenths, both entered and left by step.',
      ja: '応唱に対して4度と7度が鳴ります——どちらも弱い16分音符の上で、どちらも順次進行で出入りします。',
    },
    caption: {
      en: 'Bar 2 of the C major fugue (WTC I, BWV 846): the answer enters above in calm eighths — G, A, B — while the first voice keeps its sixteenths running underneath. Twice the running line clashes with the held note above it: a fourth against G, then a major seventh against B. Both dissonances sit on weak sixteenths, both are approached by step and left by step, and the seventh melts into a bare octave one sixteenth later. This is the passing-tone contract executed at speed — the textbook pattern of the previous figure, in real counterpoint, twice in a single bar.',
      ja: 'ハ長調フーガ（平均律 I 巻、BWV 846）の第2小節。応唱が G、A、B と落ち着いた8分音符で上に入り、その下を初声部の16分音符が走り続けます。走る線は上の保持音と2度衝突します。G に対する4度、つづいて B に対する長7度です。どちらの不協和も弱い16分音符の上にあり、どちらも順次進行で近づき順次進行で離れ、7度は16分音符ひとつ後にはむき出しのオクターヴへ溶けています。前の譜例の教科書的な型を実戦の速度で——それも1小節に2回——実行したものです。',
    },
    time: '4/4',
    width: 660,
    upperClef: 'treble',
    lowerClef: 'treble',
    upperLabel: { en: 'answer', ja: '応唱' },
    lowerLabel: { en: 'voice 1', ja: '第1声部' },
    verdict: 'good',
    upper: [
      { key: 'b/4', duration: 'q', rest: true },
      { key: 'b/4', duration: 'q', rest: true },
      { key: 'b/4', duration: '8', rest: true },
      { key: 'g/4', duration: '8' },
      { key: 'a/4', duration: '8' },
      { key: 'b/4', duration: '8' },
    ],
    lower: [
      { key: 'd/4', duration: '8' },
      { key: 'g/4', duration: '8d' },
      { key: 'a/4', duration: '16' },
      { key: 'g/4', duration: '16' },
      { key: 'f/4', duration: '16' },
      { key: 'e/4', duration: '16' },
      { key: 'f/4', duration: '16' },
      { key: 'e/4', duration: '16' },
      { key: 'd/4', duration: '16', annotation: 'P4', color: GREEN },
      { key: 'c/4', duration: '16' },
      { key: 'd/4', duration: '16' },
      { key: 'c/4', duration: '16', annotation: 'M7', color: GREEN },
      { key: 'b/3', duration: '16', annotation: 'P8' },
    ],
    issues: [
      { kind: 'note', label: 'passing 4th', lowerIndex: 8, color: GREEN },
      { kind: 'vertical', label: 'passing 7th', upperIndex: 5, lowerIndex: 11, color: GREEN },
    ],
  },

  bachSuspensionChain: {
    ruleIds: ['suspension_preparation', 'suspension_resolution_step_down'],
    badge: { en: 'From Bach', ja: 'バッハの実例' },
    title: {
      en: 'Bach: WTC I Prelude in B minor — suspensions passed between voices',
      ja: 'バッハ: 平均律 I 巻 ロ短調プレリュード — 声部を渡り歩く掛留',
    },
    diagnosis: {
      en: 'Over a walking bass, soprano and alto take turns holding a note into a dissonance and resolving it down by step.',
      ja: '歩くバスの上で、ソプラノとアルトが交互に音を吊り、不協和を作っては順次下行で解決します。',
    },
    caption: {
      en: 'The opening of the B minor prelude that closes WTC I (BWV 869). Three suspensions in two bars, handed between the voices: the alto holds B into a fourth over the bass\'s F♯ and falls to A; the soprano ties F♯ across the barline into a fourth over C♯ and falls to E; the alto holds C♯ into a ninth over B and falls to B. Every one follows the three-stage script — consonant preparation, tie, step-down resolution — that `suspension_preparation` and `suspension_resolution_step_down` enforce. The soprano\'s final D is itself tied on into bar 3, where it makes the next seventh: the chain simply keeps going.',
      ja: '平均律 I 巻を閉じるロ短調プレリュード（BWV 869）の冒頭。2小節に3つの掛留が、声部から声部へ手渡されていきます。アルトは B を保持してバスの F♯ との4度を作り、A へ落ちる。ソプラノは F♯ を小節線越しにタイでつなぎ、C♯ 上の4度を作って E へ落ちる。アルトは C♯ を保持して B 上の9度を作り、B へ落ちる。どれも協和な準備・タイ・順次下行解決という三段の台本どおり——`suspension_preparation` と `suspension_resolution_step_down` が強制する型そのものです。ソプラノ最後の D もまた第3小節へタイでつながれ、そこで次の7度を作ります。連鎖はただ続いていくのです。',
    },
    time: '4/4',
    bars: 2,
    keySignature: 'Bm',
    width: 720,
    upperClef: 'treble',
    middleClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'soprano', ja: 'ソプラノ' },
    middleLabel: { en: 'alto', ja: 'アルト' },
    lowerLabel: { en: 'walking bass', ja: '歩くバス' },
    verdict: 'good',
    upper: [
      { key: 'b/4', duration: 'h', rest: true },
      { key: 'c#/5', duration: 'q' },
      { key: 'f#/5', duration: 'q', annotation: 'prep', tie: true },
      { key: 'f#/5', duration: 'q', color: AMBER },
      { key: 'e/5', duration: 'q', color: GREEN },
      { key: 'd/5', duration: 'h', annotation: 'prep', tie: true },
    ],
    middle: [
      { key: 'f#/4', duration: 'q' },
      { key: 'b/4', duration: 'q', annotation: 'prep', tie: true },
      { key: 'b/4', duration: 'q', color: AMBER },
      { key: 'a/4', duration: 'q', color: GREEN },
      { key: 'g#/4', duration: 'q', accidental: '#' },
      { key: 'c#/5', duration: 'q', annotation: 'prep', tie: true },
      { key: 'c#/5', duration: 'q', color: AMBER },
      { key: 'b/4', duration: '8', color: GREEN },
      { key: 'a/4', duration: '8' },
    ],
    lower: [
      { key: 'b/2', duration: '8' },
      { key: 'c#/3', duration: '8' },
      { key: 'd/3', duration: '8' },
      { key: 'e/3', duration: '8' },
      { key: 'f#/3', duration: '8' },
      { key: 'g#/3', duration: '8', accidental: '#' },
      { key: 'a/3', duration: '8' },
      { key: 'b/3', duration: '8' },
      { key: 'c#/4', duration: '8' },
      { key: 'b/3', duration: '8' },
      { key: 'a#/3', duration: '8', accidental: '#' },
      { key: 'f#/3', duration: '8' },
      { key: 'b/3', duration: '8' },
      { key: 'a/3', duration: '8' },
      { key: 'g/3', duration: '8' },
      { key: 'f#/3', duration: '8' },
    ],
    issues: [
      { kind: 'vertical', label: '4th', middleIndex: 2, lowerIndex: 4, color: AMBER },
      { kind: 'vertical', label: '4th', upperIndex: 3, lowerIndex: 8, color: AMBER },
      { kind: 'vertical', label: '9th', middleIndex: 6, lowerIndex: 12, color: AMBER },
      { kind: 'motion', label: 'each resolves down by step', fromUpper: 3, toUpper: 4, color: GREEN },
    ],
  },
}
