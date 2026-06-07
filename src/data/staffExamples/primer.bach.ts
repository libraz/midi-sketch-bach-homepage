import type { StaffExampleDef } from './types'
import { AMBER, GREEN } from './types'

/**
 * From Bach — corpus quotations for the primer chapter.
 * Note data is transcribed from the Bach corpus and verified against it;
 * it must not be hand-authored or adjusted by ear.
 */
export const primerBachExamples: Record<string, StaffExampleDef> = {
  bachScaleDegrees: {
    ruleIds: [],
    badge: { en: 'From Bach', ja: 'バッハの実例' },
    title: {
      en: 'Bach: WTC I Prelude in C major — a bar built from degrees 1, 3, and 5',
      ja: 'バッハ: 平均律 I 巻 ハ長調プレリュード — 音度1・3・5だけでできた1小節',
    },
    diagnosis: {
      en: 'Sixteen notes, three pitch classes: every single one is degree 1, 3, or 5 of C major — the tonic triad.',
      ja: '16個の音に対してピッチクラスは3つだけ。すべてがハ長調の第1・第3・第5音——主和音の構成音です。',
    },
    caption: {
      en: 'The first bar of the most famous prelude ever written (WTC I, BWV 846) uses no melody at all — just the tonic triad C-E-G spread into a ripple, two notes for the left hand and a six-note wave for the right, twice per bar. Read it with the degree numbers: 1-3-5-1-3, climbing through two octaves and never touching another degree. The next bar keeps the same ripple and changes the degrees to 2-4-6 over a held 1 — that is all "harmony changing over a pattern" means. (Bach notates the first two notes as held voices; they are shown here as the plain sixteenths the hand plays.)',
      ja: '史上最も有名なプレリュード（平均律 I 巻、BWV 846）の第1小節に、旋律はありません。あるのは主和音 C-E-G を波紋のように開いた音型だけ——左手に2音、右手に6音の波、それが小節に2回。音度で読んでみてください：1-3-5-1-3。2オクターヴを駆け上がりながら、他の音度には一度も触れません。次の小節は同じ波紋のまま、保持された1の上で音度を2-4-6に変えます。「音型の上で和声が変わる」とは、ただそれだけのことです。（冒頭の2音をバッハは保持声部として記譜しています。ここでは手が実際に弾く16分音符として示しました。）',
    },
    time: '4/4',
    width: 680,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'keyboard', ja: '鍵盤' },
    lowerLabel: { en: 'tacet', ja: '休止' },
    verdict: 'neutral',
    upper: [
      { key: 'c/4', duration: '16', annotation: '1', color: GREEN },
      { key: 'e/4', duration: '16', annotation: '3', color: GREEN },
      { key: 'g/4', duration: '16', annotation: '5', color: GREEN },
      { key: 'c/5', duration: '16', annotation: '1' },
      { key: 'e/5', duration: '16', annotation: '3' },
      { key: 'g/4', duration: '16', annotation: '5' },
      { key: 'c/5', duration: '16' },
      { key: 'e/5', duration: '16' },
      { key: 'c/4', duration: '16' },
      { key: 'e/4', duration: '16' },
      { key: 'g/4', duration: '16' },
      { key: 'c/5', duration: '16' },
      { key: 'e/5', duration: '16' },
      { key: 'g/4', duration: '16' },
      { key: 'c/5', duration: '16' },
      { key: 'e/5', duration: '16' },
    ],
    lower: [
      { key: 'd/3', duration: 'w', rest: true },
    ],
    issues: [
      { kind: 'bracket', label: 'tonic triad only', fromUpper: 0, toUpper: 7, color: GREEN },
    ],
  },

  bachStepsLeaps: {
    ruleIds: [],
    badge: { en: 'From Bach', ja: 'バッハの実例' },
    title: {
      en: 'Bach: Cello Suite No. 1, Prélude — steps and leaps in one bar',
      ja: 'バッハ: 無伴奏チェロ組曲第1番 プレリュード — 1小節の順次進行と跳躍',
    },
    diagnosis: {
      en: 'Two leaps open each half bar and land on chord tones; the steps in between decorate around B.',
      ja: '半小節ごとに2つの跳躍が和音構成音へ着地し、間の順次進行が B のまわりを飾ります。',
    },
    caption: {
      en: 'The opening bar of the First Cello Suite (BWV 1007) is a one-line demonstration of the step/leap economy. The two leaps — a fifth G→D, then a sixth D→B — are safe because they outline the G major triad: leaps that land on chord tones spend no melodic credit. Between them the line moves only by step, B-A-B, a neighbor figure decorating one chord tone. One voice, two registers, and the harmony is fully implied — chapter 7 returns to this trick under the name "compound melody".',
      ja: '無伴奏チェロ組曲第1番（BWV 1007）の冒頭小節は、順次進行と跳躍の経済学を一行で示しています。2つの跳躍——5度の G→D と6度の D→B——が安全なのは、ト長調の主和音をなぞっているからです。和音構成音へ着地する跳躍は、旋律的な借金を残しません。その間で線は B-A-B と順次にしか動かず、構成音をひとつ飾る刺繍音型になっています。1つの声部、2つの音域、それだけで和声が完全に立ち上がる——第7章で「複合旋律」という名前でこの手品に戻ってきます。',
    },
    time: '4/4',
    keySignature: 'G',
    width: 620,
    upperClef: 'bass',
    lowerClef: 'bass',
    upperLabel: { en: 'cello', ja: 'チェロ' },
    lowerLabel: { en: 'tacet', ja: '休止' },
    verdict: 'neutral',
    upper: [
      { key: 'g/2', duration: '16' },
      { key: 'd/3', duration: '16', color: AMBER },
      { key: 'b/3', duration: '16', color: AMBER },
      { key: 'a/3', duration: '16', color: GREEN },
      { key: 'b/3', duration: '16', color: GREEN },
      { key: 'd/3', duration: '16' },
      { key: 'b/3', duration: '16' },
      { key: 'd/3', duration: '16' },
      { key: 'g/2', duration: '16' },
      { key: 'd/3', duration: '16' },
      { key: 'b/3', duration: '16' },
      { key: 'a/3', duration: '16' },
      { key: 'b/3', duration: '16' },
      { key: 'd/3', duration: '16' },
      { key: 'b/3', duration: '16' },
      { key: 'd/3', duration: '16' },
    ],
    lower: [
      { key: 'd/3', duration: 'w', rest: true },
    ],
    issues: [
      { kind: 'motion', label: 'P5', fromUpper: 0, toUpper: 1, color: AMBER },
      { kind: 'motion', label: 'M6', fromUpper: 1, toUpper: 2, color: AMBER },
      { kind: 'bracket', label: 'steps', fromUpper: 2, toUpper: 4, color: GREEN },
    ],
  },
}
