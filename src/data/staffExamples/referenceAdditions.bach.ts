import type { StaffExampleDef } from './types'
import { AMBER, GREEN } from './types'

/**
 * Additional From Bach quotations.
 *
 * Each excerpt is a reduction. The source comments identify the corpus file,
 * voice, and beat window used for the transcription.
 */
export const referenceAdditionBachExamples: Record<string, StaffExampleDef> = {
  // Source: reference corpus BWV578_fugue.json; v1 soprano beats 0–8,
  // v2 alto beats 20–28.
  bachRealAnswer: {
    ruleIds: [],
    badge: { en: 'From Bach', ja: 'バッハの実例' },
    title: {
      en: 'Bach: "Little" Fugue in G minor (BWV 578) — a real answer',
      ja: 'バッハ: 小フーガ ト短調（BWV 578）— 実応',
    },
    diagnosis: {
      en: 'The displayed opening of the subject returns five semitones lower in the alto entry.',
      ja: '表示した主唱の冒頭が、アルトの実応で 5 半音下に現れます。',
    },
    caption: {
      en: 'In the "Little" Fugue in G minor (BWV 578), the upper staff quotes the soprano in mm. 1–2 and the lower staff quotes the alto in mm. 6–7. The 11 displayed pitches and their durations match after a transposition of −5 semitones, a perfect fourth down. The full subject continues beyond these two bars; this comparison covers its opening only. The staves are aligned for comparison and play sequentially, so they are not simultaneous voices.',
      ja: 'ト短調「小フーガ」（BWV 578）では、上段に第 1〜2 小節のソプラノ、下段に第 6〜7 小節のアルトを引用します。表示した 11 音は音価を保ったまま 5 半音、すなわち完全 4 度下へ移調されています。主唱全体はこの 2 小節の後も続くため、ここで比べるのは冒頭だけです。上下段は比較のためにそろえたもので、順に再生され、同時に鳴る声部ではありません。',
    },
    time: '4/4',
    bars: 2,
    keySignature: 'Gm',
    width: 720,
    upperClef: 'treble',
    lowerClef: 'treble',
    upperLabel: { en: 'subject', ja: '主唱' },
    lowerLabel: { en: 'answer', ja: '応唱' },
    playback: 'sequential',
    verdict: 'neutral',
    upper: [
      { key: 'g/4', duration: 'q' },
      { key: 'd/5', duration: 'q' },
      { key: 'bb/4', duration: 'qd' },
      { key: 'a/4', duration: '8' },
      { key: 'g/4', duration: '8' },
      { key: 'bb/4', duration: '8' },
      { key: 'a/4', duration: '8' },
      { key: 'g/4', duration: '8' },
      { key: 'f#/4', duration: '8', accidental: '#' },
      { key: 'a/4', duration: '8' },
      { key: 'd/4', duration: 'q' },
    ],
    lower: [
      { key: 'd/4', duration: 'q' },
      { key: 'a/4', duration: 'q' },
      { key: 'f/4', duration: 'qd' },
      { key: 'e/4', duration: '8', accidental: 'n' },
      { key: 'd/4', duration: '8' },
      { key: 'f/4', duration: '8' },
      { key: 'e/4', duration: '8', accidental: 'n' },
      { key: 'd/4', duration: '8' },
      { key: 'c#/4', duration: '8', accidental: '#' },
      { key: 'e/4', duration: '8', accidental: 'n' },
      { key: 'a/3', duration: 'q' },
    ],
  },

  // Source: reference corpus BWV582.json; v4 pedal beats 1–13 and 25–37.
  bachPassacagliaReturn: {
    ruleIds: ['passacaglia_ground_immutable'],
    badge: { en: 'From Bach', ja: 'バッハの実例' },
    title: {
      en: 'Bach: Passacaglia in C minor (BWV 582) — the pedal returns',
      ja: 'バッハ: パッサカリア ハ短調（BWV 582）— ペダル主題の回帰',
    },
    diagnosis: {
      en: 'The pedal repeats the same pitches and durations in the opening and at the first return.',
      ja: 'ペダルが冒頭と最初の回帰で、同じ音高と音価を反復します。',
    },
    caption: {
      en: 'Bach’s organ Passacaglia in C minor (BWV 582) begins with a quarter-note pickup. The upper staff shows the first four full bars of the pedal after that pickup (corpus beats 1–13); the lower staff shows the corresponding four bars at the first return (beats 25–37). Both excerpts contain the same eight attacks in 3/4. The pickup and the final four bars of the eight-bar ground are omitted. The staves are aligned for comparison and play sequentially, not as simultaneous parts. An exact corpus search finds the full 24-beat ground at beats 0, 24, 48, 72, and 96; later variations can move or decorate it.',
      ja: 'バッハのオルガン曲《パッサカリア ハ短調》（BWV 582）は 4 分音符の弱起で始まります。上段は弱起後のペダル最初の 4 つの完全な小節（コーパス上の拍位置 1〜13）、下段は最初の回帰にあたる 4 小節（拍位置 25〜37）です。どちらも 3/4 拍子で 8 つの発音を含み、音高と音価が一致します。弱起と、8 小節グラウンドの後半 4 小節は省略しています。上下段は比較のためにそろえたもので、順に再生され、同時に鳴るパートではありません。コーパスの完全一致検索では、24 拍のグラウンドが拍位置 0、24、48、72、96 に現れます。後の変奏では、グラウンドが移動したり装飾されたりする場合があります。',
    },
    time: '3/4',
    bars: 4,
    systemBars: 2,
    keySignature: 'Cm',
    width: 720,
    upperClef: 'bass',
    lowerClef: 'bass',
    upperLabel: { en: 'opening', ja: '初回' },
    lowerLabel: { en: 'return', ja: '反復' },
    playback: 'sequential',
    verdict: 'neutral',
    upper: [
      { key: 'g/2', duration: 'h', annotation: 'opening', color: AMBER },
      { key: 'eb/2', duration: 'q' },
      { key: 'f/2', duration: 'h' },
      { key: 'g/2', duration: 'q' },
      { key: 'ab/2', duration: 'h' },
      { key: 'f/2', duration: 'q' },
      { key: 'g/2', duration: 'h' },
      { key: 'd/2', duration: 'q' },
    ],
    lower: [
      { key: 'g/2', duration: 'h', annotation: 'return', color: GREEN },
      { key: 'eb/2', duration: 'q' },
      { key: 'f/2', duration: 'h' },
      { key: 'g/2', duration: 'q' },
      { key: 'ab/2', duration: 'h' },
      { key: 'f/2', duration: 'q' },
      { key: 'g/2', duration: 'h' },
      { key: 'd/2', duration: 'q' },
    ],
    issues: [],
  },

  // Source: reference corpus BWV869_prelude.json; manual track m.3,
  // beats 8–12, as an alto/bass reduction.
  bachSuspensionNineEight: {
    ruleIds: ['suspension_preparation', 'suspension_resolution_step_down'],
    badge: { en: 'From Bach', ja: 'バッハの実例' },
    title: {
      en: 'Bach: WTC I Prelude in B minor (BWV 869) — a displaced 9–8 suspension',
      ja: 'バッハ: 平均律 I 巻 ロ短調プレリュード（BWV 869）— オクターヴ移動を伴う 9–8 型掛留',
    },
    diagnosis: {
      en: 'G4 is held into a minor ninth, then falls to F♯4 while the bass drops to F♯2, making a sounding fifteenth.',
      ja: 'G4 を短 9 度まで保持して F♯4 へ下行し、バスの F♯2 によって解決時に 15 度を作ります。',
    },
    caption: {
      en: 'In m. 3 of WTC I’s B minor prelude (BWV 869), the reduced alto line begins as a consonant minor tenth over E3. G4 is held into beat 3, where F♯3 below it forms a minor ninth; the line then resolves down to F♯4 as the bass drops from F♯3 to F♯2, so the sounding resolution is a double octave (15th), not an octave. The final E4 is clipped at the barline and continues into m. 4. The soprano and other keyboard notes are omitted. This score illustrates the 9–8 type; the validator does not infer a Bach suspension from this reduced excerpt.',
      ja: '平均律 I 巻ロ短調プレリュード（BWV 869）の第 3 小節を、アルトとバスの縮約で示します。アルトの G4 は E3 上の協和な短 10 度として始まり、第 3 拍まで保持されて F♯3 上の短 9 度を作ります。その後 G4 は F♯4 へ順次下行しますが、バスも F♯3 から F♯2 へオクターヴ下がるため、響く解決音程はオクターヴではなく複オクターヴ（15 度）です。末尾の E4 は小節線で切ってあり、第 4 小節へ続きます。ソプラノなど他の鍵盤音は省略しています。これは 9–8 型の実例を示す縮約であり、この縮約だけから検証器がバッハの掛留を自動判定するものではありません。',
    },
    time: '4/4',
    bars: 1,
    keySignature: 'Bm',
    width: 680,
    upperClef: 'treble',
    lowerClef: 'bass',
    upperLabel: { en: 'alto', ja: 'アルト' },
    lowerLabel: { en: 'bass', ja: 'バス' },
    verdict: 'caution',
    upper: [
      { key: 'g/4', duration: 'h', annotation: 'prep', tie: true },
      { key: 'g/4', duration: '8', annotation: 'm9', color: AMBER },
      { key: 'f#/4', duration: '8', annotation: 'P15', color: GREEN },
      { key: 'e/4', duration: 'q' },
    ],
    lower: [
      { key: 'e/3', duration: '8' },
      { key: 'c#/3', duration: '8' },
      { key: 'd/3', duration: '8' },
      { key: 'e/3', duration: '8' },
      { key: 'f#/3', duration: '8', color: AMBER },
      { key: 'f#/2', duration: '8', color: GREEN },
      { key: 'g#/2', duration: '8', accidental: '#' },
      { key: 'a#/2', duration: '8', accidental: '#' },
    ],
    issues: [
      { kind: 'vertical', label: 'minor 9th', upperIndex: 1, lowerIndex: 4, color: AMBER },
      { kind: 'motion', label: 'step down', fromUpper: 1, toUpper: 2, color: GREEN },
      { kind: 'vertical', label: 'P15 resolution', upperIndex: 2, lowerIndex: 5, color: GREEN },
    ],
  },

  // Source: reference corpus BWV857_fugue.json; manual track m.3,
  // beats 8–12, subject voice only.
  bachChromaticSubject: {
    ruleIds: [],
    badge: { en: 'From Bach', ja: 'バッハの実例' },
    title: {
      en: 'Bach: WTC I Fugue in F minor (BWV 857) — chromatic subject descent',
      ja: 'バッハ: 平均律 I 巻 ヘ短調フーガ（BWV 857）— 主題の半音階的下行',
    },
    diagnosis: {
      en: 'The subject spells A♮–A♭–G, a chromatic descent inside one line.',
      ja: '主題が A♮–A♭–G と、一つの線の中で半音階的に下行します。',
    },
    caption: {
      en: 'In m. 3 of WTC I’s F minor fugue (BWV 857), the subject descends A♮ on beat 1, A♭ on beat 2, and G across beats 3–4. A♮ is chromatic against the F-minor signature; A♭ is the diatonic third, and the line continues to G. This is a one-voice reduction: the lower staff is silent in this bar and the other voices are omitted; the next entry begins in m. 4, beat 2.',
      ja: '平均律 I 巻ヘ短調フーガ（BWV 857）の第 3 小節で、主題は第 1 拍の A♮、第 2 拍の A♭、第 3〜4 拍の G と下行します。A♮ はヘ短調の調号にない半音階的な音で、A♭ は調階の第 3 音です。これは一声部の縮約です。下段はこの小節では休止し、他声部は省略しています。次の声部の入りは第 4 小節第 2 拍です。',
    },
    time: '4/4',
    bars: 1,
    keySignature: 'Fm',
    width: 620,
    upperClef: 'bass',
    lowerClef: 'treble',
    upperLabel: { en: 'subject', ja: '主題' },
    lowerLabel: { en: 'others', ja: '他声部' },
    verdict: 'neutral',
    upper: [
      { key: 'a/3', duration: 'q', accidental: 'n', color: AMBER },
      { key: 'ab/3', duration: 'q', accidental: 'b' },
      { key: 'g/3', duration: 'h' },
    ],
    lower: [{ key: 'b/4', duration: 'w', rest: true }],
    issues: [
      { kind: 'motion', label: 'chromatic semitone', fromUpper: 0, toUpper: 1, color: AMBER },
      { kind: 'bracket', label: 'subject m. 3', fromUpper: 0, toUpper: 2, color: AMBER },
    ],
  },
}
