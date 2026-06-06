import type { StaffExampleDef } from './types'
import { RED, AMBER, GREEN } from './types'

/**
 * Chapter 7 — Form-specific constraints.
 * Immutable carriers (ground bass, cantus firmus), figuration harmony,
 * and the implied-voice rules for solo string writing.
 */
export const formConstraintExamples: Record<string, StaffExampleDef> = {
  groundBass: {
    ruleIds: ['ground_bass_immutable', 'passacaglia_ground_immutable'],
    badge: { en: 'Immutable carrier', ja: '不変の素材' },
    title: { en: 'Ground bass replays unchanged', ja: '固執低音は変わらない' },
    diagnosis: {
      en: 'The bass line repeats verbatim each cycle while the upper voice varies.',
      ja: '低音主題は毎周そのまま反復され、上声だけが変奏されます。',
    },
    caption: {
      en: 'Passacaglia and chaconne are built on a ground: a bass theme that repeats unchanged underneath ever-richer variations. The engine marks the ground as immutable material — if any cycle alters even one note, the structural rule fails. Variation happens above the ground, never inside it.',
      ja: 'パッサカリアとシャコンヌは固執低音の上に築かれます。低音主題は一切変えずに反復され、その上で変奏だけが豊かになっていきます。エンジンはこの低音を不変素材として印づけており、どこか一周でも一音でも変われば構造ルールが失敗します。変奏は低音の上で起きるもので、低音の中では起きません。',
    },
    time: '3/4',
    bars: 2,
    keySignature: 'Cm',
    width: 680,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'variation', ja: '変奏声部' },
    lowerLabel: { en: 'ground', ja: '固執低音' },
    upper: [
      { key: 'g/4' },
      { key: 'eb/4' },
      { key: 'd/4' },
      { key: 'c/4' },
      { key: 'b/3', accidental: 'n' },
      { key: 'd/4' },
    ],
    lower: [
      { key: 'c/3', annotation: 'ground', color: AMBER },
      { key: 'c/3', color: AMBER },
      { key: 'bb/2', color: AMBER },
      { key: 'ab/2', color: AMBER },
      { key: 'g/2', color: AMBER },
      { key: 'g/2', color: AMBER },
    ],
    issues: [
      { kind: 'bracket', label: 'replays verbatim every cycle', fromLower: 0, toLower: 5, color: AMBER },
    ],
  },

  cantusFirmus: {
    ruleIds: ['cantus_firmus_immutable', 'figuration_harmonic_consistency'],
    badge: { en: 'Immutable carrier', ja: '不変の素材' },
    title: { en: 'Cantus firmus with figuration', ja: '定旋律と装飾声部' },
    diagnosis: {
      en: 'The chorale tone holds each downbeat; the fast voice must hit a chord tone there.',
      ja: 'コラールの音が各小節頭を支え、装飾声部は小節頭で必ず和声音を取ります。',
    },
    caption: {
      en: 'In a chorale prelude the hymn melody (cantus firmus) moves in long notes while another voice embroiders around it. Two contracts hold: the downbeat of each bar must restate the skeleton tone exactly, and the figuration\'s bar-opening note must belong to the bar\'s chord. Between downbeats, the embellishment is free.',
      ja: 'コラール前奏曲では、賛美歌の旋律（定旋律）が長い音価で進み、別の声部がその周りを装飾します。契約は二つ。各小節頭では骨格音が正確に再現されること、そして装飾声部の小節頭の音はその小節の和音に属することです。小節頭と小節頭のあいだでは、装飾は自由です。',
    },
    time: '4/4',
    width: 620,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'CF', ja: '定旋律' },
    lowerLabel: { en: 'figuration', ja: '装飾声部' },
    upper: [
      { key: 'c/5', duration: 'h', annotation: 'CF', color: AMBER },
      { key: 'd/5', duration: 'h', color: AMBER },
    ],
    lower: [
      { key: 'c/3', duration: '8', annotation: 'chord tone', color: GREEN },
      { key: 'd/3', duration: '8' },
      { key: 'e/3', duration: '8' },
      { key: 'c/3', duration: '8' },
      { key: 'f/3', duration: '8' },
      { key: 'e/3', duration: '8' },
      { key: 'd/3', duration: '8' },
      { key: 'c/3', duration: '8' },
    ],
    issues: [
      { kind: 'note', label: 'downbeat anchored', lowerIndex: 0, color: GREEN },
      { kind: 'bracket', label: 'free between downbeats', fromLower: 1, toLower: 7 },
    ],
  },

  figurationHarmony: {
    ruleIds: ['figuration_harmonic_consistency'],
    badge: { en: 'Free prelude', ja: '自由な前奏曲' },
    title: { en: 'Figuration anchored at the downbeat', ja: '小節頭に錨を下ろすフィグレーション' },
    diagnosis: {
      en: 'Each bar-opening note is a chord tone of that bar\'s harmony; everything between is free.',
      ja: '各小節を開く音はその小節の和音の和声音で、そのあいだの音は自由です。',
    },
    caption: {
      en: 'The free-prelude texture runs continuous figuration over a slow harmonic rhythm — here one chord per bar, I then V. The validator constrains exactly one note per bar: the downbeat must belong to the bar\'s chord. The scalework between downbeats is unconstrained; that freedom is what makes it figuration rather than chorale writing.',
      ja: '自由な前奏曲のテクスチュアは、ゆっくりした和声リズム——ここでは1小節1和音、I から V——の上で絶え間ないフィグレーションを走らせます。validator が拘束するのは1小節につきただ一音、小節頭がその小節の和音に属することだけです。小節頭のあいだの音階的な走句は無制約で、その自由こそがコラール書法ではなくフィグレーションである理由です。',
    },
    time: '4/4',
    bars: 2,
    width: 680,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'figuration', ja: '装飾声部' },
    lowerLabel: { en: 'harmony', ja: '和声' },
    upper: [
      { key: 'g/4', duration: '8', annotation: 'chord tone', color: GREEN },
      { key: 'c/5', duration: '8' },
      { key: 'e/5', duration: '8' },
      { key: 'c/5', duration: '8' },
      { key: 'd/5', duration: '8' },
      { key: 'c/5', duration: '8' },
      { key: 'b/4', duration: '8' },
      { key: 'c/5', duration: '8' },
      { key: 'b/4', duration: '8', annotation: 'chord tone', color: GREEN },
      { key: 'd/5', duration: '8' },
      { key: 'g/5', duration: '8' },
      { key: 'd/5', duration: '8' },
      { key: 'e/5', duration: '8' },
      { key: 'd/5', duration: '8' },
      { key: 'c/5', duration: '8' },
      { key: 'b/4', duration: '8' },
    ],
    lower: [
      { key: 'c/3', duration: 'w', annotation: 'I' },
      { key: 'g/2', duration: 'w', annotation: 'V' },
    ],
    issues: [
      { kind: 'note', label: 'anchored', upperIndex: 0, color: GREEN },
      { kind: 'note', label: 'anchored', upperIndex: 8, color: GREEN },
      { kind: 'bracket', label: 'free between downbeats', fromUpper: 1, toUpper: 7, color: AMBER },
    ],
  },

  anacrusisUpbeat: {
    ruleIds: ['anacrusis_consistent'],
    badge: { en: 'Phrase grid', ja: 'フレーズ' },
    title: { en: 'Anacrusis: the upbeat lead-in', ja: 'アウフタクト — 弱起の助走' },
    diagnosis: {
      en: 'The short note before the barline leads into the downbeat where the phrase really starts.',
      ja: '小節線の手前の短い音が、フレーズが本当に始まる小節頭へ向かって導入します。',
    },
    caption: {
      en: 'An anacrusis starts the music before the bar: a pickup that resolves into the first downbeat. The engine treats it as a declared property — if the piece declares an upbeat of a given length, every upbeat fragment must begin exactly that distance before a phrase start, and if no upbeat is declared, none may appear. Consistency, not existence, is what the rule checks.',
      ja: 'アウフタクトは、小節が始まる前に音楽を始めます。最初の小節頭へ流れ込む助走の音です。エンジンはこれを宣言されたプロパティとして扱います。ある長さの弱起を宣言したなら、すべての弱起断片はフレーズ開始のちょうどその距離だけ手前で始まらなければならず、宣言しなければ一つも現れてはいけません。このルールが見るのは弱起の有無ではなく、一貫性です。',
    },
    time: '2/4',
    bars: 2,
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'melody', ja: '旋律' },
    lowerLabel: { en: 'bass', ja: 'バス' },
    upper: [
      { key: 'b/4', duration: 'q', rest: true },
      { key: 'g/4', annotation: 'upbeat', color: AMBER },
      { key: 'c/5', annotation: 'downbeat', color: GREEN },
      { key: 'e/5' },
    ],
    lower: [
      { key: 'd/3', duration: 'h', rest: true },
      { key: 'c/3' },
      { key: 'g/2' },
    ],
    issues: [
      { kind: 'note', label: 'leads in', upperIndex: 1, color: AMBER },
      { kind: 'motion', label: 'into the phrase start', fromUpper: 1, toUpper: 2, color: GREEN },
    ],
  },

  impliedStreams: {
    ruleIds: ['implicit_voice_counterpoint', 'arpeggio_no_parallel_perfect'],
    badge: { en: 'Solo strings', ja: '独奏弦' },
    title: { en: 'One line, two voices: extracting the streams', ja: '一本の線から声部を取り出す' },
    diagnosis: {
      en: 'Each 4-note cell contributes its lowest pitch to a bass stream and its highest to a top stream.',
      ja: '4音のセルごとに、最低音が低音線へ、最高音が上声線へ取り出されます。',
    },
    caption: {
      en: 'This is what the music actually looks like: one unbroken line of broken chords, BWV 1007-style. The engine partitions the line into cells of the declared group size, then takes each cell\'s lowest note (amber) as the implied bass and its highest (green) as the implied melody. Register decides, not position — here the top note sits in the middle of the cell, and the extraction still finds it. Play it in sequence: first the real line, then the bass your ear was already hearing.',
      ja: '実際の楽譜はこうなっています。BWV 1007 ふうの、途切れない一本の分散和音の線です。エンジンはこの線を宣言されたグループサイズのセルに区切り、各セルの最低音（琥珀）を暗示低音、最高音（緑）を暗示旋律として取り出します。決め手はセル内の位置ではなく音域です——この音型では最高音がセルの真ん中にありますが、抽出はそれを正しく見つけます。順に再生してみてください。本物の線のあとに、耳がすでに聞き取っていた低音が続きます。',
    },
    time: '4/4',
    bars: 2,
    width: 680,
    upperClef: 'bass',
    lowerClef: 'bass',
    upperLabel: { en: 'played', ja: '実際の線' },
    lowerLabel: { en: 'implied', ja: '暗示低音' },
    playback: 'sequential',
    upper: [
      { key: 'c/3', duration: '8', annotation: 'low', color: AMBER },
      { key: 'g/3', duration: '8' },
      { key: 'e/4', duration: '8', annotation: 'top', color: GREEN },
      { key: 'g/3', duration: '8' },
      { key: 'c/3', duration: '8', color: AMBER },
      { key: 'g/3', duration: '8' },
      { key: 'e/4', duration: '8', color: GREEN },
      { key: 'g/3', duration: '8' },
      { key: 'b/2', duration: '8', color: AMBER },
      { key: 'g/3', duration: '8' },
      { key: 'f/4', duration: '8', color: GREEN },
      { key: 'g/3', duration: '8' },
      { key: 'b/2', duration: '8', color: AMBER },
      { key: 'g/3', duration: '8' },
      { key: 'd/4', duration: '8', color: GREEN },
      { key: 'g/3', duration: '8' },
    ],
    lower: [
      { key: 'c/3', duration: 'w', annotation: 'I', color: AMBER },
      { key: 'b/2', duration: 'w', annotation: 'V', color: AMBER },
    ],
    issues: [
      { kind: 'bracket', label: 'one cell (4 notes)', fromUpper: 0, toUpper: 3, color: AMBER },
      { kind: 'motion', label: 'the bass your ear extracts', fromLower: 0, toLower: 1, color: AMBER },
    ],
  },

  arpeggioParallel: {
    ruleIds: ['implicit_voice_counterpoint', 'arpeggio_no_parallel_perfect'],
    badge: { en: 'Solo strings', ja: '独奏弦' },
    title: { en: 'Implied parallel perfects in arpeggio', ja: '分散和音内の暗示的並行' },
    diagnosis: {
      en: 'The broken chord projects bass and top streams moving in parallel perfect intervals.',
      ja: '低音線と上声線として聞こえる音が、完全音程で並行しています。',
    },
    caption: {
      en: 'Solo cello or violin writing can imply multiple voices. The validator reconstructs low and high streams and checks them like real counterpoint.',
      ja: 'チェロやヴァイオリンの分散和音では、一声の中に複数の暗示声部が聞こえます。validator は低音線と上声線を復元して検査します。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'top', ja: '上声線' },
    lowerLabel: { en: 'bass', ja: '低音線' },
    upper: [
      { key: 'g/4', annotation: 'top', color: RED, issue: true },
      { key: 'a/4', annotation: 'top', color: RED, issue: true },
      { key: 'b/4' },
    ],
    lower: [
      { key: 'c/3', annotation: 'bass', color: RED, issue: true },
      { key: 'd/3', annotation: 'bass', color: RED, issue: true },
      { key: 'e/3' },
    ],
    issues: [
      { kind: 'vertical', label: 'P5', upperIndex: 0, lowerIndex: 0 },
      { kind: 'vertical', label: 'P5', upperIndex: 1, lowerIndex: 1 },
      { kind: 'motion', label: 'implied streams', fromUpper: 0, toUpper: 1, fromLower: 0, toLower: 1 },
    ],
  },

  trioIndependence: {
    ruleIds: ['voice_independence_threshold'],
    badge: { en: 'Trio sonata', ja: 'トリオ・ソナタ' },
    title: { en: 'Three voices, three rhythms', ja: '三つの声部、三つのリズム' },
    diagnosis: {
      en: 'Each voice moves on its own rhythmic grid; where they meet, the motion is contrary or oblique.',
      ja: '各声部が固有のリズムで動き、ぶつかる場面では反行か斜行になっています。',
    },
    caption: {
      en: 'The trio sonata has exactly one job: three lines that stay audibly independent. The engine scores every voice pair on rhythmic offset and contrary/oblique motion at note boundaries and fails the piece if any pair drops below the threshold. This is the target texture: the melody sustains while the middle voice walks, and the bass moves in slow halves against both.',
      ja: 'トリオ・ソナタの仕事はただ一つ、三本の線が独立して聞こえ続けることです。エンジンはすべての声部ペアについて、リズムのずれと音の変わり目での反行・斜行を採点し、どこかのペアがしきい値を割れば失敗にします。これが目標のテクスチュアです。旋律が伸ばしているあいだ中声が歩き、バスはその両方に対してゆっくりした2分音符で動きます。',
    },
    time: '4/4',
    width: 560,
    upperClef: 'treble',
    middleClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'manual 1', ja: '手鍵盤1' },
    middleLabel: { en: 'manual 2', ja: '手鍵盤2' },
    lowerLabel: { en: 'pedal', ja: 'ペダル' },
    upper: [
      { key: 'c/5', duration: 'h', color: GREEN },
      { key: 'b/4' },
      { key: 'c/5' },
    ],
    middle: [
      { key: 'e/4', color: GREEN },
      { key: 'f/4', color: GREEN },
      { key: 'g/4', color: GREEN },
      { key: 'e/4', color: GREEN },
    ],
    lower: [
      { key: 'c/3', duration: 'h', color: GREEN },
      { key: 'g/2', duration: 'h', color: GREEN },
    ],
    issues: [
      { kind: 'bracket', label: 'half + quarters', fromUpper: 0, toUpper: 2, color: GREEN },
      { kind: 'motion', label: 'contrary at the join', fromMiddle: 1, toMiddle: 2, fromLower: 0, toLower: 1, color: GREEN },
    ],
  },

  arpeggioContrary: {
    ruleIds: ['implicit_voice_counterpoint', 'arpeggio_no_parallel_perfect'],
    badge: { en: 'Solo strings', ja: '独奏弦' },
    title: { en: 'Implied streams in contrary motion', ja: '反行する暗示声部' },
    diagnosis: {
      en: 'The reconstructed bass stream rises while the top stream descends — real two-part counterpoint inside one instrument.',
      ja: '復元された低音線が上行し、上声線が下行します。一つの楽器の中に本物の二声対位法があります。',
    },
    caption: {
      en: 'This is the shape the cello prelude generator aims for: when each broken-chord cell changes, its lowest and highest notes trace independent, contrary lines. The same intervals that failed in the previous example pass here because the streams never move in parallel perfects.',
      ja: 'チェロ前奏曲の生成器が目指すのはこの形です。分散和音のセルが変わるたび、その最低音と最高音が独立した反行する線を描きます。前の譜例で失敗した音型も、二つの線が完全音程で並行しなければここでは合格します。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'top', ja: '上声線' },
    lowerLabel: { en: 'bass', ja: '低音線' },
    upper: [
      { key: 'g/4', annotation: 'P12' },
      { key: 'f/4', annotation: 'm10', color: GREEN },
      { key: 'e/4', annotation: 'P8', color: GREEN },
    ],
    lower: [
      { key: 'c/3' },
      { key: 'd/3', color: GREEN },
      { key: 'e/3', color: GREEN },
    ],
    issues: [
      { kind: 'motion', label: 'contrary streams', fromUpper: 0, toUpper: 2, fromLower: 0, toLower: 2, color: GREEN },
    ],
  },
}
