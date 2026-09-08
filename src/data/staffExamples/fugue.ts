import type { StaffExampleDef } from './types'
import { AMBER, GREEN } from './types'

/**
 * Chapter 6 — Fugal devices.
 * Subject/answer mapping, countersubject continuity, sequences,
 * imitation, stretto, and pedal points.
 */
export const fugueExamples: Record<string, StaffExampleDef> = {
  realVsTonalAnswer: {
    ruleIds: ['tonal_answer_dominant_mapping'],
    badge: { en: 'Fugal device', ja: 'フーガ技法' },
    title: { en: 'Subject and tonal answer', ja: '主唱と変応（トーナルアンサー）' },
    diagnosis: {
      en: 'The subject opens on the tonic; this teaching cell models a tonal answer whose head maps I to V.',
      ja: '主唱は主音で始まります。この譜例は、冒頭で I を V へ写像する変応をモデル化しています。',
    },
    caption: {
      en: 'A real answer transposes the whole subject up a fifth. A tonal answer makes small intervallic adjustments where a literal transposition would destabilize the tonic; this teaching cell models that as I↔V mapping at the head. Real fugues can modify more than a simple head/tail split, while the validator checks the declared head mapping.',
      ja: '実応は主唱全体を5度上へ移調します。変応は、機械的な移調が主調を不安定にする箇所で音程を小さく調整します。この譜例はその調整を冒頭の I↔V 写像としてモデル化したものです。実際のフーガでは単純な「冒頭／尾部」の分割を超えて変更されることもありますが、検証器が確認するのは宣言された冒頭の写像です。',
    },
    time: '4/4',
    width: 620,
    upperClef: 'treble',
    lowerClef: 'treble',
    upperLabel: { en: 'subject', ja: '主唱' },
    lowerLabel: { en: 'answer', ja: '応唱' },
    playback: 'sequential',
    upper: [
      { key: 'c/4', annotation: 'I', color: AMBER, issue: true },
      { key: 'g/4', annotation: 'V' },
      { key: 'e/4' },
      { key: 'f/4' },
    ],
    lower: [
      { key: 'g/4', annotation: 'V', color: AMBER, issue: true },
      { key: 'c/5', annotation: 'I' },
      { key: 'b/4' },
      { key: 'c/5' },
    ],
    issues: [
      { kind: 'vertical', label: 'I maps to V', upperIndex: 0, lowerIndex: 0, color: AMBER },
      {
        kind: 'motion',
        label: 'engine head mapping',
        fromLower: 0,
        toLower: 3,
        color: AMBER,
      },
    ],
  },

  countersubjectContinuous: {
    ruleIds: ['countersubject_continuous'],
    badge: { en: 'Fugal device', ja: 'フーガ技法' },
    title: { en: 'Declared countersubject keeps sounding', ja: '宣言された対主題が鳴り続ける' },
    diagnosis: {
      en: 'When a countersubject is declared, it fills every beat of the answer window without resting.',
      ja: '対主題を宣言した場合、その声部が応唱の区間を休みなく満たします。',
    },
    caption: {
      en: 'A countersubject is a recurring companion in some fugues, not a requirement of every fugue. When material declares one, this engine contract samples every quarter-beat of the answer window and fails if the countersubject voice falls silent.',
      ja: '対主題は一部のフーガで使われる反復的な相方の線で、すべてのフーガに必須ではありません。素材が対主題を宣言した場合、このエンジン契約は応唱の区間を4分音符単位で調べ、対主題声部が途切れると失敗にします。',
    },
    time: '4/4',
    width: 620,
    upperClef: 'treble',
    lowerClef: 'treble',
    upperLabel: { en: 'answer', ja: '応唱' },
    lowerLabel: { en: 'CS', ja: '対主題' },
    upper: [{ key: 'g/4' }, { key: 'a/4' }, { key: 'b/4' }, { key: 'c/5' }],
    lower: [
      { key: 'e/4', duration: '8', color: GREEN },
      { key: 'd/4', duration: '8', color: GREEN },
      { key: 'c/4', duration: '8', color: GREEN },
      { key: 'b/3', duration: '8', color: GREEN },
      { key: 'g/3', duration: '8', color: GREEN },
      { key: 'a/3', duration: '8', color: GREEN },
      { key: 'b/3', duration: '8', color: GREEN },
      { key: 'c/4', duration: '8', color: GREEN },
    ],
    issues: [
      { kind: 'bracket', label: 'no gaps in the window', fromUpper: 0, toUpper: 3, color: GREEN },
    ],
  },

  sequenceSteps: {
    ruleIds: ['sequence_pattern_consistency', 'episode_motif_derived'],
    badge: { en: 'Episode', ja: '嬉遊部' },
    title: { en: 'Descending sequence', ja: '下行ゼクエンツ' },
    diagnosis: {
      en: 'This engine cell repeats bar one exactly, transposed down one step.',
      ja: '2小節目が1小節目をそのまま1度下へ移調して繰り返しています。',
    },
    caption: {
      en: 'Sequences are common ways for Baroque episodes to travel between keys, but episodes can also develop other ideas and need not be exact transpositions. This cell shows the stricter engine contract: each declared step must be a verbatim transposition of the seed by the declared offset.',
      ja: 'ゼクエンツはバロックの嬉遊部が調から調へ移動する一般的な方法ですが、嬉遊部は別の素材を展開することもあり、常に正確な移調になるわけではありません。このセルは、各段を宣言されたオフセットで種から逐語的に移調させる、より厳しいエンジン契約を示します。',
    },
    time: '3/4',
    bars: 2,
    width: 680,
    upperClef: 'treble',
    lowerClef: 'treble',
    upper: [
      { key: 'c/5', annotation: 'seed', color: AMBER },
      { key: 'b/4', color: AMBER },
      { key: 'a/4', color: AMBER },
      { key: 'b/4', annotation: '-1 step', color: GREEN },
      { key: 'a/4', color: GREEN },
      { key: 'g/4', color: GREEN },
    ],
    lower: [
      { key: 'a/3' },
      { key: 'g/3' },
      { key: 'f/3' },
      { key: 'g/3' },
      { key: 'f/3' },
      { key: 'e/3' },
    ],
    issues: [
      { kind: 'bracket', label: 'seed', fromUpper: 0, toUpper: 2, color: AMBER },
      { kind: 'bracket', label: 'exact transposition', fromUpper: 3, toUpper: 5, color: GREEN },
    ],
  },

  motifInversion: {
    ruleIds: ['episode_motif_derived'],
    badge: { en: 'Episode', ja: '嬉遊部' },
    title: { en: 'Motif inversion: the seed upside down', ja: '動機の反行形 — 種を上下逆さに' },
    diagnosis: {
      en: 'The derived line mirrors every step of the seed in the opposite direction.',
      ja: '導出された線が、種のすべての歩みを反対方向に鏡映しています。',
    },
    caption: {
      en: 'When material declares a subject slice and a transform, inversion is a clear example: an upward step becomes a downward step, and an upward third becomes a downward third. Historical episodes can use other ideas; this cell isolates the declared engine transform, which is checked by pitch, duration, and tick.',
      ja: '素材が主題の断片と変形を宣言した場合、反行は分かりやすい例です。1度上がる動きが1度下がる動きに、3度上がる動きが3度下がる動きになります。歴史上の嬉遊部には別の素材を使うものもあります。このセルは、音高・音価・ティックで検査されるエンジンの変形契約を切り出して示します。',
    },
    time: '4/4',
    width: 620,
    upperClef: 'treble',
    lowerClef: 'treble',
    upperLabel: { en: 'seed', ja: '動機' },
    lowerLabel: { en: 'inverted', ja: '反行形' },
    playback: 'sequential',
    upper: [
      { key: 'g/4', annotation: 'seed', color: AMBER },
      { key: 'a/4', color: AMBER },
      { key: 'b/4', color: AMBER },
      { key: 'd/5', color: AMBER },
    ],
    lower: [
      { key: 'g/4', annotation: 'mirror', color: GREEN },
      { key: 'f/4', color: GREEN },
      { key: 'e/4', color: GREEN },
      { key: 'c/4', color: GREEN },
    ],
    issues: [
      { kind: 'motion', label: 'steps up', fromUpper: 0, toUpper: 3, color: AMBER },
      { kind: 'motion', label: 'same steps, mirrored', fromLower: 0, toLower: 3, color: GREEN },
    ],
  },

  middleEntry: {
    ruleIds: ['middle_entry_in_related_key'],
    badge: { en: 'Development', ja: '展開' },
    title: { en: 'Middle entry in the relative key', ja: '平行調での中間入り' },
    diagnosis: {
      en: 'The subject returns transposed into vi — every note diatonic in the related key.',
      ja: '主題が vi の調に移されて戻り、すべての音がその近親調の音階に収まっています。',
    },
    caption: {
      en: 'After the exposition the subject travels: here the C major subject returns in A minor, the relative key. The validator restricts the declared entry key to the related family — dominant, relative, subdominant, supertonic — and then checks that every note of the entry is diatonic in that key. Play them in sequence: the same theme, a new emotional light.',
      ja: '提示部のあと、主題は旅に出ます。譜例ではハ長調の主題が平行調のイ短調で戻ってきます。検証器は宣言されたエントリの調を近親調の一族——属調・平行調・下属調・上主調——に制限したうえで、エントリのすべての音がその調で全音階的であることを確認します。順に再生してみてください。同じ主題が、新しい感情の光の中で響きます。',
    },
    time: '4/4',
    width: 620,
    upperClef: 'treble',
    lowerClef: 'treble',
    upperLabel: { en: 'subject', ja: '主唱' },
    lowerLabel: { en: 'vi entry', ja: '中間入り' },
    playback: 'sequential',
    upper: [
      { key: 'c/4', annotation: 'C major', color: AMBER },
      { key: 'e/4', color: AMBER },
      { key: 'd/4', color: AMBER },
      { key: 'g/4', color: AMBER },
    ],
    lower: [
      { key: 'a/3', annotation: 'A minor', color: GREEN },
      { key: 'c/4', color: GREEN },
      { key: 'b/3', color: GREEN },
      { key: 'e/4', color: GREEN },
    ],
    issues: [
      {
        kind: 'bracket',
        label: 'same subject, related key',
        fromLower: 0,
        toLower: 3,
        color: GREEN,
      },
    ],
  },

  imitationEntry: {
    ruleIds: ['imitation_entry_match'],
    badge: { en: 'Imitation', ja: '模倣' },
    title: { en: 'Imitative entry at the fourth below', ja: '4度下の模倣エントリ' },
    diagnosis: {
      en: "The follower restates the leader's figure one bar later, a fourth lower.",
      ja: '後続声部が、先行声部の音型を1小節遅れ・4度下で再現しています。',
    },
    caption: {
      en: 'Imitation declares a contract: the follower must enter exactly at the declared time distance and exactly at the declared interval. The validator verifies both the entry tick and the pitch offset against the leader fragment.',
      ja: '模倣は契約です。後続声部は宣言された時間差と音程差のとおりに入らなければなりません。検証器はエントリの時刻と音程オフセットの両方を、先行声部の断片と突き合わせて検証します。',
    },
    time: '2/4',
    bars: 2,
    width: 620,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'leader', ja: '先行声部' },
    lowerLabel: { en: 'follower', ja: '後続声部' },
    upper: [
      { key: 'c/4', annotation: 'leader', color: AMBER },
      { key: 'd/4', color: AMBER },
      { key: 'e/4' },
      { key: 'f/4' },
    ],
    lower: [
      { key: 'd/3', duration: 'h', rest: true },
      { key: 'g/2', annotation: 'follower', color: GREEN },
      { key: 'a/2', color: GREEN },
    ],
    issues: [
      { kind: 'bracket', label: '+1 bar, a 4th below', fromLower: 1, toLower: 2, color: GREEN },
    ],
  },

  strettoOverlap: {
    ruleIds: ['stretto_overlap_valid'],
    badge: { en: 'Development', ja: '展開' },
    title: { en: 'Stretto: entries overlap', ja: 'ストレッタ — 重なり合う主題' },
    diagnosis: {
      en: 'The follower starts the subject before the leader has finished it.',
      ja: '先行声部が主題を歌い終わる前に、後続声部が主題を開始しています。',
    },
    caption: {
      en: "In a stretto the subject chases itself: the second entry begins inside the first one's window. It is the classic intensification device near a fugue's climax. The validator requires a genuine overlap and an exact transposition of the subject.",
      ja: 'ストレッタでは主題が主題を追いかけます。第2のエントリが第1のエントリの途中で始まる、フーガの頂点付近を熱くする常套手段です。検証器は本当に重なっていること、そして主題が正確に移調されていることを要求します。',
    },
    time: '2/4',
    bars: 2,
    width: 620,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'leader', ja: '先行声部' },
    lowerLabel: { en: 'follower', ja: '後続声部' },
    upper: [
      { key: 'c/4', annotation: 'subject', color: AMBER },
      { key: 'e/4', color: AMBER },
      { key: 'g/4', color: AMBER },
      { key: 'e/4', color: AMBER },
    ],
    lower: [
      { key: 'd/3', duration: 'q', rest: true },
      { key: 'c/3', annotation: 'enters early', color: GREEN },
      { key: 'e/3', color: GREEN },
      { key: 'g/3', color: GREEN },
    ],
    issues: [{ kind: 'bracket', label: 'overlap zone', fromUpper: 1, toUpper: 3, color: GREEN }],
  },

  pedalPoint: {
    ruleIds: ['pedal_point_tonic_or_dominant'],
    badge: { en: 'Development', ja: '展開' },
    title: { en: 'Tonic pedal point', ja: '主音の保続音' },
    diagnosis: {
      en: 'The bass holds the tonic while the upper voice moves through dissonances above it.',
      ja: 'バスが主音を保持したまま、上声がその上で不協和も交えて動きます。',
    },
    caption: {
      en: 'A pedal point suspends the harmonic clock: the held bass legitimizes passing clashes above it. The validator does not police those clashes — it checks that the pedal pitch itself is the tonic or the dominant, the only degrees that can bear this weight.',
      ja: '保続音は和声の時計を一時停止させます。保持されたバスの上では、経過的な衝突も正当化されます。検証器がここで検査するのは衝突の方ではなく、保続される音そのものが主音か属音か——この重みに耐えられる二つの音度か——という点です。',
    },
    time: '4/4',
    width: 620,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'c/5', annotation: '8' },
      { key: 'b/4', annotation: '7', color: AMBER },
      { key: 'a/4', annotation: '6' },
      { key: 'b/4', annotation: '7', color: AMBER },
    ],
    lower: [{ key: 'c/3', duration: 'w', annotation: 'pedal', color: GREEN }],
    issues: [
      {
        kind: 'bracket',
        label: 'harmony moves over a held tonic',
        fromUpper: 0,
        toUpper: 3,
        color: GREEN,
      },
    ],
  },
}
