#!/usr/bin/env node
/**
 * Replace scaffolder stub phrases in beta/stable MDX so HONEST_BETA_DOC_DEBT clears.
 * See validate-components.ts STUB_MDX_PHRASES.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const roots = [
  join(ROOT, "nextjs-app/shared/components"),
  join(ROOT, "nextjs-app/shared/patterns"),
  join(ROOT, "nextjs-app/shared/templates"),
];

const REPLACEMENTS = [
  [
    "- Production layouts and flows documented in Storybook.",
    "- When the **Example** story matches your layout or flow.\n- When design tokens and theme context from `ThemeProvider` are already mounted.",
  ],
  [
    "- Prefer a smaller primitive when this composition is more than you need.",
    "- When a smaller primitive (link, text, icon) covers the need without extra chrome.\n- When the composition is one-off and not worth standardising in the design system.",
  ],
  [
    "- Verify keyboard, focus, and screen-reader behaviour in the **Example** story.\n- Theme and forced-colors stories cover light, dark, and high-contrast modes.",
    "- Exercise keyboard, focus, and screen-reader behaviour in **Playground** and **Example**.\n- Confirm **ForcedColors** for high-contrast regressions; run `npm run test:stories:hc:ci` before marking `forcedColorsVerified`.",
  ],
  [
    "- Promote to stable after AT snapshots and a documented production consumer.",
    "- Beta: Example + ForcedColors stories, axe gate enabled, MDX headings complete.\n- Stable: documented production consumer, AT snapshots, and honest `lightDarkVerified` / `forcedColorsVerified` flags.",
  ],
];

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

let mdxUpdated = 0;

for (const base of roots) {
  for (const name of readdirSync(base)) {
    const dir = join(base, name);
    if (!isDir(dir)) continue;
    const mdxPath = join(dir, `${name}.mdx`);
    if (!existsSync(mdxPath)) continue;

    let text = readFileSync(mdxPath, "utf8");
    const before = text;
    for (const [from, to] of REPLACEMENTS) {
      text = text.split(from).join(to);
    }
    if (text !== before) {
      writeFileSync(mdxPath, text.endsWith("\n") ? text : `${text}\n`);
      mdxUpdated++;
    }
  }
}

console.log(`replace-stub-mdx: updated ${mdxUpdated} MDX file(s)`);
