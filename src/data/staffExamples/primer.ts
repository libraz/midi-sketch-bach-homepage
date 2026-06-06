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
    title: { en: 'Strong and weak beats', ja: '強拍と弱拍' },
    diagnosis: {
      en: 'Beat 1 of each bar is the strong beat — the engine checks harmony strictly there.',
      ja: '各小節の1拍目が強拍です。エンジンはこの位置で和声を厳密に検査します。',
    },
    caption: {
      en: 'Count along while playing: 1-2-3-4, 1-2-3. The first beat of every bar (the downbeat) feels like a checkpoint — listeners expect the harmony to be stable there. The validator uses exactly this binary model: a tick at the start of a bar is strong, every other position is weak. Tension is allowed to pass on weak beats; on the downbeat it sounds like a structural error.',
      ja: '再生しながら「1、2、3、4。1、2、3」と数えてみてください。各小節の1拍目（小節頭）はチェックポイントのように響き、聴き手はそこで和声が安定していることを期待します。validator もまさにこの二値モデルで、小節の先頭に当たる tick だけを強拍、それ以外をすべて弱拍として扱います。弱拍の緊張は通過として許されますが、強拍の緊張は構造の誤りとして聞こえます。',
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
      { key: 'a/4', annotation: '3' },
      { key: 'g/4', annotation: '4' },
      { key: 'd/5', annotation: '1' },
      { key: 'b/4', annotation: '2' },
      { key: 'c/5', duration: 'h', annotation: '3' },
    ],
    lower: [
      { key: 'c/3', color: GREEN },
      { key: 'g/3' },
      { key: 'f/3' },
      { key: 'e/3' },
      { key: 'g/2', color: GREEN },
      { key: 'g/2' },
      { key: 'c/3', duration: 'h' },
    ],
    issues: [
      { kind: 'note', label: 'strong', lowerIndex: 0, color: GREEN },
      { kind: 'bracket', label: 'weak', fromLower: 1, toLower: 3, color: AMBER },
      { kind: 'note', label: 'strong', lowerIndex: 4, color: GREEN },
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
      en: 'A key name is a tonic plus a step pattern. Play the scale over the held tonic: degrees 3→4 and 7→1 are semitones, every other step is a whole tone — W W H W W W H. Start that same pattern on any of the 12 pitch classes and you get that pitch\'s major key; the accidentals needed to keep the pattern intact become the key signature. Note how the final semitone (the leading tone) pulls the line home to the tonic.',
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
    title: { en: 'C major vs. C minor — same home, different mode', ja: 'ハ長調とハ短調 — 同じ主音、違う旋法' },
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
    lower: [
      { key: 'c/3', duration: 'w' },
    ],
    issues: [
      { kind: 'motion', label: 'steps', fromUpper: 0, toUpper: 2, color: GREEN },
      { kind: 'motion', label: 'leap (P4)', fromUpper: 2, toUpper: 3, color: AMBER },
    ],
  },
}
