---
title: CLI 参照
description: MIDI Sketch Bach のコマンドラインインターフェース参照。
---

# CLI 参照

MIDI Sketch Bachには、ターミナルから直接バッハ風のMIDI ファイルを生成するコマンドラインツールが含まれています。

::: info 音楽系オプションの読み方
`--form`、`--key`、`--character`、`--scale`、`--bars` は音楽構造に関する選択です。用語が曖昧な場合は、先に[エンジニアのための音楽用語入門](/ja/docs/music-primer)を読むと理解しやすくなります。
:::

## インストール

```bash
# インストールせずに実行
npx @libraz/midi-sketch-bach [options]

# グローバルインストール
npm install -g @libraz/midi-sketch-bach
@libraz/midi-sketch-bach [options]
```

## 使い方

```
@libraz/midi-sketch-bach [options]
```

## オプション

| オプション | エイリアス | 型 | 既定 | 説明 |
|-----------|----------|------|----------|------|
| `--form <value>` | | string | `prelude_and_fugue` | 楽曲形式名 |
| `--key <value>` | | string | `c_major` | `c_major`、`g_minor`、`F_major` などの調名 |
| `--character <value>` | | string | `severe` | 主題の性格（`severe`、`playful`、`noble`、`restless`） |
| `--instrument <value>` | | string | 形式の既定 | 楽器（`organ`、`harpsichord`、`piano`、`violin`、`cello`、`guitar`） |
| `--bpm <value>` | | number | `72` | テンポ（BPM、40--200）。CLI の既定値は 72。JavaScript API では省略時 100 |
| `--seed <value>` | | number | `0` | ランダムシード（0 = ランダム、解決済みシードが報告される） |
| `--scale <value>` | | string | `short` | 長さ倍率（`short`、`medium`、`long`、`full`）。CLI 限定の便宜仕様: フーガで `--scale` 省略時のみ `medium` になる（JavaScript API の既定値は常に `short`） |
| `--bars <value>` | | number | -- | 目標小節数（`--scale` を上書き） |
| `-o <path>` | | string | `output.mid` | 出力ファイルパス |
| `--json` | | boolean | `false` | MIDI ファイルと同じ場所に `.json` のイベントデータを書き出す |
| `--generated-json` | | boolean | `false` | 採点用の `generated.v1` + `provenance.v1` JSON を出力（開発者向け） |
| `--composer-phase <value>` | | string | -- | 開発用のハーネスフェーズ実行モード |
| `--help` | `-h` | boolean | -- | ヘルプを表示 |

::: warning 廃止されたフラグ
`--voices`、`--minor`、`--analyze`、`--strict`、`--toccata-style` は廃止されました。声部数は形式が決定し、長調・短調は `--key` に含めます（`c_major`、`d_minor` など）。無効な `--form`/`--key`/`--character`/`--instrument`/`--scale` の値や範囲外の `--bpm` は、既定へ代替せずエラーで終了します。
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

既定の楽曲（ハ長調の前奏曲とフーガ）を生成：

```bash
@libraz/midi-sketch-bach -o prelude-fugue.mid
```

### ニ短調のフーガ

```bash
@libraz/midi-sketch-bach --form fugue --key d_minor --character severe --bpm 76 -o fugue-dm.mid
```

### ハ長調の前奏曲とフーガ

```bash
@libraz/midi-sketch-bach --form prelude_and_fugue --key c_major -o prelude-fugue.mid
```

### ヘ長調のトリオ・ソナタ

```bash
@libraz/midi-sketch-bach --form trio_sonata --key f_major --bpm 90 -o trio-sonata.mid
```

### イ長調のコラール前奏曲

```bash
@libraz/midi-sketch-bach --form chorale_prelude --key a_major --character noble --bpm 66 -o chorale.mid
```

### ニ短調のトッカータとフーガ

```bash
@libraz/midi-sketch-bach --form toccata_and_fugue --key d_minor --character restless -o toccata-fugue.mid
```

### ハ短調のパッサカリア

```bash
@libraz/midi-sketch-bach --form passacaglia --key c_minor --scale long -o passacaglia.mid
```

### ト短調の幻想曲とフーガ

```bash
@libraz/midi-sketch-bach --form fantasia_and_fugue --key g_minor -o fantasia-fugue.mid
```

### ト長調のチェロ前奏曲

```bash
@libraz/midi-sketch-bach --form cello_prelude --key g_major --instrument cello -o cello-prelude.mid
```

### ニ短調のシャコンヌ

```bash
@libraz/midi-sketch-bach --form chaconne --key d_minor --instrument violin -o chaconne.mid
```

### ト長調のゴルトベルク変奏曲

```bash
@libraz/midi-sketch-bach --form goldberg_variations --key g_major --instrument harpsichord -o goldberg.mid
```

### シードによる決定論的出力

```bash
@libraz/midi-sketch-bach --form fugue --key g_minor --seed 42 -o fugue-seed42.mid
```

### フルスケールのパッサカリア

```bash
@libraz/midi-sketch-bach --form passacaglia --key d_minor --scale full -o passacaglia-full.mid
```

### 特定の小節数を目標にする

```bash
@libraz/midi-sketch-bach --form fugue --key c_major --bars 24 -o fugue-24bars.mid
```

### JSONイベントデータの出力

```bash
@libraz/midi-sketch-bach --form fugue --key d_minor --json -o fugue.mid
```

この例では `fugue.mid` と `fugue.json` が書き出されます。

### npxで実行

インストール不要で実行できます。

```bash
npx @libraz/midi-sketch-bach --form fugue --key d_minor -o fugue.mid
```

## JSON出力形式

`--json` を使用した場合、MIDI ファイルと同じ場所に書き出される JSON は [EventData](/ja/docs/api-js#eventdata) の構造に従います。

イベント JSON はピッチを C で報告し（指定された調は `.mid` ファイルにのみ適用）、各ノートは `source` 由来タグ（`"material"`、`"compose"`、`"ornament"`）を持ちます。

```json
{
  "form": "fugue",
  "key": "D minor",
  "bpm": 80,
  "seed": 12345,
  "total_ticks": 80640,
  "total_bars": 42,
  "description": "Fugue, 3 voices",
  "tracks": [
    {
      "name": "Soprano",
      "channel": 0,
      "program": 19,
      "note_count": 128,
      "notes": [
        {
          "pitch": 72,
          "velocity": 80,
          "start_tick": 0,
          "duration": 480,
          "voice": 0,
          "source": "material"
        }
      ]
    }
  ]
}
```

## 終了コード

| コード | 意味 |
|--------|------|
| `0` | 成功 |
| `1` | 無効な引数または生成エラー |
