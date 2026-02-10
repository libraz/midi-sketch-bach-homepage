---
title: JavaScript API
description: MIDI Sketch BachのJavaScript APIリファレンス。
---

# JavaScript APIリファレンス

## 初期化

### `init(options?)`

WASMモジュールをロードし初期化します。`BachGenerator` インスタンスを作成する前に必ず呼び出してください。

```js
import { init } from 'midi-sketch-bach'

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
  numVoices: 4,
  bpm: 80,
  seed: 42
})
```

**パラメータ**: 後述の [BachConfig](#bachconfig) を参照。

**戻り値**: `void`

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
console.log(events.form)        // "Fugue"
console.log(events.key)         // "D minor"
console.log(events.bpm)         // 80
console.log(events.total_bars)  // 32
console.log(events.tracks)      // TrackDataの配列
```

**戻り値**: [EventData](#eventdata)

### `getInfo()`

ジェネレータとその現在の状態に関する情報を返します。

```js
const info = generator.getInfo()
```

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
| `form` | `number \| string` | `0` | 楽曲形式（0--8または名前）。[フォーム](/ja/docs/forms)と[プリセットリファレンス](/ja/docs/presets)を参照。 |
| `key` | `number` | `0` | 調（0--11のピッチクラス: 0=C, 1=C#, 2=D, ... 11=B） |
| `isMinor` | `boolean` | `false` | `true` で短調、`false` で長調 |
| `numVoices` | `number` | 形式のデフォルト | 声部数（2--5） |
| `bpm` | `number` | `100` | テンポ（BPM、40--200、0はデフォルトの100） |
| `seed` | `number` | `0` | ランダムシード（0 = ランダム） |
| `character` | `number \| string` | `0` | 主題キャラクタータイプ（0--3） |
| `instrument` | `number \| string` | 形式のデフォルト | 楽器プリセット（0--5） |
| `scale` | `number \| string` | `1` | 長さスケール（0=short, 1=medium, 2=long, 3=full） |
| `targetBars` | `number` | -- | 目標小節数（scaleを上書き） |

### フォームの値

形式は番号または名前文字列で指定できます。

| 番号 | 文字列 |
|------|--------|
| `0` | `"fugue"` |
| `1` | `"prelude-and-fugue"` |
| `2` | `"trio-sonata"` |
| `3` | `"chorale-prelude"` |
| `4` | `"toccata-and-fugue"` |
| `5` | `"passacaglia"` |
| `6` | `"fantasia-and-fugue"` |
| `7` | `"cello-prelude"` |
| `8` | `"chaconne"` |

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

| 番号 | 説明 |
|------|------|
| `0` | デフォルトのバランス型 |
| `1` | 叙情的、順次進行 |
| `2` | 活動的、広い音程 |
| `3` | 劇的、リズムに変化あり |

### スケールの値

| 番号 | 文字列 | 説明 |
|------|--------|------|
| `0` | `"short"` | コンパクト |
| `1` | `"medium"` | 標準（デフォルト） |
| `2` | `"long"` | 拡張 |
| `3` | `"full"` | 最大長 |

---

## レスポンス型

### EventData

```ts
interface EventData {
  form: string          // 形式名（例: "Fugue"）
  key: string           // 調の説明（例: "D minor"）
  bpm: number           // テンポ
  seed: number          // 生成に使用されたシード
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
  pitch: number         // MIDIノート番号（0-127）
  velocity: number      // ノートベロシティ（0-127）
  start_tick: number    // MIDIティック単位の開始時間
  duration: number      // MIDIティック単位の長さ
  voice: number         // 声部インデックス
}
```

---

## プリセット列挙関数

これらの関数は、利用可能なオプションを記述する `PresetInfo` オブジェクトの配列を返します。

### `getForms()`

```js
import { getForms } from 'midi-sketch-bach'

const forms = getForms()
// [{ index: 0, name: "Fugue", ... }, ...]
```

### `getInstruments()`

```js
import { getInstruments } from 'midi-sketch-bach'

const instruments = getInstruments()
// [{ index: 0, name: "Organ", ... }, ...]
```

### `getCharacters()`

```js
import { getCharacters } from 'midi-sketch-bach'

const characters = getCharacters()
```

### `getKeys()`

```js
import { getKeys } from 'midi-sketch-bach'

const keys = getKeys()
// [{ index: 0, name: "C", ... }, { index: 1, name: "C#", ... }, ...]
```

### `getScales()`

```js
import { getScales } from 'midi-sketch-bach'

const scales = getScales()
// [{ index: 0, name: "Short", ... }, ...]
```

### `getVersion()`

```js
import { getVersion } from 'midi-sketch-bach'

const version = getVersion()
// "1.0.0"
```

---

## 完全な使用例

### フーガを生成して保存

```js
import { init, BachGenerator } from 'midi-sketch-bach'
import { writeFileSync } from 'fs'

await init()

const generator = new BachGenerator()
generator.generate({
  form: 'fugue',
  key: 2,
  isMinor: true,
  numVoices: 4,
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
import { init, BachGenerator, getForms } from 'midi-sketch-bach'
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
import { init, BachGenerator } from 'midi-sketch-bach'

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
