---
title: CLI 参照
description: MIDI Sketch Bach のコマンドラインインターフェース参照。
---

# CLI 参照

MIDI Sketch Bachには、ターミナルから直接バッハ風のMIDI ファイルを生成するコマンドラインツールが含まれています。

::: info 音楽系オプションの読み方
`--form`、`--key`、`--character`、`--scale`、`--bars` は音楽構造に関する選択です。用語が曖昧な場合は、先に[エンジニアのための音楽用語入門](/ja/docs/music-primer)を読むと理解しやすくなります。
:::

## ビルド

```bash
git clone https://github.com/libraz/midi-sketch-bach.git
cd midi-sketch-bach
make build
```

npm パッケージは未公開で、CLI 実行ファイルも提供しません。ソースツリーからネイティブバイナリを実行します。

## 使い方

```
./build/bin/bach_cli [options]
```

## オプション

| オプション | エイリアス | 型 | 既定 | 説明 |
|-----------|----------|------|----------|------|
| `--form <value>` | | string | `fugue` | 楽曲形式名 |
| `--key <value>` | | string | `c_major` | `c_major`、`g_minor`、`F_major` などの調名 |
| `--character <value>` | | string | `severe` | 主題の性格（`severe`、`playful`、`noble`、`restless`） |
| `--instrument <value>` | | string | 形式の既定 | その形式が受け付ける楽器（`organ`、`harpsichord`、`piano`、`violin`、`cello`、`guitar`） |
| `--bpm <value>` | | number | `100` | 開始テンポ（BPM、40--200） |
| `--seed <value>` | | number | `0` | ランダムシード（0 = ランダム、解決済みシードが報告される） |
| `--scale <value>` | | string | `short` | 長さ倍率（`short`、`medium`、`long`、`full`） |
| `--bars <value>` | | number | -- | 目標小節数（`--scale` を上書き） |
| `--free-counterpoint` | | boolean | `false` | 実験的: パッサカリアの副次対旋律を候補探索で生成する。他の形式では利用不可の診断を出して終了 |
| `-o <path>` | | string | `output.mid` | 出力ファイルパス |
| `--json` | | boolean | `false` | MIDI ファイルと同じ場所に `.json` のイベントデータを書き出す |
| `--generated-json` | | boolean | `false` | 採点用の `generated.v1` + `provenance.v1` JSON を出力（開発者向け） |
| `--composer-phase <value>` | | string | -- | 開発用のハーネスフェーズ実行モード。上記のオプションとは併用できない |
| `--help` | `-h` | boolean | -- | ヘルプを表示 |

::: warning 廃止されたフラグ
`--voices`、`--minor`、`--analyze`、`--strict`、`--toccata-style` は廃止されました。声部数は形式が決定し、長調・短調は `--key` に含めます（`c_major`、`d_minor` など）。無効な `--form`/`--key`/`--character`/`--instrument`/`--scale` の値、値が欠けたオプション、範囲外の `--bpm` は、既定へ代替せずエラーで終了します。
:::

::: info 楽器は形式が決める
各形式は 1 つの楽器のために書かれています。形式 0--6 はオルガン、チェロ前奏曲はチェロ、シャコンヌはヴァイオリン、ゴルトベルク変奏曲はチェンバロまたはピアノです。`--instrument` はその形式が受け付ける範囲から選ぶもので、それ以外を指定すると楽器非互換エラーで終了します。
:::

## 楽曲形式名

`--form` オプションで使用できる名前：

| 名前 |
|------|
| `fugue` |
| `prelude_and_fugue` |
| `trio_sonata` |
| `chorale_prelude` |
| `toccata_and_fugue` |
| `passacaglia` |
| `fantasia_and_fugue` |
| `cello_prelude` |
| `chaconne` |
| `goldberg_variations` |

## 性格名

| 名前 |
|------|
| `severe` |
| `playful` |
| `noble` |
| `restless` |

## 楽器名

| 名前 |
|------|
| `organ` |
| `harpsichord` |
| `piano` |
| `violin` |
| `cello` |
| `guitar` |

## 使用例

### 基本的な生成

既定の楽曲（ハ長調のフーガ）を生成：

```bash
./build/bin/bach_cli -o fugue.mid
```

### ニ短調のフーガ

```bash
./build/bin/bach_cli --form fugue --key d_minor --character severe --bpm 76 -o fugue-dm.mid
```

### ハ長調の前奏曲とフーガ

```bash
./build/bin/bach_cli --form prelude_and_fugue --key c_major -o prelude-fugue.mid
```

### ヘ長調のトリオ・ソナタ

