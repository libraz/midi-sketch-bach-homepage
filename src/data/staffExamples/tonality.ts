import type { StaffExampleDef } from './types'
import { RED, AMBER, GREEN } from './types'

/**
 * Chapter 5 — Tonal grammar.
 * Cadence types, leading-tone and seventh doubling, cross relations,
 * applied dominants, and pivot modulation.
 */
export const tonalityExamples: Record<string, StaffExampleDef> = {
  cadence: {
    ruleIds: ['cadence_voice_leading'],
    badge: { en: 'Cadence cell', ja: '終止型' },
    title: { en: 'Authentic cadence voice leading', ja: '正格終止の声部進行' },
    diagnosis: {
      en: 'The leading tone resolves upward while the bass moves V to I.',
      ja: '導音が上行して主音へ解決し、バスは属音から主音へ進みます。',
    },
    caption: {
      en: 'The validator checks the declared cadence type, not just chord labels.',
      ja: 'validator は和音名だけでなく、宣言された終止型に合う外声進行を確認します。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'b/4', annotation: 'LT' },
      { key: 'c/5', annotation: 'I', color: GREEN, issue: true },
    ],
    lower: [
      { key: 'g/2', annotation: 'V' },
      { key: 'c/3', annotation: 'I', color: GREEN, issue: true },
    ],
    issues: [
      { kind: 'motion', label: 'LT -> I / V -> I', fromUpper: 0, toUpper: 1, fromLower: 0, toLower: 1 },
      { kind: 'vertical', label: 'cadence', upperIndex: 1, lowerIndex: 1, color: GREEN },
    ],
  },

  plagalCadence: {
    ruleIds: ['cadence_voice_leading'],
    badge: { en: 'Cadence cell', ja: '終止型' },
    title: { en: 'Plagal cadence (IV - I)', ja: '変格終止（IV - I）' },
    diagnosis: {
      en: 'The bass falls from the subdominant to the tonic while the upper voice holds the tonic.',
      ja: 'バスが下属音から主音へ進み、上声は主音を保持します。',
    },
    caption: {
      en: 'The "Amen" cadence. There is no leading tone, so the sense of closure comes entirely from the bass motion IV to I. The validator recognizes the plagal type from the declared cadence event and checks the bass accordingly.',
      ja: 'いわゆる「アーメン終止」です。導音を含まないため、終止感はバスの IV→I の進行だけから生まれます。validator は宣言された終止イベントから変格終止と認識し、それに応じたバス進行を確認します。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'c/5', annotation: 'common tone' },
      { key: 'c/5', annotation: 'I', color: GREEN },
    ],
    lower: [
      { key: 'f/3', annotation: 'IV' },
      { key: 'c/3', annotation: 'I', color: GREEN, issue: true },
    ],
    issues: [
      { kind: 'motion', label: 'IV -> I', fromLower: 0, toLower: 1, color: GREEN },
      { kind: 'vertical', label: 'plagal close', upperIndex: 1, lowerIndex: 1, color: GREEN },
    ],
  },

  halfCadence: {
    ruleIds: ['cadence_voice_leading'],
    verdict: 'good',
    badge: { en: 'Cadence cell', ja: '終止型' },
    title: { en: 'Half cadence (ends on V)', ja: '半終止（V で止まる）' },
    diagnosis: {
      en: 'The phrase stops on the dominant — a musical comma, not a period.',
      ja: 'フレーズが属和音の上で止まります。句点ではなく読点にあたる終止です。',
    },
    caption: {
      en: 'A half cadence parks the music on V and leaves it expecting continuation. Inside a generated piece it articulates phrase boundaries without closing the paragraph; the final cadence of a section is authentic instead.',
      ja: '半終止は音楽を V の上に留め、続きを期待させたまま区切ります。生成曲の内部ではフレーズの切れ目を作りつつ段落は閉じない役割を持ち、セクションの最後では代わりに正格終止が置かれます。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'c/5', annotation: 'I' },
      { key: 'b/4', annotation: 'V', color: AMBER },
    ],
    lower: [
      { key: 'c/3' },
      { key: 'g/2', annotation: 'V', color: AMBER, issue: true },
    ],
    issues: [
      { kind: 'motion', label: 'comes to rest on V', fromLower: 0, toLower: 1, color: AMBER },
      { kind: 'vertical', label: 'open ending', upperIndex: 1, lowerIndex: 1, color: AMBER },
    ],
  },

  deceptiveCadence: {
    ruleIds: ['cadence_voice_leading'],
    badge: { en: 'Cadence cell', ja: '終止型' },
    title: { en: 'Deceptive cadence (V - vi)', ja: '偽終止（V - vi）' },
    diagnosis: {
      en: 'The leading tone still resolves up, but the bass sidesteps to the sixth degree.',
      ja: '導音は上行解決しますが、バスは主音ではなく第6音へ逸れます。',
    },
    caption: {
      en: 'Everything promises a final close — then the bass moves to vi instead of I. Bach uses the deception to extend a phrase that seemed finished. The validator accepts the declared deceptive type only when the bass really arrives on the sixth degree.',
      ja: 'すべてが完全な終止を予感させたところで、バスが I ではなく vi へ進みます。終わったように見せたフレーズを引き延ばす、バッハ常用の手法です。validator は宣言が偽終止のとき、バスが本当に第6音へ到達したかを確認します。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'b/4', annotation: 'LT' },
      { key: 'c/5', annotation: 'resolves', color: GREEN },
    ],
    lower: [
      { key: 'g/2', annotation: 'V' },
      { key: 'a/2', annotation: 'vi', color: AMBER, issue: true },
    ],
    issues: [
      { kind: 'motion', label: 'bass evades I', fromLower: 0, toLower: 1, color: AMBER },
      { kind: 'vertical', label: 'V -> vi', upperIndex: 1, lowerIndex: 1, color: AMBER },
    ],
  },

  phrygianCadence: {
    ruleIds: ['cadence_voice_leading'],
    badge: { en: 'Cadence cell', ja: '終止型' },
    title: { en: 'Phrygian cadence (iv6 - V in minor)', ja: 'フリギア終止（短調の iv6 - V）' },
    diagnosis: {
      en: 'The bass descends by half step onto the dominant while the upper voice rises by step.',
      ja: 'バスが半音下行して属音に到達し、上声は順次上行します。',
    },
    caption: {
      en: 'The signature Baroque ending for a slow minor movement: the half-step descent in the bass against contrary stepwise rise above. It ends on V like a half cadence, but the chromatic bass approach gives it a distinct, archaic color.',
      ja: '短調の緩徐楽章を締めくくる、バロック特有の型です。バスの半音下行に対して上声が反行で順次上がります。半終止と同じく V で止まりますが、半音で迫るバスが独特の古雅な色合いを与えます。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'd/4', annotation: 'step up' },
      { key: 'e/4', annotation: 'V', color: GREEN },
    ],
    lower: [
      { key: 'f/3', annotation: 'iv6' },
      { key: 'e/3', annotation: 'half step', color: AMBER, issue: true },
    ],
    issues: [
      { kind: 'motion', label: 'contrary steps onto V', fromUpper: 0, toUpper: 1, fromLower: 0, toLower: 1, color: AMBER },
    ],
  },

  picardyThird: {
    ruleIds: ['cadence_voice_leading'],
    badge: { en: 'Cadence cell', ja: '終止型' },
    title: { en: 'Picardy third', ja: 'ピカルディ3度' },
    diagnosis: {
      en: 'A minor-key piece closes on a major tonic chord — the third is raised.',
      ja: '短調の曲が、第3音を半音上げた長三和音で終わります。',
    },
    caption: {
      en: 'The final chord of a minor-mode work brightens to major. The raised third demands an accidental, and the validator checks the declared Picardy cadence for both the leading-tone resolution and the major third in the final sonority.',
      ja: '短調作品の最後の和音だけが長和音に転じます。上げられた第3音には臨時記号が必要です。validator は宣言されたピカルディ終止に対し、導音の解決と最終和音の長3度の両方を確認します。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'b/4', annotation: 'LT' },
      { key: 'c#/5', accidental: '#', annotation: 'major 3rd', color: GREEN, issue: true },
    ],
    lower: [
      { key: 'e/3', annotation: 'V' },
      { key: 'a/2', annotation: 'I (major)', color: GREEN },
    ],
    issues: [
      { kind: 'vertical', label: 'raised third', upperIndex: 1, lowerIndex: 1, color: GREEN },
      { kind: 'motion', label: 'minor closes major', fromLower: 0, toLower: 1, color: GREEN },
    ],
  },

  doublingLeadingTone: {
    ruleIds: ['doubling_no_leading_tone'],
    badge: { en: 'Doubling', ja: '重複' },
    title: { en: 'Doubled leading tone', ja: '導音の重複' },
    diagnosis: {
      en: 'The leading-tone pitch class appears in more than one voice.',
      ja: '導音のピッチクラスが複数声部に現れています。',
    },
    caption: {
      en: 'Doubling the leading tone creates multiple voices demanding the same resolution.',
      ja: '導音を重複すると、同じ解決要求を持つ声部が複数できます。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'b/4', annotation: 'LT', color: RED, issue: true },
      { key: 'c/5' },
    ],
    lower: [
      { key: 'b/2', annotation: 'LT', color: RED, issue: true },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'vertical', label: 'doubled leading tone', upperIndex: 0, lowerIndex: 0 },
    ],
  },

  doublingSeventh: {
    ruleIds: ['doubling_no_seventh'],
    badge: { en: 'Doubling', ja: '重複' },
    title: { en: 'Doubled seventh', ja: '第7音の重複' },
    diagnosis: {
      en: 'The chordal seventh appears in more than one voice.',
      ja: '和音の第7音が複数声部に現れています。',
    },
    caption: {
      en: 'The seventh is a tendency tone. Seventh-quality chords keep it single to avoid competing resolutions.',
      ja: '第7音は解決を要求する傾向音です。七の和音では重複させません。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'f/4', annotation: '7th', color: RED, issue: true },
      { key: 'e/4' },
    ],
    lower: [
      { key: 'f/3', annotation: '7th', color: RED, issue: true },
      { key: 'e/3' },
    ],
    issues: [
      { kind: 'vertical', label: 'doubled seventh', upperIndex: 0, lowerIndex: 0 },
    ],
  },

  crossRelation: {
    ruleIds: ['cross_relation'],
    badge: { en: 'Chromatic', ja: '半音階' },
    title: { en: 'Cross relation', ja: '対斜' },
    diagnosis: {
      en: 'Different voices contradict the same scale degree chromatically in close succession.',
      ja: '近い位置で、別声部が同じ音度を半音階的に食い違わせています。',
    },
    caption: {
      en: 'The red notes show a chromatic clash between voices inside the validator window. Natural E-F and B-C half steps are not cross-relations.',
      ja: '赤い音同士が対斜です。E-F や B-C の自然な半音ではなく、声部間の変化記号衝突として扱います。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'f#/4', accidental: '#', annotation: 'F#', color: RED, issue: true },
      { key: 'g/4' },
    ],
    lower: [
      { key: 'f/3', annotation: 'F', color: RED, issue: true },
      { key: 'e/3' },
    ],
    issues: [
      { kind: 'vertical', label: 'chromatic conflict', upperIndex: 0, lowerIndex: 0 },
    ],
  },

  secondaryDominant: {
    ruleIds: ['secondary_dominant_resolution'],
    badge: { en: 'Applied harmony', ja: '借用和音' },
    title: { en: 'Secondary dominant resolving (V/V - V)', ja: '副次ドミナントの解決（V/V - V）' },
    diagnosis: {
      en: 'The chromatic F sharp acts as a local leading tone and resolves up to G.',
      ja: '半音階的な嬰ヘ音が一時的な導音として働き、Gへ上行解決します。',
    },
    caption: {
      en: 'A secondary dominant borrows dominant function for a chord other than the tonic. The raised note would normally fail the melodic checks — but inside a declared applied-dominant region, the validator exempts the chromatic motion and instead verifies that the next chord really is the targeted degree.',
      ja: '副次ドミナントは、主和音以外の和音に対して一時的にドミナントの機能を借りる和音です。半音上げられた音は本来なら旋律ルールに引っかかりますが、宣言された借用和音の圏内では半音階的な動きが免除され、代わりに「次の和音が本当に目標の度数か」が検証されます。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'f#/4', accidental: '#', annotation: 'V/V', color: AMBER, issue: true },
      { key: 'g/4', annotation: 'resolves', color: GREEN },
    ],
    lower: [
      { key: 'd/3', annotation: 'D' },
      { key: 'g/2', annotation: 'G', color: GREEN },
    ],
    issues: [
      { kind: 'motion', label: 'local LT rises', fromUpper: 0, toUpper: 1, color: GREEN },
      { kind: 'motion', label: 'D7 -> G', fromLower: 0, toLower: 1, color: GREEN },
    ],
  },

  pivotModulation: {
    ruleIds: ['modulation_pivot_chord_required'],
    badge: { en: 'Modulation', ja: '転調' },
    title: { en: 'Pivot-chord modulation (C major to G major)', ja: 'ピボット転調（ハ長調からト長調へ）' },
    diagnosis: {
      en: 'The A-minor sonority is vi in C and ii in G — diatonic in both keys.',
      ja: 'イ短調の響きはハ長調の vi であり、ト長調の ii でもあります。両方の調に属する和音です。',
    },
    caption: {
      en: 'A pivot chord belongs to both the old key and the new one, so the ear can reinterpret it mid-phrase. Here Am (vi in C, ii in G) pivots into a D major chord that only makes sense in G, and the cadence confirms the new key. The validator requires the declared pivot chord to be diatonic in both keys.',
      ja: 'ピボット和音は元の調と新しい調の両方に属するため、聴き手はフレーズの途中でその意味を読み替えられます。ここでは Am（ハ長調の vi ＝ト長調の ii）を軸に、ト長調でしか説明できない D の和音へ進み、終止が新しい調を確定します。validator は宣言されたピボット和音が両方の調で全音階的であることを要求します。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'e/4', annotation: 'pivot: vi=ii', color: AMBER, issue: true },
      { key: 'f#/4', accidental: '#', annotation: 'V of G', color: AMBER },
      { key: 'g/4', annotation: 'G: I', color: GREEN },
    ],
    lower: [
      { key: 'a/2', annotation: 'Am' },
      { key: 'd/3', annotation: 'D' },
      { key: 'g/2', annotation: 'G', color: GREEN },
    ],
    issues: [
      { kind: 'bracket', label: 'reinterpreted mid-phrase', fromUpper: 0, toUpper: 2 },
      { kind: 'motion', label: 'new key confirmed', fromLower: 1, toLower: 2, color: GREEN },
    ],
  },
}
