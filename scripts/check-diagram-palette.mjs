// Holds the two copies of the diagram palette together.
//
// A diagram carries its own colours behind `prefers-color-scheme` so it renders when
// opened on its own, but the copy the site uses lives in the theme: Vue's template
// compiler drops `<style>` from a page template, so the inlined copy would disappear on
// hydration and leave every shape at the SVG default fill of black. Both copies are
// written by hand, so they are reconciled here.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const IMAGES = 'src/public/images'
const THEME = '.vitepress/theme/custom.css'

/** Splits a flat rule list into `selector -> declarations`, one entry per selector. */
function parseRules(css) {
  const rules = new Map()
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const body = match[2]
      .split(';')
      // `opacity:.16` and `opacity: 0.16`, or a font stack with and without spaces after
      // its commas, are the same declaration written two ways.
      .map(decl =>
        decl
          .replace(/\s+/g, ' ')
          .replace(/\s*:\s*/, ':')
          .replace(/(^|[:\s])\.(\d)/g, '$10.$2')
          .replace(/\s*,\s*/g, ',')
          .trim(),
      )
      .filter(Boolean)
      .sort()
      .join('; ')
    if (!body) continue
    for (const selector of match[1].split(',')) {
      rules.set(selector.replace(/\s+/g, ' ').trim(), body)
    }
  }
  return rules
}

/** The light rules and the `prefers-color-scheme: dark` rules of one diagram. */
function readPalette(file) {
  const svg = fs.readFileSync(path.join(root, IMAGES, file), 'utf-8')
  const style = svg.match(/<style>([\s\S]*?)<\/style>/)
  if (!style) return null

  const css = style[1]
  const start = css.search(/@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)\s*\{/)
  if (start === -1) return { light: parseRules(css), dark: new Map() }

  const open = css.indexOf('{', start)
  let depth = 0
  let end = -1
  for (let idx = open; idx < css.length; idx += 1) {
    if (css[idx] === '{') depth += 1
    else if (css[idx] === '}' && --depth === 0) {
      end = idx
      break
    }
  }
  if (end === -1) return null

  return {
    light: parseRules(css.slice(0, start) + css.slice(end + 1)),
    dark: parseRules(css.slice(open + 1, end)),
  }
}

const files = fs
  .readdirSync(path.join(root, IMAGES))
  .filter(file => file.endsWith('.svg'))
  .sort()

const problems = []

if (files.length === 0) problems.push(`No diagrams found under ${IMAGES}.`)

// Every diagram is drawn from one palette, so the theme can carry a single copy of it.
const palettes = new Map()
for (const file of files) {
  const palette = readPalette(file)
  if (!palette) {
    problems.push(`${IMAGES}/${file} has no readable <style> palette.`)
    continue
  }
  const key = JSON.stringify([[...palette.light], [...palette.dark]])
  if (!palettes.has(key)) palettes.set(key, { palette, files: [] })
  palettes.get(key).files.push(file)
}

if (palettes.size > 1) {
  const groups = [...palettes.values()].sort((a, b) => b.files.length - a.files.length)
  for (const group of groups.slice(1)) {
    problems.push(
      `${group.files.join(', ')}: palette differs from the other ${groups[0].files.length} ` +
        'diagrams. Every diagram shares one palette, because the theme ships it once.',
    )
  }
}

const reference = [...palettes.values()][0]?.palette

if (reference) {
  const theme = parseRules(fs.readFileSync(path.join(root, THEME), 'utf-8'))
  const check = (selector, body, scope) => {
    const scoped = `${scope} ${selector}`
    if (!theme.has(scoped)) problems.push(`${THEME} is missing \`${scoped}\`.`)
    else if (theme.get(scoped) !== body) {
      problems.push(`${THEME} \`${scoped}\` is \`${theme.get(scoped)}\`, diagrams say \`${body}\`.`)
    }
  }
  for (const [selector, body] of reference.light) check(selector, body, '.docs-figure')
  for (const [selector, body] of reference.dark) check(selector, body, '.dark .docs-figure')

  // A class the palette never names paints nothing, so it draws in the default black.
  const named = new Set(
    [...reference.light.keys(), ...reference.dark.keys()]
      .filter(selector => selector.startsWith('.'))
      .map(selector => selector.slice(1)),
  )
  for (const file of files) {
    const svg = fs.readFileSync(path.join(root, IMAGES, file), 'utf-8')
    for (const match of svg.matchAll(/\sclass="([^"]+)"/g)) {
      for (const cls of match[1].split(/\s+/)) {
        if (!named.has(cls)) {
          problems.push(`${IMAGES}/${file} uses \`.${cls}\`, which the palette does not define.`)
        }
      }
    }
  }
}

if (problems.length) {
  console.error(`\nDiagram palette check failed (${problems.length} problem(s)):\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  console.error('')
  process.exit(1)
}

console.log(`Diagram palette check passed: ${files.length} diagrams share the theme palette.`)
