/**
 * Prunes stale entries from contract argTypesProxyExempt lists.
 *
 * An exemption is stale when the prop it mutes HAS a real meta.argTypes entry
 * in the component's stories — the exemption then does nothing except blind
 * the coverage gate to future regressions. validate:components errors on
 * stale entries; this script removes them mechanically.
 *
 * Usage: npx tsx scripts/design-system/prune-argtypes-exemptions.ts [--check]
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Project, SyntaxKind } from 'ts-morph'
import type { ObjectLiteralExpression, PropertyAssignment, SourceFile } from 'ts-morph'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOTS = [
    resolve(__dirname, '../../nextjs-app/shared/components'),
    resolve(__dirname, '../../nextjs-app/shared/patterns'),
]

function candidateMetaObjects(sf: SourceFile): ObjectLiteralExpression[] {
    const out: ObjectLiteralExpression[] = []
    const unwrap = (init: import('ts-morph').Expression | undefined): ObjectLiteralExpression | null => {
        if (!init) return null
        if (init.getKind() === SyntaxKind.ObjectLiteralExpression) return init as ObjectLiteralExpression
        if (init.getKind() === SyntaxKind.SatisfiesExpression || init.getKind() === SyntaxKind.AsExpression) {
            return init.getChildrenOfKind(SyntaxKind.ObjectLiteralExpression)[0] ?? null
        }
        return null
    }
    for (const v of sf.getVariableDeclarations()) {
        const obj = unwrap(v.getInitializer())
        if (obj) out.push(obj)
    }
    const dflt = sf.getExportAssignment((a) => !a.isExportEquals())
    const dfltObj = unwrap(dflt?.getExpression())
    if (dfltObj) out.push(dfltObj)
    return out
}

function extractArgTypeKeys(sf: SourceFile): Set<string> | null {
    for (const obj of candidateMetaObjects(sf)) {
        const argTypesProp = obj.getProperty('argTypes')
        if (!argTypesProp || argTypesProp.getKind() !== SyntaxKind.PropertyAssignment) continue
        const argTypesInit = (argTypesProp as PropertyAssignment).getInitializer()
        if (!argTypesInit || argTypesInit.getKind() !== SyntaxKind.ObjectLiteralExpression) continue
        const keys = new Set<string>()
        for (const p of (argTypesInit as ObjectLiteralExpression).getProperties()) {
            const name = (p as unknown as { getName?: () => string }).getName?.()
            if (name) keys.add(name.replace(/^["']|["']$/g, ''))
        }
        return keys
    }
    return null
}

const checkOnly = process.argv.includes('--check')
const project = new Project({ skipAddingFilesFromTsConfig: true })
let prunedTotal = 0
let staleComponents = 0

for (const root of ROOTS) {
    if (!existsSync(root)) continue
    for (const dir of readdirSync(root)) {
        const contractPath = `${root}/${dir}/${dir}.contract.json`
        const storiesPath = `${root}/${dir}/${dir}.stories.tsx`
        if (!existsSync(contractPath) || !existsSync(storiesPath)) continue
        const contract = JSON.parse(readFileSync(contractPath, 'utf8'))
        const exempt: string[] = contract.argTypesProxyExempt ?? []
        if (!exempt.length) continue
        const sf = project.addSourceFileAtPath(storiesPath)
        const keys = extractArgTypeKeys(sf)
        if (!keys) continue
        const stale = exempt.filter((k) => keys.has(k))
        if (!stale.length) continue
        staleComponents += 1
        prunedTotal += stale.length
        if (checkOnly) {
            console.log(`${dir}: ${stale.length} stale exemption(s): ${stale.join(', ')}`)
            continue
        }
        const remaining = exempt.filter((k) => !keys.has(k))
        if (remaining.length) contract.argTypesProxyExempt = remaining
        else delete contract.argTypesProxyExempt
        writeFileSync(contractPath, JSON.stringify(contract, null, 4) + '\n')
        console.log(`${dir}: pruned ${stale.length} (${remaining.length} remain)`)
    }
}

console.log(`\n${checkOnly ? 'Found' : 'Pruned'} ${prunedTotal} stale exemption(s) across ${staleComponents} component(s)`)
if (checkOnly && prunedTotal > 0) process.exit(1)
