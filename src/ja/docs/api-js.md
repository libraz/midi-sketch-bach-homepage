---
title: JavaScript API
description: MIDI Sketch Bach のJavaScript API 参照。
---

# JavaScript API 参照

::: info config 内の音楽用語
`form`、`key`、`isMinor`、`character`、`scale`、`targetBars` は、API 値を音楽上の判断に対応させるフィールドです。プログラミング以外の用語は[エンジニアのための音楽用語入門](/ja/docs/music-primer)と[オプション関係](/ja/docs/option-relationships)を参照してください。
:::

## 初期化

### `init(options?)`

WASM モジュールをロードし初期化します。`BachGenerator` インスタンスを作成する前に必ず呼び出してください。

::: code-group

```js [Node.js]
import { init } from '@libraz/midi-sketch-bach'

await init()
```

```js [ブラウザ]
import { init } from '@libraz/midi-sketch-bach'

await init({ wasmPath: '/wasm/bach.wasm' })
```

:::

**パラメータ**:

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `options.wasmPath` | `string` | `.wasm` ファイルへのパス。ブラウザ環境では必須。 |

**戻り値**: `Promise<void>`

::: tip 同時呼び出しは安全
`init()` が重なって呼ばれた場合はモジュールを二重に初期化せず、実行中のロードを共有します。エンジンを必要とする各エントリポイントからそのまま呼び出せます。ロード中に別の `wasmPath` を渡した場合は例外を投げます。
:::

---

## BachGenerator

バッハ風の楽曲を生成するメインクラス。

### コンストラクタ

```js
const generator = new BachGenerator()
```

新しいジェネレータインスタンスを作成します。インスタンス作成前に `init()` を呼び出してください。

### `generate(config?)`

指定された設定に基づいて楽曲を生成します。

```js
generator.generate({
  form: 'fugue',
  key: 2,
  isMinor: true,
  character: 'severe',
  bpm: 80,
  seed: 42
})
```

