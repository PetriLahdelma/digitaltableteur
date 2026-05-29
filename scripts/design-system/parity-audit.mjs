#!/usr/bin/env node
/**
 * Design-system parity progress (methodology breadth, not visual clone).
 * Benchmarks: production site, Carbon, Polaris, HDS, Ant Design (patterns only).
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../..')
const shared = join(root, 'nextjs-app/shared')

import { IN_SCOPE_COMPONENTS } from './in-scope-components.mjs'

const IN_SCOPE = IN_SCOPE_COMPONENTS.map((c) => c.name)

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function componentDirs() {
  return readdirSync(join(shared, 'components'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

function contractsUnder(rel) {
  const dir = join(shared, rel)
  if (!existsSync(dir)) return []
  const out = []
  for (const f of readdirSync(dir, { recursive: true })) {
    if (typeof f === 'string' && f.endsWith('.contract.json')) {
      out.push(f.replace(/\.contract\.json$/, '').split('/').pop())
    }
  }
  return [...new Set(out)]
}

function exampleBlock(text) {
  const m = text.match(/export const Example[\s\S]*?(?=\nexport const [A-Z]|\nexport default |\Z)/)
  return m ? m[0] : ''
}

function exampleQuality(text) {
  const block = exampleBlock(text)
  if (!block) return 'no-example'
  if (/render\s*:/.test(block)) return 'composition'
  if (/args\s*:/.test(block) && !/\.\.\./.test(block)) return 'production-args'
  const spread = block.match(/\.\.\.(\w+)/)
  if (spread) {
    const ref = spread[1]
    const refBlock = text.match(new RegExp(`export const ${ref}[\\s\\S]*?(?=\\nexport const |\\Z)`))
    if (refBlock && /render\s*:/.test(refBlock[0])) return 'composition-via-ref'
    return 'alias'
  }
  return 'stub'
}

function metricScore(counts) {
  const good =
    (counts.composition || 0) +
    (counts['production-args'] || 0) +
    (counts['composition-via-ref'] || 0)
  return Math.round((good / IN_SCOPE.length) * 100)
}

const componentCount = componentDirs().length
const contractNames = new Set([...contractsUnder('components'), ...contractsUnder('patterns')])
let beta = 0
let stable = 0
const exampleReport = {}
for (const name of IN_SCOPE) {
  const rel = ['SiteHeader', 'SiteFooter'].includes(name) ? 'patterns' : 'components'
  const cp = join(shared, rel, name, `${name}.contract.json`)
  if (existsSync(cp)) {
    const s = readJson(cp).status
    if (s === 'beta') beta += 1
    else if (s === 'stable') stable += 1
  }
  const sp = join(shared, rel, name, `${name}.stories.tsx`)
  exampleReport[name] = existsSync(sp) ? exampleQuality(readFileSync(sp, 'utf8')) : 'missing-stories'
}

const groups = {}
for (const q of Object.values(exampleReport)) {
  groups[q] = (groups[q] || 0) + 1
}
const phase1Score = metricScore(groups)
const goodCount =
  (groups.composition || 0) +
  (groups['production-args'] || 0) +
  (groups['composition-via-ref'] || 0)

console.log('\n=== Design-system parity audit ===\n')
console.log(`Phase 1 Example score: ${phase1Score}% (${goodCount}/${IN_SCOPE.length})`)
console.log(`In-scope maturity: beta ${beta} | stable ${stable}`)
console.log(`Library breadth: ${componentCount} folders | ${contractNames.size} contracts`)
console.log('\nExample quality:')
for (const [q, n] of Object.entries(groups).sort()) {
  const names = Object.entries(exampleReport)
    .filter(([, v]) => v === q)
    .map(([k]) => k)
  console.log(`  ${q} (${n}): ${names.join(', ')}`)
}
console.log(
  '\nBenchmarks (methodology only): IBM Carbon, Shopify Polaris, Helsinki DS, Ant Design, DSharp case study.',
)
console.log('Emit metric line for autoresearch: PARITY_PHASE1_SCORE=' + phase1Score)
