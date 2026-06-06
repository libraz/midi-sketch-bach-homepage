---
title: インストール
description: MIDI Sketch Bach のインストール方法 - npm、CLI、ブラウザでの利用。
---

# インストール

::: warning アルファ版 — npm では未公開
このパッケージはアルファ版であり、**まだ npm レジストリに公開されていません**。このページのコマンドは最初の公開リリースまで動作しません。それまでは本サイトの[ライブデモ](/ja/)でお試しください。
:::

## npmパッケージ

Node.js プロジェクトの依存関係としてインストールします。

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

インポートして使用します。

```js
import { init, BachGenerator } from '@libraz/midi-sketch-bach'

await init()
const generator = new BachGenerator()
```

## CLI（グローバルインストール）

`@libraz/midi-sketch-bach` コマンドをどこからでも使えるようにグローバルインストールします。

```bash
npm install -g @libraz/midi-sketch-bach
```

インストールせずに直接実行することもできます。

```bash
npx @libraz/midi-sketch-bach --form fugue -o fugue.mid
```

## ブラウザでの利用

MIDI Sketch Bach はWebAssemblyを介してブラウザ上で動作します。ブラウザ環境で使用する場合は、WASM ファイルのパスを指定してください。

```js
import { init, BachGenerator } from '@libraz/midi-sketch-bach'

// ブラウザ環境ではWASM ファイルの場所を指定
await init({ wasmPath: '/wasm/bach.wasm' })

const generator = new BachGenerator()
generator.generate({ form: 'fugue', key: 0 })

const midi = generator.getMidi()
// ダウンロードリンクを作成
const blob = new Blob([midi], { type: 'audio/midi' })
const url = URL.createObjectURL(blob)
// ダウンロード処理の全体は JavaScript API ページを参照
```

::: tip WASM パスについて
Node.jsではWASM ファイルは自動的に解決されます。ブラウザ環境では、`.wasm` ファイルが配信されている場所を `wasmPath` オプションで指定する必要があります。
:::

## バンドラーの設定

### Vite

Vite プロジェクトでは、WASM ファイルが正しく配信されるように設定します。

```js
// vite.config.js
export default {
  optimizeDeps: {
    exclude: ['@libraz/midi-sketch-bach']
  }
}
```

### Webpack

Webpack の場合、`.wasm` ファイルのアセット処理を設定する必要があります。

```js
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true
  }
}
```

## システム要件

- **Node.js**: 18.0以降
- **ブラウザ**: WebAssembly対応の現代的なブラウザ（Chrome、Firefox、Safari、Edge）
- **ネイティブ依存関係なし**: JavaScript + WebAssemblyのみで構成されています
