---
title: オプション関係
description: MIDI Sketch Bach の設定オプションの相互作用 - 依存関係、制約、検証ルール。
---

# オプション関係

MIDI Sketch Bach の設定オプションは特定の方法で相互に作用します。これらの関係を理解することで、望む結果を生む設定を作成する助けになります。

::: info オプションには二つの層があります
`form`、`key`、`isMinor`、`character` は音楽構造を選びます。`instrument`、`bpm`、`seed` はレンダリングや再現性に関わります。このページで使う音楽用語は[エンジニアのための音楽用語入門](/ja/docs/music-primer)で説明しています。
:::

## 依存関係の概要

```mermaid
graph TD
    A["form"] -->|"固定"| C["声部数"]
    A -->|"既定を決定"| B["instrument"]
    A -->|"構造と拍子を決定"| E["形式構造"]
    A -->|"基準長を設定"| P["基準長"]
    F["scale"] -->|"倍率"| P
    P --> G["出力の長さ"]
    H["targetBars"] -->|"上書き"| F
    I["seed"] -->|"初期化"| J["RNG"]
    K["key"] --> L["ピッチセンター（MIDI 出力時に適用）"]
    M["isMinor"] --> L
    N["character"] -->|"形作る"| O["主題/テーマ"]
    A -->|"禁止する場合あり"| N
```

## 声部数は形式が決定

`form` は最も影響力のあるオプションです。声部数・拍子・基準長を**固定**し、既定の `instrument` を選択します。

```mermaid
graph LR
    A["form: 'fugue'"] --> B["3声 · 4/4<br>42小節 · オルガン"]
    C["form: 'cello_prelude'"] --> D["1声 · 4/4<br>8小節 · チェロ"]
    E["form: 'chaconne'"] --> F["2声 · 3/4<br>16小節 · ヴァイオリン"]
```

::: warning `numVoices` は廃止されました
声部数オプションは存在しません — テクスチュアを選ぶには形式を選びます（[楽曲形式](/ja/docs/forms)の表を参照）。後方互換のため `num_voices`/`numVoices` の指定は受理されますが無視されます。エラーにはならず、効果もありません。
:::

### 既定の連鎖

形式を指定すると、エンジンが未指定フィールドを補完します。

```js
// 指定内容:
generator.generate({ form: 'fugue', key: 2, isMinor: true })

// エンジンが解決する値:
// {
//   form: 'fugue',
//   key: 2,
//   isMinor: true,
//   instrument: 'organ',  ← 形式既定
//   bpm: 100,             ← 既定
//   seed: 0,              ← ランダム（解決済みシードは getInfo().seedUsed）
//   character: 'severe',  ← 既定
//   scale: 'short',       ← 既定（≒ 基準長）
// }
// 声部数（3）、拍子（4/4）、基準長（42小節）は形式から決まります。
```

明示的に設定したフィールドは既定を上書きします。

```js
// 楽器とBPMを上書き
generator.generate({
  form: 'fugue',
  instrument: 'harpsichord',  // オルガンを上書き
  bpm: 72                     // 既定の100を上書き
})
```

形式ごとの声部数は[楽曲形式](/ja/docs/forms)の表を、完全な既定テーブルは[プリセット一覧](/ja/docs/presets)をご覧ください。

## 楽器の既定

各形式は既定の楽器を選択しますが、任意の楽器に差し替えできます。

| 形式 | 既定楽器 |
|------|--------------|
| `fugue`、`prelude_and_fugue`、`trio_sonata`、`chorale_prelude`、`toccata_and_fugue`、`passacaglia`、`fantasia_and_fugue` | オルガン |
| `cello_prelude` | チェロ |
| `chaconne` | ヴァイオリン |
| `goldberg_variations` | チェンバロ |

`instrument` の選択は、General MIDI プログラム、生成時に使う演奏可能音域、装飾処理の装飾密度に影響します。無効な楽器文字列は例外を投げます。

## scale と targetBars

`scale` と `targetBars` はどちらも出力の長さを設定します。`scale` は形式の基準長に対する倍率、`targetBars` は明示的な上書きです。

| 設定 | 動作 |
|------|------|
| `scale` のみ | 長さ = 形式の基準長 × スケール倍率 |
| `targetBars` のみ | エンジンはその小節数を目標とする |
| 両方指定 | `targetBars` が優先；`scale` は無視 |
| どちらも未指定 | 既定: `scale: "short"`（≒ 基準長） |

スケール倍率はおおよそ `short` ≒ 1倍、`medium` ≒ 2倍、`long` ≒ 3倍、`full` ≒ 4倍です。

::: warning CLI との違い
CLI ではフーガで `--scale` を省略した場合のみ `medium` になります（CLI 限定の便宜仕様）。JavaScript API の既定は形式にかかわらず常に `scale: "short"` です。詳細は [CLI 参照](/ja/docs/cli) を参照してください。
:::

::: tip
`targetBars` は形式の刻み（グラウンドバスの周期など）にスナップされ、`[形式の最小値, 128]` に丸め込まれます。すべての形式は128小節で上限となります。一般的なサイズカテゴリには `scale`、特定の長さには `targetBars` を使用してください。
:::

```js
// 形式の基準長の倍率で長さを指定
generator.generate({ form: 'fugue', scale: 'long' })   // ≒ 3 × 42小節

// 特定の長さ（スナップ・丸め込みあり）
generator.generate({ form: 'fugue', targetBars: 48 })

// 両方指定時はtargetBarsが優先
generator.generate({
  form: 'fugue',
  scale: 'short',      // 無視される
  targetBars: 48        // これが使用される
})
```

