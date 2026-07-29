import type { StaffExampleDef } from './types'
import { AMBER, GREEN } from './types'

/**
 * Chapter 0 — Music primer.
 * Foundation examples with no validator rule of their own: beat strength
 * inside the bar, and the step/leap distinction used by the melodic rules.
 */
export const primerExamples: Record<string, StaffExampleDef> = {
  beatHierarchy: {
    ruleIds: [],
    badge: { en: 'Foundation', ja: '基礎' },
    title: { en: 'Strong, medium, and weak beats', ja: '強・中・弱の拍節階層' },
    diagnosis: {
      en: 'In 4/4, beat 1 is strong and beat 3 is a medium accent; both are structural checkpoints.',
      ja: '4/4 では1拍目が強、3拍目が中強で、どちらも構造上の検査位置です。',
    },
    caption: {
      en: 'Count 1-2-3-4 through both bars. The downbeat is strongest, while beat 3 carries a secondary accent. The validator treats both as structural accents and the intervening beats as weak. Other meters supply their own hierarchy: compound meters accent dotted pulses, and a Sarabande gives beat 2 a medium accent.',
      ja: '2小節とも「1、2、3、4」と数えてください。小節頭が最も強く、3拍目には副次的なアクセントがあります。検証器は両方を構造的アクセントとして扱い、その間の拍を弱とします。ほかの拍子では階層も変わり、複合拍子は付点の拍、サラバンドは2拍目が中強になります。',
    },
    time: '4/4',
    bars: 2,
    width: 680,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'melody', ja: '旋律' },
    lowerLabel: { en: 'bass', ja: 'バス' },
    upper: [
      { key: 'c/5', annotation: '1' },
      { key: 'b/4', annotation: '2' },
      { key: 'a/4', annotation: '3', color: AMBER },
      { key: 'g/4', annotation: '4' },
      { key: 'd/5', annotation: '1' },
      { key: 'b/4', annotation: '2' },
      { key: 'c/5', duration: 'h', annotation: '3', color: AMBER },
    ],
    lower: [
      { key: 'c/3', color: GREEN },
      { key: 'g/3' },
      { key: 'f/3', color: AMBER },
      { key: 'e/3' },
      { key: 'g/2', color: GREEN },
      { key: 'g/2' },
      { key: 'c/3', duration: 'h', color: AMBER },
    ],
    issues: [
      { kind: 'note', label: 'strong', lowerIndex: 0, color: GREEN },
      { kind: 'note', label: 'weak', lowerIndex: 1, color: AMBER },
      { kind: 'note', label: 'medium', lowerIndex: 2, color: AMBER },
      { kind: 'note', label: 'weak', lowerIndex: 3, color: AMBER },
      { kind: 'note', label: 'strong', lowerIndex: 4, color: GREEN },
      { kind: 'note', label: 'medium', lowerIndex: 6, color: AMBER },
    ],
  },

  majorScaleSteps: {
    ruleIds: [],
    badge: { en: 'Foundation', ja: '基礎' },
    title: { en: 'The major scale — W W H W W W H', ja: '長音階 — 全音と半音の並び' },
    diagnosis: {
      en: 'Two of the seven steps are semitones (H); the other five are whole tones (W).',
      ja: '7つのステップのうち2か所だけが半音（H）、残り5つは全音（W）です。',
    },
    caption: {
      en: "A key name is a tonic plus a step pattern. Play the scale over the held tonic: degrees 3→4 and 7→1 are semitones, every other step is a whole tone — W W H W W W H. Start that same pattern on any of the 12 pitch classes and you get that pitch's major key; the accidentals needed to keep the pattern intact become the key signature. Note how the final semitone (the leading tone) pulls the line home to the tonic.",
      ja: '調の名前は「主音＋ステップの並び」です。保持された主音の上でスケールを再生してみてください。第3音→第4音と第7音→主音だけが半音で、ほかはすべて全音 — W W H W W W H の並びです。この並びを12のピッチクラスのどれから始めても、その音を主音とする長調になります。並びを保つために必要なシャープやフラットが、そのまま調号になります。最後の半音（導音）が、線を主音へ引き戻す引力も聴き取れます。',
    },
    time: '4/4',
    bars: 2,
    width: 680,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'C major scale', ja: 'ハ長調の音階' },
    lowerLabel: { en: 'tonic', ja: '主音' },
    upper: [
      { key: 'c/4', annotation: '1' },
      { key: 'd/4', annotation: '2' },
      { key: 'e/4', annotation: '3' },
      { key: 'f/4', annotation: '4', color: AMBER },
      { key: 'g/4', annotation: '5' },
      { key: 'a/4', annotation: '6' },
      { key: 'b/4', annotation: '7' },
      { key: 'c/5', annotation: '1', color: GREEN },
    ],
    lower: [
      { key: 'c/3', duration: 'w' },
      { key: 'c/3', duration: 'w' },
    ],
    issues: [
      { kind: 'motion', label: 'H', fromUpper: 2, toUpper: 3, color: AMBER },
      { kind: 'motion', label: 'H', fromUpper: 6, toUpper: 7, color: GREEN },
    ],
    verdict: 'neutral',
  },

  majorVsMinor: {
    ruleIds: [],
    badge: { en: 'Foundation', ja: '基礎' },
    title: {
      en: 'C major vs. C minor — same home, different mode',
      ja: 'ハ長調とハ短調 — 同じ主音、違う旋法',
    },
    diagnosis: {
      en: 'The minor scale lowers degrees 3, 6, and 7 — three notes turn bright into dark.',
      ja: '短音階は第3・第6・第7音を半音下げます。3つの音が明るさを暗さに変えます。',
    },
    caption: {
      en: 'Both scales start and end on C — same home, different step pattern. The play button plays them in turn: first major, then minor. Lowering degrees 3, 6, and 7 is all it takes for the line to turn darker. Shown here is the natural minor; in practice counterpoint raises the 7th back up to recover a leading tone (harmonic minor — course chapter 4). A minor played from A to A uses the *unaltered* white keys of C major: that pair is the relative keys.',
      ja: 'どちらのスケールも C で始まり C で終わります — 帰る場所は同じで、ステップの並びだけが違います。再生ボタンで順に鳴ります：先に長調、続けて短調です。第3・第6・第7音を半音下げるだけで、線は暗い表情に変わります。譜例は自然短音階で、実際の対位法では導音を取り戻すために第7音を半音上げ直します（和声的短音階 — 第4章）。なお、変化記号なしの C major と同じ白鍵を A から A まで弾くとイ短調になります。これが平行調です。',
    },
    time: '4/4',
    bars: 2,
    width: 680,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'C major', ja: 'ハ長調' },
    lowerLabel: { en: 'C minor', ja: 'ハ短調' },
    upper: [
      { key: 'c/4', annotation: '1' },
      { key: 'd/4', annotation: '2' },
      { key: 'e/4', annotation: '3' },
      { key: 'f/4', annotation: '4' },
      { key: 'g/4', annotation: '5' },
      { key: 'a/4', annotation: '6' },
      { key: 'b/4', annotation: '7' },
      { key: 'c/5', annotation: '1' },
    ],
    lower: [
      { key: 'c/3', annotation: '1' },
      { key: 'd/3', annotation: '2' },
      { key: 'eb/3', accidental: 'b', annotation: '♭3', color: AMBER },
      { key: 'f/3', annotation: '4' },
      { key: 'g/3', annotation: '5' },
      { key: 'ab/3', accidental: 'b', annotation: '♭6', color: AMBER },
      { key: 'bb/3', accidental: 'b', annotation: '♭7', color: AMBER },
      { key: 'c/4', annotation: '1' },
    ],
    playback: 'sequential',
    verdict: 'neutral',
  },

  stepsAndLeaps: {
    ruleIds: [],
    badge: { en: 'Foundation', ja: '基礎' },
    title: { en: 'Steps and leaps', ja: '順次進行と跳躍' },
    diagnosis: {
      en: 'Three notes move by step; the last one leaps a fourth.',
      ja: '三つの音は隣の音へ順次進行し、最後の音だけ4度跳躍します。',
    },
    caption: {
      en: 'A step moves to the next-door scale note (1-2 semitones); anything larger is a leap. The distinction drives the melodic rules: dissonance must be approached and left by step, and leaps spend energy that stepwise motion has to pay back. Here the bass holds while the melody walks up by step and then leaps a fourth to the octave.',
      ja: '隣のスケール音へ移ること（半音1〜2個分）を順次進行、それより大きい動きを跳躍と呼びます。この区別が旋律ルールの軸になります。不協和音は順次進行で出入りしなければならず、跳躍で使ったエネルギーは順次進行で返す必要があります。譜例ではバスが保持され、旋律が順次に上ってから4度跳躍してオクターヴに着地します。',
    },
    time: '4/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'melody', ja: '旋律' },
    lowerLabel: { en: 'bass', ja: 'バス' },
    upper: [
      { key: 'e/4' },
      { key: 'f/4', color: GREEN },
      { key: 'g/4', color: GREEN },
      { key: 'c/5', color: AMBER },
    ],
    lower: [{ key: 'c/3', duration: 'w' }],
    issues: [
      { kind: 'motion', label: 'steps', fromUpper: 0, toUpper: 2, color: GREEN },
      { kind: 'motion', label: 'leap (P4)', fromUpper: 2, toUpper: 3, color: AMBER },
    ],
  },
}
