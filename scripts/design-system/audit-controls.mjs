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
const EFFECTS = process.argv.includes('--effects')

// --effects: presence is not effect. A widget can render, be operable, and
// still drive nothing (a custom render that hardcodes the prop, a masked
// fallback chain, a mapping nobody consumes). This pass perturbs each operable
// widget IN THE REAL PANEL and diffs the canvas DOM; identical DOM => INERT.
// Exemptions are for props whose effect is real but not canvas-visible at the
// story's default state — every entry carries its justification and how the
// effect was verified instead.
const EFFECT_EXEMPT = {
    Avatar: {
        clickable: 'behavior-only: wires onClick navigation, no DOM signature; verified by click->URL navigation probe',
        destinationUrl: 'behavior-only: consumed by the clickable click handler; verified by click->URL navigation probe',
        menuLabel: 'labels the menu trigger, which only exists when menuItems is set; verified with menuItems preset + aria-label probe',
        placementRefreshKey: 'recalc token: recomputes placement only while a menu is open',
    },
    Button: {
        clickAction: 'function preset: effect appears after click (pending state); verified via click -> aria-busy probe',
        target: 'anchor-only attribute, inert on the button form by design; verified on the link form',
        rel: 'anchor-only attribute, inert on the button form by design; verified on the link form (rel:noopener reaches the anchor)',
    },
    SplitButton: {
        usePortal: 'relocates the open menu to document.body; canvas DOM unchanged while the menu is closed',
        options: 'menu content: visible only while open; verified by open-menu interaction (basic preset -> 2 menuitems)',
        menuAlign: 'collision-aware placement (resolvedAlign) auto-flips near viewport edges; Playground pins the trigger at the left edge so start/end resolve identically there',
    },
}

// Icon-name text knobs: appending characters makes an UNKNOWN icon (renders
// nothing = false inert). Perturb them to a known registry icon instead.
const ICON_NAME_PROP = /icon|^name$/i
const TEXT_PROBE_ICON = 'check'

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

const canvasHtml = async () => {
    const frame = page.frames().find((f) => f.url().includes('iframe.html'))
    if (!frame) return null
    try { return await frame.$eval('#storybook-root', (el) => el.innerHTML) } catch { return null }
}

const rowFor = async (prop) => {
    const rows = page.locator('tr', { has: page.locator('td') })
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
        const nm = ((await rows.nth(i).locator('td,th').first().textContent()) || '').trim().replace(/\*$/, '').trim()
        if (nm === prop) return rows.nth(i)
    }
    return null
}

