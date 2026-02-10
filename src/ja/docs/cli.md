---
title: CLI リファレンス
description: MIDI Sketch Bachのコマンドラインインターフェースリファレンス。
---

# CLI リファレンス

MIDI Sketch Bachには、ターミナルから直接バッハスタイルのMIDIファイルを生成するコマンドラインツールが含まれています。

## インストール

```bash
# インストールせずに実行
npx midi-sketch-bach [options]

# グローバルインストール
npm install -g midi-sketch-bach
midi-sketch-bach [options]
```

## 使い方

```
midi-sketch-bach [options]
```

## オプション

| オプション | エイリアス | 型 | デフォルト | 説明 |
|-----------|----------|------|----------|------|
| `--form <value>` | `-f` | string/number | `0` | 楽曲形式（名前または0--8） |
| `--key <value>` | `-k` | number | `0` | ピッチクラスとしての調（0=C, 1=C#, ... 11=B） |
| `--minor` | `-m` | boolean | `false` | 短調を使用 |
| `--voices <value>` | `-v` | number | 形式のデフォルト | 声部数（2--5） |
| `--bpm <value>` | `-b` | number | `100` | テンポ（BPM、40--200） |
| `--seed <value>` | `-s` | number | `0` | ランダムシード（0 = ランダム） |
| `--instrument <value>` | `-i` | string/number | 形式のデフォルト | 楽器（名前または0--5） |
| `--character <value>` | `-c` | number | `0` | 主題キャラクタータイプ（0--3） |
| `--scale <value>` | | string/number | `1` | 長さスケール（short/medium/long/fullまたは0--3） |
| `--target-bars <value>` | | number | -- | 目標小節数 |
| `--output <path>` | `-o` | string | `output.mid` | 出力ファイルパス |
| `--json` | | boolean | `false` | イベントデータをJSONとして標準出力に出力 |

## 楽曲形式名

`--form` オプションで使用できる名前：

| 名前 | 番号 |
|------|------|
| `fugue` | 0 |
| `prelude-and-fugue` | 1 |
| `trio-sonata` | 2 |
| `chorale-prelude` | 3 |
| `toccata-and-fugue` | 4 |
| `passacaglia` | 5 |
| `fantasia-and-fugue` | 6 |
| `cello-prelude` | 7 |
| `chaconne` | 8 |

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
midi-sketch-bach -o fugue.mid
```

### ニ短調のフーガ

```bash
midi-sketch-bach --form fugue --key 2 --minor --voices 4 --bpm 76 -o fugue-dm.mid
```

### ハ長調の前奏曲とフーガ

```bash
midi-sketch-bach --form prelude-and-fugue --key 0 --voices 4 -o prelude-fugue.mid
```

### ヘ長調のトリオ・ソナタ

```bash
midi-sketch-bach --form trio-sonata --key 5 --bpm 90 -o trio-sonata.mid
```

### イ長調のコラール前奏曲

```bash
midi-sketch-bach --form chorale-prelude --key 9 --voices 4 --bpm 66 -o chorale.mid
```

### ニ短調のトッカータとフーガ

```bash
midi-sketch-bach --form toccata-and-fugue --key 2 --minor --voices 4 -o toccata-fugue.mid
```

### ハ短調のパッサカリア

```bash
midi-sketch-bach --form passacaglia --key 0 --minor --voices 4 --scale long -o passacaglia.mid
```

### ト短調の幻想曲とフーガ

```bash
midi-sketch-bach --form fantasia-and-fugue --key 7 --minor --voices 4 -o fantasia-fugue.mid
```

### ト長調のチェロ前奏曲

```bash
midi-sketch-bach --form cello-prelude --key 7 --instrument cello -o cello-prelude.mid
```

### ニ短調のシャコンヌ

```bash
midi-sketch-bach --form chaconne --key 2 --minor --instrument violin -o chaconne.mid
```

### シードによる決定論的出力

```bash
midi-sketch-bach --form fugue --key 7 --minor --seed 42 -o fugue-seed42.mid
```

### フルスケールのパッサカリア

```bash
midi-sketch-bach --form passacaglia --key 2 --minor --scale full --voices 5 -o passacaglia-full.mid
```

### 特定の小節数を目標にする

```bash
midi-sketch-bach --form fugue --key 0 --target-bars 24 -o fugue-24bars.mid
```

### JSONイベントデータの出力

```bash
midi-sketch-bach --form fugue --key 2 --minor --json > fugue-events.json
```

### npxで実行

インストール不要で実行できます。

```bash
npx midi-sketch-bach --form fugue --key 2 --minor -o fugue.mid
```

## JSON出力形式

`--json` を使用した場合、出力は [EventData](/ja/docs/api-js#eventdata) の構造に従います。

```json
{
  "form": "Fugue",
  "key": "D minor",
  "bpm": 80,
  "seed": 12345,
  "total_ticks": 30720,
  "total_bars": 32,
  "description": "Fugue in D minor, 4 voices",
  "tracks": [
    {
      "name": "Soprano",
      "channel": 0,
      "program": 19,
      "note_count": 128,
      "notes": [
        {
          "pitch": 74,
          "velocity": 80,
          "start_tick": 0,
          "duration": 480,
          "voice": 0
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
