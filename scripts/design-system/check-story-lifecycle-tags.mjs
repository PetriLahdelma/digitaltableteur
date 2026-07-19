#!/usr/bin/env node
/**
 * Verify every contract-backed component/pattern story carries a meta-level
 * lifecycle tag that matches its contract status.
 *
 *   npm run check:story-lifecycle-tags
 *
 * Why this gate exists
 * --------------------
 * The Storybook sidebar lifecycle dot (manager.ts `renderLabel`) is drawn
 * ONLY from a meta-level tag in {stable, beta, alpha, deprecated}. It does
 * NOT read `parameters.contractStatus` — that parameter only feeds the
 * canvas WipBadge. So a component can be `"status": "stable"` in its contract,
 * render a stable WipBadge, and still show no sidebar dot because its meta
 * `tags` never carried "stable" (this is exactly how Timestamp drifted).
 *
 * The contract `status` is the single source of truth. This check asserts the
 * meta tag agrees with it, in both directions:
 *   - MISSING  : contract has a status, meta has no lifecycle tag
 *   - MISMATCH : meta lifecycle tag differs from the contract status
 *
 * Web-component stories declare status inline (shared nativeStoryParameters +
 * per-story tags) and have no colocated contract, so they are out of scope
 * here by design.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const LIFECYCLE = new Set(["stable", "beta", "alpha", "deprecated"]);
const ROOTS = [
  "nextjs-app/shared/components",
  "nextjs-app/shared/patterns",
];

/** Collect every `*.stories.tsx` under a root, recursively. */
function collectStoryFiles(base, rel = "", out = []) {
  const abs = join(ROOT, base, rel);
  for (const name of readdirSync(abs)) {
    const p = join(abs, name);
    if (statSync(p).isDirectory()) {
      collectStoryFiles(base, join(rel, name), out);
    } else if (name.endsWith(".stories.tsx")) {
      out.push({ base, rel, name, abs: p });
    }
  }
  return out;
}

/** Resolve the default-exported meta object literal (handles the three forms:
 *  `export default {…}`, `const meta = {…}; export default meta`,
 *  `const meta: Meta = {…}; export default meta`). */
function findMetaObject(sourceFile) {
  let defaultExpr = null;
  const consts = new Map();
  for (const stmt of sourceFile.statements) {
    if (ts.isExportAssignment(stmt) && !stmt.isExportEquals) {
      defaultExpr = stmt.expression;
    } else if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.initializer) {
          consts.set(decl.name.text, decl.initializer);
        }
      }
    }
  }
  if (!defaultExpr) return null;
  let expr = defaultExpr;
  if (ts.isIdentifier(expr) && consts.has(expr.text)) expr = consts.get(expr.text);
  // Unwrap `{…} satisfies Meta<…>` / `{…} as Meta`.
  while (expr && (ts.isSatisfiesExpression?.(expr) || ts.isAsExpression(expr))) {
    expr = expr.expression;
  }
  return expr && ts.isObjectLiteralExpression(expr) ? expr : null;
}

/** Read a named string-literal property off the meta object, or null. */
function readMetaStringProp(metaObj, propName) {
  for (const prop of metaObj.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === propName &&
      ts.isStringLiteralLike(prop.initializer)
    ) {
      return prop.initializer.text;
    }
  }
  return null;
}

/** Read the string literals of the meta's `tags: [...]` property, or null if absent. */
function readMetaTags(metaObj) {
  for (const prop of metaObj.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === "tags" &&
      ts.isArrayLiteralExpression(prop.initializer)
    ) {
      return prop.initializer.elements
        .filter((el) => ts.isStringLiteralLike(el))
        .map((el) => el.text);
    }
  }
  return null;
}

function parseMeta(abs, name) {
  const src = readFileSync(abs, "utf8");
  const sf = ts.createSourceFile(name, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  return findMetaObject(sf);
}

const violations = [];
let checked = 0;

for (const base of ROOTS) {
  // Group every story file in a component/pattern directory so we can inspect
  // ALL CSF files that feed one sidebar node — not just <Name>.stories.tsx.
  // A component's sidebar node aggregates tags as the INTERSECTION of its
  // stories' tags, so a SECOND same-title CSF whose meta omits the lifecycle
  // tag (e.g. Button + ButtonSurfaceComparison) silently strips the node's
  // dot even though the primary meta is tagged correctly.
  const byDir = new Map();
  for (const f of collectStoryFiles(base)) {
    const key = f.rel; // directory (relative to base)
    if (!byDir.has(key)) byDir.set(key, []);
    byDir.get(key).push(f);
  }

  for (const [rel, files] of byDir) {
    // Determine the component's authoritative status from its contract.
    const compName = rel.split("/").pop();
    const contractPath = join(ROOT, base, rel, `${compName}.contract.json`);
    if (!existsSync(contractPath)) continue; // out of scope: no authoritative status
    let status;
    try {
      status = JSON.parse(readFileSync(contractPath, "utf8")).status;
    } catch {
      continue;
    }
    if (!status || !LIFECYCLE.has(status)) continue;

    // The primary <Name>.stories.tsx defines the canonical sidebar title.
    const primary = files.find((f) => f.name === `${compName}.stories.tsx`);
    if (!primary) continue;
    const primaryMeta = parseMeta(primary.abs, primary.name);
    if (!primaryMeta) continue;
    const primaryTitle = readMetaStringProp(primaryMeta, "title");

    // Every CSF that shares that exact title merges into the same node, so
    // each must carry the lifecycle tag or it dilutes the node's intersection.
    for (const f of files) {
      const metaObj = f === primary ? primaryMeta : parseMeta(f.abs, f.name);
      if (!metaObj) continue;
      const title = f === primary ? primaryTitle : readMetaStringProp(metaObj, "title");
      if (title !== primaryTitle) continue; // separate sidebar node — not this dot

      checked++;
      const tags = readMetaTags(metaObj) ?? [];
      const lifecycleTags = tags.filter((t) => LIFECYCLE.has(t));
      const rel4 = join(base, rel, f.name);
      const secondary = f !== primary;

      if (lifecycleTags.length === 0) {
        violations.push({ file: rel4, kind: "MISSING", status, secondary });
      } else if (!lifecycleTags.includes(status)) {
        violations.push({ file: rel4, kind: "MISMATCH", status, has: lifecycleTags.join(", "), secondary });
      }
    }
  }
}

if (violations.length === 0) {
  console.log(`✓ Story lifecycle tags match contract status (${checked} contract-backed stories)`);
  process.exit(0);
}

console.error(`FAIL: ${violations.length} story meta lifecycle tag(s) out of sync with contract status:\n`);
for (const v of violations) {
  const dilutes = v.secondary
    ? " This secondary CSF shares the component title, so its untagged stories dilute the sidebar node's tag intersection and drop the dot."
    : "";
  if (v.kind === "MISSING") {
    console.error(`  MISSING  ${v.file}`);
    console.error(`           contract status is "${v.status}" but the meta has no lifecycle tag.${dilutes}`);
    console.error(`           Add "${v.status}" to the meta \`tags\` array (e.g. tags: ["${v.status}", "autodocs"]).`);
  } else {
    console.error(`  MISMATCH ${v.file}`);
    console.error(`           contract status is "${v.status}" but the meta tag is "${v.has}".${dilutes}`);
    console.error(`           Change the meta lifecycle tag to "${v.status}".`);
  }
}
console.error(
  `\nThe sidebar lifecycle dot (manager.ts renderLabel) is drawn only from this meta tag,\n` +
  `not from parameters.contractStatus. Keep the tag in sync with the contract.`,
);
process.exit(1);
