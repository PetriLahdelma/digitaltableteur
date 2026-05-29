#!/usr/bin/env node
/**
 * Tag required lifecycle stories so test-runner can target them:
 * Default, Playground, Example, ForcedColors on beta/stable-tier components.
 *
 * Walks every component contract under shared/components and shared/patterns
 * (including nested folders like `components/animations/<Name>`). For each
 * contract whose status is `beta` or `stable`, the matching `*.stories.tsx`
 * is patched so the four lifecycle exports carry the `beta-matrix` tag.
 *
 * The story regex tolerates four export shapes:
 *   1. `export const X: Story = { ... };` (multi-line)
 *   2. `export const X = { ... };`        (multi-line, untyped)
 *   3. `export const X = {};`             (single-line, empty)
 *   4. `export const X = { foo: bar };`   (single-line, populated)
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REQUIRED = ["Default", "Playground", "Example", "ForcedColors"];
const ELIGIBLE_STATUS = new Set(["beta", "stable"]);
const roots = [
  "nextjs-app/shared/components",
  "nextjs-app/shared/patterns",
  "nextjs-app/shared/templates",
];

let updated = 0;

function* walkContracts(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkContracts(full);
    } else if (entry.isFile() && entry.name.endsWith(".contract.json")) {
      yield full;
    }
  }
}

function tagStoryFile(text, storyName) {
  // Capture the opening `export const <Name>[: Story] = {` token plus the
  // remainder of the file up to the FIRST closing `};` that occurs at the
  // start of a (possibly indented) line. Single-line bodies and empty objects
  // both end at a `};` token; the regex requires the `};` be followed by EOL
  // so we don't accidentally swallow a nested object literal.
  const re = new RegExp(
    `(export const ${storyName}(?::\\s*Story)?\\s*=\\s*\\{)([^]*?)(\\};)(\\s*$)`,
    "m",
  );
  let mutated = false;
  const next = text.replace(re, (full, open, body, close, trailing) => {
    if (/tags:\s*\[[^\]]*beta-matrix/.test(body)) return full;
    if (/tags:\s*\[/.test(body)) {
      mutated = true;
      const patched = body.replace(/tags:\s*\[/, 'tags: ["beta-matrix", ');
      return `${open}${patched}${close}${trailing}`;
    }
    mutated = true;
    // For empty-object exports (`export const X = {};`) keep them on one line
    // so we don't churn formatting; otherwise insert the tags property as the
    // first key on its own line so existing keys are preserved verbatim.
    const trimmedBody = body.trim();
    if (trimmedBody === "") {
      return `${open} tags: ["beta-matrix"] ${close}${trailing}`;
    }
    return `${open}\n  tags: ["beta-matrix"],${body}${close}${trailing}`;
  });
  return { text: next, mutated };
}

for (const root of roots) {
  for (const contractPath of walkContracts(root)) {
    const contract = JSON.parse(readFileSync(contractPath, "utf8"));
    if (!ELIGIBLE_STATUS.has(contract.status)) continue;

    const name = contract.name;
    const dir = contractPath.slice(0, -`${name}.contract.json`.length);
    const storyPath = join(dir, `${name}.stories.tsx`);
    if (!existsSync(storyPath)) continue;

    let text = readFileSync(storyPath, "utf8");
    let fileUpdated = false;

    for (const storyName of REQUIRED) {
      const result = tagStoryFile(text, storyName);
      text = result.text;
      if (result.mutated) fileUpdated = true;
    }

    if (fileUpdated) {
      writeFileSync(storyPath, text);
      updated += 1;
    }
  }
}

console.log(`tag-beta-matrix-stories: updated ${updated} story files`);
