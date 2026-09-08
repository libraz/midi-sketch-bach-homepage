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
 * The SVG files keep their `prefers-color-scheme` block so they still render correctly
 * when opened on their own; this module rewrites that block to `.dark` on the way in.
 */

const IMAGES_DIR = fileURLToPath(new URL('../src/public/images', import.meta.url))
const IMAGE_PREFIX = '/images/'

/** Per-page counters, so the same diagram used twice still gets unique element ids. */
interface InlineSvgEnv {
  __inlineSvgCounts?: Map<string, number>
}

/** Splits a flat rule list into `selectors { body }` pairs and prefixes every selector. */
function prefixRules(css: string, scope: string): string {
  const rules: string[] = []
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const body = match[2].trim()
    if (!body) continue
    const selectors = match[1]
      .trim()
      .split(',')
      .map(selector => `${scope} ${selector.trim()}`)
      .join(', ')
    rules.push(`${selectors} { ${body} }`)
  }
  return rules.join('\n')
}

/** Rewrites the OS-preference dark block as a `.dark` block and scopes everything. */
function scopeCss(css: string, scope: string): string {
  const start = css.search(/@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)\s*\{/)
  if (start === -1) return prefixRules(css, scope)

  const open = css.indexOf('{', start)
  let depth = 0
  let end = -1
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1
    else if (css[i] === '}') {
      depth -= 1
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  if (end === -1) return prefixRules(css, scope)

  const light = css.slice(0, start) + css.slice(end + 1)
  const dark = css.slice(open + 1, end)
  return `${prefixRules(light, scope)}\n${prefixRules(dark, `.dark ${scope}`)}`
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

  return out.replace(
    /<style>([\s\S]*?)<\/style>/,
    (_, css: string) => `<style>\n${scopeCss(css, `#${uid}`)}\n</style>`,
  )
}

/** Inlines `![alt](/images/*.svg)` diagrams; every other image renders as usual. */
export function inlineSvgPlugin(md: MarkdownRenderer): void {
  const renderImage = md.renderer.rules.image

  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const fallback = () =>
      renderImage
        ? renderImage(tokens, idx, options, env, self)
        : self.renderToken(tokens, idx, options)

    const src = tokens[idx].attrGet('src') ?? ''
    if (!src.startsWith(IMAGE_PREFIX) || !src.endsWith('.svg')) return fallback()

    const name = src.slice(IMAGE_PREFIX.length)
    if (name.includes('/') || name.includes('..')) return fallback()

    let svg: string
    try {
      svg = readFileSync(join(IMAGES_DIR, name), 'utf8')
    } catch {
      console.warn(`[inline-svg] ${src} could not be read; left as an <img> reference`)
      return fallback()
    }

    const scope = env as InlineSvgEnv
    const counts = (scope.__inlineSvgCounts ??= new Map<string, number>())
    const base = name.replace(/\.svg$/, '')
    const seen = (counts.get(base) ?? 0) + 1
    counts.set(base, seen)
    const uid = seen === 1 ? `dg-${base}` : `dg-${base}-${seen}`

    // `v-pre` keeps the Vue compiler out of the CSS, where `{` and `}` are structural.
    return `<figure class="docs-figure" v-pre>${transform(svg, uid)}</figure>`
  }
}
