---
title: Installation
description: Installation methods for MIDI Sketch Bach - npm, CLI, and browser usage.
---

# Installation

## npm Package

Install MIDI Sketch Bach as a dependency in your Node.js project:

```bash
npm install midi-sketch-bach
```

```bash
yarn add midi-sketch-bach
```

```bash
pnpm add midi-sketch-bach
```

Then import and use it in your code:

```js
import { init, BachGenerator } from 'midi-sketch-bach'

await init()
const generator = new BachGenerator()
```

## CLI (Global Install)

Install globally to use the `midi-sketch-bach` command anywhere:

```bash
npm install -g midi-sketch-bach
```

Or run directly without installing:

```bash
npx midi-sketch-bach --form fugue -o fugue.mid
```

## Browser Usage

MIDI Sketch Bach runs in the browser via WebAssembly. When using in a browser environment, specify the path to the WASM file:

```js
import { init, BachGenerator } from 'midi-sketch-bach'

// Specify the WASM file location for browser environments
await init({ wasmPath: '/wasm/midisketch.wasm' })

const generator = new BachGenerator()
generator.generate({ form: 'invention', key: 0 })

const midi = generator.getMidi()
// Create a download link
const blob = new Blob([midi], { type: 'audio/midi' })
const url = URL.createObjectURL(blob)
```

::: tip WASM Path
In Node.js, the WASM file is resolved automatically. In browser environments, you need to provide the `wasmPath` option pointing to where the `.wasm` file is served.
:::

## Bundler Configuration

### Vite

For Vite projects, ensure the WASM file is served correctly:

```js
// vite.config.js
export default {
  optimizeDeps: {
    exclude: ['midi-sketch-bach']
  }
}
```

### Webpack

For Webpack, you may need to configure asset handling for `.wasm` files:

```js
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true
  }
}
```

## System Requirements

- **Node.js**: 18.0 or later
- **Browser**: Any modern browser with WebAssembly support (Chrome, Firefox, Safari, Edge)
- **No native dependencies**: The package is pure JavaScript + WebAssembly
