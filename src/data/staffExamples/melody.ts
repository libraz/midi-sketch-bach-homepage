import type { StaffExampleDef } from './types'
import { RED, GREEN } from './types'

/**
 * Chapter 4 — Melodic writing.
 * Forbidden leaps, leap recovery, leading-tone obligation, and what
 * a singable generated line looks like.
 */
export const melodyExamples: Record<string, StaffExampleDef> = {
  melodicTritone: {
    ruleIds: ['tritone_melodic', 'augmented_melodic', 'diminished_melodic'],
    badge: { en: 'Melody', ja: '旋律' },
    title: { en: 'Forbidden melodic leap', ja: '禁止される旋律跳躍' },
    diagnosis: {
      en: 'The red melodic leap crosses a tritone-class gap.',
      ja: '赤い旋律跳躍が三全音クラスの距離を作っています。',
    },
    caption: {
      en: 'The validator checks each generated voice as a melody. Augmented, diminished, and tritone leaps are rejected unless an applied-harmony context exempts the motion.',
      ja: 'validator は縦の響きだけでなく、各声部を旋律としても見ます。増音程・減音程・三全音の跳躍は、原則として退けられます。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'c/4' },
      { key: 'f#/4', accidental: '#', annotation: 'TT', color: RED, issue: true },
    ],
    lower: [
      { key: 'c/3' },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'motion', label: 'tritone leap', fromUpper: 0, toUpper: 1 },
    ],
  },

  augmentedSecond: {
    ruleIds: ['augmented_melodic'],
    badge: { en: 'Melody', ja: '旋律' },
    title: { en: 'Augmented second in minor', ja: '短調の増2度' },
    diagnosis: {
      en: 'The step from the sixth to the raised seventh degree spans three semitones.',
      ja: '第6音から導音（半音上げた第7音）への進行が3半音の増2度になっています。',
    },
    caption: {
      en: 'In harmonic minor, moving directly from the natural sixth degree to the leading tone produces an augmented second — the interval that makes a line sound instrumental rather than vocal. Bach avoids it by using the melodic-minor scale forms; the validator simply rejects the interval. Secondary-dominant regions are exempt, because applied harmony legitimately introduces chromatic steps.',
      ja: '和声的短音階で自然な第6音から導音へ直接進むと増2度が生まれます。声楽的な滑らかさを壊す音程で、バッハは旋律的短音階の使い分けでこれを避けます。validator はこの音程自体を退けますが、副次ドミナント圏では半音階的な動きが正当なものとして免除されます。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'f/4', annotation: '♮6' },
      { key: 'g#/4', accidental: '#', annotation: 'A2', color: RED, issue: true },
    ],
    lower: [
      { key: 'a/2' },
      { key: 'a/2' },
    ],
    issues: [
      { kind: 'motion', label: 'augmented 2nd', fromUpper: 0, toUpper: 1 },
    ],
  },

  consecutiveLeaps: {
    ruleIds: ['consecutive_leaps'],
    badge: { en: 'Melody', ja: '旋律' },
    title: { en: 'Consecutive large leaps', ja: '跳躍の連続' },
    diagnosis: {
      en: 'Two large leaps occur back to back without stepwise recovery.',
      ja: '大きな跳躍が二回続き、順次進行で回復していません。',
    },
    caption: {
      en: 'One leap can be idiomatic. Repeated large leaps make the line stop behaving like a singable contrapuntal voice.',
      ja: '一度の跳躍は自然でも、跳躍が連続すると声部が歌える線として聞こえにくくなります。',
    },
    time: '3/4',
    width: 520,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'c/4' },
      { key: 'g/4', annotation: 'leap', color: RED, issue: true },
      { key: 'd/5', annotation: 'leap', color: RED, issue: true },
    ],
    lower: [
      { key: 'c/3' },
      { key: 'c/3' },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'motion', label: 'two large leaps', fromUpper: 0, toUpper: 1 },
      { kind: 'motion', label: 'no recovery', fromUpper: 1, toUpper: 2 },
    ],
  },

  leapRecovery: {
    ruleIds: ['consecutive_leaps'],
    badge: { en: 'Allowed pattern', ja: '許容される型' },
    title: { en: 'Leap, then step back', ja: '跳躍したら順次で戻る' },
    diagnosis: {
      en: 'After the sixth upward, the line turns around and descends by step.',
      ja: '6度の上行跳躍のあと、旋律が向きを変えて順次下行しています。',
    },
    caption: {
      en: 'The classical recovery rule: a large leap spends melodic energy, and stepwise motion in the opposite direction pays it back. This is the shape the candidate search prefers when it builds free counterpoint.',
      ja: '跳躍回復の古典的な原則です。大きな跳躍は旋律のエネルギーを使うので、逆方向の順次進行でそれを返済します。候補探索が自由対位声部を組むとき優先するのもこの形です。',
    },
    time: '4/4',
    width: 560,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'c/4' },
      { key: 'a/4', annotation: 'leap', color: GREEN },
      { key: 'g/4', annotation: 'step', color: GREEN },
      { key: 'f/4', annotation: 'step', color: GREEN },
    ],
    lower: [
      { key: 'f/2', duration: 'w' },
    ],
    issues: [
      { kind: 'motion', label: 'leap up', fromUpper: 0, toUpper: 1, color: GREEN },
      { kind: 'motion', label: 'steps back down', fromUpper: 1, toUpper: 3, color: GREEN },
    ],
  },

  melodicArch: {
    ruleIds: [],
    badge: { en: 'Line shape', ja: '旋律の輪郭' },
    title: { en: 'A single-peak melodic arch', ja: '頂点を一つ持つ旋律線' },
    diagnosis: {
      en: 'The line rises to one clear high point and settles back down.',
      ja: '旋律が一つの明確な頂点へ上り、そこから収まっていきます。',
    },
    caption: {
      en: 'Good contrapuntal lines tend to have one climax per phrase. No single validator rule enforces this; it emerges from the candidate search scoring, which rewards stepwise motion and penalizes aimless zig-zag. Reading generated voices, you will usually find this arch.',
      ja: 'よい対位法の旋律は、フレーズごとに頂点を一つ持つ傾向があります。これを直接強制する単一ルールはありませんが、順次進行を高く評価し無目的なジグザグを減点する候補探索のスコアリングから自然に現れます。生成された声部を読むと、たいていこのアーチが見つかります。',
    },
    time: '4/4',
    width: 560,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'c/4' },
      { key: 'e/4' },
      { key: 'g/4', annotation: 'peak', color: GREEN },
      { key: 'e/4' },
    ],
    lower: [
      { key: 'c/3', duration: 'w' },
    ],
    issues: [
      { kind: 'note', label: 'single climax', upperIndex: 2, color: GREEN },
    ],
  },

  leadingTone: {
    ruleIds: ['leading_tone_resolution'],
    badge: { en: 'Tonal syntax', ja: '調性' },
    title: { en: 'Leading tone must resolve', ja: '導音の未解決' },
    diagnosis: {
      en: 'The leading tone does not continue upward to tonic.',
      ja: '導音が主音へ上行解決していません。',
    },
    caption: {
      en: 'When material marks a leading tone, the next note in that voice must resolve to the tonic pitch class by step.',
      ja: '素材上で導音として印づけられた音は、次の同声部音で主音のピッチクラスへ解決する必要があります。',
    },
    time: '2/4',
    width: 440,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'b/4', annotation: 'LT', color: RED, issue: true },
      { key: 'a/4', annotation: 'wrong', color: RED, issue: true },
    ],
    lower: [
      { key: 'g/2' },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'motion', label: 'should resolve to C', fromUpper: 0, toUpper: 1 },
    ],
  },

  voiceRange: {
    ruleIds: ['voice_range_integrity'],
    badge: { en: 'Physical limit', ja: '物理的制約' },
    title: { en: 'Note outside the declared range', ja: '宣言音域の外に出た音' },
    diagnosis: {
      en: 'The red note exceeds the upper bound of the voice\'s declared MIDI range.',
      ja: '赤い音が、この声部に宣言された MIDI 音域の上限を超えています。',
    },
    caption: {
      en: 'Every voice declares an inclusive MIDI range `[lo, hi]` in its texture plan — a soprano compass, an organ pedal compass, a cello\'s strings. This is a physical rule, not a stylistic one: a single note outside the bounds fails the voice, however good the counterpoint around it is.',
      ja: 'すべての声部は、テクスチュアプランの中で MIDI 音域 `[lo, hi]` を宣言します——ソプラノの声域、オルガンペダルの音域、チェロの弦の範囲。これは様式ではなく物理の規則です。周りの対位法がどれほど良くても、範囲外の音が一つあればその声部は失敗します。',
    },
    time: '4/4',
    width: 560,
    upperClef: 'treble',
    lowerClef: 'bass',
    upper: [
      { key: 'e/5', color: GREEN },
      { key: 'g/5', color: GREEN },
      { key: 'c/6', annotation: '> hi', color: RED, issue: true },
      { key: 'g/5', color: GREEN },
    ],
    lower: [
      { key: 'c/3' },
      { key: 'e/3' },
      { key: 'g/3' },
      { key: 'c/3' },
    ],
    issues: [
      { kind: 'note', label: 'outside [lo, hi]', upperIndex: 2 },
      { kind: 'bracket', label: 'declared compass', fromUpper: 0, toUpper: 3, color: GREEN },
    ],
  },
}
