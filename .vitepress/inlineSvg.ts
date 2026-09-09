import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import type { MarkdownRenderer } from 'vitepress'

/**
 * Inlines the documentation diagrams instead of leaving them as `<img>` references.
 *
 * An `<img>` is an isolated document, so the only theme signal it can read is the
 * operating system's `prefers-color-scheme`. VitePress switches themes with a `.dark`
 * class on `<html>`, so an `<img>`-referenced diagram desynchronises from the site
 * whenever the reader's OS preference and the site toggle disagree. Inlining puts the
 * diagram in the page's own cascade, where `.dark` applies.
 *
 * The palette cannot travel with the diagram: Vue's template compiler drops every
 * `<style>` element from a page template, so a palette inlined here would render on the
 * server and then disappear on hydration, leaving every shape at the SVG default fill of
 * black. The block is therefore stripped on the way in, and the palette lives in the
 * theme (`theme/custom.css`, DOC DIAGRAMS). The files keep their own copy behind
 * `prefers-color-scheme` so they still render when opened on their own.
 */

const IMAGES_DIR = fileURLToPath(new URL('../src/public/images', import.meta.url))
const IMAGE_PREFIX = '/images/'

/** Per-page counters, so the same diagram used twice still gets unique element ids. */
interface InlineSvgEnv {
  __inlineSvgCounts?: Map<string, number>
}

/** The diagrams this plugin inlines; every other image renders as usual. */
function diagramName(src: string): string | null {
  if (!src.startsWith(IMAGE_PREFIX) || !src.endsWith('.svg')) return null
  const name = src.slice(IMAGE_PREFIX.length)
  if (name.includes('/') || name.includes('..')) return null
  return name
}

/**
 * Namespaces every id in the file. Inline SVG shares the page's id space, and all the
 * diagrams reuse the same ids (`ttl`, `dsc`, and single-letter marker ids), so pages
 * carrying more than one diagram would otherwise reference the wrong marker.
 */
function namespaceIds(svg: string, uid: string): string {
  const prefixed = (id: string) => `${uid}--${id}`
  return svg
    .replace(/\bid="([^"]+)"/g, (_, id: string) => `id="${prefixed(id)}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${prefixed(id)})`)
    .replace(
      /\b((?:xlink:)?href)="#([^"]+)"/g,
      (_, attr: string, id: string) => `${attr}="#${prefixed(id)}"`,
    )
    .replace(
      /\baria-labelledby="([^"]+)"/g,
      (_, ids: string) => `aria-labelledby="${ids.trim().split(/\s+/).map(prefixed).join(' ')}"`,
    )
}

function transform(svg: string, uid: string): string {
  let out = namespaceIds(svg.trim(), uid)

  // Drop the intrinsic size so the diagram scales with the prose column; the `viewBox`
  // still carries the aspect ratio. Only the root element matches — `markerWidth` and
  // `markerHeight` on `<marker>` are left alone.
  out = out.replace(
    /<svg\b([^>]*)>/,
    (_, attrs: string) => `<svg id="${uid}"${attrs.replace(/\s(?:width|height)="[^"]*"/g, '')}>`,
  )

  // The palette is a page-level concern; see the module comment.
  return out.replace(/\s*<style>[\s\S]*?<\/style>/, '')
}

/**
 * Hides the paragraph around a diagram that is alone in one. A `<figure>` is not valid
 * inside a `<p>`, so the browser lifts it out while parsing the server-rendered HTML —
 * the DOM then no longer matches the client render and Vue rebuilds the subtree.
 */
function unwrapDiagramParagraphs(md: MarkdownRenderer): void {
  md.core.ruler.push('inline_svg_unwrap', state => {
    const tokens = state.tokens
    for (let idx = 0; idx + 2 < tokens.length; idx += 1) {
      if (tokens[idx].type !== 'paragraph_open') continue
      const inline = tokens[idx + 1]
      if (inline.type !== 'inline' || tokens[idx + 2].type !== 'paragraph_close') continue

      const children = inline.children ?? []
      if (children.length !== 1 || children[0].type !== 'image') continue
      if (!diagramName(children[0].attrGet('src') ?? '')) continue

      tokens[idx].hidden = true
      tokens[idx + 2].hidden = true
    }
  })
}

/** Inlines `![alt](/images/*.svg)` diagrams; every other image renders as usual. */
export function inlineSvgPlugin(md: MarkdownRenderer): void {
  const renderImage = md.renderer.rules.image

  unwrapDiagramParagraphs(md)

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const fallback = () =>
      renderImage
        ? renderImage(tokens, idx, options, env, self)
        : self.renderToken(tokens, idx, options)

    const name = diagramName(tokens[idx].attrGet('src') ?? '')
    if (name === null) return fallback()

    let svg: string
    try {
      svg = readFileSync(join(IMAGES_DIR, name), 'utf8')
    } catch {
      console.warn(`[inline-svg] ${name} could not be read; left as an <img> reference`)
      return fallback()
    }

    const scope = env as InlineSvgEnv
    const counts = (scope.__inlineSvgCounts ??= new Map<string, number>())
    const base = name.replace(/\.svg$/, '')
    const seen = (counts.get(base) ?? 0) + 1
    counts.set(base, seen)
    const uid = seen === 1 ? `dg-${base}` : `dg-${base}-${seen}`

    // `v-pre` keeps the Vue compiler out of the diagram: its text is prose written for a
    // reader, and a stray `{{` in a label is a label, not an interpolation.
    return `<figure class="docs-figure" v-pre>${transform(svg, uid)}</figure>`
  }
}
