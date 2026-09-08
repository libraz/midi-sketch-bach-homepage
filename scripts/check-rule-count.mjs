// Verifies every stated validator-rule count against the rule index itself.
//
// The count is written out in four places — the README, and the description and
// body of the rule index in both locales — and they drifted: the README said 47
// while the pages said 57, with nothing to reconcile them. The table is the
// artefact, so it is counted here and the prose is checked against it.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const INDEX = 'src/docs/validator-rules.md'

/** Table rows whose first cell is a `rule_id` in backticks. */
function countRules(relPath) {
  const abs = path.join(root, relPath)
  if (!fs.existsSync(abs)) return null
  return fs
    .readFileSync(abs, 'utf-8')
    .split('\n')
    .filter(line => /^\|\s*`[a-z0-9_]+`\s*\|/.test(line)).length
}

const expected = countRules(INDEX)
if (expected === null) {
  console.error(`Rule count check failed: ${INDEX} is missing.`)
  process.exit(1)
}

// The Japanese index must hold the same rules, not merely the same claim.
const jaCount = countRules('src/ja/docs/validator-rules.md')
const problems = []

if (jaCount !== null && jaCount !== expected) {
  problems.push(
    `src/ja/docs/validator-rules.md lists ${jaCount} rules but the English index lists ${expected}.`,
  )
}

/** Where a count is stated in prose, with the pattern that carries it. */
const CLAIMS = [
  ['README.md', /(\d+) validator rules/g],
  ['src/docs/validator-rules.md', /all (\d+) validator rules/g],
  ['src/ja/docs/validator-rules.md', /全(\d+)ルール/g],
]

let found = 0

for (const [rel, pattern] of CLAIMS) {
  const abs = path.join(root, rel)
  if (!fs.existsSync(abs)) continue
  fs.readFileSync(abs, 'utf-8')
    .split('\n')
    .forEach((line, i) => {
      for (const match of line.matchAll(pattern)) {
        found++
        const stated = Number(match[1])
        if (stated !== expected) {
          problems.push(`${rel}:${i + 1} says ${stated} rules, but ${INDEX} lists ${expected}.`)
        }
      }
    })
}

if (found === 0) {
  problems.push(
    'No stated rule count found. If the prose stopped naming a number, drop the matching ' +
      'entry from CLAIMS in this script rather than leaving it unchecked.',
  )
}

if (problems.length) {
  console.error(`\nRule count check failed (${problems.length} problem(s)):\n`)
  for (const p of problems) console.error(`  ${p}`)
  console.error('')
  process.exit(1)
}

console.log(`Rule count check passed: ${expected} rules, ${found} stated mention(s) in step.`)
