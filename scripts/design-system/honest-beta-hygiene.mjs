#!/usr/bin/env node
/**
 * Honest Beta — Phase A hygiene batch.
 *
 *  A1  Demote out-of-scope auto-betas back to alpha so `status: "beta"` only
 *      labels components that are deliberately on the in-scope list.
 *  A2  Promote ReadingProgress contract from alpha to beta (in-scope drift).
 *      Deferred — promotion needs real MDX + spec + a11y review evidence,
 *      which is Phase B/C work. Logged here, not flipped.
 *  A3  Strip auto-generated `description: 'X control.'` noise from stories.
 *  A4  Add `storybook/test` imports where stories use expect/within/userEvent.
 *
 * Idempotent. Reports a summary so the run is auditable.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'glob'

import { IN_SCOPE_COMPONENTS } from './in-scope-components.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '../..')

const inScope = new Set(IN_SCOPE_COMPONENTS.map((c) => c.name))

// A1 — contract status reconciliation
const demotedToAlpha = []
const contractFiles = globSync('nextjs-app/shared/**/*.contract.json', { cwd: repoRoot })

for (const rel of contractFiles) {
  const abs = join(repoRoot, rel)
  const raw = readFileSync(abs, 'utf8')
  let json
  try { json = JSON.parse(raw) } catch { continue }
  if (!json.name) continue
  const before = json.status
  if (json.status === 'beta' && !inScope.has(json.name)) {
    json.status = 'alpha'
    if (json.a11y) {
      json.a11y.reviewed = false
      delete json.a11y.reviewedNote
      json.a11y.forcedColorsVerified = false
      json.a11y.lightDarkVerified = false
    }
  }
  if (json.status !== before) {
    writeFileSync(abs, JSON.stringify(json, null, 2) + '\n')
    if (json.status === 'alpha') demotedToAlpha.push(json.name)
  }
}

// A3 — strip `description: 'X control.',` noise inside argType objects.
// Auto-generated descriptions that just restate the prop name + " control."
// carry zero information beyond the key itself.
const noiseStripped = []
const storyFiles = globSync('nextjs-app/shared/**/*.stories.tsx', { cwd: repoRoot })
const inlineNoiseRe = /description:\s*['"`][^'"`]*?\bcontrol\.['"`]\s*,?\s*/g

for (const rel of storyFiles) {
  const abs = join(repoRoot, rel)
  const before = readFileSync(abs, 'utf8')
  let after = before.replace(inlineNoiseRe, '')
  // Clean up a `{ ,` that can result when description was the first key
  after = after.replace(/\{\s*,\s*/g, '{ ')
  // Collapse `{   control:` to `{ control:` style noise
  after = after.replace(/\{\s{2,}(?=[a-zA-Z])/g, '{ ')
  if (after !== before) {
    writeFileSync(abs, after)
    noiseStripped.push(rel)
  }
}

// A4 — add missing `storybook/test` imports
const STORY_TEST_HELPERS = ['expect', 'within', 'userEvent', 'fireEvent', 'waitFor']
const importFixed = []

for (const rel of storyFiles) {
  const abs = join(repoRoot, rel)
  let text = readFileSync(abs, 'utf8')
  if (/from\s+['"]storybook\/test['"]/.test(text) || /from\s+['"]@storybook\/test['"]/.test(text)) continue
  const helpersUsed = STORY_TEST_HELPERS.filter((h) => new RegExp(`\\b${h}\\s*\\(`).test(text))
  if (helpersUsed.length === 0) continue
  const importLineRe = /^(import [^\n;]*;\s*\n)+/m
  const match = text.match(importLineRe)
  const insertion = `import { ${helpersUsed.join(', ')} } from "storybook/test";\n`
  if (match) text = text.replace(importLineRe, match[0] + insertion)
  else text = insertion + text
  writeFileSync(abs, text)
  importFixed.push({ file: rel, helpers: helpersUsed })
}

const pad = (n) => String(n).padStart(3)
console.log('=== Honest Beta hygiene pass ===\n')
console.log(`A1  demoted to alpha       ${pad(demotedToAlpha.length)} contract(s)`)
if (demotedToAlpha.length) console.log('     ' + demotedToAlpha.slice(0, 12).join(', ') + (demotedToAlpha.length > 12 ? ` + ${demotedToAlpha.length - 12} more` : ''))
console.log(`A3  stripped description   ${pad(noiseStripped.length)} story file(s)`)
console.log(`A4  added test-helper imp. ${pad(importFixed.length)} story file(s)`)
if (importFixed.length) for (const { file, helpers } of importFixed) console.log(`     ${file}  [${helpers.join(', ')}]`)
console.log('\nNext: strengthen validate-components.ts to reject stub MDX + TODO spec.md (track A5).')
