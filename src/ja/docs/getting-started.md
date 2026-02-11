---
title: はじめに
description: MIDI Sketch Bach クイックスタートガイド - アルゴリズムによるバッハスタイル器楽曲MIDI生成ツール。
---

# はじめに

MIDI Sketch Bachは、バロック音楽理論と対位法の規則に基づいてバッハスタイルの器楽曲MIDIを生成するアルゴリズム作曲エンジンです。フーガ、トッカータ、パッサカリアなど、編集可能なMIDIデータを出力します。

## インストール

```bash
npm install @libraz/midi-sketch-bach
```

## クイックスタート

```js
import { init, BachGenerator } from '@libraz/midi-sketch-bach'
import { writeFileSync } from 'fs'

// WASMモジュールを初期化
await init()

// ジェネレータを作成し、ニ短調のフーガを生成
const generator = new BachGenerator()
generator.generate({
  form: 'fugue',
  key: 2,
  isMinor: true,
  numVoices: 4,
  bpm: 80
})

// MIDIファイルデータを取得して保存
const midi = generator.getMidi()
writeFileSync('bach-fugue.mid', midi)

// 構造化されたイベントデータを取得
const events = generator.getEvents()
console.log(events.description)
console.log(`${events.total_bars} 小節、${events.tracks.length} トラック`)

// リソースを解放
generator.destroy()
```

## CLIクイックスタート

コマンドラインから直接MIDIファイルを生成できます。

```bash
npx @libraz/midi-sketch-bach --form fugue --key 2 --minor -o output.mid
```

ニ短調のトッカータとフーガを生成する例：

```bash
npx @libraz/midi-sketch-bach --form "toccata-and-fugue" --key 2 --minor -o toccata.mid
```

## 生成できる楽曲

MIDI Sketch Bachは2つのシステムにまたがる9つの楽曲形式をサポートしています。

**オルガンシステム** -- フーガ、前奏曲とフーガ、トリオ・ソナタ、コラール前奏曲、トッカータとフーガ、パッサカリア、幻想曲とフーガ

**独奏楽器システム** -- チェロ前奏曲、シャコンヌ

各形式はバロック時代の声部進行、対位法、和声構造に関する正統的な作曲規則に従います。

## 次のステップ

- [特徴](/ja/docs/features) -- すべての機能の概要
- [インストール](/ja/docs/installation) -- 詳細なインストール方法
- [楽曲形式](/ja/docs/forms) -- 各楽曲形式について
- [対位法と声部進行](/ja/docs/counterpoint) -- エンジンの背後にあるバロック音楽理論
- [JavaScript API](/ja/docs/api-js) -- 完全なAPIリファレンス
- [CLI リファレンス](/ja/docs/cli) -- コマンドラインの使い方
- [アーキテクチャ](/ja/docs/architecture) -- 技術的な仕組み