// Perturb one operable widget and report whether the canvas DOM changed.
// Returns 'effect' | 'inert' | 'skipped' | 'unstable'.
async function testEffect(storyUrl, prop, kind) {
    await page.goto(storyUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('tr td', { timeout: 9000 }).catch(() => {})
    await page.waitForTimeout(800)
    const before1 = await canvasHtml()
    await page.waitForTimeout(300)
    const before = await canvasHtml()
    if (before == null) return 'skipped'
    if (before1 !== before) return 'unstable' // canvas animates at rest; a diff proves nothing
    const row = await rowFor(prop)
    if (!row) return 'skipped'
    try {
        if (kind === 'select') {
            const sel = row.locator('select').first()
            const cur = await sel.inputValue()
            const opts = await sel.locator('option').evaluateAll((os) => os.map((o) => o.value))
            // Skip Storybook's "Choose option..." placeholder — selecting it just
            // clears the arg and reads as a false effect/inert. Some options are
            // designed visual no-ops (e.g. a legacy alias of the default), so a
            // select counts as effective if ANY option changes the canvas.
            const candidates = opts.filter((v) => v && !/^choose option/i.test(v) && v !== cur).slice(0, 5)
            if (!candidates.length) return 'skipped'
            for (const next of candidates) {
                await sel.selectOption(next)
                await page.waitForTimeout(900)
                if ((await canvasHtml()) !== before) return 'effect'
            }
            return 'inert'
        } else if (kind === 'checkbox') {
            // The boolean control's input is visually hidden; the switch label is
            // the click target a human uses.
            await row.locator('label:has(input[type="checkbox"])').first().click()
        } else if (kind === 'radio-group') {
            // Same any-option rule as selects: the first unchecked radio can be
            // the rendered default (e.g. tone "neutral"), a designed no-op.
            // Click the label like a human — .check() asserts the input state
            // synchronously and races Storybook's React-controlled radios.
            const radioLabels = row.locator('label:has(input[type="radio"])')
            const n = await radioLabels.count()
            let tried = 0
            for (let i = 0; i < n && tried < 5; i++) {
                if (await radioLabels.nth(i).locator('input').isChecked()) continue
                await radioLabels.nth(i).click()
                tried++
                await page.waitForTimeout(900)
                if ((await canvasHtml()) !== before) return 'effect'
            }
            return tried ? 'inert' : 'skipped'
        } else if (kind === 'text' || kind === 'textarea') {
            const input = row.locator('input[type="text"], textarea').first()
            const cur = await input.inputValue()
            await input.fill(ICON_NAME_PROP.test(prop) ? TEXT_PROBE_ICON : `${cur}zprobe`)
        } else if (kind === 'number' || kind === 'range') {
            const input = row.locator('input[type="number"], input[type="range"]').first()
            const cur = await input.inputValue()
            await input.fill(String((Number(cur) || 0) + 3))
        } else {
            return 'skipped' // color/date pickers: rare, not probed yet
        }
    } catch (e) {
        if (!JSON_OUT) console.error(`    [effects] ${prop}: ${String(e).split('\n')[0].slice(0, 140)}`)
        return 'skipped'
    }
    await page.waitForTimeout(900)
    const after = await canvasHtml()
    return after === before ? 'inert' : 'effect'
}

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
    let effects = null
    if (EFFECTS) {
        effects = { effect: 0, inert: [], exempt: [], skipped: [], unstable: [] }
        const exempt = EFFECT_EXEMPT[comp.name] ?? {}
        for (const prop of comp.props) {
            const kind = widgets[prop]
            if (perProp[prop] === 'handler' || !kind || !FUNCTIONAL.has(kind)) continue
            if (exempt[prop]) { effects.exempt.push(prop); continue }
            const outcome = await testEffect(`${URL}/?path=/story/${id}`, prop, kind)
            if (outcome === 'effect') effects.effect++
            else effects[outcome].push(prop)
        }
    }
    results.push({
        name: comp.name, status: comp.status,
        total: denom, operable, dead, missing, handlers,
        coverage: denom ? Math.round((operable / denom) * 100) : 100,
        failing: Object.entries(perProp).filter(([, v]) => v === 'DEAD' || v === 'MISSING').map(([k, v]) => `${k}:${v}`),
        ...(effects ? { effects } : {}),
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

if (EFFECTS) {
    let inertTotal = 0
    console.log('\nEffect pass — perturbed each operable widget in the real panel; INERT = canvas DOM unchanged\n')
    for (const r of results) {
        if (!r.effects) continue
        const e = r.effects
        inertTotal += e.inert.length
        const notes = []
        if (e.inert.length) notes.push(`INERT: ${e.inert.join(', ')}`)
        if (e.unstable.length) notes.push(`unstable canvas (not probed): ${e.unstable.join(', ')}`)
        if (e.skipped.length) notes.push(`skipped: ${e.skipped.join(', ')}`)
        if (e.exempt.length) notes.push(`exempt: ${e.exempt.join(', ')}`)
        console.log(`  ${r.name.padEnd(24)} effect ${String(e.effect).padStart(2)}  ${notes.join('  |  ') || 'all effective'}`)
    }
    console.log(`\nCONTROLS_INERT_PROPS=${inertTotal}`)
    if (inertTotal > 0) { console.error('FAIL: operable-but-inert props found — a widget that drives nothing is a lie'); process.exit(1) }
}

// --min <n>: fail when operable coverage drops below the ratchet (CI gate use).
const minI = process.argv.indexOf('--min')
if (minI >= 0) {
    const min = Number(process.argv[minI + 1])
    if (pct < min) { console.error(`FAIL: controls operability ${pct}% < ${min}%`); process.exit(1) }
    console.log(`✓ controls operability ${pct}% (>=${min}%)`)
}
