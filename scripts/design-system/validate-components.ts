#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { basename, join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    Project,
    SyntaxKind,
    type SourceFile,
    type CallExpression,
    type ObjectLiteralExpression,
    type PropertyAssignment,
} from 'ts-morph'
import { VARIANT_PROP_NAMES } from './cva-sync-lib.mjs'
import { validateContractSchema } from './contract-schema-lib.mjs'
import { docFieldErrors } from './doc-fields-rules.mjs'
import { docTierFor } from './doc-tiers.mjs'

type VariantMap = Record<string, { values: string[]; default: string | null }>

// Components whose Controls panel is derived at runtime by the preview-level
// enhancers (.storybook/lib/controls-autogen.ts). The static argTypes gate
// does not apply to them; audit:controls (+ --effects) enforces the surface.
const CONTROLS_AUTOGEN: Set<string> = (() => {
    try {
        const p = resolve(dirname(fileURLToPath(import.meta.url)), '../../.storybook/controls-autogen.json')
        return new Set(JSON.parse(readFileSync(p, 'utf8')).components as string[])
    } catch {
        return new Set()
    }
})()

function normalizeVariantToken(value: string | null | undefined): string | null {
    if (value == null) return null
    return String(value).replace(/^["']+|["']+$/g, '')
}

interface ExtractedCva {
    fnName: string
    variants: VariantMap
}

interface ExtractedComponent {
    interfaceName: string | null
    variantsFnName: string | null
    variants: VariantMap
    /** All CVA calls in the file, keyed by their variable name. Includes the root one. */
    allCvas: ExtractedCva[]
    hasAsChild: boolean
    slotProps: string[]
    /** Every prop the root interface / type alias declares directly (not inherited HTML attrs). Used by the selfish-component rule. */
    declaredPropNames: string[]
    exportedNames: string[]
}

function extractCvaConfig(call: CallExpression): VariantMap {
    const variants: VariantMap = {}
    const configArg = call.getArguments()[1]
    if (!configArg || configArg.getKind() !== SyntaxKind.ObjectLiteralExpression) return variants
    const config = configArg as ObjectLiteralExpression

    const variantsProp = config.getProperty('variants')
    const defaultsProp = config.getProperty('defaultVariants')

    if (variantsProp && variantsProp.getKind() === SyntaxKind.PropertyAssignment) {
        const variantsObj = (variantsProp as any).getInitializer() as ObjectLiteralExpression
        for (const axisProp of variantsObj.getProperties()) {
            if (axisProp.getKind() !== SyntaxKind.PropertyAssignment) continue
            const axisName = (axisProp as any).getName()
            const axisValues = (axisProp as any).getInitializer() as ObjectLiteralExpression
            const valueNames = axisValues
                .getProperties()
                .filter((p: any) => p.getKind() === SyntaxKind.PropertyAssignment)
                .map((p: any) => normalizeVariantToken((p as any).getName())!)
                .filter(Boolean)
            variants[axisName] = { values: valueNames, default: null }
        }
    }
    if (defaultsProp && defaultsProp.getKind() === SyntaxKind.PropertyAssignment) {
        const defaultsObj = (defaultsProp as any).getInitializer() as ObjectLiteralExpression
        for (const defProp of defaultsObj.getProperties()) {
            if (defProp.getKind() !== SyntaxKind.PropertyAssignment) continue
            const axisName = (defProp as any).getName()
            const initializer = (defProp as any).getInitializer()
            let defValue: string | null = null
            // String literal default ("primary", "md", etc.)
            if (typeof initializer?.getLiteralText === 'function') {
                const lit = initializer.getLiteralText()
                if (lit !== undefined) defValue = lit
            }
            // Boolean literal default (true/false) — CVA supports boolean
            // variant values (e.g. `inset: { true: '...', false: '' }`) and
            // AST nodes for the keyword don't have getLiteralText.
            if (defValue === null) {
                const kind = initializer?.getKind?.()
                if (kind === SyntaxKind.TrueKeyword) defValue = 'true'
                else if (kind === SyntaxKind.FalseKeyword) defValue = 'false'
            }
            if (variants[axisName]) variants[axisName].default = normalizeVariantToken(defValue)
        }
    }
    return variants
}

export function extractComponentFromSourceFile(
    sf: SourceFile,
    tsxPath?: string,
    /**
     * Component to extract, when it is not the one the filename implies. A file may
     * export more than one component (SelectableCard.tsx also exports
     * SelectableCardGroup); without this the basename wins and the caller silently gets
     * the sibling's CVA variants and declared-prop count under the wrong name.
     */
    componentNameOverride?: string,
): ExtractedComponent {
    const componentName = componentNameOverride
        ?? basename(tsxPath ?? sf.getFilePath(), '.tsx')
    return extractComponentInner(sf, componentName)
}

export function extractComponent(tsxPath: string): ExtractedComponent {
    const project = new Project({
        compilerOptions: { allowJs: false, jsx: 4 /* Preserve */ },
        useInMemoryFileSystem: false,
        skipAddingFilesFromTsConfig: true,
    })
    const sf: SourceFile = project.addSourceFileAtPath(tsxPath)
    return extractComponentInner(sf, basename(tsxPath, '.tsx'))
}

function extractComponentInner(sf: SourceFile, componentName: string): ExtractedComponent {
    const expectedPropsName = `${componentName}Props`

    // Accept either `interface XProps` or `type XProps = ...` for the root Props
    // declaration. Type aliases are required when extending a Radix primitive's
    // discriminated-union type (TS interface can't extend a union).
    const exportedInterfaces = sf.getInterfaces().filter(i => i.isExported())
    const exportedTypeAliases = sf.getTypeAliases().filter(t => t.isExported())
    const propsInterface = exportedInterfaces.find(i => i.getName() === expectedPropsName)
    const propsTypeAlias = exportedTypeAliases.find(t => t.getName() === expectedPropsName)
    const firstInterface = exportedInterfaces[0]
    const firstTypeAlias = exportedTypeAliases[0]

    let rootKind: 'interface' | 'type' | null = null
    let interfaceName: string | null = null
    let rootInterface = firstInterface
    let rootTypeAlias = firstTypeAlias
    if (propsInterface) {
        rootKind = 'interface'
        interfaceName = expectedPropsName
        rootInterface = propsInterface
    } else if (propsTypeAlias) {
        rootKind = 'type'
        interfaceName = expectedPropsName
        rootTypeAlias = propsTypeAlias
    } else if (firstInterface && firstTypeAlias) {
        rootKind =
            firstInterface.getStart() < firstTypeAlias.getStart() ? 'interface' : 'type'
    } else if (firstInterface) {
        rootKind = 'interface'
    } else if (firstTypeAlias) {
        rootKind = 'type'
    }
    if (!interfaceName && rootKind === 'interface') interfaceName = rootInterface!.getName()
    else if (!interfaceName && rootKind === 'type') interfaceName = rootTypeAlias!.getName()

    // For type aliases we resolve the alias's Type and walk its properties via
    // the type checker so intersections (`A & B`) and discriminated unions
    // (`{ iconOnly: true; … } | { iconOnly?: false }`) are flattened the same
    // way an interface would present them to `getProperties`.
    //
    // `locallyDeclared` flags whether ANY of the property's declarations
    // originate in the component's own .tsx file. Props inherited via
    // intersection from `React.HTMLAttributes` etc. are declared in
    // `node_modules/@types/react/...` and have `locallyDeclared === false`.
    // The selfish-component rule only fires on locally-declared props so
    // banned names that happen to exist on HTMLAttributes (e.g. `content`)
    // do not produce false positives on type-alias components.
    const collectTypeAliasPropTexts = (): Array<{ name: string; typeText: string; locallyDeclared: boolean }> => {
        if (rootKind !== 'type' || !rootTypeAlias) return []
        const resolved = rootTypeAlias.getType()
        const ownPath = sf.getFilePath()
        const seen = new Set<string>()
        const out: Array<{ name: string; typeText: string; locallyDeclared: boolean }> = []
        for (const sym of resolved.getProperties()) {
            const name = sym.getName()
            if (seen.has(name)) continue
            seen.add(name)
            const decls = sym.getDeclarations()
            let typeText = ''
            for (const d of decls) {
                const asSig = (d as unknown as { getTypeNode?: () => { getText: () => string } | undefined })
                    .getTypeNode?.()
                if (asSig) {
                    typeText = asSig.getText()
                    break
                }
            }
            const locallyDeclared = decls.some(d => d.getSourceFile().getFilePath() === ownPath)
            out.push({ name, typeText, locallyDeclared })
        }
        return out
    }

    const typeAliasProps = collectTypeAliasPropTexts()

    const hasAsChild =
        rootKind === 'interface'
            ? rootInterface!.getProperty('asChild') !== undefined
            : typeAliasProps.some(p => p.name === 'asChild')

    // `children` is the default composition, not a named slot — skip it when
    // collecting slot props so manifests only need to declare true named slots
    // like `icon`, `leading`, `trailing`. Type-alias path also resolves through
    // inherited HTML attributes where `children` appears even when the author
    // did not declare it directly.
    const slotProps: string[] = []
    const declaredPropNames: string[] = []
    const pushIfSlot = (name: string) => {
        if (name === 'children') return
        slotProps.push(name)
    }
    if (rootKind === 'interface') {
        // Interface path: getProperties() returns ONLY directly declared props,
        // not inherited (HTML attrs reached via `extends` are not enumerated).
        // Perfect for the selfish-component rule which only cares about
        // author-declared content props.
        for (const prop of rootInterface!.getProperties()) {
            const propName = prop.getName()
            declaredPropNames.push(propName)
            const type = prop.getTypeNode()?.getText() ?? ''
            if (type.includes('ReactNode')) pushIfSlot(propName)
        }
    } else if (rootKind === 'type') {
        // Type-alias path: typeAliasProps.locallyDeclared filters out
        // intersection-inherited props (HTMLAttributes etc. from
        // node_modules) so declaredPropNames matches the interface-path
        // semantics: only props the author wrote in this file. The slot-
        // detection still runs across all resolved props because slot props
        // (`leading`, `trailing`, etc.) are always author-declared, never
        // inherited from HTML attrs.
        for (const prop of typeAliasProps) {
            if (prop.locallyDeclared) declaredPropNames.push(prop.name)
            if (prop.typeText.includes('ReactNode')) pushIfSlot(prop.name)
        }
    }

    // Walk ALL cva() calls. First one is the root; subsequent ones are subparts.
    const allCvas: ExtractedCva[] = []
    for (const varDecl of sf.getVariableDeclarations()) {
        const init = varDecl.getInitializer()
        if (!init || init.getKind() !== SyntaxKind.CallExpression) continue
        const call = init as CallExpression
        if (call.getExpression().getText() !== 'cva') continue
        allCvas.push({ fnName: varDecl.getName(), variants: extractCvaConfig(call) })
    }

    const variantsFnName = allCvas[0]?.fnName ?? null
    const variants = allCvas[0]?.variants ?? {}

    const exportedNames: string[] = []
    for (const decl of sf.getExportedDeclarations().keys()) {
        exportedNames.push(decl)
    }

    return { interfaceName, variantsFnName, variants, allCvas, hasAsChild, slotProps, declaredPropNames, exportedNames }
}

/**
 * Selfish-component banned props (per ADR-style guidance derived from
 * Daniel Yuschick's "selfish components" thesis: components own appearance
 * and behaviour, not content). Atoms must not accept content-coupled props;
 * use slots (`leading`, `trailing`) and `children` instead.
 *
 * Scope: tier === 'atom' only. Molecules / organisms / patterns / templates
 * routinely orchestrate content and can legitimately accept content props.
 */
const SELFISH_BANNED_ATOM_PROPS = new Set([
    'text',
    'iconLeft',
    'iconRight',
    'leftIcon',
    'rightIcon',
    'content',
])

export interface ValidationResult {
    ok: boolean
    errors: string[]
    /** Components that opted out of the play-function gate via a11y.playFunctionExempt. Listed at the end of the validator run so the gap stays visible. */
    playExempt?: Array<{ name: string; reason: string }>
    /**
     * Components shipping with stub MDX / spec.md prose. Auto-detected from
     * the canonical scaffolder boilerplate ("Production layouts and flows
     * documented in Storybook", "Prefer a smaller primitive when this
     * composition is more than you need", `TODO:` markers in spec.md).
     *
     * Tracked as visible debt — not an error — so honest beta promotion can
     * land in waves without blocking the validator. Each entry disappears
     * automatically when its underlying file stops matching the stub
     * heuristics.
     */
    documentationDebt?: Array<{ name: string; reasons: string[] }>
}

/**
 * Stub-content heuristics for the Honest Beta tracker.
 *
 * MDX phrases listed here are produced ONLY by the `scaffold-component.mjs`
 * boilerplate — no human-authored "In use" / "When not to use" prose ever
 * happens to use these literal sentences, so a positive match is a reliable
 * stub signal. spec.md detection is simpler: a `TODO:` marker anywhere means
 * the canonical Intent / Interaction contract / Do-don't / Design notes
 * sections were left as scaffolder placeholders.
 */
const STUB_MDX_PHRASES = [
    'Production layouts and flows documented in Storybook',
    'Prefer a smaller primitive when this composition is more than you need',
    'Promote to stable after AT snapshots and a documented production consumer',
]
const STUB_SPEC_MARKER = /\bTODO\b:/

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadValidator() {
    return validateContractSchema
}

function isComponentDir(dir: string): boolean {
    return statSync(dir).isDirectory()
}

/**
 * Resolve the default-export meta object from a stories file. Handles:
 *
 *   export default { … }
 *   export default meta  // const meta = { … } satisfies Meta<…>
 */
function peelToMetaObject(node: unknown): ObjectLiteralExpression | null {
    if (!node || typeof (node as { getKind?: () => SyntaxKind }).getKind !== 'function') return null
    let candidate = node as { getKind: () => SyntaxKind; getExpression?: () => unknown }
    for (let depth = 0; depth < 4; depth++) {
        if (candidate.getKind() === SyntaxKind.SatisfiesExpression || candidate.getKind() === SyntaxKind.AsExpression) {
            if (typeof candidate.getExpression !== 'function') return null
            candidate = candidate.getExpression() as typeof candidate
            continue
        }
        break
    }
    if (candidate.getKind() === SyntaxKind.ObjectLiteralExpression) {
        return candidate as unknown as ObjectLiteralExpression
    }
    return null
}

function extractMetaObject(sf: SourceFile): ObjectLiteralExpression | null {
    for (const [exportName, decls] of sf.getExportedDeclarations()) {
        if (exportName !== 'default') continue
        for (const decl of decls) {
            const direct = peelToMetaObject(decl)
            if (direct) return direct
            if (decl.getKind() === SyntaxKind.ExportAssignment) {
                const peeled = peelToMetaObject((decl as unknown as { getExpression: () => unknown }).getExpression())
                if (peeled) return peeled
            }
            const init = (decl as unknown as { getInitializer?: () => unknown }).getInitializer?.()
            const peeled = peelToMetaObject(init)
            if (peeled) return peeled
        }
    }
    return null
}

/** Returns the `meta.argTypes` object literal, or null when missing / non-literal. */
function extractArgTypesObject(metaObj: ObjectLiteralExpression): ObjectLiteralExpression | null {
    const argTypesProp = metaObj.getProperty('argTypes')
    if (!argTypesProp || argTypesProp.getKind() !== SyntaxKind.PropertyAssignment) return null
    const init = (argTypesProp as PropertyAssignment).getInitializer()
    if (!init || init.getKind() !== SyntaxKind.ObjectLiteralExpression) return null
    return init
}

/** Top-level keys on `meta.argTypes`. Spread entries are not resolved. */
function argTypeKeysFromObject(argTypesObj: ObjectLiteralExpression): Set<string> {
    const keys = new Set<string>()
    for (const prop of argTypesObj.getProperties()) {
        if (prop.getKind() !== SyntaxKind.PropertyAssignment && prop.getKind() !== SyntaxKind.ShorthandPropertyAssignment) {
            continue
        }
        const name = (prop as unknown as { getName: () => string }).getName?.()
        if (name) keys.add(name)
    }
    return keys
}

function isArgTypeDisableOnly(obj: ObjectLiteralExpression): boolean {
    const tableProp = obj.getProperty('table')
    if (!tableProp || tableProp.getKind() !== SyntaxKind.PropertyAssignment) return false
    const tableInit = (tableProp as PropertyAssignment).getInitializer()
    if (!tableInit || tableInit.getKind() !== SyntaxKind.ObjectLiteralExpression) return false
    const disableProp = (tableInit as ObjectLiteralExpression).getProperty('disable')
    if (!disableProp) return false
    if (!/disable\s*:\s*true/.test(disableProp.getText())) return false
    return obj.getProperty('control') === undefined
}

function argTypeHasDefaultValueSummary(obj: ObjectLiteralExpression): boolean {
    const tableProp = obj.getProperty('table')
    if (tableProp?.getKind() === SyntaxKind.PropertyAssignment) {
        const tableInit = (tableProp as PropertyAssignment).getInitializer()
        if (tableInit?.getKind() === SyntaxKind.ObjectLiteralExpression) {
            const dv = (tableInit as ObjectLiteralExpression).getProperty('defaultValue')
            if (dv && /summary/.test(dv.getText())) return true
        }
    }
    const topDv = obj.getProperty('defaultValue')
    return topDv !== undefined && /summary/.test(topDv.getText())
}

/**
 * Rule 3 (beta+): each documented control needs `description`; variant axes need
 * `table.defaultValue.summary` so the Controls panel shows defaults.
 */
function validateArgTypesDocumentation(
    argTypesObj: ObjectLiteralExpression,
    declaredVariants: string[],
    errors: string[],
    name: string,
    status: string,
): void {
    for (const prop of argTypesObj.getProperties()) {
        if (prop.getKind() !== SyntaxKind.PropertyAssignment) continue
        const key = (prop as PropertyAssignment).getName()
        const init = (prop as PropertyAssignment).getInitializer()
        if (!init || init.getKind() !== SyntaxKind.ObjectLiteralExpression) continue
        const obj = init as ObjectLiteralExpression
        if (!isArgTypeDisableOnly(obj) && !obj.getProperty('description')) {
            errors.push(
                `${name}.stories.tsx: argTypes.${key} requires a description (${status} promotion gate — Controls panel documentation).`,
            )
        }
        if (declaredVariants.includes(key) && !argTypeHasDefaultValueSummary(obj)) {
            errors.push(
                `${name}.stories.tsx: argTypes.${key} requires table.defaultValue.summary (${status} promotion gate — variant axis default).`,
            )
        }
    }
}

function extractArgTypeKeys(sf: SourceFile): Set<string> | null {
    const metaObj = extractMetaObject(sf)
    if (!metaObj) return null
    const argTypesObj = extractArgTypesObject(metaObj)
    if (!argTypesObj) return null
    return argTypeKeysFromObject(argTypesObj)
}

export function validateComponentsDir(root: string): ValidationResult {
    const errors: string[] = []
    const playExempt: Array<{ name: string; reason: string }> = []
    const documentationDebt: Array<{ name: string; reasons: string[] }> = []
    if (!existsSync(root)) {
        return { ok: false, errors: [`components dir does not exist: ${root}`] }
    }
    const validateSchema = loadValidator()

    for (const entry of readdirSync(root)) {
        const dir = join(root, entry)
        if (!isComponentDir(dir)) continue
        const name = entry
        const manifestPath = join(dir, `${name}.contract.json`)

        if (!existsSync(manifestPath)) {
            continue
        }

        let manifest: any
        try {
            manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
        } catch (err) {
            errors.push(`${name}: invalid JSON in ${name}.contract.json: ${(err as Error).message}`)
            continue
        }

        const schemaResult = validateSchema(manifest)
        if (!schemaResult.ok) {
            for (const err of schemaResult.errors ?? []) {
                errors.push(`${name}.contract.json: ${err.instancePath || '/'} ${err.message}`)
            }
            continue
        }

        // Spec.md: must exist and contain the 5 required sections
        const specPath = join(dir, `${name}.spec.md`)
        if (!existsSync(specPath)) {
            errors.push(`${name}: missing ${name}.spec.md`)
        } else {
            const spec = readFileSync(specPath, 'utf8')
            const requiredSections = [
                '## Intent',
                '## Interaction contract',
                '## Do / don\'t',
                '## Design notes',
            ]
            for (const section of requiredSections) {
                if (!spec.includes(section)) {
                    errors.push(`${name}.spec.md: missing section "${section}"`)
                }
            }
        }

        // Cross-field: variant defaults must be in values
        for (const [axis, def] of Object.entries<any>(manifest.variants)) {
            if (!def.values.includes(def.default)) {
                errors.push(`${name}.contract.json: ${axis} default "${def.default}" is not in values [${def.values.join(', ')}]`)
            }
        }

        // Cross-field: manifest name matches folder name
        if (manifest.name !== name) {
            errors.push(`${name}.contract.json: manifest.name "${manifest.name}" does not match folder "${name}"`)
        }

        // Doc-fields ratchet (Task 10): silent until a contract adopts `usage`,
        // then enforces the doc-tier field set. Status-agnostic — runs before
        // the alpha early-continue below so alpha components that opt in to
        // `usage` early are held to the same ratchet.
        errors.push(...docFieldErrors(manifest, docTierFor(name)))

        if (manifest.status === 'alpha') {
            continue
        }

        // Status lifecycle gates
        //
        // Tightened on 2026-05-02 in response to the maturity assessment that
        // caught 7/12 beta components actually failing their own a11y gate.
        // The contract claims drove the promotion lifecycle, but several flags
        // could be flipped to true without the corresponding evidence existing.
        // The new rules below close those holes:
        //   - lightDarkVerified MUST be true at beta (Icon shipped beta with
        //     lightDarkVerified=false in 0.7.0 because there was no gate).
        //   - The ForcedColors story MUST be in requiredStories at beta
        //     (forcedColorsVerified=true is meaningless without the story).
        //   - The Example story MUST be in requiredStories at beta (the
        //     "what does this look like in production" demo is part of the
        //     credibility surface; missing it makes consumers infer from
        //     thin variant stories).
        if ((manifest.status === 'beta' || manifest.status === 'stable') && manifest.figma === null) {
            errors.push(`${name}.contract.json: ${manifest.status} requires figma to be a URL (manifest has null)`)
        }
        if ((manifest.status === 'beta' || manifest.status === 'stable') && manifest.a11y.forcedColorsVerified !== true) {
            errors.push(`${name}.contract.json: ${manifest.status} requires a11y.forcedColorsVerified to be true (verify the ForcedColors Storybook story before promotion)`)
        }
        if ((manifest.status === 'beta' || manifest.status === 'stable') && (manifest.a11y as any).motion === true && (manifest.a11y as any).reducedMotion !== true) {
            errors.push(`${name}.contract.json: ${manifest.status} requires a11y.reducedMotion to be true when a11y.motion=true (verify the component honors prefers-reduced-motion before promotion)`)
        }
        if ((manifest.status === 'beta' || manifest.status === 'stable') && manifest.lightDarkVerified !== true) {
            errors.push(`${name}.contract.json: ${manifest.status} requires lightDarkVerified to be true (manually verify the component renders correctly in both light and dark theme before promotion)`)
        }
        if ((manifest.status === 'beta' || manifest.status === 'stable') && !(manifest.requiredStories ?? []).includes('Example')) {
            errors.push(`${name}.contract.json: ${manifest.status} requires "Example" in requiredStories (the canonical "what this looks like in production" composition is part of the credibility surface)`)
        }
        if ((manifest.status === 'beta' || manifest.status === 'stable') && !(manifest.requiredStories ?? []).includes('ForcedColors')) {
            errors.push(`${name}.contract.json: ${manifest.status} requires "ForcedColors" in requiredStories (the forced-colors verification story must exist when a11y.forcedColorsVerified is true)`)
        }
        if (manifest.status === 'stable' && manifest.a11y.reviewed !== true) {
            errors.push(`${name}.contract.json: stable requires a11y.reviewed to be true`)
        }

        // Deprecation gate (docs/design-system/deprecation-policy.md R2): the
        // tombstone text is mandatory — it outlives the code in the policy log.
        if (manifest.status === 'deprecated') {
            const reason = (manifest as { deprecatedReason?: unknown }).deprecatedReason
            if (typeof reason !== 'string' || reason.trim().length < 20) {
                errors.push(
                    `${name}.contract.json: deprecated requires a substantive deprecatedReason naming the successor component(s) (see docs/design-system/deprecation-policy.md)`,
                )
            }
        }

        // Stable promotion gate: accessibility-tree snapshot evidence
        // (replaced the manual screenReaderVerified gate on 2026-05-03 —
        // automating real SR audio is infeasible without paid SaaS, but
        // the AT tree IS what every SR narrates so snapshotting it is
        // the practical equivalent gate).
        //
        // Stable requires:
        //   - a11y.accessibilityTreeVerified = true
        //   - at least one __a11y-snapshots__/<id>.yaml file exists
        //     for any of the component's required stories
        //
        // The snapshot is captured per story by test-runner postVisit
        // (Playwright locator.ariaSnapshot) and committed; future ARIA
        // regressions fail CI on diff. screenReaderVerified remains as
        // an OPTIONAL aspirational signal for components that have had
        // additional manual / paid SR walkthroughs — it is NOT a gate.
        if (manifest.status === 'stable') {
            if ((manifest.a11y as any).accessibilityTreeVerified !== true) {
                errors.push(`${name}.contract.json: stable requires a11y.accessibilityTreeVerified to be true (capture AT snapshots for every required story via DSHARP_UPDATE_A11Y_SNAPSHOTS=1 pnpm test:stories, then commit the __a11y-snapshots__/<id>.yaml files)`)
            }
            // Verify at least one snapshot file exists for this component.
            // Snapshot ids look like 'atoms-button--primary' (kebab-cased
            // story title + variant) — we match by component name lower-
            // cased anywhere in the filename.
            const snapDir = join(dir, '__a11y-snapshots__')
            if (existsSync(snapDir)) {
                const lower = name.toLowerCase()
                const hasAny = readdirSync(snapDir).some((f) => f.toLowerCase().includes(`-${lower}--`) || f.toLowerCase().includes(`--${lower}-`) || f.toLowerCase().startsWith(`${lower}-`))
                if (!hasAny) {
                    errors.push(`${name}.contract.json: stable requires at least one accessibility-tree snapshot under ${name}/__a11y-snapshots__/ (none found). Run DT_UPDATE_A11Y_SNAPSHOTS=1 npm run test:stories:ci to populate, then commit.`)
                }
            } else {
                errors.push(`${name}.contract.json: stable requires ${name}/__a11y-snapshots__/ with a snapshot for this component. Run DT_UPDATE_A11Y_SNAPSHOTS=1 npm run test:stories:ci to populate, then commit.`)
            }

            // Real-browser forced-colors verification (replaces the
            // ambiguous "real Windows HC" manual step in the docs row).
            // Playwright's emulateMedia({forcedColors: 'active'}) flips
            // Chromium's actual forced-colors:active media query — the
            // same flag Windows HC triggers — so a passing test-runner
            // run under that flag IS real-browser HC verification (modulo
            // Windows-specific system-color values, which Chromium emulates).
            if ((manifest.a11y as any).realBrowserForcedColorsVerified !== true) {
                errors.push(`${name}.contract.json: stable requires a11y.realBrowserForcedColorsVerified to be true (run pnpm test:stories:hc; flip to true after that pass succeeds for every required story)`)
            }

            // Production-consumer evidence. "Used in shipping product" is
            // part of the stable contract — without at least one entry,
            // we don't know if a future breaking change has any effect.
            const consumers = (manifest as any).consumers as Array<{ repo: string; path: string; since: string }> | undefined
            if (!consumers || consumers.length === 0) {
                errors.push(`${name}.contract.json: stable requires consumers[] (at least one production consumer documented). Each entry: { repo, path, since: 'YYYY-MM-DD', note? }. Stable means "used in shipping product" — without this we can't reverse-impact-analyse a future breaking change.`)
            }
        }

        // Beta documentation bar (tightened on 2026-05-03 after the
        // chore/true-beta-promotions sweep closed all 47 debt entries).
        // The mechanical gate above (figma + lightDarkVerified +
        // forcedColorsVerified + Example + ForcedColors stories) was the
        // 0.9.0-era bar. With the Carbon-style MDX page + a11y.reviewed
        // now landed for every beta-tagged component, the validator can
        // enforce the documentation bar honestly.
        //
        // To promote a component to beta now, the consumer must:
        //   - meet the mechanical gate above
        //   - flip a11y.reviewed to true (with an a11y.reviewedNote
        //     recording what was checked + known limitations)
        //   - ship a Component.mdx file in the same folder following the
        //     canonical Carbon-style structure (see Button.mdx)
        //
        // See packages/react/AGENTS.md "Status lifecycle" for the full
        // ladder; pnpm beta-debt prints the current debt list (now
        // empty as of 2026-05-03).
        if (manifest.status === 'beta' || manifest.status === 'stable') {
            if (manifest.a11y.reviewed !== true) {
                errors.push(`${name}.contract.json: ${manifest.status} requires a11y.reviewed to be true (run a code-level a11y review covering keyboard contract, ARIA, focus management, reduced motion; record evidence in a11y.reviewedNote)`)
            }
            if (manifest.a11y.reviewed === true && (manifest.a11y as any).reviewedNote === undefined) {
                errors.push(`${name}.contract.json: ${manifest.status} with a11y.reviewed=true requires a11y.reviewedNote (free-text evidence note recording what was checked, date, reviewer, tools, known limitations)`)
            }
            const mdxPath = join(dir, `${name}.mdx`)
            // Frame adoption (Astryx Phase 2): once a contract adopts the doc
            // fields (`usage` present — same predicate as the doc-fields
            // ratchet), the component's docs page is the DT autodocs frame
            // (.storybook/blocks/DtDocsPage) rendered from the contract, and
            // the Carbon-style MDX bar is superseded by the stricter
            // docFieldErrors bar above. A colocated MDX page must then be
            // REMOVED: it would attach a second docs page to the same meta,
            // which breaks the Storybook index with a docs-id conflict
            // (hard 500 on /index.json). Migrate unique MDX prose into the
            // contract (usage.*, a11y.ariaRequirements, forbiddenUse) before
            // deleting, and tag the stories meta with "autodocs".
            const frameAdopted = Boolean((manifest as any).usage)
            if (frameAdopted) {
                if (existsSync(mdxPath)) {
                    errors.push(`${name}.mdx: contract has adopted doc fields (usage present), so docs render via the DT autodocs frame; delete ${name}.mdx after migrating unique prose into the contract (a second docs page on the same meta breaks the Storybook index)`)
                }
            } else if (!existsSync(mdxPath)) {
                errors.push(`${name}.contract.json: ${manifest.status} requires a Carbon-style MDX page at ${name}.mdx (When to use / When not to use / Anatomy / Variants / Accessibility / Keyboard / Common mistakes / Promotion notes — see Button.mdx for the canonical shape) or contract doc-field adoption (usage/bestPractices/keywords/dense) with the autodocs frame`)
            } else {
                // MDX heading enforcement: verify the canonical Carbon-style
                // structure is in place. Required headings (verified by line-
                // start regex on the .mdx source):
                //   - h1 title (the component name)
                //   - ## When to use
                //   - ## When not to use
                //   - ## Accessibility
                //   - ## Promotion notes
                // Other headings (Anatomy, Variants, Keyboard, Content
                // guidance, Related components, Common mistakes) are
                // recommended but not required — display-only atoms (Badge,
                // Container, Skeleton, etc.) genuinely don't need an
                // Anatomy or Keyboard section, so the validator stays
                // honest about which headings are universally applicable.
                //
                // See packages/react/AGENTS.md "Status lifecycle" for the
                // full bar.
                const mdxText = readFileSync(mdxPath, 'utf-8')
                const requiredHeadings: Array<[RegExp, string]> = [
                    [/^# /m, 'h1 component title (`# ComponentName`)'],
                    // `## In use` and `## How to use` were added as a
                    // 2026-05-05 standard (canonical examples authored on
                    // Button, Input, Card, Badge, Logo; swept across the
                    // remaining 75 components in 0.36.0). `In use` covers
                    // the canonical "in production" composition with a
                    // deep link to the Example story, common compositions
                    // to crib from, and one anti-pattern. `How to use`
                    // covers the import statement, minimal code
                    // (controlled / uncontrolled), required consumer
                    // wiring, and theme + forced-colors notes. Both are
                    // gated at beta+ so future additions can't ship
                    // without them. See Button.mdx for the canonical
                    // shape.
                    [/^## In use/m, '`## In use`'],
                    [/^## How to use/m, '`## How to use`'],
                    [/^## When to use/m, '`## When to use`'],
                    [/^## When not to use/m, '`## When not to use`'],
                    [/^## Accessibility/m, '`## Accessibility`'],
                    [/^## Promotion notes/m, '`## Promotion notes`'],
                ]
                for (const [pattern, label] of requiredHeadings) {
                    if (!pattern.test(mdxText)) {
                        errors.push(`${name}.mdx: ${manifest.status} requires the ${label} heading (Carbon-style guidance structure — see Button.mdx)`)
                    }
                }

                // MDX <ComponentMeta status="..."> must agree with the
                // contract.json status. The two are authored in different
                // places (TS scaffolder + manual MDX) and drift silently
                // when one gets bumped without the other — adversarial
                // review on 2026-05-05 surfaced 11 contracts at status=beta
                // while their MDX still said status=alpha. Catch the drift
                // at the contract gate so it can never re-emerge.
                const metaStatusMatch = mdxText.match(/<ComponentMeta[^>]*\bstatus\s*=\s*"([^"]+)"/)
                if (metaStatusMatch) {
                    const mdxStatus = metaStatusMatch[1]
                    if (mdxStatus !== manifest.status) {
                        errors.push(`${name}.mdx: <ComponentMeta status="${mdxStatus}"> disagrees with ${name}.contract.json status "${manifest.status}". The two must stay in sync; pick the canonical state in the contract and update the MDX to match (or vice versa).`)
                    }
                }

                // Honest Beta debt detector: surface stubs as visible debt.
                // Scaffolder boilerplate phrases never appear in human-authored
                // prose, so a positive match here is a high-signal stub.
                const stubReasons: string[] = []
                const matchedPhrases = STUB_MDX_PHRASES.filter((phrase) => mdxText.includes(phrase))
                if (matchedPhrases.length > 0) {
                    stubReasons.push(`stub MDX (matches scaffolder boilerplate: ${matchedPhrases.map((p) => '"' + p.slice(0, 40) + (p.length > 40 ? '…' : '') + '"').join(', ')})`)
                }
                if (existsSync(specPath)) {
                    const specRaw = readFileSync(specPath, 'utf8')
                    if (STUB_SPEC_MARKER.test(specRaw)) {
                        stubReasons.push('stub spec.md (contains TODO: markers)')
                    }
                }
                if (stubReasons.length > 0) {
                    documentationDebt.push({ name, reasons: stubReasons })
                }
            }

            // Play-function gate (added 2026-05-03 after Petri's verdict
            // flagged limited interaction-test coverage). For interactive
            // beta components — those declaring two or more keyboard
            // contract entries — at least one play function in the
            // stories file must use a real interaction primitive
            // (userEvent.keyboard / .tab / .type / .click, or
            // fireEvent.key*). A pure render-time play that doesn't drive
            // the control isn't sufficient.
            //
            // The threshold is "kbCount >= 2" rather than "interactive
            // group" because some components in form / feedback groups
            // (Label, Spinner, Alert, Progress) are wrappers around
            // native semantics with no DSharp-owned keyboard contract —
            // their a11y.keyboard array is empty or one trivial entry,
            // and a play function would test framework behaviour, not
            // ours. The keyboard-count signal is honest.
            //
            // Components where a play genuinely doesn't apply (composition
            // templates whose interaction lives in their children, canvas
            // wrappers like ReactFlow that own their own keyboard handling)
            // can opt out by setting a11y.playFunctionExempt with a
            // free-text justification. The exempt set is listed at the end
            // of every validator run so the gap stays visible.
            // L1 axe gate (validator-enforced as of 2026-05-08): every
            // component at status beta+ must declare `parameters.a11y.test:
            // 'error'` on its stories file's meta block. The flag tells the
            // Storybook test-runner to FAIL the build on axe violations
            // (vs warn-only when the flag is absent). Beta means
            // "production-ready, contract may shift" — production-ready
            // implies axe-clean.
            //
            // Components with documented axe debt (e.g. CodeBlock's Shiki
            // theme contrast, RichTextEditor's Quill toolbar) keep the
            // gate but selectively disable specific rules via
            // `a11y.config.rules` rather than removing the gate entirely.
            // The gap stays visible per-component instead of being a
            // global escape hatch.
            //
            // To opt out (rare — composition template whose a11y lives
            // entirely in children, canvas wrapper, etc.) set
            // a11y.axeTestExempt on the contract with a free-text
            // justification, mirroring the existing playFunctionExempt
            // pattern.
            if (manifest.status === 'beta' || manifest.status === 'stable') {
                const axeExemptReason = (manifest.a11y as any).axeTestExempt
                if (typeof axeExemptReason !== 'string' || axeExemptReason.length === 0) {
                    const storiesPath = join(dir, `${name}.stories.tsx`)
                    if (existsSync(storiesPath)) {
                        const storiesText = readFileSync(storiesPath, 'utf-8')
                        // Look for a11y: { ... test: 'error' ... } anywhere
                        // in the file. The block sits inside meta.parameters
                        // but ts-morph traversal would be 30 lines for a
                        // contract that's already encoded in the source.
                        const axeGateRe = /a11y:\s*\{[\s\S]*?test:\s*['"]error['"]/
                        if (!axeGateRe.test(storiesText)) {
                            errors.push(`${name}.stories.tsx: ${manifest.status} requires \`parameters.a11y.test: 'error'\` on the meta block (the axe gate). Beta/stable means production-ready and axe-clean — without this flag the test-runner is warn-only, not failing. Add to your meta:\n    parameters: {\n        a11y: { test: 'error' },\n        ...\n    }\nIf the component has documented axe debt that can't be fixed yet, disable specific rules via \`a11y.config.rules\` rather than removing the gate. If the component genuinely has no own a11y surface (composition template etc.), set \`a11y.axeTestExempt\` on the contract with a justification.`)
                        }
                    }
                }
            }

            const kbCount = (manifest.a11y.keyboard ?? []).length
            const isInteractive = kbCount >= 2
            if (isInteractive) {
                const exemptReason = (manifest.a11y as any).playFunctionExempt
                if (typeof exemptReason === 'string' && exemptReason.length > 0) {
                    // Recorded exempt — not an error here. The summary at the
                    // end of the validator run lists exempt components.
                    playExempt.push({ name, reason: exemptReason })
                } else {
                    const storiesPath = join(dir, `${name}.stories.tsx`)
                    if (existsSync(storiesPath)) {
                        const storiesText = readFileSync(storiesPath, 'utf-8')
                        const realInteractionRegex = /userEvent\.(keyboard|tab|type|click|hover)\s*\(|fireEvent\.key/
                        if (!realInteractionRegex.test(storiesText)) {
                            errors.push(`${name}.contract.json: ${manifest.status} interactive component (group=${manifest.group}, keyboardKeys=${kbCount}) requires at least one play function in ${name}.stories.tsx that drives the control via userEvent.keyboard/.tab/.type/.click/.hover or fireEvent.key*. Pure render-time plays don't satisfy the gate. If a play genuinely doesn't apply (composition template, canvas wrapper), set a11y.playFunctionExempt with a free-text justification.`)
                        }
                    }
                }
            }
        }

        // Status source-of-truth consistency: the Docs-page StatusPill
        // (.storybook/blocks/DocHeader) reads `contract.status`, while the
        // sidebar lifecycle dot (.storybook/manager.ts renderLabel) reads the
        // story meta `tags` status. These are two independent copies of the
        // same fact; when they drift the docs badge and the sidebar dot show
        // different lifecycles for the same component (e.g. Docs "Beta" but an
        // alpha dot). Enforce that the meta status tag, when present, equals
        // contract.status so a promotion must update both.
        {
            const storiesPath = join(dir, `${name}.stories.tsx`)
            if (existsSync(storiesPath)) {
                const storiesText = readFileSync(storiesPath, 'utf-8')
                const metaCut = storiesText.indexOf('export default meta')
                const metaRegion = metaCut > 0 ? storiesText.slice(0, metaCut) : storiesText
                const tagsMatch = metaRegion.match(/tags:\s*\[([^\]]*)\]/)
                if (tagsMatch) {
                    const metaTags = tagsMatch[1]
                        .split(',')
                        .map(entry => entry.trim().replace(/["'!]/g, ''))
                    const metaStatus = (['stable', 'beta', 'alpha', 'deprecated'] as const).find(
                        candidate => metaTags.includes(candidate),
                    )
                    if (metaStatus && metaStatus !== manifest.status) {
                        errors.push(
                            `${name}.stories.tsx: meta tags status "${metaStatus}" disagrees with ${name}.contract.json status "${manifest.status}". The sidebar lifecycle dot reads the meta tag and the Docs StatusPill reads contract.status, so they would show different lifecycles for the same component. Update the meta tags status to "${manifest.status}".`,
                        )
                    }
                }

                // Docs-frame consistency: the global autodocs page is the DT
                // frame (.storybook/preview.tsx -> DtDocsPage), which renders
                // the DocHeader masthead (group, name + StatusPill, description,
                // Figma link) plus the contract-driven Usage/Anatomy/Props/etc.
                // A contract-backed component that overrides `parameters.docs.page`
                // in its meta shadows that frame with a bespoke page, dropping the
                // masthead and every authored contract doc section. Forbid it so
                // every contract component keeps the same docs shell.
                if (/docs:\s*\{[\s\S]*?\bpage:/.test(metaRegion)) {
                    errors.push(
                        `${name}.stories.tsx: meta overrides parameters.docs.page, which shadows the DtDocsPage autodocs frame and drops the DocHeader masthead + contract doc sections for a contract-backed component. Remove the docs.page override so ${name} uses the shared frame (see .storybook/preview.tsx / DtDocsPage).`,
                    )
                }
            }
        }

        // Description quality: contract.description is the Docs-page masthead
        // standfirst (DocHeader) and the component's one-line summary everywhere
        // it is listed. It must be a real sentence describing what the component
        // is or does, never a scaffolder stub, a TODO, or just the name. Sound
        // the alarm on the placeholder shapes the `new-component` scaffolder and
        // the Tier-2 sweep left behind ("<Name> — production @dt component
        // (Storybook beta)."). Note: the word "placeholder" is allowed — some
        // components (Skeleton, EmptyState, ImagePlaceholder) legitimately ARE
        // placeholders — so key on stub SHAPES, not that word.
        {
            const desc = typeof manifest.description === 'string' ? manifest.description.trim() : ''
            const stubReasons: string[] = []
            if (!desc) {
                stubReasons.push('empty')
            } else {
                if (desc.length < 20) stubReasons.push('too short (<20 chars)')
                if (/production @dt component/i.test(desc)) stubReasons.push("scaffolder stub 'production @dt component'")
                if (/\(Storybook (?:alpha|beta|stable)\)/i.test(desc)) stubReasons.push("'(Storybook <status>)' placeholder")
                if (/\b(?:TODO|FIXME|lorem ipsum)\b/i.test(desc)) stubReasons.push('TODO/FIXME/lorem placeholder')
                if (new RegExp(`^${name}(?: component)?\\.?$`, 'i').test(desc)) stubReasons.push('name-only (no real description)')
            }
            if (stubReasons.length > 0) {
                errors.push(
                    `${name}.contract.json: description is a placeholder (${stubReasons.join(', ')}): "${desc.slice(0, 60)}". Write a concrete one-sentence description of what ${name} is or does — it renders as the Docs masthead standfirst and the component's summary. Distil it from usage.description / dense; no em dashes.`,
                )
            }
        }

        const strictLifecycle = manifest.status === 'beta' || manifest.status === 'stable'

        // AST checks via ts-morph
        const tsxPath = join(dir, `${name}.tsx`)
        if (strictLifecycle && existsSync(tsxPath)) {
            const extracted = extractComponent(tsxPath)

            // Interface name
            if (extracted.interfaceName !== `${name}Props`) {
                errors.push(`${name}.tsx: expected interface ${name}Props, got ${extracted.interfaceName ?? '(none)'}`)
            }

            // Variants
            const manifestVariants = manifest.variants as Record<
                string,
                { values: string[]; default: string; forwarded?: boolean; propSourced?: boolean }
            >
            for (const [axis, def] of Object.entries(manifestVariants)) {
                // `forwarded: true` opts the axis out of CVA-contract alignment.
                // The contract still declares the axis (so it appears in
                // argTypes coverage + the agent manifest + Storybook autodocs),
                // but the value isn't styled by a root CVA — it's threaded to
                // a child component.
                if (def.forwarded) continue
                if (def.propSourced) continue
                const extractedAxis = extracted.variants[axis]
                if (!extractedAxis) {
                    errors.push(`${name}.tsx: CVA is missing variant axis "${axis}"`)
                    continue
                }
                const sameValues =
                    extractedAxis.values.length === def.values.length &&
                    extractedAxis.values.every(v => def.values.includes(v))
                if (!sameValues) {
                    errors.push(
                        `${name}.tsx: variant values mismatch for "${axis}": CVA has [${extractedAxis.values.join(', ')}], manifest has [${def.values.join(', ')}]`,
                    )
                }
                if (extractedAxis.default !== def.default) {
                    errors.push(
                        `${name}.tsx: default mismatch for "${axis}": CVA has "${extractedAxis.default ?? '(none)'}", manifest has "${def.default}"`,
                    )
                }
            }

            // Stable only: styling axes on Props must be declared in contract.variants (Button.surface drift).
            if (manifest.status === 'stable') {
                for (const propName of extracted.declaredPropNames) {
                    if (VARIANT_PROP_NAMES.has(propName) && !(propName in manifestVariants)) {
                        errors.push(
                            `${name}.contract.json: stable requires contract.variants.${propName} (${name}Props exposes styling axis "${propName}"; set propSourced:true when not backed by root CVA)`,
                        )
                    }
                }
            }

            // asChild
            if (extracted.hasAsChild !== manifest.asChild) {
                errors.push(
                    `${name}.tsx: asChild presence mismatch: interface has ${extracted.hasAsChild}, manifest has ${manifest.asChild}`,
                )
            }

            // Slot props
            const manifestSlots = manifest.slots as string[]
            const sameSlots =
                manifestSlots.length === extracted.slotProps.length &&
                manifestSlots.every(s => extracted.slotProps.includes(s))
            if (!sameSlots) {
                errors.push(
                    `${name}.tsx: slots mismatch: interface has [${extracted.slotProps.join(', ')}], manifest has [${manifestSlots.join(', ')}]`,
                )
            }

            // Selfish-component rule: atoms cannot accept content-coupled props.
            // Components own appearance and behaviour, not content. Use slots
            // (`leading`, `trailing`) or `children` for content composition.
            if (manifest.tier === 'atom') {
                for (const propName of extracted.declaredPropNames) {
                    if (SELFISH_BANNED_ATOM_PROPS.has(propName)) {
                        errors.push(
                            `${name}.tsx: atom declares content-coupled prop "${propName}" — atoms must use slots (leading/trailing) or children, not content props (selfish-component rule)`,
                        )
                    }
                }
            }

            // Sub-parts: each declared subpart must be exported and, if it
            // declares variants, match a cva() call of the expected name.
            // Convention: subpart "FooBar" has cva fn "fooBarVariants".
            const manifestSubParts = (manifest.subParts as Array<{
                name: string
                element?: string
                variants?: Record<string, { values: string[]; default: string }>
            }>) ?? []
            for (const sub of manifestSubParts) {
                if (!extracted.exportedNames.includes(sub.name)) {
                    errors.push(
                        `${name}.tsx: manifest declares subPart "${sub.name}" but it is not exported`,
                    )
                }
                if (!sub.variants || Object.keys(sub.variants).length === 0) continue

                const expectedFn = sub.name.charAt(0).toLowerCase() + sub.name.slice(1) + 'Variants'
                const subCva = extracted.allCvas.find(c => c.fnName === expectedFn)
                if (!subCva) {
                    errors.push(
                        `${name}.tsx: subPart "${sub.name}" declares variants in manifest but no \`${expectedFn}\` CVA call found in the file`,
                    )
                    continue
                }
                for (const [axis, def] of Object.entries(sub.variants)) {
                    const extractedAxis = subCva.variants[axis]
                    if (!extractedAxis) {
                        errors.push(
                            `${name}.tsx: subPart "${sub.name}" CVA is missing variant axis "${axis}"`,
                        )
                        continue
                    }
                    const sameValues =
                        extractedAxis.values.length === def.values.length &&
                        extractedAxis.values.every(v => def.values.includes(v))
                    if (!sameValues) {
                        errors.push(
                            `${name}.tsx: subPart "${sub.name}" variant values mismatch for "${axis}": CVA has [${extractedAxis.values.join(', ')}], manifest has [${def.values.join(', ')}]`,
                        )
                    }
                    if (extractedAxis.default !== def.default) {
                        errors.push(
                            `${name}.tsx: subPart "${sub.name}" default mismatch for "${axis}": CVA has "${extractedAxis.default ?? '(none)'}", manifest has "${def.default}"`,
                        )
                    }
                }
            }
        }

        if (existsSync(tsxPath)) {
            const source = readFileSync(tsxPath, 'utf8')

            // 0. Next.js "use client" must be the file prologue — only comments/blank
            //    lines may precede it. An export or import before the directive is ignored
            //    by the RSC compiler and silently breaks client-boundary semantics.
            if (source.includes('"use client"') || source.includes("'use client'")) {
                const withoutLeadingComments = source.replace(
                    /^(\s*\/\*[\s\S]*?\*\/\s*|\s*\/\/[^\n]*\n|\s*\n)*/m,
                    '',
                )
                if (!/^["']use client["'];?\s*\n/.test(withoutLeadingComments)) {
                    errors.push(
                        `${name}.tsx: "use client" must be the first statement (only comments/blank lines before it). Move the directive above imports and exports.`,
                    )
                }
            }

            // 1. No hex literals
            const hexMatches = source.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []
            for (const hex of hexMatches) {
                errors.push(`${name}.tsx: hex literal ${hex} found — use tokens instead`)
            }

            if (!strictLifecycle) {
                // alpha components skip token/jsdoc/radix gates below
            } else {
            // 2. All var(--...) references declared in manifest.tokens.
            // Runtime-injected CSS vars from UI libraries (Radix, etc.) are exempt —
            // they're set by primitives at render time, not by the DSharp token system.
            const declaredTokens = new Set<string>([
                ...(manifest.tokens.colors as string[]),
                ...(manifest.tokens.spacing as string[]),
                ...((manifest.tokens.radii as string[] | undefined) ?? []),
                ...((manifest.tokens.shadows as string[] | undefined) ?? []),
                ...((manifest.tokens.zIndex as string[] | undefined) ?? []),
            ])
            const RUNTIME_INJECTED_PREFIXES = ['--radix-']
            const varMatches = [...source.matchAll(/var\((--[a-z][a-z0-9-]*)\)/g)]
            for (const [, tokenName] of varMatches) {
                if (!tokenName) continue
                if (RUNTIME_INJECTED_PREFIXES.some(prefix => tokenName.startsWith(prefix))) continue
                if (!declaredTokens.has(tokenName)) {
                    errors.push(`${name}.tsx: undeclared token ${tokenName} — add to manifest.tokens`)
                }
            }

            // 3. JSDoc on component export
            const projectForDoc = new Project({ skipAddingFilesFromTsConfig: true })
            const sfDoc = projectForDoc.addSourceFileAtPath(tsxPath)
            const componentDecl = sfDoc
                .getVariableDeclarations()
                .find(d => d.getName() === name)
            if (componentDecl) {
                const stmt = componentDecl.getVariableStatement()
                const hasJsDoc = (stmt?.getJsDocs().length ?? 0) > 0
                if (!hasJsDoc) {
                    errors.push(`${name}.tsx: JSDoc required on component export`)
                }
            }

            // 4. Radix import <-> radixPrimitive bidirectional integrity.
            //    Forward: if manifest declares a primitive, the .tsx must import it.
            //    Inverse: if the .tsx imports any @radix-ui/react-* package, the
            //    manifest must declare that exact primitive. Closes the gap that
            //    let Button / Container / Grid / Icon / Row / Stack drift to
            //    radixPrimitive: null while still importing @radix-ui/react-slot
            //    for asChild polymorphism.
            if (manifest.radixPrimitive !== null) {
                if (!source.includes(`from '${manifest.radixPrimitive}'`) && !source.includes(`from "${manifest.radixPrimitive}"`)) {
                    errors.push(`${name}.tsx: manifest declares radixPrimitive "${manifest.radixPrimitive}" but component does not import from ${manifest.radixPrimitive}`)
                }
            }
            const radixImports = [...source.matchAll(/from\s+['"](@radix-ui\/react-[a-z-]+)['"]/g)]
                .map(m => m[1])
            const uniqueRadixImports = [...new Set(radixImports)]
            for (const imp of uniqueRadixImports) {
                if (manifest.radixPrimitive === null) {
                    errors.push(`${name}.tsx: imports from ${imp} but manifest declares radixPrimitive: null — set radixPrimitive to the imported primitive`)
                } else if (manifest.radixPrimitive !== imp) {
                    errors.push(`${name}.tsx: imports from ${imp} but manifest declares radixPrimitive "${manifest.radixPrimitive}" — radixPrimitive is singular, components currently must not import multiple distinct @radix-ui packages`)
                }
            }
            }
        }

        // Required stories: every name in requiredStories must be exported from <Name>.stories.tsx
        const storiesPath = join(dir, `${name}.stories.tsx`)
        if (strictLifecycle && existsSync(storiesPath)) {
            const project = new Project({ skipAddingFilesFromTsConfig: true })
            const storiesSf = project.addSourceFileAtPath(storiesPath)
            const storyExports = new Set<string>()
            for (const decl of storiesSf.getExportedDeclarations().keys()) {
                if (decl === 'default') continue
                storyExports.add(decl)
            }
            for (const required of manifest.requiredStories as string[]) {
                if (!storyExports.has(required)) {
                    errors.push(`${name}.stories.tsx: missing required story "${required}"`)
                }
            }

            // Story alias TDZ: \`export const Default = Playground\` must be declared after Playground.
            const storiesText = readFileSync(storiesPath, 'utf-8')
            const aliasRe = /export const (\w+)(?::\s*Story)?\s*=\s*(\w+)\s*;/g
            let aliasMatch: RegExpExecArray | null
            while ((aliasMatch = aliasRe.exec(storiesText))) {
                const [, alias, target] = aliasMatch
                if (alias === target) continue
                const targetRe = new RegExp(`export const ${target}\\b`)
                const aliasIdx = aliasMatch.index
                const targetMatch = targetRe.exec(storiesText)
                if (targetMatch && aliasIdx < targetMatch.index) {
                    errors.push(
                        `${name}.stories.tsx: "${alias}" aliases "${target}" before it is declared — move the alias export after "${target}" (module load ReferenceError).`,
                    )
                }
            }

            // argTypes promotion gate (beta+): required block + coverage + documentation
            //
            // 0. `meta.argTypes` must exist (even when contract.variants is {}).
            // 1. Every variant axis in the contract must be a key in argTypes.
            // 2. Every locally-declared prop on <Name>Props must be in argTypes or exempt.
            // 3. Each control needs `description`; variant axes need table.defaultValue.summary.
            //
            // Alpha components may ship before the Controls/docs surface is complete.
            //
            // Components registered in .storybook/controls-autogen.json derive
            // argTypes at runtime from the contract + docgen
            // (.storybook/lib/controls-autogen.ts) — there is no static
            // meta.argTypes block to parse. Their Controls surface is enforced
            // by the STRONGER runtime instruments instead: audit:controls
            // (presence, farm --min ratchet) and --effects (0 inert props).
            if ((manifest.status === 'beta' || manifest.status === 'stable') && !CONTROLS_AUTOGEN.has(name)) {
                const declaredVariants = Object.keys(manifest.variants ?? {})
                const metaObj = extractMetaObject(storiesSf)
                const argTypesObj = metaObj ? extractArgTypesObject(metaObj) : null
                const argTypeKeys = argTypesObj ? argTypeKeysFromObject(argTypesObj) : null

                if (!argTypesObj || argTypeKeys === null) {
                    errors.push(
                        `${name}.stories.tsx: ${manifest.status} requires meta.argTypes on the story meta object (documented controls for every public prop and variant axis). See docs/adr/0005-dsharp-parity-baseline.md § Beta promotion gates.`,
                    )
                } else {
                    const missingVariants = declaredVariants.filter((v) => !argTypeKeys.has(v))
                    if (missingVariants.length > 0) {
                        errors.push(
                            `${name}.stories.tsx: ${manifest.status} requires argTypes coverage for every variant axis declared in the contract; missing: ${missingVariants.join(', ')}. Add meta.argTypes.<axis> with description and table.defaultValue.summary.`,
                        )
                    }

                    const SKIP_FROM_COVERAGE = new Set([
                        'children', 'asChild', 'className', 'style', 'ref',
                    ])
                    const proxyExempt = new Set<string>(
                        (manifest.argTypesProxyExempt as string[] | undefined) ?? [],
                    )

                    // Controls-quality gate: an exemption that mutes a prop
                    // which HAS an argTypes entry is stale — it does nothing
                    // except blind this gate to future regressions. Run
                    // scripts/design-system/prune-argtypes-exemptions.ts.
                    const staleExemptions = [...proxyExempt].filter((p) => argTypeKeys.has(p))
                    if (staleExemptions.length > 0) {
                        errors.push(
                            `${name}.contract.json: argTypesProxyExempt contains ${staleExemptions.length} stale entr${staleExemptions.length === 1 ? 'y' : 'ies'} already covered by argTypes (${staleExemptions.join(', ')}). Run npx tsx scripts/design-system/prune-argtypes-exemptions.ts.`,
                        )
                    }
                    // Variant axes are the component's public API surface —
                    // they may never be exempted from the Controls panel.
                    const exemptAxes = declaredVariants.filter((v) => proxyExempt.has(v))
                    if (exemptAxes.length > 0) {
                        errors.push(
                            `${name}.contract.json: argTypesProxyExempt may not contain variant axes (${exemptAxes.join(', ')}); every axis needs a real control with description and default summary.`,
                        )
                    }
                    const componentForCoverage = extractComponent(tsxPath)
                    const propsRequiringCoverage = componentForCoverage.declaredPropNames.filter(
                        (p) => !SKIP_FROM_COVERAGE.has(p) && !proxyExempt.has(p) && !p.startsWith('aria-') && !p.startsWith('on') && !p.startsWith('data-'),
                    )
                    const missingProps = propsRequiringCoverage.filter((p) => !argTypeKeys.has(p))
                    if (missingProps.length > 0) {
                        errors.push(
                            `${name}.stories.tsx: ${manifest.status} requires argTypes coverage for every locally-declared prop on ${name}Props; missing: ${missingProps.join(', ')}. Add an entry per prop — control with description (and table.defaultValue.summary when applicable) or \`{ table: { disable: true } }\`. Proxy patterns: contract.argTypesProxyExempt.`,
                        )
                    }

                    validateArgTypesDocumentation(argTypesObj, declaredVariants, errors, name, manifest.status)
                }
            }
        }
    }

    return { ok: errors.length === 0, errors, playExempt, documentationDebt }
}

function main() {
    const roots = [
        resolve(__dirname, '../../nextjs-app/shared/components'),
        resolve(__dirname, '../../nextjs-app/shared/patterns'),
    ]
    const allErrors: string[] = []
    const allPlayExempt: Array<{ name: string; reason: string }> = []
    const allDocDebt: Array<{ name: string; reasons: string[] }> = []
    for (const root of roots) {
        const result = validateComponentsDir(root)
        allErrors.push(...result.errors)
        if (result.playExempt) allPlayExempt.push(...result.playExempt)
        if (result.documentationDebt) allDocDebt.push(...result.documentationDebt)
    }
    if (allErrors.length > 0) {
        console.error('\nComponent contract validation failed:\n')
        for (const err of allErrors) console.error('  ✗ ' + err)
        console.error('')
        process.exit(1)
    }
    console.log('✓ All component contracts valid.')
    if (allPlayExempt.length > 0) {
        console.log('')
        console.log(`ⓘ ${allPlayExempt.length} component(s) opted out of the play-function gate via a11y.playFunctionExempt:`)
        for (const e of allPlayExempt) {
            console.log(`    ${e.name}: ${e.reason}`)
        }
        console.log('  These are tracked so the gap stays visible. Close the exemption when a real play function lands.')
    }
    if (allDocDebt.length > 0) {
        console.log('')
        console.log(`ⓘ ${allDocDebt.length} beta-or-stable component(s) shipping with stub documentation (Honest Beta debt):`)
        for (const d of allDocDebt) {
            console.log(`    ${d.name}: ${d.reasons.join('; ')}`)
        }
        console.log('  Stubs were emitted by the scaffolder and never replaced with real prose. Author real MDX + spec.md content to clear the debt.')
        // Emit a machine-readable metric line for the autoresearch / CI dashboards.
        console.log(`HONEST_BETA_DOC_DEBT=${allDocDebt.length}`)
    } else {
        console.log('HONEST_BETA_DOC_DEBT=0')
    }

    // Controls-panel exemption debt: props muted from the coverage gate via
    // argTypesProxyExempt. Stale entries (exempt + covered) are hard errors;
    // this counts the legitimate remainder so blanket lists stay visible.
    let exemptTotal = 0
    for (const root of roots) {
        if (!existsSync(root)) continue
        for (const dir of readdirSync(root)) {
            const contractPath = `${root}/${dir}/${dir}.contract.json`
            if (!existsSync(contractPath)) continue
            try {
                const contract = JSON.parse(readFileSync(contractPath, 'utf8'))
                exemptTotal += (contract.argTypesProxyExempt as string[] | undefined)?.length ?? 0
            } catch {
                // unreadable contracts are reported by the main validation pass
            }
        }
    }
    console.log(`CONTROLS_PROXY_EXEMPT=${exemptTotal}`)
}

// Run only when invoked directly, not when imported by tests
if (import.meta.url === `file://${process.argv[1]}`) {
    main()
}
