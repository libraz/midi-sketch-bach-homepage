---
title: インストール
description: MIDI Sketch Bachのインストール方法 - npm、CLI、ブラウザでの利用。
---

# インストール

## npmパッケージ

Node.jsプロジェクトの依存関係としてインストールします。

```bash
npm install midi-sketch-bach
```

```bash
yarn add midi-sketch-bach
```

```bash
pnpm add midi-sketch-bach
```

インポートして使用します。

```js
import { init, BachGenerator } from 'midi-sketch-bach'

await init()
const generator = new BachGenerator()
```

## CLI（グローバルインストール）

`midi-sketch-bach` コマンドをどこからでも使えるようにグローバルインストールします。

```bash
npm install -g midi-sketch-bach
```

インストールせずに直接実行することもできます。

```bash
npx midi-sketch-bach --form fugue -o fugue.mid
```

## ブラウザでの利用

MIDI Sketch BachはWebAssemblyを介してブラウザ上で動作します。ブラウザ環境で使用する場合は、WASMファイルのパスを指定してください。

```js
import { init, BachGenerator } from 'midi-sketch-bach'

// ブラウザ環境ではWASMファイルの場所を指定
await init({ wasmPath: '/wasm/midisketch.wasm' })

const generator = new BachGenerator()
generator.generate({ form: 'invention', key: 0 })

const midi = generator.getMidi()
// ダウンロードリンクを作成
const blob = new Blob([midi], { type: 'audio/midi' })
const url = URL.createObjectURL(blob)
```

::: tip WASMパスについて
Node.jsではWASMファイルは自動的に解決されます。ブラウザ環境では、`.wasm` ファイルが配信されている場所を `wasmPath` オプションで指定する必要があります。
:::

## バンドラーの設定

### Vite

Viteプロジェクトでは、WASMファイルが正しく配信されるように設定します。

```js
// vite.config.js
export default {
  optimizeDeps: {
    exclude: ['midi-sketch-bach']
  }
}
```

### Webpack

Webpackの場合、`.wasm` ファイルのアセット処理を設定する必要があります。

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
- **ブラウザ**: WebAssembly対応のモダンブラウザ（Chrome、Firefox、Safari、Edge）
- **ネイティブ依存関係なし**: JavaScript + WebAssemblyのみで構成されています
