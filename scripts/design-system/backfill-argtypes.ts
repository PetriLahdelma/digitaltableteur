/**
 * Backfills deliberate meta.argTypes entries for every prop currently muted
 * via contract argTypesProxyExempt, then deletes the exemption lists.
 *
 * Treatment per the Controls quality bar (components/AGENTS.md):
 * - handlers (on*, function types)      -> action + table.disable
 * - ReactNode / refs / style / as / id  -> table.disable (documented in contract)
 * - string-literal unions               -> inline-radio (<=4) or select, options, default summary
 * - boolean / number / string           -> matching control + description
 * - data arrays / objects               -> object control + description
 * Descriptions come from the prop's JSDoc; fallback is generated and marked
 * for review in the run report.
 *
 * Usage: npx tsx scripts/design-system/backfill-argtypes.ts
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Project, SyntaxKind } from 'ts-morph'
import type { InterfaceDeclaration, ObjectLiteralExpression, PropertyAssignment, SourceFile, TypeLiteralNode } from 'ts-morph'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOTS = [
    resolve(__dirname, '../../nextjs-app/shared/components'),
    resolve(__dirname, '../../nextjs-app/shared/patterns'),
]

type PropInfo = { typeText: string; jsdoc: string; defaultTag: string | null; unionValues: string[] }

function collectPropsInfo(sf: SourceFile, componentName: string): Map<string, PropInfo> {
    const out = new Map<string, PropInfo>()
    const candidates: Array<InterfaceDeclaration | TypeLiteralNode> = []
    const iface = sf.getInterface(`${componentName}Props`)
    if (iface) candidates.push(iface)
    const alias = sf.getTypeAlias(`${componentName}Props`)
    const aliasNode = alias?.getTypeNode()
    if (aliasNode) {
        if (aliasNode.getKind() === SyntaxKind.TypeLiteral) candidates.push(aliasNode as TypeLiteralNode)
        // intersection: Type & {...}
        for (const tl of aliasNode.getDescendantsOfKind(SyntaxKind.TypeLiteral)) candidates.push(tl)
    }
    for (const c of candidates) {
        for (const m of c.getMembers()) {
            if (m.getKind() !== SyntaxKind.PropertySignature) continue
            const ps = m.asKindOrThrow(SyntaxKind.PropertySignature)
            const name = ps.getName().replace(/^["']|["']$/g, '')
            const typeText = ps.getTypeNode()?.getText() ?? 'unknown'
            const jsDocs = ps.getJsDocs()
            const raw = jsDocs.map((d) => d.getDescription().trim()).filter(Boolean).join(' ')
            const defaultTag =
                jsDocs.flatMap((d) => d.getTags()).find((t) => t.getTagName() === 'default')?.getCommentText()?.trim() ??
                raw.match(/@default\s+"?([\w-]+)"?/)?.[1] ??
                null
            const jsdoc = raw.replace(/@default\s+\S+/g, '').replace(/\s+/g, ' ').trim()
            const unionValues = [
                ...new Set(
                    typeText
                        .split('|')
                        .map((p) => p.trim().match(/^["']([^"']+)["']$/)?.[1])
                        .filter((v): v is string => !!v),
                ),
            ]
            out.set(name, { typeText, jsdoc, defaultTag, unionValues })
        }
    }
    return out
}

function metaArgTypes(sf: SourceFile): ObjectLiteralExpression | null {
    const unwrap = (init: import('ts-morph').Expression | undefined): ObjectLiteralExpression | null => {
        if (!init) return null
        if (init.getKind() === SyntaxKind.ObjectLiteralExpression) return init as ObjectLiteralExpression
        if (init.getKind() === SyntaxKind.SatisfiesExpression || init.getKind() === SyntaxKind.AsExpression) {
            return init.getChildrenOfKind(SyntaxKind.ObjectLiteralExpression)[0] ?? null
        }
        return null
    }
    const metas: ObjectLiteralExpression[] = []
    for (const v of sf.getVariableDeclarations()) {
        const obj = unwrap(v.getInitializer())
        if (obj) metas.push(obj)
    }
    const dflt = sf.getExportAssignment((a) => !a.isExportEquals())
    const dfltObj = unwrap(dflt?.getExpression())
    if (dfltObj) metas.push(dfltObj)
    for (const m of metas) {
        const at = m.getProperty('argTypes')
        if (at?.getKind() === SyntaxKind.PropertyAssignment) {
            const init = (at as PropertyAssignment).getInitializer()
            if (init?.getKind() === SyntaxKind.ObjectLiteralExpression) return init as ObjectLiteralExpression
        }
    }
    // meta exists but no argTypes: create one on the first meta that has a `component` prop
    for (const m of metas) {
        if (m.getProperty('component')) {
            const added = m.addPropertyAssignment({ name: 'argTypes', initializer: '{}' })
            return added.getInitializer() as ObjectLiteralExpression
        }
    }
    return null
}

function esc(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function humanize(name: string): string {
    const words = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()
    return words.charAt(0).toUpperCase() + words.slice(1) + '.'
}

function categoryFor(name: string, isAxis: boolean): string {
    if (isAxis) return 'Appearance'
    if (/^on[A-Z]/.test(name)) return 'Behavior'
    if (/^aria|^role$|label|accessible/i.test(name)) return 'Accessibility'
    if (/^(as|id|className|style|ref)$/.test(name)) return 'Advanced'
    return 'Content'
}

function entryFor(name: string, info: PropInfo | undefined, isAxis: boolean, report: string[]): string {
    const cat = categoryFor(name, isAxis)
    if (!info) {
        // Inherited / passthrough (not on the local interface): hide the row.
        return `{ table: { disable: true } }`
    }
    const t = info.typeText
    const isFn = /^on[A-Z]/.test(name) || /=>/.test(t)
    if (isFn) return `{ action: "${esc(name)}", table: { disable: true } }`
    if (/ReactNode|ReactElement|Ref<|CSSProperties|ElementType|ComponentType|HTMLElement/.test(t)) {
        return `{ table: { disable: true } }`
    }
    let desc = info.jsdoc
    if (!desc) {
        desc = humanize(name)
        report.push(`REVIEW description: ${name}`)
    }
    const descProp = `description: "${esc(desc)}"`
    const dv = info.defaultTag ? `, defaultValue: { summary: "${esc(info.defaultTag)}" }` : ''
    const table = `table: { category: "${cat}"${dv} }`
    if (info.unionValues.length >= 2) {
        const kind = info.unionValues.length <= 4 ? 'inline-radio' : 'select'
        const opts = info.unionValues.map((v) => `"${esc(v)}"`).join(', ')
        return `{ control: { type: "${kind}" }, options: [${opts}], ${descProp}, ${table} }`
    }
    if (/^boolean$/.test(t)) return `{ control: "boolean", ${descProp}, ${table} }`
    if (/^number$/.test(t)) return `{ control: "number", ${descProp}, ${table} }`
    if (/^string$/.test(t) || /^string\s*\|/.test(t)) return `{ control: "text", ${descProp}, ${table} }`
    if (/\[\]$|Array<|Record<|^\{/.test(t)) return `{ control: "object", ${descProp}, ${table} }`
    return `{ control: false, ${descProp}, ${table} }`
}

const project = new Project({ skipAddingFilesFromTsConfig: true })
const report: string[] = []
let filesTouched = 0
let entriesAdded = 0

for (const root of ROOTS) {
    if (!existsSync(root)) continue
    for (const dir of readdirSync(root)) {
        const contractPath = `${root}/${dir}/${dir}.contract.json`
        const storiesPath = `${root}/${dir}/${dir}.stories.tsx`
        const tsxPath = `${root}/${dir}/${dir}.tsx`
        if (!existsSync(contractPath) || !existsSync(storiesPath) || !existsSync(tsxPath)) continue
        const contract = JSON.parse(readFileSync(contractPath, 'utf8'))
        const exempt: string[] = contract.argTypesProxyExempt ?? []
        if (!exempt.length) continue
        const storiesSf = project.addSourceFileAtPath(storiesPath)
        const tsxSf = project.addSourceFileAtPath(tsxPath)
        const argTypesObj = metaArgTypes(storiesSf)
        if (!argTypesObj) {
            report.push(`SKIP ${dir}: no meta/argTypes object found`)
            continue
        }
        const existing = new Set(
            argTypesObj.getProperties().map((p) => (p as unknown as { getName?: () => string }).getName?.()?.replace(/^["']|["']$/g, '') ?? ''),
        )
        const propsInfo = collectPropsInfo(tsxSf, dir)
        const axes = Object.keys(contract.variants ?? {})
        let added = 0
        for (const name of exempt) {
            if (existing.has(name)) continue
            const key = name
            argTypesObj.addPropertyAssignment({
                name: key,
                initializer: entryFor(name, propsInfo.get(name), axes.includes(name), report),
            })
            added += 1
        }
        delete contract.argTypesProxyExempt
        writeFileSync(contractPath, JSON.stringify(contract, null, 4) + '\n')
        if (added > 0) storiesSf.saveSync()
        filesTouched += 1
        entriesAdded += added
        console.log(`${dir}: +${added} argTypes, exemption list removed (${exempt.length})`)
    }
}

console.log(`\n${filesTouched} components, ${entriesAdded} argTypes entries added`)
if (report.length) {
    console.log(`\n${report.length} item(s) need review:`)
    for (const r of report) console.log('  ' + r)
}
