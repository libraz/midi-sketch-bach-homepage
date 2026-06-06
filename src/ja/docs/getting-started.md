---
title: はじめに
description: MIDI Sketch Bach クイックスタートガイド - アルゴリズムによるバッハ風器楽曲の MIDI生成ツール。
---

# はじめに

MIDI Sketch Bach は、バロック音楽理論と対位法の規則に基づいてバッハ風器楽曲の MIDIを生成するアルゴリズム作曲エンジンです。フーガ、トッカータ、パッサカリアなど、編集可能な MIDI データを出力します。

::: info バロック音楽や楽譜用語に慣れていない場合
ライブラリを使うだけなら五線譜を読める必要はありません。**声部**、**小節**、**調**、**フーガ**、**対位法**などが曖昧な場合は、先に[エンジニアのための音楽用語入門](/ja/docs/music-primer)を読むと以降のページが追いやすくなります。
:::

## インストール

::: warning アルファ版 — npm では未公開
このパッケージはアルファ版であり、**まだ npm レジストリに公開されていません**。以下のコマンドは最初の公開リリースまで動作しません。それまでは本サイトの[ライブデモ](/ja/)でお試しください。
:::

::: code-group

```bash [npm]
npm install @libraz/midi-sketch-bach
```

```bash [yarn]
yarn add @libraz/midi-sketch-bach
```

```bash [pnpm]
pnpm add @libraz/midi-sketch-bach
```

```bash [bun]
bun add @libraz/midi-sketch-bach
```

:::

## クイックスタート

```js
import { init, BachGenerator } from '@libraz/midi-sketch-bach'
import { writeFileSync } from 'fs'

// WASM モジュールを初期化
await init()

// ジェネレータを作成し、ニ短調のフーガを生成
const generator = new BachGenerator()
generator.generate({
  form: 'fugue',
  key: 2,
  isMinor: true,
  character: 'severe',
  bpm: 80
})

// MIDI ファイルデータを取得して保存
const midi = generator.getMidi()
writeFileSync('bach-fugue.mid', midi)

// 構造化されたイベントデータを取得
const events = generator.getEvents()
console.log(events.description)
console.log(`${events.total_bars} 小節、${events.tracks.length} トラック`)

// リソースを解放
generator.destroy()
// 注: サンプルは ESM import を使用 — package.json に "type": "module" を設定（または .mjs を使用）
```

## CLI クイックスタート

コマンドラインから直接 MIDI ファイルを生成できます。

```bash
npx @libraz/midi-sketch-bach --form fugue --key d_minor -o output.mid
```

ニ短調のトッカータとフーガを生成する例：

```bash
npx @libraz/midi-sketch-bach --form toccata_and_fugue --key d_minor -o toccata.mid
```

::: tip JavaScript API と CLI で既定が異なります
`bpm` 省略時、JavaScript API の既定は 100、CLI の既定は 72 です。また CLI ではフーガで `--scale` を省略した場合のみ `medium` になります（JavaScript API の既定は常に `short`）。CLI の既定一覧は [CLI 参照](/ja/docs/cli) を参照してください。
:::

## 生成できる楽曲

MIDI Sketch Bach は3つの系統にまたがる10種類の楽曲形式に対応しています。

**オルガン系** -- フーガ、前奏曲とフーガ、トリオ・ソナタ、コラール前奏曲、トッカータとフーガ、パッサカリア、幻想曲とフーガ

**独奏楽器系** -- チェロ前奏曲、シャコンヌ

**変奏系** -- ゴルトベルク変奏曲

各形式はバロック時代の声部進行、対位法、和声構造に関する正統的な作曲規則に従います。

## 次のステップ

1. [エンジニアのための音楽用語入門](/ja/docs/music-primer) -- この資料で使う最小限の音楽用語
2. [特徴](/ja/docs/features) -- すべての機能の概要
3. [楽曲形式](/ja/docs/forms) -- 使いたい作曲テンプレートを選ぶ
4. [対位法コース](/ja/docs/counterpoint) -- 検証器が音を採用/拒否する理由
5. [インストール](/ja/docs/installation) -- 詳細なインストール方法
6. [JavaScript API](/ja/docs/api-js) または [CLI 参照](/ja/docs/cli) -- コードまたはターミナルから使う
7. [アーキテクチャ](/ja/docs/architecture) -- 技術的な仕組み
