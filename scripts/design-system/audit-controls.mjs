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
import { PLUMBING, hiddenByDesign } from './controls-hidden-by-design.mjs'
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
    FormFieldEditorial: {
        children: 'the <option> list feeds the select-mode Combobox popover, which is closed in the static canvas — swapping the preset changes options that only render once the popover opens; verified by the select-variant unit test (open popover → pick option → onChange payload) and the Playground mapping presets',
    },
    BlogMediaImage: {
        fit: 'object-fit class only applies in fill mode; the Playground renders inline (fill=false) so it is inert there; verified by the FillContain story and the fill-mode cover/contain unit tests',
    },
    Breadcrumb: {
        maxItems: 'static collapse cap — only changes layout when items.length exceeds it, and the Playground trail is short; verified by the static-collapse unit tests and the Collapsed story',
        collapseLabel: 'labels the ellipsis trigger, which only exists once the trail collapses; verified by the custom-collapseLabel unit test and the Collapsed story',
    },
    Avatar: {
        clickable: 'behavior-only: wires onClick navigation, no DOM signature; verified by click->URL navigation probe',
        destinationUrl: 'behavior-only: consumed by the clickable click handler; verified by click->URL navigation probe',
        menuLabel: 'labels the menu trigger, which only exists when menuItems is set; verified with menuItems preset + aria-label probe',
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
    Checkbox: {
        defaultChecked: 'uncontrolled-only initial state, masked while the seeded `checked` arg keeps the control controlled; verified by unit test (uncontrolled toggle path)',
    },
    Combobox: {
        options: 'dropdown content: portaled to document.body and visible only while open; verified by the KeyboardSelection play story (ArrowDown opens, options render, Enter selects)',
    },
    MultiCombobox: {
        options: 'dropdown content: portaled to document.body and visible only while open; verified by the play story that opens the listbox and picks options',
    },
    Switch: {
        defaultChecked: 'uncontrolled-only initial state, masked by the controlled Playground template; verified by unit test (uncontrolled toggle path)',
    },
    Radio: {
        defaultChecked: 'uncontrolled-only initial state, masked while the seeded `checked` arg keeps the control controlled; verified by unit test',
    },
    FileUpload: {
        maxSizeInBytes: 'validation-time only: applied when a file is picked, no DOM signature at rest; verified by oversize-pick unit test',
        sizeErrorMessage: 'validation-time only: rendered when a picked file exceeds maxSizeInBytes; verified by oversize-pick unit test',
    },
    Skeleton: {
        height: 'non-text variants only: the text variant sizes by line count and applies width alone; verified by unit test (rect variant height style)',
    },
    Toast: {
        duration: 'timer-only: sets the auto-dismiss delay, no DOM signature at rest; verified by unit tests (default and custom duration fire onClose)',
    },
    NavLink: {
        exact: 'route-matching semantic: at the Storybook stub pathname "/" prefix and exact matching coincide for every href; verified by unit tests (exact vs prefix)',
        activeClassName: 'active-route only: applied when pathname matches href, and the Playground link is deliberately inactive; verified by unit test (activeClassName under matching pathname)',
    },
    LanguageSwitcher: {
        floatedButtonClassName: 'open-tray only: the fanned option buttons exist only while the tray is open; verified by unit test (open tray applies the class)',
        openTriggerClassName: 'open-tray only: applied to the trigger while expanded; verified by unit test (open tray applies the class)',
    },
    ExpandableSection: {
        defaultExpanded: 'uncontrolled-only initial state, masked while the seeded controlled `expanded` arg drives the Playground; verified by unit test (respects defaultExpanded)',
    },
    MarkdownMessage: {
        fallback: 'masked while content renders (shown only when content sanitizes to empty); verified by unit test (renders fallback when content empty)',
    },
    ContactInquiryPanel: {
        packageId: 'booking-provider prefill: observable only with a provider configured via env; Storybook runs providerless (coming-soon fallback); resolution verified by donny-booking unit tests',
        bookingConfig: 'booking-provider override: observable only when the provider embed renders (book tab + configured provider); providerless Storybook shows the coming-soon fallback; verified by donny-booking unit tests',
    },
    ContactPageContentEditorial: {
        bookingPackageId: 'booking-provider prefill: observable only with a provider configured via env; Storybook runs providerless; resolution verified by donny-booking unit tests',
        bookingConfig: 'booking-provider override: observable only when the provider embed renders; providerless Storybook shows the coming-soon fallback; verified by donny-booking unit tests',
    },
    HomeHero: {
        scrollTargetId: 'behavior-only: consumed by the scroll indicator click handler (scrollIntoView target), no DOM signature at rest; verified by ScrollIndicator unit test (click scrolls the target)',
    },
    ChatWidget: {
        title: 'panel-only: rendered in the chat panel header, visible only after the bubble is clicked open; verified by the EmptyState play story (opens the panel, asserts the "Meet Donny" heading)',
        description: 'panel-only: rendered in the chat panel header, visible only after the bubble is clicked open; verified by the EmptyState play story',
        endpoint: 'behavior-only: the POST target used when a message is submitted, no DOM signature at rest; verified by the widget play stories (mock endpoint drives the reply flow)',
    },
    MCPActionButton: {
        toolId: 'behavior-only: sent through onExecute when the button is clicked, no DOM signature at rest; verified by unit test (click invokes onExecute with { toolId, payload })',
        payload: 'behavior-only: sent through onExecute when the button is clicked, no DOM signature at rest; verified by unit test (click invokes onExecute with { toolId, payload })',
    },
    TransformingActionInput: {
        defaultValue: 'mount-only initial value, surfaced as the input value PROPERTY (not reflected to innerHTML); verified by the StartAsInput play story (seeds defaultValue and asserts input value)',
        value: 'controlled value, surfaced as the input value PROPERTY (not reflected to innerHTML); verified by the StartAsInput play story (types into the input and asserts its value)',
        actionLabelKey: 'button-branch only: the trigger label, rendered when mode="button"; the Playground rests in input mode so the button is not mounted (Default starts in button mode and shows it)',
        stayInInputMode: 'behavior-only: keeps the field in input mode after submit instead of reverting to the button, observable only across a submit interaction; no DOM signature at rest',
    },
    DonnyAvatar: {
        proximitySelectors: 'behavior-only: registers mouse-proximity listeners against these selectors; no DOM signature at rest, the eventual effect is a data-state change (state transitions unit-tested)',
        proximityThreshold: 'behavior-only: distance threshold for the proximity listeners above; no DOM signature at rest',
        enableIdleExpressions: 'behavior-only: opt-in timer that swaps expression after idle; effect appears only after idleExpressionInterval elapses, drives data-state (unit-tested)',
        idleExpressionInterval: 'behavior-only: timing for the idle-expression timer above; no DOM signature at rest',
        enableSleepDetection: 'behavior-only: opt-in timers that move the avatar to the sleeping state after inactivity; effect appears only after sleepyDelay/sleepDelay elapse, drives data-state (unit-tested)',
        sleepyDelay: 'behavior-only: timing for the sleepy state above; no DOM signature at rest',
        sleepDelay: 'behavior-only: timing for the sleeping state above; no DOM signature at rest',
    },
    EmailSignatureGenerator: {
        logoUrlFull: 'output-only: written into the generated signature HTML that is copied to the clipboard (generateSignatureHTML), never rendered into the canvas; the visible preview uses logoUrl',
    },
    EnhancedProjectCard: {
        autoPlayVideo: 'sets the <video> autoPlay attribute, gated by !prefers-reduced-motion; the audit emulates reduced-motion so it is always off here, and autoPlay is a media property not reflected to innerHTML',
    },
}

