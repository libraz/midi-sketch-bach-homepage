# MIDI Sketch Bach — Homepage

Documentation and live demo site for [MIDI Sketch Bach](https://github.com/libraz/midi-sketch-bach), an algorithmic Bach-style instrumental MIDI generator.

**Live site:** https://bach.midi-sketch.libraz.net

## What's Here

- **Live demo** — generate and play Bach-style pieces in the browser via WebAssembly
- **Documentation** (English / Japanese) — getting started, JavaScript API, CLI, musical forms, presets
- **Counterpoint course** — a 7-chapter course covering the 47 validator rules the engine enforces, with playable staff notation examples

Built with [VitePress](https://vitepress.dev/), Vue 3, [VexFlow](https://www.vexflow.com/) (staff notation), and [smplr](https://github.com/danigb/smplr) (playback).

## Development

### Prerequisites

- Node.js 22+ (managed via [Volta](https://volta.sh/))
- Yarn 4
- A sibling clone of [`midi-sketch-bach`](https://github.com/libraz/midi-sketch-bach) at `../midi-sketch-bach` (only needed to refresh the WASM build)

### Commands

```bash
yarn              # Install dependencies
yarn dev          # Start dev server
yarn build        # Build for production
yarn preview      # Preview production build
yarn typecheck    # Run vue-tsc type checking
yarn copy:wasm    # Copy WASM build from ../midi-sketch-bach/dist
```

The WASM engine files are checked in under `src/wasm/`, so `yarn dev` works without the engine repo. Run `yarn copy:wasm` only when updating to a new engine build (requires `yarn build` in the engine repo first; provenance is recorded in `src/wasm/meta.json`).

## Project Structure

```
src/
├── index.md            # Landing page (full-screen demo layout)
├── docs/               # English documentation
├── ja/                 # Japanese pages and documentation
├── components/         # Vue components (demo, piano roll, staff notation)
├── composables/        # WASM management, MIDI playback, i18n
├── data/               # Form presets, staff notation examples
├── locales/            # UI translation files (en/ja)
├── public/             # Static assets (favicon, OG image)
└── wasm/               # WASM engine build (copied from the engine repo)
.vitepress/
├── config.ts           # Site config (i18n, SEO, JSON-LD)
└── theme/              # Custom theme (cathedral/classical design)
```

## Deployment

Deployed to Cloudflare Pages:

- Build command: `yarn build`
- Output directory: `.vitepress/dist`

## License

[AGPL-3.0](LICENSE). The engine is dual-licensed (AGPL-3.0 / commercial) — see the [midi-sketch-bach](https://github.com/libraz/midi-sketch-bach) repository for details.