## シードの動作

`seed` パラメータは決定論的出力を制御します。

| シード値 | 動作 |
|---------|------|
| `0`（既定） | 非ゼロのランダムシードが選ばれ、解決値は `getInfo().seedUsed` で報告 |
| 正の整数 | 決定論的 — 同じ設定 + 同じシード = バイト単位で同一の出力 |

::: tip ランダム実行の再現
`seed: 0` の実行後に `getInfo().seedUsed` を読み取り、それを `seed` として渡し直すと、まったく同じ楽曲を再生成できます。
:::

::: warning 再現性
決定論的再現には同じバージョンのMIDI Sketch Bachが必要です。内部アルゴリズムはバージョン間で変更される可能性があるため、アップグレード後に同じシードが異なる出力を生成する場合があります。特定の出力を保存する必要がある場合は、バージョン間のシード再現性に頼るのではなく、生成されたMIDI ファイルを保存してください。
:::

```js
// 毎回ランダム
generator.generate({ form: 'fugue', seed: 0 })

// 常に同じ結果
generator.generate({ form: 'fugue', key: 2, isMinor: true, seed: 42 })

// 調が異なれば同じシードでも出力は異なる
generator.generate({ form: 'fugue', key: 0, isMinor: true, seed: 42 })
```

## 調と旋法

`key` と `isMinor` パラメータは連携して調中心を定義します。

::: info 調中心
**調中心**は、音楽上「帰る場所」のように聞こえる音です。`key` が C や D のようなピッチクラスを選び、`isMinor` が長調か短調かを選びます。
:::

```js
// ニ長調
generator.generate({ key: 2, isMinor: false })

// ニ短調
generator.generate({ key: 2, isMinor: true })
```

| パラメータ | 範囲 | 既定 |
|-----------|------|---------|
| `key` | 0--11（ピッチクラス） | 0（C） |
| `isMinor` | `true` / `false` | `false`（長調） |

調は以下に影響します：
- 楽曲のピッチセンターと音階
- エンジンが利用できる和声語彙
- 転調の目標（関連調）

## 性格と形式

`character` パラメータ（`severe`、`playful`、`noble`、`restless`）は主要な主題素材を形作ります。影響は形式により異なり、一部の組み合わせは禁止されています。

::: info `character` はジャンルではありません
`character` は、主題や主要素材の旋律傾向を変えます。音程の大きさ、リズムの活発さ、半音階的な傾向、旋律の輪郭などです。形式そのものを切り替える設定ではありません。`restless` なフーガも、形式としてはフーガです。
:::

| 形式タイプ | 性格の影響 |
|-----------|-----------------|
| フーガ系形式（`fugue`、`prelude_and_fugue`、`toccata_and_fugue`、`fantasia_and_fugue`） | **強い** — フーガ主題を直接形作り、楽曲全体を定義 |
| 変奏形式（`passacaglia`、`chaconne`、`goldberg_variations`） | **中程度** — 固定バス上の変奏に色付け |
| コラール前奏曲 | **中程度** — 対位法声部に影響、定旋律は固定 |
| トリオ・ソナタ | **中程度** — 上声部の動機素材を形作る |
| チェロ前奏曲 | **中程度** — 音型パターンに影響 |

::: warning 禁止された性格と形式の組み合わせ（例外を投げます）
- `chorale_prelude` は `playful` と `restless` を拒否します。
- `toccata_and_fugue` は `noble` を拒否します。

禁止された組み合わせを要求すると、暗黙的に性格を差し替えるのではなく例外を投げます。
:::

::: tip
`severe` はほとんどの状況で堅実な既定です。トッカータとフーガには `restless` を、コラール前奏曲には `noble` を試してみてください。
:::

## 検証ルール

すべての設定フィールドの完全な検証制約。いくつかのフィールドは丸め込みではなく無効入力で**例外を投げる**ようになりました。

::: info config 検証と音楽上の検証
この表は API 設定の検証、つまりオプション値が受理されるかを扱います。対位法や形式構造の失敗は別の音楽上の検証器ルールです。[検証器ルール一覧](/ja/docs/validator-rules)を参照してください。
:::

| フィールド | 型 | 範囲 | 既定 | 検証 |
|-----------|------|------|---------|------|
| `form` | number または string | 0--9 / 名前 | `"fugue"` | 不明な名前・範囲外の番号では例外 |
| `key` | number | 0--11 | 0 | 範囲外では例外 |
| `isMinor` | boolean | true/false | false | -- |
| `bpm` | number | 0 または 40--200 | 100 | 0 は既定値 100を使用；それ以外の範囲外では例外 |
| `seed` | number | 0+ | 0 | 0 = ランダム；解決値は `getInfo().seedUsed` |
| `character` | string または number | 名前 / 0--3 | `"severe"` | 不明な値では例外；禁止された形式の組み合わせでは例外 |
| `instrument` | string または number | 名前 / 0--5 | 形式既定 | 不明な値では例外 |
| `scale` | string または number | 名前 / 0--3 | `"short"` | 不明な値では例外 |
| `targetBars` | number | >0 | -- | `scale` を上書き；形式の刻みにスナップし `[最小, 128]` に丸め込み |
| `numVoices` | number | -- | -- | 受理されるが無視（声部数は形式が決定） |