// Icon-name text knobs: appending characters makes an UNKNOWN icon (renders
// nothing = false inert). Perturb them to a known registry icon instead.
const ICON_NAME_PROP = /icon|^name$/i
const TEXT_PROBE_ICON = 'check'

// CSS-length text knobs (gap/width/etc.): appending characters makes an
// INVALID value, and the CSSOM rejects invalid assignments while KEEPING the
// previous value — a false inert. Perturb to a different valid length instead.
const CSS_LENGTH = /^-?\d+(\.\d+)?(px|rem|em|%|ch|vw|vh|fr)$/
const LENGTH_PROBE = (cur) => (cur === '17px' ? '23px' : '17px')

const ROOTS = [
    resolve(__dirname, '../../nextjs-app/shared/components'),
    resolve(__dirname, '../../nextjs-app/shared/patterns'),
]

// Public props worth a control (skip pure DOM/React plumbing a human never
// sets). Single source of truth shared with the enhancer:
// scripts/design-system/controls-hidden-by-design.mjs.
const SKIP = PLUMBING

// Props with NO Controls row by a documented per-component decision that the
// shared hiddenByDesign() predicate cannot express. Every entry carries its
// justification, mirroring EFFECT_EXEMPT.
const HIDDEN_EXEMPT = {
    Grid: {
        tabletColumns: 'viewport-dependent: only changes tracks past 768px, so a panel knob at the default viewport looks inert; demoed by the ResponsiveColumns story',
        desktopColumns: 'viewport-dependent (1024px rung); demoed by the ResponsiveColumns story',
        wideColumns: 'viewport-dependent (1440px rung); demoed by the ResponsiveColumns story',
        ultraColumns: 'viewport-dependent (1920px rung); demoed by the ResponsiveColumns story',
    },
}