**パラメータ**: 後述の [BachConfig](#bachconfig) を参照。

**戻り値**: `void`

::: warning 厳格な検証
無効な `form`、`key`、`character`、`instrument`、`scale` の値、および範囲外の `bpm`（0 または 40--200 以外）は、既定へ暗黙的に代替せず**エラーを投げます**。禁止された性格と形式の組み合わせ、および楽器と形式の組み合わせ（[オプション関係](/ja/docs/option-relationships#性格と形式)を参照）も例外を投げます。

エラー文字列は失敗ごとに異なります。たとえば `Invalid BPM (must be 0 or 40-200)` や `Incompatible instrument for this form` です。作曲器自身が対位法の検証に失敗した場合は、[`getDiagnostic()`](#getdiagnostic) で規則単位の詳細を取得してください。
:::

### `getMidi()`

生成された楽曲を標準 MIDI ファイルデータとして返します。

```js
const midi = generator.getMidi()
// midiは有効な.midファイルを含むUint8Array
```

**戻り値**: `Uint8Array`

### `getEvents()`

メタデータと個別のノートイベントを含む構造化イベントデータを返します。

```js
const events = generator.getEvents()
console.log(events.form)             // "fugue"
console.log(events.key)              // "D_minor"
console.log(events.bpm)              // 80
console.log(events.total_bars)       // 44
console.log(events.tempos)           // テンポマップ
console.log(events.time_signatures)  // 拍子マップ
console.log(events.tracks)           // TrackDataの配列
```

::: info イベントのピッチは MIDI 出力と一致する
エンジンは内部的に C で作曲した後、指定された調と楽器の音域に合わせたオクターブシフトを `getEvents()` のピッチと `getMidi()` の `.mid` ファイルに適用します。`getEvents()` と `getMidi()` は、キャラクターに応じたアーティキュレーション後の再生時の長さも使います。内部 C のピッチとアーティキュレーション前の記譜上の長さが必要な場合は `getGenerated()` を使ってください。
:::

::: warning `bpm` だけでは時刻を決められない
`events.bpm` は開始テンポです。多くの形式は終結でリタルダンドしますが、トリオ・ソナタにはありません。前奏曲とフーガ、トッカータとフーガ、幻想曲とフーガでは、フーガに入る位置でもテンポが変わります。一定テンポを仮定せず、[テンポマップ](#ティックを秒に変換する)をたどってください。
:::

**戻り値**: [EventData](#eventdata)

### `getGenerated()`

`generated.v1` ドキュメントを返します。再生用ではなく、採点や解析に使うためのインデックス参照可能なフラットなノート列です。

`getEvents()` とは異なり、ノートのピッチは出力用の移調前にエンジン内部の C で記録されます。

ノートの長さは、キャラクターに応じたアーティキュレーション前に保存された記譜上のスナップショットです。`FinalScore` 検証とテクスチュア指標はこのスナップショットを使い、`getEvents()` と `getMidi()` は短くなった再生時の長さを使います。

```js
const generated = generator.getGenerated()
console.log(generated.schema_version)  // "generated.v1"
console.log(generated.ticks_per_beat)  // 480
console.log(generated.notes[0])
// { index, start_tick, duration, pitch, voice, velocity }
```

**戻り値**: `GeneratedData`。生成が一度も成功していない場合は例外を投げます。

### `generated.v1` のワイヤーフィールド

`getGenerated()` はパース済みの `generated.v1` オブジェクトを返します。ルートの必須フィールドは `schema_version`、`ticks_per_beat`、`duration_ticks`、`notes`、`counterpoint_observations`、`informational_findings`、`wave_veto` です。`tempos` は任意で、エクスポーターがテンポマップを受け取った場合に現れます。`info` も任意で、利用できる場合に主題の特徴量、ストリーム分離、テクスチュア指標などの生成時メトリクスを持ちます。[generated.v1 スキーマ](https://github.com/libraz/midi-sketch-bach/blob/973659e705915c2178d72663d5a65ab95d3cae4b/schema/generated.v1.json)がワイヤー契約であり、`info` はメトリクスの種類が任意であるため、意図的に開いたオブジェクトです。

```ts
interface GeneratedV1Wire {
  schema_version: 'generated.v1'
  ticks_per_beat: number
  duration_ticks: number
  tempos?: Array<{ tick: number; bpm: number }>
  notes: Array<{
    index: number
    start_tick: number
    duration: number
    pitch: number
    voice: number
    velocity: number
  }>
  counterpoint_observations: Array<{
    rule_id: string
    geometry: 'linear' | 'vertical' | 'unclassified'
    total: number
    gated: number
    exempted: number
  }>
  informational_findings: Array<{
    span_id: number | null
    rule_id: string
    geometry: 'linear' | 'vertical' | 'unclassified'
    kind: 'StructuralFail' | 'MusicalFail' | 'ConfigFail'
  }>
  wave_veto: {
    anchor_parallel_displaced: number
    wobble_breaker_fired: number
    step_parallel_adjusted: number
    step_harsh_adjusted: number
    order_clamp_changed: number
    window_expanded: number
    anchor_fault_held: number
    total: number
  }
  info?: Record<string, unknown>
}
```

`counterpoint_observations` には、検証中に1回以上一致した規則が `rule_id` 順で1件ずつ入ります。`geometry` は、1声部内の旋律進行を測る `linear` と、発音中の声部同士または声部と和声プランの関係を測る `vertical` を示します。`unclassified` は、幾何分類表に登録されていない規則 ID 用です。`total` は振り分け前の一致数、`gated` は停止させる検証失敗へ送った件数、`exempted` は生成時にすべての対象音が不変の `Material` または `Ornament` だったため除外した件数です。このレコーダーで扱う検出結果では、`total - gated - exempted` が参考情報として表現される一致数です。独立した参考情報ルールには観測値がない場合があります。

`informational_findings` には、検証状態を停止させず証拠として残す検出結果が入ります。各要素は `span_id`（`null` 可）、規則 ID、幾何分類、`FailKind` を持ちます。形式別の対位法予算で閉じている垂直規則に一致した場合は、形式の予算によって `span_id: null` の停止 `MusicalFail` が追加されることがあります。この場合も観測値の集計は変わりません。

`wave_veto` は、反応型フィグレーション・ウェーブの各層が音を変更した回数と、アンカー違反を解消できず残した回数を報告します。`total` は音を変更した6つのカウンターだけの合計です。`anchor_fault_held` は、修復できないアンカー違反を残した回数を別に報告します。8つのフィールドは、すべて0の場合も常に出力されます。

ワイヤーエクスポーターは `informational_findings`、`wave_veto`、任意の `tempos`、任意の `info` をすでに出力しています。現在同梱している JavaScript 宣言は `counterpoint_observations` までは宣言していますが、2つの名前付きフィールドと任意のエクスポーターメタデータはまだ宣言していません。このページは実行時のワイヤーオブジェクトを説明しているため、宣言されていないフィールドを TypeScript から読む場合は、ローカルの型拡張または実行時の絞り込みが必要です。

### `getProvenance()`

`provenance.v1` ドキュメントを返します。`getGenerated().notes` とインデックスが 1 対 1 で対応し、そのノートがどう選ばれたかを 1 件ずつ記録します。

```js
const provenance = generator.getProvenance()
const note = provenance.notes[0]
console.log(note.voice_intent)  // "SubjectCarrier"
console.log(note.source)        // "Material" | "Compose" | "Ornament"

// 規則マスクは10進文字列。Number ではなく BigInt で読む
const satisfied = BigInt(note.satisfied_rules)
const high = note.satisfied_rules_high ? BigInt(note.satisfied_rules_high) : 0n
```

::: warning 規則マスクは文字列
JavaScript の `number` では 64 個の規則ビットをすべて保持できないため、`satisfied_rules` と `satisfied_rules_high` は10進文字列です。`BigInt()` で読んでください。上位レーン（ビット 64--127）を 1 つも使わないノートでは、`satisfied_rules_high` はフィールドごと省略されます。
:::

**戻り値**: `ProvenanceData`。生成が一度も成功していない場合は例外を投げます。

### `getDiagnostic()`

直近の作曲検証エラーの `diagnostic.v1` ドキュメントを返します。直前の生成が成功していた場合は `null` を返します。

```js
try {
  generator.generate({ form: 'fugue', seed: 42 })
} catch {
  const diagnostic = generator.getDiagnostic()
  for (const failure of diagnostic?.validation.failures ?? []) {
    console.log(failure.kind, failure.rule_id, failure.span_id)
  }
}
```

`generate()` が成功した場合は例外を投げず、`getDiagnostic()` は `null` を返します。生成が作曲検証エラーを返したときに、`catch` 節で診断データを読み取ってください。

**戻り値**: `DiagnosticData | null`

### `getInfo()`

ジェネレータとその現在の状態に関する情報を返します。

```js
const info = generator.getInfo()
console.log(info.seedUsed)    // 解決されたシード（seed: 0 を指定しても非ゼロ）
console.log(info.totalBars)   // 解決された小節数
console.log(info.bpm)         // 実際に使用されたBPM
console.log(info.trackCount)  // トラック数
```

`seed: 0`（ランダム）を渡すと、この実行で実際に選択されたシードが `getInfo().seedUsed` として報告されます。同じ出力を再現するにはその値を再利用してください。

**戻り値**: `BachInfo`

### `destroy()`

このジェネレータが確保したWASM メモリを解放します。使用後は必ず呼び出してください。

```js
generator.destroy()
```

::: warning
`destroy()` を呼び出した後、そのジェネレータインスタンスは再利用できません。別の楽曲を生成する場合は、新しい `BachGenerator` を作成してください。
:::

---

## BachConfig

`generate()` に渡す設定オブジェクト。すべてのフィールドはオプションです。

| フィールド | 型 | 既定 | 説明 |
|-----------|------|----------|------|
| `form` | `FormId \| FormName` | `"fugue"` | 楽曲形式（0--9または名前）。[楽曲形式](/ja/docs/forms)と[プリセット一覧](/ja/docs/presets)を参照。 |
| `key` | `KeyId \| KeyName` | `0` | 調。ピッチクラス（0=C, 1=C#, 2=D, ... 11=B）または正式名（`"C"`、`"C#"`、`"D"`、`"Eb"`、`"E"`、`"F"`、`"F#"`、`"G"`、`"Ab"`、`"A"`、`"Bb"`、`"B"`）。 |
| `isMinor` | `boolean` | `false` | `true` で短調、`false` で長調 |
| `bpm` | `number` | `100` | 開始テンポ（BPM）。`0` は既定の100を使用。それ以外は 40--200 の範囲が必須（範囲外では例外）。 |
| `seed` | `number` | `0` | 符号なし 32 ビットのランダムシード。`0` は非ゼロのランダムシードを選び、`getInfo().seedUsed` で報告。 |
| `character` | `CharacterId \| CharacterName` | `"severe"` | 主題の性格（`"severe"`、`"playful"`、`"noble"`、`"restless"`）。無効値では例外。 |
| `instrument` | `InstrumentId \| InstrumentName` | 形式の既定 | 楽器（`"organ"`、`"harpsichord"`、`"piano"`、`"violin"`、`"cello"`、`"guitar"`）。その形式が受け付ける楽器である必要があり、それ以外は例外。 |
| `scale` | `DurationScaleId \| DurationScaleName` | `"short"` | 形式の基準長に対する倍率: `"short"`（約1倍）、`"medium"`（約2倍）、`"long"`（約3倍）、`"full"`（約4倍）。無効値では例外。 |
| `targetBars` | `number` | -- | 推奨する整数範囲は 0〜128 です。`0` は `scale` を使い、正の値はそれを上書きしてから形式の刻みにスナップし、`[最小, 128]` に丸め込みます。ワイヤーでは符号なし16ビット値を受け付けますが、非常に大きな値は刻みへのスナップ時に桁あふれして形式の最小長へ戻ることがあります。受け付ける範囲と端の値の動作は[オプション関係](/ja/docs/option-relationships#scale-と-targetbars)を参照してください。 |

::: info 名前文字列は完全一致
形式・調・スケールの名前は正式な綴りと完全に一致する必要があり、`"Fugue"`、`"g"`、`"FULL"` はいずれも例外になります。性格名だけは例外で大文字小文字を区別しないため、`getCharacters()` が返す先頭大文字のラベルをそのまま渡せます。
:::

::: info 声部数は形式で決まります
`BachConfig` に `numVoices` フィールドはありません。声部数は `form` で決まります。[楽曲形式](/ja/docs/forms)の表を参照してください。C API に直接渡す JSON では互換性のため `num_voices` を別に受け付けますが、符号なし8ビット整数として検証した後に無視します。
:::

### 楽曲形式の値

形式は番号または名前文字列で指定できます。

| 番号 | 文字列 |
|------|--------|
| `0` | `"fugue"` |
| `1` | `"prelude_and_fugue"` |
| `2` | `"trio_sonata"` |
| `3` | `"chorale_prelude"` |
| `4` | `"toccata_and_fugue"` |
| `5` | `"passacaglia"` |
| `6` | `"fantasia_and_fugue"` |
| `7` | `"cello_prelude"` |
| `8` | `"chaconne"` |
| `9` | `"goldberg_variations"` |

### 楽器の値

| 番号 | 文字列 | 受け付ける形式 |
|------|--------|----------------|
| `0` | `"organ"` | 形式 0--6 |
| `1` | `"harpsichord"` | ゴルトベルク変奏曲 |
| `2` | `"piano"` | ゴルトベルク変奏曲 |
| `3` | `"violin"` | シャコンヌ |
| `4` | `"cello"` | チェロ前奏曲 |
| `5` | `"guitar"` | -- |

各形式は特定の楽器のために書かれており、その形式の欄にない楽器は拒否されます。`instrument` を省略すると形式の既定が使われます。

### 性格の値

| 番号 | 文字列 | 説明 |
|------|--------|------|
| `0` | `"severe"` | 厳格で知的に緻密（既定） |
| `1` | `"playful"` | 軽快で機敏、リズミカル |
| `2` | `"noble"` | 荘重で広やか、威厳のある |
| `3` | `"restless"` | 推進力があり半音階的で劇的 |

性格はノートのリリースのアーティキュレーションとコントローラーのレベルも制御します。1拍=480ティックで、宣言される分離量は Noble 24、Severe 40、Playful 56、Restless 72ティックです。チェロ前奏曲とシャコンヌでは値が半分になり、定旋律の声部は0です。コントローラーのオフセットはカーブ形状を変えません。

### スケールの値

`scale` は形式の基準長を倍率で伸ばします（[楽曲形式](/ja/docs/forms)を参照）。`targetBars` がこれを上書きします。

| 番号 | 文字列 | おおよその長さ |
|------|--------|------|
| `0` | `"short"` | 基準長の約1倍（既定） |
| `1` | `"medium"` | 基準長の約2倍 |
| `2` | `"long"` | 基準長の約3倍 |
| `3` | `"full"` | 基準長の約4倍。ただしゴルトベルク変奏曲は完全な128小節の特例 |

基準長は形式が持つスナップ前の小節数です。出力前に形式ごとの小節単位へスナップされます。フーガの基準長は42小節ですが、`"short"` の出力は44小節に解決されます。ゴルトベルク変奏曲の `"full"` は、アリア、30の全変奏、アリア・ダ・カーポを含む完全な128小節のレイアウトという特例で、20小節の基準長を4倍したものではありません。

---

## レスポンス型

### EventData

```ts
interface EventData {
  form: string          // 形式名（例: "fugue"）
  key: string           // 指定された調名（例: "D_minor"）
  bpm: number           // 開始テンポ
  seed: number          // 生成に使用された解決済みシード
  total_ticks: number   // MIDIティック単位の総時間
  total_bars: number    // 総小節数
  description: string   // 人間が読める説明文
  tempos: Array<{ tick: number; bpm: number }>
  time_signatures: Array<{ tick: number; numerator: number; denominator: number }>
  tracks: TrackData[]   // トラックデータの配列
}
```

`tempos` の先頭は必ずティック 0 の要素で、その `bpm` が開始テンポです。`time_signatures` は形式の拍子を示し、多くの形式は 4/4、パッサカリアとシャコンヌは 3/4 です。

### TrackData

```ts
interface TrackData {
  name: string          // トラック名（例: "Voice 0", "Voice 1"）
  channel: number       // MIDI チャンネル（0-15）
  program: number       // General MIDI プログラム番号
  note_count: number    // このトラックのノート数
  control_changes: Array<{ tick: number; controller: number; value: number }>
  notes: NoteEvent[]    // ノートイベントの配列
}
```

`control_changes` は演奏プロファイルの強弱変化を、重複を統合済みの点列として持ちます。オルガンとチェンバロは CC 7（チャンネルボリューム）、ピアノ、ヴァイオリン、チェロは CC 11（エクスプレッション）を使い、ギターには連続表現プロファイルがありません。CC 7 は再生レベルを変えるもので、オルガンのストップ選択ではありません。性格によるオフセットはカーブ形状を保ったまま、Severe を基準に Noble +5、Severe 0、Playful -7、Restless +2 です。

### NoteEvent

```ts
interface NoteEvent {
  pitch: number         // MIDI ノート番号（0-127）、出力調と音域へ移調済み
  velocity: number      // ノートベロシティ（0-127）
  start_tick: number    // MIDIティック単位の開始時間
  duration: number      // アーティキュレーション後の再生時の長さ（MIDIティック）
  voice: number         // 声部インデックス
  source: string        // 由来: "material" | "compose" | "ornament"
}
```

::: info ノートの音価と由来
`getEvents()` の `duration` は、キャラクターに応じたアーティキュレーション後の再生時の長さです。240 ティック未満（480 ティックを1拍とするグリッドでの8分音符未満）の音では、宣言された分離量が音の長さに応じて縮小されます。短縮量は元の音価の半分を超えません。各声部の最後の開始音は全長を保ちます。`source` はノートの生成方法を記録するため、後からベロシティやアーティキュレーションを変更しても、既存の `material` や `compose` が `ornament` には変わりません。
:::

::: info ノートの由来（`source`）
すべてのノートは生成方法を記録する `source` タグを持ちます。
- `"material"` — 形式が割り当てた固定素材（主題、グラウンドバス、定旋律）。
- `"compose"` — 和声プランに対して候補探索が選択したノート。
- `"ornament"` — 装飾処理（トリル、モルデント、ナッハシュラーク）が追加したノート。
:::

---

## ティックを秒に変換する

ティックは音楽上の時間、秒は実時間です。曲の途中でテンポが変わるため、両者の変換はテンポマップを区間ごとにたどる必要があります。

```js
const PPQ = 480

function secondsAtTick(tick, events) {
  const tempos = [...events.tempos].sort((a, b) => a.tick - b.tick)
  let seconds = 0
  let previousTick = 0
  let bpm = tempos[0].bpm

  for (const tempo of tempos) {
    if (tempo.tick <= 0) {
      bpm = tempo.bpm
      continue
    }
    if (tempo.tick >= tick) break
    seconds += ((tempo.tick - previousTick) / PPQ) * (60 / bpm)
    previousTick = tempo.tick
    bpm = tempo.bpm
  }
  return seconds + ((tick - previousTick) / PPQ) * (60 / bpm)
}

const events = generator.getEvents()
const total = secondsAtTick(events.total_ticks, events)
const noteStart = secondsAtTick(events.tracks[0].notes[0].start_tick, events)
```

ノートの長さを秒で求めるときは、長さ単体を換算するのではなく両端の差を取ります。

```js
const start = secondsAtTick(note.start_tick, events)
const end = secondsAtTick(note.start_tick + note.duration, events)
const durationSeconds = end - start
```

小節番号と拍番号も同じ要領で拍子マップから求めます。1 拍は `(480 * 4) / denominator` ティック、1 小節はその `numerator` 倍です。

```js
function timeSignatureAtTick(tick, events) {
  let active = events.time_signatures[0]
  for (const signature of events.time_signatures) {
    if (signature.tick > tick) break
    active = signature
  }
  return active
}
```

---

## プリセット列挙関数

これらの関数は、利用可能なオプションを記述する `PresetInfo` オブジェクトの配列を返します。

以下の例は、[初期化](#初期化)に示す `await init()` が完了していることを前提とします。

### `getForms()`

```js
import { getForms } from '@libraz/midi-sketch-bach'

const forms = getForms()
// [{ id: 0, name: "fugue", display: "Fugue" }, ...]
```

### `getInstruments()`

```js
import { getInstruments } from '@libraz/midi-sketch-bach'

const instruments = getInstruments()
// [{ id: 0, name: "organ" }, ...]
```

### `getCharacters()`

```js
import { getCharacters } from '@libraz/midi-sketch-bach'

const characters = getCharacters()
// [{ id: 0, name: "Severe" }, ...]
```

性格名は表示用に先頭が大文字で返ります。`character` は大文字小文字を区別しないため、この値をそのまま `generate()` に渡せます。

### `getKeys()`

```js
import { getKeys } from '@libraz/midi-sketch-bach'

const keys = getKeys()
// [{ id: 0, name: "C" }, { id: 1, name: "C#" }, ...]
```

これが調の正式名なので、`key` には `id` と `name` のどちらでも渡せます。

### `getScales()`

```js
import { getScales } from '@libraz/midi-sketch-bach'

const scales = getScales()
// [{ id: 0, name: "short" }, ...]
```

### `getDefaultInstrumentForForm(formId: number): number`

楽曲形式 ID の既定楽器 ID を返します。

```js
import { getDefaultInstrumentForForm } from '@libraz/midi-sketch-bach'

const instrumentId = getDefaultInstrumentForForm(7)
// 4（チェロ）
```

**引数**: `formId: number`

**戻り値**: `number`。有効な楽曲形式 ID は 0--9 です。無効または範囲外の値には `0`（オルガン）を返します。

### `getVersion()`

```js
import { getVersion } from '@libraz/midi-sketch-bach'

const version = getVersion()
console.log(version) // 現在のエンジンバージョン文字列
```

---

## 完全な使用例

### フーガを生成して保存

```js
import { init, BachGenerator } from '@libraz/midi-sketch-bach'
import { writeFileSync } from 'fs'

await init()

const generator = new BachGenerator()
generator.generate({
  form: 'fugue',
  key: 2,
  isMinor: true,
  character: 'severe',
  bpm: 76,
  seed: 12345
})

writeFileSync('fugue-d-minor.mid', generator.getMidi())

const events = generator.getEvents()
console.log(`生成完了: ${events.description}`)
console.log(`小節数: ${events.total_bars}, トラック数: ${events.tracks.length}`)

for (const track of events.tracks) {
  console.log(`  ${track.name}: ${track.note_count} ノート`)
}

generator.destroy()
```

### すべての形式を生成

```js
import { init, BachGenerator, getForms } from '@libraz/midi-sketch-bach'
import { writeFileSync } from 'fs'

await init()

const forms = getForms()
const generator = new BachGenerator()

for (const form of forms) {
  generator.generate({
    form: form.name,
    key: 2,
    isMinor: true,
    seed: 42
  })

  // form.name は最初から snake_case（例: "prelude_and_fugue"）。表示用の名前には form.display を使う
  const filename = `bach-${form.name}.mid`
  writeFileSync(filename, generator.getMidi())
  console.log(`保存: ${filename}`)
}

generator.destroy()
```

### ブラウザ: 生成してダウンロード

```js
import { init, BachGenerator } from '@libraz/midi-sketch-bach'

await init({ wasmPath: '/wasm/bach.wasm' })

const generator = new BachGenerator()
generator.generate({
  form: 'fugue',
  key: 0,
  isMinor: false
})

const midi = generator.getMidi()
const blob = new Blob([midi], { type: 'audio/midi' })
const url = URL.createObjectURL(blob)

const a = document.createElement('a')
a.href = url
a.download = 'bach-fugue.mid'
a.click()

URL.revokeObjectURL(url)
generator.destroy()
```
