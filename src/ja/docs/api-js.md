---
title: JavaScript API
description: MIDI Sketch BachのJavaScript APIリファレンス。
---

# JavaScript APIリファレンス

## 初期化

### `init(options?)`

WASMモジュールをロードし初期化します。`BachGenerator` インスタンスを作成する前に必ず呼び出してください。

```js
import { init } from '@libraz/midi-sketch-bach'

// Node.js（WASMパスは自動解決）
await init()

// ブラウザ（WASMパスを指定）
await init({ wasmPath: '/wasm/midisketch.wasm' })
```

**パラメータ**:

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `options.wasmPath` | `string` | `.wasm` ファイルへのパス。ブラウザ環境では必須。 |

**戻り値**: `Promise<void>`

---

## BachGenerator

バッハスタイルの楽曲を生成するメインクラス。

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
無効な `form`、`character`、`instrument`、`scale` 文字列、および範囲外の `bpm`（0 または 40--200 以外）は、デフォルトへ暗黙的にフォールバックせず**エラーをスロー**するようになりました。禁止されたキャラクター/形式の組み合わせ（[オプション関係](/ja/docs/option-relationships#キャラクターと形式)を参照）もスローします。
:::

### `getMidi()`

生成された楽曲を標準MIDIファイルデータとして返します。

```js
const midi = generator.getMidi()
// midiは有効な.midファイルを含むUint8Array
```

**戻り値**: `Uint8Array`

### `getEvents()`

メタデータと個別のノートイベントを含む構造化イベントデータを返します。

```js
const events = generator.getEvents()
console.log(events.form)        // "fugue"
console.log(events.key)         // 使用されたピッチクラス（0 = C）
console.log(events.bpm)         // 80
console.log(events.total_bars)  // 42
console.log(events.tracks)      // TrackDataの配列
```

::: info ピッチはCで生成される
エンジンは内部的にCで作曲し、指定された `key` はMIDIファイル書き出し時に適用されます。そのためイベントJSONのピッチはCのまま報告され、`getMidi()` が返す `.mid` ファイルは選択した調に移調されます。
:::

**戻り値**: [EventData](#eventdata)

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

このジェネレータが確保したWASMメモリを解放します。使用後は必ず呼び出してください。

```js
generator.destroy()
```

::: warning
`destroy()` を呼び出した後、そのジェネレータインスタンスは再利用できません。別の楽曲を生成する場合は、新しい `BachGenerator` を作成してください。
:::

---

## BachConfig

`generate()` に渡す設定オブジェクト。すべてのフィールドはオプションです。

| フィールド | 型 | デフォルト | 説明 |
|-----------|------|----------|------|
| `form` | `number \| string` | `"fugue"` | 楽曲形式（0--9または名前）。[楽曲形式](/ja/docs/forms)と[プリセットリファレンス](/ja/docs/presets)を参照。 |
| `key` | `number` | `0` | 調（0--11のピッチクラス: 0=C, 1=C#, 2=D, ... 11=B） |
| `isMinor` | `boolean` | `false` | `true` で短調、`false` で長調 |
| `bpm` | `number` | `100` | テンポ（BPM）。`0` はデフォルトの100を使用。それ以外は 40--200 の範囲が必須（範囲外はスロー）。 |
| `seed` | `number` | `0` | ランダムシード。`0` は非ゼロのランダムシードを選び、`getInfo().seedUsed` で報告。 |
| `character` | `string \| number` | `"severe"` | 主題キャラクター（`"severe"`、`"playful"`、`"noble"`、`"restless"`）。無効値はスロー。 |
| `instrument` | `string \| number` | 形式のデフォルト | 楽器（`"organ"`、`"harpsichord"`、`"piano"`、`"violin"`、`"cello"`、`"guitar"`）。無効値はスロー。 |
| `scale` | `string \| number` | `"short"` | 形式の自然長に対する倍率: `"short"`（約1倍）、`"medium"`（約2倍）、`"long"`（約3倍）、`"full"`（約4倍）。無効値はスロー。 |
| `targetBars` | `number` | -- | 明示的な小節数。`> 0` のとき `scale` を上書きし、形式の刻みにスナップして `[最小, 128]` にクランプ。 |

::: warning `numVoices` は廃止されました
声部数は `form` によって決定されます（[楽曲形式](/ja/docs/forms)の表を参照）。後方互換のため `num_voices`/`numVoices` の指定は受理されますが無視されます。エラーにはならず、効果もありません。
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

| 番号 | 文字列 |
|------|--------|
| `0` | `"organ"` |
| `1` | `"harpsichord"` |
| `2` | `"piano"` |
| `3` | `"violin"` |
| `4` | `"cello"` |
| `5` | `"guitar"` |

### キャラクターの値

| 番号 | 文字列 | 説明 |
|------|--------|------|
| `0` | `"severe"` | 厳格で知的に緻密（デフォルト） |
| `1` | `"playful"` | 軽快で機敏、リズミカル |
| `2` | `"noble"` | 荘重で広やか、威厳のある |
| `3` | `"restless"` | 推進力があり半音階的で劇的 |

### スケールの値

`scale` は形式の自然長を倍率で伸ばします（[楽曲形式](/ja/docs/forms)を参照）。`targetBars` がこれを上書きします。

| 番号 | 文字列 | おおよその長さ |
|------|--------|------|
| `0` | `"short"` | 自然長の約1倍（デフォルト） |
| `1` | `"medium"` | 自然長の約2倍 |
| `2` | `"long"` | 自然長の約3倍 |
| `3` | `"full"` | 自然長の約4倍 |

---

## レスポンス型

### EventData

```ts
interface EventData {
  form: string          // 形式名（例: "fugue"）
  key: number           // ピッチクラス（イベントJSONはCのまま）
  bpm: number           // テンポ
  seed: number          // 生成に使用された解決済みシード
  total_ticks: number   // MIDIティック単位の総時間
  total_bars: number    // 総小節数
  description: string   // 人間が読める説明文
  tracks: TrackData[]   // トラックデータの配列
}
```

### TrackData

```ts
interface TrackData {
  name: string          // トラック名（例: "Soprano", "Bass"）
  channel: number       // MIDIチャンネル（0-15）
  program: number       // General MIDIプログラム番号
  note_count: number    // このトラックのノート数
  notes: NoteEvent[]    // ノートイベントの配列
}
```

### NoteEvent

```ts
interface NoteEvent {
  pitch: number         // MIDIノート番号（0-127）、Cで生成
  velocity: number      // ノートベロシティ（0-127）
  start_tick: number    // MIDIティック単位の開始時間
  duration: number      // MIDIティック単位の長さ
  voice: number         // 声部インデックス
  source: string        // 由来: "material" | "compose" | "ornament"
}
```

::: info ノートの由来（`source`）
すべてのノートは生成方法を記録する `source` タグを持ちます。
- `"material"` — 形式が割り当てた固定素材（主題、グラウンドバス、定旋律）。
- `"compose"` — 和声プランに対して候補探索が選択したノート。
- `"ornament"` — 装飾パス（トリル、モルデント、ナッハシュラーク）が追加したノート。
:::

---

## プリセット列挙関数

これらの関数は、利用可能なオプションを記述する `PresetInfo` オブジェクトの配列を返します。

### `getForms()`

```js
import { getForms } from '@libraz/midi-sketch-bach'

const forms = getForms()
// [{ index: 0, name: "Fugue", ... }, ...]
```

### `getInstruments()`

```js
import { getInstruments } from '@libraz/midi-sketch-bach'

const instruments = getInstruments()
// [{ index: 0, name: "Organ", ... }, ...]
```

### `getCharacters()`

```js
import { getCharacters } from '@libraz/midi-sketch-bach'

const characters = getCharacters()
```

### `getKeys()`

```js
import { getKeys } from '@libraz/midi-sketch-bach'

const keys = getKeys()
// [{ index: 0, name: "C", ... }, { index: 1, name: "C#", ... }, ...]
```

### `getScales()`

```js
import { getScales } from '@libraz/midi-sketch-bach'

const scales = getScales()
// [{ index: 0, name: "Short", ... }, ...]
```

### `getVersion()`

```js
import { getVersion } from '@libraz/midi-sketch-bach'

const version = getVersion()
// "1.0.0"
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
    form: form.index,
    key: 2,
    isMinor: true,
    seed: 42
  })

  const filename = `bach-${form.name.toLowerCase().replace(/\s+/g, '-')}.mid`
  writeFileSync(filename, generator.getMidi())
  console.log(`保存: ${filename}`)
}

generator.destroy()
```

### ブラウザ: 生成してダウンロード

```js
import { init, BachGenerator } from '@libraz/midi-sketch-bach'

await init({ wasmPath: '/wasm/midisketch.wasm' })

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
