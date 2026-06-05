---
title: CLI リファレンス
description: MIDI Sketch Bachのコマンドラインインターフェースリファレンス。
---

# CLI リファレンス

MIDI Sketch Bachには、ターミナルから直接バッハスタイルのMIDIファイルを生成するコマンドラインツールが含まれています。

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

| オプション | エイリアス | 型 | デフォルト | 説明 |
|-----------|----------|------|----------|------|
| `--form <value>` | `-f` | string/number | `fugue` | 楽曲形式（名前または0--9） |
| `--key <value>` | `-k` | number | `0` | ピッチクラスとしての調（0=C, 1=C#, ... 11=B） |
| `--minor` | `-m` | boolean | `false` | 短調を使用 |
| `--character <value>` | `-c` | string/number | `severe` | 主題キャラクター（severe/playful/noble/restless） |
| `--instrument <value>` | `-i` | string/number | 形式のデフォルト | 楽器（名前または0--5） |
| `--bpm <value>` | `-b` | number | `100` | テンポ（BPM、0 = デフォルト100、それ以外は40--200） |
| `--seed <value>` | `-s` | number | `0` | ランダムシード（0 = ランダム、解決済みシードが報告される） |
| `--scale <value>` | | string/number | `short` | 長さ倍率（short/medium/long/fullまたは0--3） |
| `--bars <value>` | | number | -- | 目標小節数（`--scale` を上書き） |
| `-o <path>` | | string | `output.mid` | 出力ファイルパス |
| `--json` | | boolean | `false` | イベントデータをJSONとして標準出力に出力 |

::: warning 廃止されたフラグ
`--voices`、`--analyze`、`--strict`、`--toccata-style` は廃止されました。声部数は形式が決定します。無効な `--form`/`--character`/`--instrument`/`--scale` の値や範囲外の `--bpm` は、デフォルトへフォールバックせずエラーで終了します。
:::

## 楽曲形式名

`--form` オプションで使用できる名前：

| 名前 | 番号 |
|------|------|
| `fugue` | 0 |
| `prelude_and_fugue` | 1 |
| `trio_sonata` | 2 |
| `chorale_prelude` | 3 |
| `toccata_and_fugue` | 4 |
| `passacaglia` | 5 |
| `fantasia_and_fugue` | 6 |
| `cello_prelude` | 7 |
| `chaconne` | 8 |
| `goldberg_variations` | 9 |

## キャラクター名

| 名前 | 番号 |
|------|------|
| `severe` | 0 |
| `playful` | 1 |
| `noble` | 2 |
| `restless` | 3 |

## 楽器名

| 名前 | 番号 |
|------|------|
| `organ` | 0 |
| `harpsichord` | 1 |
| `piano` | 2 |
| `violin` | 3 |
| `cello` | 4 |
| `guitar` | 5 |

## 使用例

### 基本的な生成

デフォルトの楽曲（ハ長調のフーガ）を生成：

```bash
@libraz/midi-sketch-bach -o fugue.mid
```

### ニ短調のフーガ

```bash
@libraz/midi-sketch-bach --form fugue --key 2 --minor --character severe --bpm 76 -o fugue-dm.mid
```

### ハ長調の前奏曲とフーガ

```bash
@libraz/midi-sketch-bach --form prelude_and_fugue --key 0 -o prelude-fugue.mid
```

### ヘ長調のトリオ・ソナタ

```bash
@libraz/midi-sketch-bach --form trio_sonata --key 5 --bpm 90 -o trio-sonata.mid
```

### イ長調のコラール前奏曲

```bash
@libraz/midi-sketch-bach --form chorale_prelude --key 9 --character noble --bpm 66 -o chorale.mid
```

### ニ短調のトッカータとフーガ

```bash
@libraz/midi-sketch-bach --form toccata_and_fugue --key 2 --minor --character restless -o toccata-fugue.mid
```

### ハ短調のパッサカリア

```bash
@libraz/midi-sketch-bach --form passacaglia --key 0 --minor --scale long -o passacaglia.mid
```

### ト短調の幻想曲とフーガ

```bash
@libraz/midi-sketch-bach --form fantasia_and_fugue --key 7 --minor -o fantasia-fugue.mid
```

### ト長調のチェロ前奏曲

```bash
@libraz/midi-sketch-bach --form cello_prelude --key 7 --instrument cello -o cello-prelude.mid
```

### ニ短調のシャコンヌ

```bash
@libraz/midi-sketch-bach --form chaconne --key 2 --minor --instrument violin -o chaconne.mid
```

### ト長調のゴルトベルク変奏曲

```bash
@libraz/midi-sketch-bach --form goldberg_variations --key 7 --instrument harpsichord -o goldberg.mid
```

### シードによる決定論的出力

```bash
@libraz/midi-sketch-bach --form fugue --key 7 --minor --seed 42 -o fugue-seed42.mid
```

### フルスケールのパッサカリア

```bash
@libraz/midi-sketch-bach --form passacaglia --key 2 --minor --scale full -o passacaglia-full.mid
```

### 特定の小節数を目標にする

```bash
@libraz/midi-sketch-bach --form fugue --key 0 --bars 24 -o fugue-24bars.mid
```

### JSONイベントデータの出力

```bash
@libraz/midi-sketch-bach --form fugue --key 2 --minor --json > fugue-events.json
```

### npxで実行

インストール不要で実行できます。

```bash
npx @libraz/midi-sketch-bach --form fugue --key 2 --minor -o fugue.mid
```

## JSON出力形式

`--json` を使用した場合、出力は [EventData](/ja/docs/api-js#eventdata) の構造に従います。

イベントJSONはピッチをCで報告し（指定された調は `.mid` ファイルにのみ適用）、各ノートは `source` 由来タグ（`"material"`、`"compose"`、`"ornament"`）を持ちます。

```json
{
  "form": "fugue",
  "key": 2,
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
