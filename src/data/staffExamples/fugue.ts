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
      en: 'The subject opens on the tonic; the answer opens on the dominant — the head is mapped I to V, not transposed literally.',
      ja: '主唱は主音で始まり、応唱は属音で始まります。冒頭は機械的な移調ではなく I と V を写像した形です。',
    },
    caption: {
      en: 'A real answer transposes the whole subject up a fifth. A tonal answer adjusts the opening so that tonic maps to dominant and dominant maps back to tonic, keeping the music anchored in the home key during the exposition. The validator checks exactly this head mapping when the material declares a tonal answer.',
      ja: '応唱が主唱を5度上へそのまま移調したものなら「実応」、冒頭だけ主音↔属音を入れ替えて調の重心を保つのが「変応」です。提示部で音楽が主調から離れすぎないための調整で、検証器は素材が変応を宣言しているとき、まさにこの冒頭の写像を検査します。',
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
      { kind: 'motion', label: 'head adjusted, tail transposed', fromLower: 0, toLower: 3, color: AMBER },
    ],
  },

  countersubjectContinuous: {
    ruleIds: ['countersubject_continuous'],
    badge: { en: 'Fugal device', ja: 'フーガ技法' },
    title: { en: 'Countersubject keeps sounding', ja: '対主題は鳴り続ける' },
    diagnosis: {
      en: 'While the answer states the theme, the countersubject fills every beat without resting.',
      ja: '応唱が主題を歌うあいだ、対主題は休みなくすべての拍を満たしています。',
    },
    caption: {
      en: 'The countersubject is the recurring companion line that accompanies each later entry of the subject. To do its job it must actually be there: the validator samples every quarter-beat of the answer window and fails the rule if the countersubject voice falls silent.',
      ja: '対主題は、主題が再登場するたびに寄り添う決まった相方の旋律です。その役割を果たすには実際に鳴っていなければなりません。検証器は応唱の区間を4分音符単位でサンプリングし、対主題声部が途切れていればこのルールで弾きます。',
    },
    time: '4/4',
    width: 620,
    upperClef: 'treble',
    lowerClef: 'treble',
    upperLabel: { en: 'answer', ja: '応唱' },
    lowerLabel: { en: 'CS', ja: '対主題' },
    upper: [
      { key: 'g/4' },
      { key: 'a/4' },
      { key: 'b/4' },
      { key: 'c/5' },
    ],
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
      en: 'Bar two repeats bar one exactly, transposed down one step.',
      ja: '2小節目が1小節目をそのまま1度下へ移調して繰り返しています。',
    },
    caption: {
      en: 'Sequences are how Baroque episodes travel between keys: a short seed is restated on successively lower (or higher) steps. The validator checks that each step is a verbatim transposition of the seed by the declared offset — paraphrases fail the rule.',
      ja: 'ゼクエンツは、嬉遊部が調から調へ移動するための乗り物です。短い種となる音型を、順に一段ずつ下（または上）に置き直していきます。検証器は各段が宣言されたオフセットどおりの「正確な移調」であることを確認し、言い換えはこのルールで落とします。',
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
      en: 'Episode material must be the declared transform of a declared subject slice — and inversion is the most striking transform: up a step becomes down a step, up a third becomes down a third. Play the two lines one after the other; the second is recognizably the first, upside down. The validator recomputes the expected notes from the transform and compares pitch, duration, and tick.',
      ja: '嬉遊部の素材は、宣言された主題の断片に宣言された変形を適用したものでなければなりません。反行はその中で最も鮮烈な変形です。1度上がる動きは1度下がる動きに、3度上は3度下になります。二つの線を順に再生してみてください。二つ目は紛れもなく一つ目の逆さまです。検証器は変形から期待される音列を再計算し、音高・音価・ティックを突き合わせます。',
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
      { kind: 'bracket', label: 'same subject, related key', fromLower: 0, toLower: 3, color: GREEN },
    ],
  },

  imitationEntry: {
    ruleIds: ['imitation_entry_match'],
    badge: { en: 'Imitation', ja: '模倣' },
    title: { en: 'Imitative entry at the fourth below', ja: '4度下の模倣エントリ' },
    diagnosis: {
      en: 'The follower restates the leader\'s figure one bar later, a fourth lower.',
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
      en: 'In a stretto the subject chases itself: the second entry begins inside the first one\'s window. It is the classic intensification device near a fugue\'s climax. The validator requires a genuine overlap and an exact transposition of the subject.',
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
    issues: [
      { kind: 'bracket', label: 'overlap zone', fromUpper: 1, toUpper: 3, color: GREEN },
    ],
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
    lower: [
      { key: 'c/3', duration: 'w', annotation: 'pedal', color: GREEN },
    ],
    issues: [
      { kind: 'bracket', label: 'harmony moves over a held tonic', fromUpper: 0, toUpper: 3, color: GREEN },
    ],
  },
}
