#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TIER_PREFIX } from "./in-scope-components.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "templates");
const REPO_ROOT = resolve(__dirname, "../..");

function camelize(name) {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function resolvePlaceholders(template, opts) {
  const radixJson = opts.radixPrimitive === null ? "null" : JSON.stringify(opts.radixPrimitive);
  return template
    .replaceAll("{{Name}}", opts.name)
    .replaceAll("{{name}}", camelize(opts.name))
    .replaceAll("{{group}}", opts.group)
    .replaceAll("{{tier}}", opts.tier)
    .replaceAll("{{TierPrefix}}", TIER_PREFIX[opts.tier] ?? "Components")
    // Storybook sidebar groups are USE-based (Actions, Content, Forms,
    // Navigation, Layout, Feedback, Site), never the atomic tiers.
    .replaceAll("{{StoryGroup}}", opts.storyGroup ?? "Content")
    .replaceAll("{{status}}", opts.status ?? "alpha")
    .replaceAll("{{asChild}}", String(opts.asChild))
    .replaceAll("{{radixPrimitiveJson}}", radixJson);
}

export function scaffoldComponent(opts) {
  const base = opts.root === "patterns"
    ? join(REPO_ROOT, "nextjs-app/shared/patterns")
    : join(REPO_ROOT, "nextjs-app/shared/components");
  const dir = join(base, opts.name);
  if (existsSync(dir)) throw new Error(`${dir} already exists.`);
  mkdirSync(dir, { recursive: true });
  const files = [
    ["component.tsx.template", `${opts.name}.tsx`],
    ["component.stories.tsx.template", `${opts.name}.stories.tsx`],
    ["component.contract.json.template", `${opts.name}.contract.json`],
    ["component.spec.md.template", `${opts.name}.spec.md`],
    ["component.mdx.template", `${opts.name}.mdx`],
    ["component.index.ts.template", "index.ts"],
  ];
  for (const [tpl, out] of files) {
    writeFileSync(join(dir, out), resolvePlaceholders(readFileSync(join(TEMPLATES_DIR, tpl), "utf8"), opts));
  }

  // Safety check: we generate a custom MDX page, so the CSF file must not opt into autodocs.
  // If templates drift, fail loudly at scaffold time instead of breaking Storybook later.
  const storyPath = join(dir, `${opts.name}.stories.tsx`);
  const storyText = readFileSync(storyPath, "utf8");
  if (storyText.includes('tags: ["autodocs"]')) {
    throw new Error(
      `${storyPath} enables autodocs but ${opts.name}.mdx is generated too. Use tags: ["!autodocs"].`,
    );
  }
}

function main() {
  const args = process.argv.slice(2);
  const name = args.find((a) => !a.startsWith("-"));
  const tier = args.includes("--tier") ? args[args.indexOf("--tier") + 1] : "atom";
  const group = args.includes("--group") ? args[args.indexOf("--group") + 1] : "display";
  const root = args.includes("--root") ? args[args.indexOf("--root") + 1] : "components";
  if (!name) {
    console.error("Usage: npm run new-component -- <Name> --tier atom --group display");
    process.exit(1);
  }
  scaffoldComponent({
    name,
    tier,
    group,
    root,
    asChild: args.includes("--asChild"),
    radixPrimitive: null,
    status: "alpha",
    storyGroup: args.includes("--story-group")
      ? args[args.indexOf("--story-group") + 1]
      : undefined,
  });
  console.log(`Scaffolded ${name}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