function contractProps(dir, root) {
    const p = `${root}/${dir}/${dir}.contract.json`
    if (!existsSync(p)) return null
    try {
        const c = JSON.parse(readFileSync(p, 'utf8'))
        // Ref-typed props (e.g. Modal panelRef) are plumbing of the same class
        // as `ref` itself: contracts expose them, no human drives a canvas
        // from a ref field. Matches the HIDDEN fallthrough in the enhancer.
        const props = Object.keys(c.props ?? {}).filter(
            (k) => !SKIP.has(k) && !/^(React\.)?(Ref|RefObject|MutableRefObject)\b/.test(c.props[k]?.type ?? ''),
        )
        const propTypes = Object.fromEntries(
            props.map((k) => [k, c.props[k]?.type ?? '']),
        )
        return { status: c.status, props, propTypes }
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
    // Native web-component stories intentionally mirror React component names.
    // This audit gates the React contract catalog, so never let index ordering
    // select a Web Components story with the same leaf title.
    const of = entries.filter(
        (e) => e.type === 'story'
            && !e.title?.startsWith('Web Components/')
            && e.title?.split('/').pop() === name,
    )
    if (!of.length) return null
    const pref = of.find((e) => e.name === 'Playground') ?? of.find((e) => e.name === 'Default') ?? of[0]
    return pref.id
}

const FUNCTIONAL = new Set(['text', 'number', 'range', 'checkbox', 'radio-group', 'select', 'textarea', 'color', 'date'])

const browser = await chromium.launch()
const page = await browser.newPage()
// Looping hero/marquee animations mutate the DOM at rest and read as
// "unstable canvas" (unprobed). DT components respect prefers-reduced-motion,
// and a reduced-motion user is a real user — emulate it so those canvases
// settle and their props get probed for real.
await page.emulateMedia({ reducedMotion: 'reduce' })
const results = []

const canvasHtml = async () => {
    const frame = page.frames().find((f) => f.url().includes('iframe.html'))
    if (!frame) return null
    try {
        return await frame.evaluate(() => {
            const root = document.getElementById('storybook-root')
            if (!root) return null
            // Portaled UI (Modal overlays, dropdown trays) is canvas a human
            // sees, but it mounts as a body-level sibling of #storybook-root.
            // Include those element siblings so portal-driven props measure as
            // effects instead of false inerts. Script/style/link tags are
            // builder plumbing, not canvas.
            const portals = Array.from(document.body.children)
                .filter((el) => el !== root && !/^(SCRIPT|STYLE|LINK)$/.test(el.tagName))
                .map((el) => el.outerHTML)
                .join('')
            // Theme plumbing (ThemeProvider forcedTheme) writes classes and
            // data attributes onto <html>/<body> — canvas-visible, but not in
            // any innerHTML. Serialize their attributes into the fingerprint.
            const attrs = (el) =>
                el.getAttributeNames().sort().map((n) => `${n}=${el.getAttribute(n)}`).join(';')
            return `${attrs(document.documentElement)}|${attrs(document.body)}|${root.innerHTML}${portals}`
        })
    } catch { return null }
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

// Storybook's "unsaved changes" save-from-controls bar appears after the
// first arg edit and INTERCEPTS pointer events over the panel's bottom rows —
// the second click of a radio/checkbox probe times out and reads as a silent
// skip. It is dev chrome, not a control; hide it for the probe session.
const hideSaveBar = () =>
    page.addStyleTag({ content: '#save-from-controls{display:none!important}' }).catch(() => {})

// Perturb one operable widget and report whether the canvas DOM changed.
// Returns 'effect' | 'inert' | 'skipped' | 'unstable'.
async function testEffect(storyUrl, prop, kind) {
    await page.goto(storyUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('tr td', { timeout: 9000 }).catch(() => {})
    await hideSaveBar()
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
            const next = ICON_NAME_PROP.test(prop)
                ? TEXT_PROBE_ICON
                : CSS_LENGTH.test(cur)
                    ? LENGTH_PROBE(cur)
                    : `${cur}zprobe`
            await input.fill(next)
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
    let operable = 0, dead = 0, missing = 0, handlers = 0, hidden = 0
    for (const prop of comp.props) {
        if (/^on[A-Z]/.test(prop)) { perProp[prop] = 'handler'; handlers++; continue }
        const kind = widgets[prop]
        if (kind && FUNCTIONAL.has(kind)) { perProp[prop] = kind; operable++ }
        else if (kind === 'dead') { perProp[prop] = 'DEAD'; dead++ }
        else if (
            // No row at all AND deliberately so: either the shared predicate
            // (ReactNode/arrays/Records/controlled-pair halves — the same
            // classification the enhancer hides by) or a documented
            // per-component exemption. A DEAD row (visible Set-button) never
            // qualifies — a rendered dead widget is a defect regardless.
            hiddenByDesign(prop, comp.propTypes?.[prop] ?? '', comp.props) ||
            HIDDEN_EXEMPT[comp.name]?.[prop]
        ) { perProp[prop] = 'hidden'; hidden++ }
        else { perProp[prop] = 'MISSING'; missing++ }
    }
    const denom = comp.props.length - handlers - hidden
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
        total: denom, operable, dead, missing, handlers, hidden,
        coverage: denom ? Math.round((operable / denom) * 100) : 100,
        failing: Object.entries(perProp).filter(([, v]) => v === 'DEAD' || v === 'MISSING').map(([k, v]) => `${k}:${v}`),
        ...(effects ? { effects } : {}),
    })
}

await browser.close()

if (JSON_OUT) { console.log(JSON.stringify(results, null, 2)); process.exit(0) }

results.sort((a, b) => (a.coverage ?? -1) - (b.coverage ?? -1))
let totalProps = 0, totalOperable = 0, fullyOperable = 0, totalHidden = 0
console.log('\nHuman-Simulated Controls audit — operable = human can select/toggle/check/input/slide\n')
for (const r of results) {
    if (r.error) { console.log(`  ${r.name.padEnd(24)} — ${r.error}`); continue }
    totalProps += r.total; totalOperable += r.operable; totalHidden += r.hidden ?? 0
    if (r.coverage === 100) { fullyOperable++; continue }
    const bar = '█'.repeat(Math.round(r.coverage / 5)).padEnd(20, '░')
    console.log(`  ${r.name.padEnd(24)} [${r.status.padEnd(6)}] ${bar} ${String(r.coverage).padStart(3)}%  ${r.operable}/${r.total}  ✗ ${r.failing.join(', ')}`)
}
const pct = Math.round((totalOperable / totalProps) * 100)
console.log(`\n${fullyOperable}/${results.filter((r) => !r.error).length} components fully operable`)
console.log(`${totalOperable}/${totalProps} value props operable (${pct}%), ${totalHidden} hidden by design`)
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