```bash
./build/bin/bach_cli --form trio_sonata --key f_major --bpm 90 -o trio-sonata.mid
```

### イ長調のコラール前奏曲

```bash
./build/bin/bach_cli --form chorale_prelude --key a_major --character noble --bpm 66 -o chorale.mid
```

### ニ短調のトッカータとフーガ

```bash
./build/bin/bach_cli --form toccata_and_fugue --key d_minor --character restless -o toccata-fugue.mid
```

### ハ短調のパッサカリア

```bash
./build/bin/bach_cli --form passacaglia --key c_minor --scale long -o passacaglia.mid
```

### ト短調の幻想曲とフーガ

```bash
./build/bin/bach_cli --form fantasia_and_fugue --key g_minor -o fantasia-fugue.mid
```

### ト長調のチェロ前奏曲

```bash
./build/bin/bach_cli --form cello_prelude --key g_major --instrument cello -o cello-prelude.mid
```

### ニ短調のシャコンヌ

```bash
./build/bin/bach_cli --form chaconne --key d_minor --instrument violin -o chaconne.mid
```

### ト長調のゴルトベルク変奏曲

```bash
./build/bin/bach_cli --form goldberg_variations --key g_major --instrument harpsichord -o goldberg.mid
```

### シードによる決定論的出力

```bash
./build/bin/bach_cli --form fugue --key g_minor --seed 42 -o fugue-seed42.mid
```

### フルスケールのパッサカリア

```bash
./build/bin/bach_cli --form passacaglia --key d_minor --scale full -o passacaglia-full.mid
```

### 特定の小節数を目標にする

```bash
./build/bin/bach_cli --form fugue --key c_major --bars 24 -o fugue-24bars.mid
```

### JSONイベントデータの出力

```bash
./build/bin/bach_cli --form fugue --key d_minor --json -o fugue.mid
```

この例では `fugue.mid` と `fugue.json` が書き出されます。`--generated-json` を付けると `fugue.generated.json` と `fugue.provenance.json` が追加されます。`-o` が既に `.json` で終わっている場合、サイドカーは拡張子を置き換えるのではなく末尾に付け足されるため、出力ファイル自身がサイドカーで上書きされることはありません。

## JSON出力形式

`--json` を使用した場合、MIDI ファイルと同じ場所に書き出される JSON は [EventData](/ja/docs/api-js#eventdata) の構造に従います。

イベント JSON のピッチは `.mid` ファイルと同じ出力調へ移調され、楽器の音域に合わせたオクターブシフトも反映されます。`generated.v1` サイドカーのピッチはエンジン内部の C のままです。イベント JSON の各ノートは `source` 由来タグ（`"material"`、`"compose"`、`"ornament"`）も持ちます。

```json
{
  "form": "fugue",
  "key": "D_minor",
  "bpm": 80,
  "seed": 12345,
  "total_ticks": 84480,
  "total_bars": 44,
  "description": "Fugue in D_minor",
  "tempos": [
    { "tick": 0, "bpm": 80 },
    { "tick": 80640, "bpm": 78 },
    { "tick": 81600, "bpm": 76 },
    { "tick": 82560, "bpm": 74 },
    { "tick": 83520, "bpm": 72 }
  ],
  "time_signatures": [
    { "tick": 0, "numerator": 4, "denominator": 4 }
  ],
  "tracks": [
    {
      "name": "Soprano",
      "channel": 0,
      "program": 19,
      "note_count": 128,
      "control_changes": [
        { "tick": 0, "controller": 7, "value": 75 }
      ],
      "notes": [
        {
          "pitch": 74,
          "velocity": 80,
          "start_tick": 0,
          "duration": 240,
          "voice": 0,
          "source": "material"
        }
      ]
    }
  ]
}
```

`bpm` は開始テンポにすぎません。これらのティックを実時間に対応づける方法は[ティックを秒に変換する](/ja/docs/api-js#ティックを秒に変換する)を参照してください。

## 終了コード

| コード | 意味 |
|--------|------|
| `0` | 成功 |
| `2` | 解析・設定エラー — 未知または無効なオプション、値の欠落や範囲外、併用できないオプションの組み合わせ |
| `3` | 生成エラー — 非互換な性格や楽器、利用できない自由対位法、作曲検証の失敗 |
| `4` | 出力エラー — MIDI ファイルまたは JSON サイドカーを書き出せなかった |

`--generated-json` を指定した状態で作曲検証に失敗した場合は、終了コード `3` で終わる前に `.diagnostic.json` サイドカーが出力先の隣に書き出されます。
