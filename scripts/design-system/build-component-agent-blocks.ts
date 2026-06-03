#!/usr/bin/env tsx
/**
 * Build machine-readable agent blocks from TypeScript source + spec.md.
 * Writes nextjs-app/shared/foundations/dist/component-agent-blocks.json
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Project, SyntaxKind } from "ts-morph";
import {
  extractComponentFromSourceFile,
} from "./validate-components.ts";
import { parseSpecAgentHints, extractSpecIntent } from "./parse-spec-agent-hints.mjs";
import {
  getReplacementFor,
  getPrefersOver,
} from "./component-replacement-policy.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "nextjs-app/shared/foundations/dist/component-agent-blocks.json");
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
];

const VARIANT_PROP_NAMES = new Set([
  "variant",
  "size",
  "severity",
  "tone",
  "orientation",
  "align",
  "density",
  "terminals",
  "layout",
  "mode",
  "type",
]);

type PropSchema = {
  optional: boolean;
  type: string;
  values?: string[];
  deprecated?: boolean;
};

type VariantAxis = {
  values: string[];
  default: string | null;
};

function collectStringLiterals(type: import("ts-morph").Type, depth = 0): string[] {
  if (depth > 6) return [];
  if (type.isUnion()) {
    return [...new Set(type.getUnionTypes().flatMap((t) => collectStringLiterals(t, depth + 1)))];
  }
  if (type.isStringLiteral()) {
    return [type.getLiteralValue() as string];
  }
  const symbol = type.getSymbol();
  if (symbol) {
    for (const decl of symbol.getDeclarations()) {
      if (decl.getKind() === SyntaxKind.TypeAliasDeclaration) {
        const aliasType = (decl as import("ts-morph").TypeAliasDeclaration).getType();
        const fromAlias = collectStringLiterals(aliasType, depth + 1);
        if (fromAlias.length) return fromAlias;
      }
    }
  }
  const apparent = type.getApparentType();
  if (apparent !== type) {
    return collectStringLiterals(apparent, depth + 1);
  }
  return [];
}

function extractPropSchemasFromFile(
  sf: import("ts-morph").SourceFile,
  componentName: string,
): Record<string, PropSchema> {
  const propsName = `${componentName}Props`;
  const propsDecl =
    sf.getInterface(propsName) ??
    sf.getTypeAlias(propsName) ??
    sf.getInterfaces().find((i) => i.isExported()) ??
    sf.getTypeAliases().find((t) => t.isExported());

  if (!propsDecl || !("getType" in propsDecl)) return {};

  const props: Record<string, PropSchema> = {};
  const ownPath = sf.getFilePath();

  for (const sym of propsDecl.getType().getProperties()) {
    const name = sym.getName();
    if (name.startsWith("__")) continue;
    const decls = sym.getDeclarations();
    const locallyDeclared = decls.some((d) => d.getSourceFile().getFilePath() === ownPath);
    if (!locallyDeclared) continue;

    let optional = true;
    let typeText = "unknown";
    let deprecated = false;

    for (const d of decls) {
      if (
        "hasQuestionToken" in d &&
        typeof (d as { hasQuestionToken: () => boolean }).hasQuestionToken === "function"
      ) {
        optional = (d as { hasQuestionToken: () => boolean }).hasQuestionToken();
      }
      const typeNodeInner = (d as { getTypeNode?: () => { getText: () => string } }).getTypeNode?.();
      if (typeNodeInner) typeText = typeNodeInner.getText();
      const jsDocs =
        (d as { getJsDocs?: () => Array<{ getDescription: () => string }> }).getJsDocs?.() ?? [];
      if (jsDocs.some((doc) => doc.getDescription().includes("@deprecated"))) {
        deprecated = true;
      }
    }

    const propType = (decls[0] as import("ts-morph").Node & { getType: () => import("ts-morph").Type }).getType?.() ??
      sym.getDeclarations()[0]?.getType?.();
    const literalValues = propType ? collectStringLiterals(propType) : [];
    const values =
      literalValues.length >= 2
        ? literalValues
        : literalUnionValuesFromText(typeText);

    props[name] = {
      optional,
      type: values?.length ? "union" : typeText.slice(0, 120),
      ...(values?.length ? { values } : {}),
      ...(deprecated ? { deprecated: true } : {}),
    };
  }

  return props;
}

function literalUnionValuesFromText(typeText: string): string[] | undefined {
  const parts = typeText
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
  const literals = parts
    .map((p) => p.match(/^["']([^"']+)["']$/)?.[1])
    .filter((v): v is string => !!v);
  return literals.length >= 2 ? [...new Set(literals)] : undefined;
}

function variantsFromProps(props: Record<string, PropSchema>): Record<string, VariantAxis> {
  const out: Record<string, VariantAxis> = {};
  for (const [name, schema] of Object.entries(props)) {
    if (!VARIANT_PROP_NAMES.has(name) || !schema.values?.length) continue;
    out[name] = { values: schema.values, default: schema.values[0] ?? null };
  }
  return out;
}

function mergeVariants(
  cvaVariants: Record<string, { values: string[]; default: string | null }>,
  propVariants: Record<string, VariantAxis>,
): Record<string, VariantAxis> {
  const merged = { ...propVariants };
  for (const [axis, def] of Object.entries(cvaVariants)) {
    merged[axis] = { values: def.values, default: def.default };
  }
  return merged;
}

function canonicalExamplesFromStories(storiesPath: string): string[] {
  if (!existsSync(storiesPath)) return [];
  const source = readFileSync(storiesPath, "utf8");
  const examples: string[] = [];
  for (const match of source.matchAll(/export const (\w+):\s*Story/g)) {
    if (["Default", "Playground", "Example", "ForcedColors"].includes(match[1])) {
      examples.push(match[1]);
    }
  }
  return examples.length ? examples : ["Default"];
}

function main() {
  const tsxPaths: string[] = [];
  const meta: Array<{ name: string; dir: string; contractPath: string; specPath: string }> = [];

  for (const base of roots) {
    for (const name of readdirSync(base)) {
      const dir = join(base, name);
      const contractPath = join(dir, `${name}.contract.json`);
      const tsxPath = join(dir, `${name}.tsx`);
      if (!existsSync(contractPath) || !existsSync(tsxPath)) continue;
      tsxPaths.push(tsxPath);
      meta.push({
        name,
        dir,
        contractPath,
        specPath: join(dir, `${name}.spec.md`),
      });
    }
  }

  const project = new Project({
    compilerOptions: { allowJs: false, jsx: 4 },
    skipAddingFilesFromTsConfig: true,
  });
  project.addSourceFilesAtPaths(tsxPaths);

  const blocks: Record<string, object> = {};

  for (const entry of meta) {
    const tsxPath = join(entry.dir, `${entry.name}.tsx`);
    const sf = project.getSourceFile(tsxPath);
    if (!sf) continue;

    const contract = JSON.parse(readFileSync(entry.contractPath, "utf8"));
    const spec = existsSync(entry.specPath) ? readFileSync(entry.specPath, "utf8") : null;
    const extracted = extractComponentFromSourceFile(sf, tsxPath);
    const props = extractPropSchemasFromFile(sf, entry.name);
    const variants = mergeVariants(extracted.variants, variantsFromProps(props));
    const { useWhen, avoidWhen } = parseSpecAgentHints(spec);
    const intent = extractSpecIntent(spec);
    const a11y = (contract.a11y ?? {}) as {
      ariaRequirements?: string[];
      keyboard?: string[];
    };

    blocks[entry.name] = {
      preferredImport: `@dt/${entry.name}`,
      intent: intent || contract.description || "",
      props,
      variants,
      /** CVA-only axes — safe to sync into contract.json */
      cvaVariants: extracted.variants,
      useWhen,
      avoidWhen,
      requiredA11y: a11y.ariaRequirements ?? [],
      keyboard: a11y.keyboard ?? [],
      compositionRules: avoidWhen.filter((line) =>
        /nest|inside|stack|terminal|pair/i.test(line),
      ),
      canonicalExamples: canonicalExamplesFromStories(join(entry.dir, `${entry.name}.stories.tsx`)),
      replacementFor: getReplacementFor(entry.name),
      prefersOver: getPrefersOver(entry.name),
      declaredPropCount: extracted.declaredPropNames.length,
    };
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), components: blocks }, null, 2)}\n`,
  );
  console.log(`✓ component-agent-blocks.json (${Object.keys(blocks).length} components)`);
}

main();
