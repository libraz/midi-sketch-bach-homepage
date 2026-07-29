---
title: Installation
description: Installation methods for MIDI Sketch Bach - npm, CLI, and browser usage.
---

# Installation

::: warning Alpha — not yet published to npm
This package is in alpha and has **not been published to the npm registry yet**. The npm package commands on this page will not work until the first public release. Until then, try the JavaScript/WASM library in the [live demo](/) on this site.
:::

## npm Package

Install MIDI Sketch Bach as a dependency in your Node.js project:

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

Then import and use it in your code:

```js
import { init, BachGenerator } from '@libraz/midi-sketch-bach'

await init()
const generator = new BachGenerator()
```

## Native CLI

The npm package does not expose a command-line executable. Build the native CLI from source:

```bash
git clone https://github.com/libraz/midi-sketch-bach.git
cd midi-sketch-bach
make build
./build/bin/bach_cli --form fugue -o fugue.mid
```

## Browser Usage

MIDI Sketch Bach runs in the browser via WebAssembly. When using in a browser environment, specify the path to the WASM file:

```js
import { init, BachGenerator } from '@libraz/midi-sketch-bach'

// Specify the WASM file location for browser environments
await init({ wasmPath: '/wasm/bach.wasm' })

const generator = new BachGenerator()
generator.generate({ form: 'fugue', key: 0 })

const midi = generator.getMidi()
// Create a download link
const blob = new Blob([midi], { type: 'audio/midi' })
const url = URL.createObjectURL(blob)
// See the JavaScript API page for the full download flow
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
    exclude: ['@libraz/midi-sketch-bach']
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

- **Node.js**: 16.0 or later
- **Native CLI build**: Make, CMake, and a C++17 compiler
- **Browser**: Any modern browser with WebAssembly support (Chrome, Firefox, Safari, Edge)
- **JavaScript/WASM package**: No native runtime dependencies
