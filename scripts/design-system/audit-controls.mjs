/**
 * Human-Simulated Controls audit.
 *
 * For every catalog component this drives the REAL Storybook Controls panel in
 * a browser and classifies each public prop's rendered widget:
 *   functional  — text | number | range | checkbox | radio-group | select | textarea
 *   dead        — a "Set object"/"Set string" button (no usable control)
 *   missing     — prop is public (on the contract) but has NO row / is disabled
 *
 * A prop is "operable" only when a human can select/toggle/check/input/slide it.
 * Coverage = operable public props / total public props.
 *
 * Usage:
 *   node scripts/design-system/audit-controls.mjs [--url http://127.0.0.1:6010] [--json] [--only Name]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = dirname(fileURLToPath(import.meta.url))
const arg = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d }
const URL = arg('--url', 'http://127.0.0.1:6010')
const JSON_OUT = process.argv.includes('--json')
const ONLY = arg('--only', null)

const ROOTS = [
    resolve(__dirname, '../../nextjs-app/shared/components'),
    resolve(__dirname, '../../nextjs-app/shared/patterns'),
]

// Public props worth a control (skip pure DOM/React plumbing a human never sets).
const SKIP = new Set(['ref', 'style', 'key', 'asChild', 'as', 'data-role', 'aria-label'])

function contractProps(dir, root) {
    const p = `${root}/${dir}/${dir}.contract.json`
    if (!existsSync(p)) return null
    try {
        const c = JSON.parse(readFileSync(p, 'utf8'))
        return { status: c.status, props: Object.keys(c.props ?? {}).filter((k) => !SKIP.has(k)) }
    } catch { return null }
}

const components = []
for (const root of ROOTS) {
    if (!existsSync(root)) continue
    for (const dir of readdirSync(root)) {
        if (ONLY && dir !== ONLY) continue
        const info = contractProps(dir, root)
        if (info && info.props.length) components.push({ name: dir, ...info })
    }
}

const index = await (await fetch(`${URL}/index.json`)).json()
const entries = Object.values(index.entries ?? {})
function storyIdFor(name) {
    const of = entries.filter((e) => e.type === 'story' && e.title?.split('/').pop() === name)
    if (!of.length) return null
    const pref = of.find((e) => e.name === 'Playground') ?? of.find((e) => e.name === 'Default') ?? of[0]
    return pref.id
}

const FUNCTIONAL = new Set(['text', 'number', 'range', 'checkbox', 'radio-group', 'select', 'textarea', 'color', 'date'])

const browser = await chromium.launch()
const page = await browser.newPage()
const results = []

for (const comp of components) {
    const id = storyIdFor(comp.name)
    if (!id) { results.push({ name: comp.name, status: comp.status, error: 'no story' }); continue }
    await page.goto(`${URL}/?path=/story/${id}`, { waitUntil: 'domcontentloaded' })
    // Controls panel renders async in the manager; wait for real rows.
    await page.waitForSelector('tr td', { timeout: 9000 }).catch(() => {})
    await page.waitForTimeout(700)
    const widgets = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('tr')].filter((r) => r.querySelector('td'))
        const out = {}
        for (const r of rows) {
            const nameCell = r.querySelector('td,th')
            const name = (nameCell?.textContent || '').trim().replace(/\*$/, '').trim()
            if (!name || /^Hide |^Show /.test(name)) continue
            const radios = r.querySelectorAll('input[type="radio"]')
            const labelToggles = r.querySelectorAll('[role="radio"], button[type="button"][value]')
            let kind = 'NONE'
            if (radios.length > 1 || labelToggles.length > 1) kind = 'radio-group'
            else {
                const w = r.querySelector('input,select,textarea,button')
                if (w) {
                    const tag = w.tagName.toLowerCase()
                    if (tag === 'input') kind = w.getAttribute('type') || 'text'
                    else if (tag === 'button') kind = /\bset\b/i.test(w.textContent) ? 'dead' : 'button'
                    else kind = tag
                }
            }
            out[name] = kind
        }
        return out
    })
    const perProp = {}
    let operable = 0, dead = 0, missing = 0, handlers = 0
    for (const prop of comp.props) {
        if (/^on[A-Z]/.test(prop)) { perProp[prop] = 'handler'; handlers++; continue }
        const kind = widgets[prop]
        if (kind && FUNCTIONAL.has(kind)) { perProp[prop] = kind; operable++ }
        else if (kind === 'dead') { perProp[prop] = 'DEAD'; dead++ }
        else { perProp[prop] = 'MISSING'; missing++ }
    }
    const denom = comp.props.length - handlers
    results.push({
        name: comp.name, status: comp.status,
        total: denom, operable, dead, missing, handlers,
        coverage: denom ? Math.round((operable / denom) * 100) : 100,
        failing: Object.entries(perProp).filter(([, v]) => v === 'DEAD' || v === 'MISSING').map(([k, v]) => `${k}:${v}`),
    })
}

await browser.close()

if (JSON_OUT) { console.log(JSON.stringify(results, null, 2)); process.exit(0) }

results.sort((a, b) => (a.coverage ?? -1) - (b.coverage ?? -1))
let totalProps = 0, totalOperable = 0, fullyOperable = 0
console.log('\nHuman-Simulated Controls audit — operable = human can select/toggle/check/input/slide\n')
for (const r of results) {
    if (r.error) { console.log(`  ${r.name.padEnd(24)} — ${r.error}`); continue }
    totalProps += r.total; totalOperable += r.operable
    if (r.coverage === 100) { fullyOperable++; continue }
    const bar = '█'.repeat(Math.round(r.coverage / 5)).padEnd(20, '░')
    console.log(`  ${r.name.padEnd(24)} [${r.status.padEnd(6)}] ${bar} ${String(r.coverage).padStart(3)}%  ${r.operable}/${r.total}  ✗ ${r.failing.join(', ')}`)
}
const pct = Math.round((totalOperable / totalProps) * 100)
console.log(`\n${fullyOperable}/${results.filter((r) => !r.error).length} components fully operable`)
console.log(`${totalOperable}/${totalProps} value props operable (${pct}%)`)
console.log(`CONTROLS_OPERABLE_PCT=${pct}`)

// --min <n>: fail when operable coverage drops below the ratchet (CI gate use).
const minI = process.argv.indexOf('--min')
if (minI >= 0) {
    const min = Number(process.argv[minI + 1])
    if (pct < min) { console.error(`FAIL: controls operability ${pct}% < ${min}%`); process.exit(1) }
    console.log(`✓ controls operability ${pct}% (>=${min}%)`)
}
