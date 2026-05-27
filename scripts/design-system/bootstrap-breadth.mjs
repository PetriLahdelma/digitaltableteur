#!/usr/bin/env node
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BREADTH_COMPONENTS } from "./breadth-components.mjs";

const ALL_BREADTH = BREADTH_COMPONENTS;

const TIER_PREFIX = {
  atom: "Components",
  molecule: "Molecules",
  organism: "Organisms",
  pattern: "Patterns",
  template: "Templates",
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "../..");
const TEMPLATES = join(__dirname, "templates");

function fill(template, item) {
  const name = item.name;
  return template
    .replaceAll("{{Name}}", name)
    .replaceAll("{{name}}", name.charAt(0).toLowerCase() + name.slice(1))
    .replaceAll("{{group}}", item.group)
    .replaceAll("{{tier}}", item.tier)
    .replaceAll("{{TierPrefix}}", TIER_PREFIX[item.tier] ?? "Components")
    .replaceAll("{{status}}", item.status ?? "alpha")
    .replaceAll("{{asChild}}", "false")
    .replaceAll("{{radixPrimitiveJson}}", "null");
}

let created = 0;
for (const item of ALL_BREADTH {
  const base =
    item.root === "patterns"
      ? join(REPO_ROOT, "nextjs-app/shared/patterns")
      : join(REPO_ROOT, "nextjs-app/shared/components");
  const dir = join(base, item.name);
  if (!existsSync(dir)) {
    console.warn("skip", item.name);
    continue;
  }
  for (const [tpl, out] of [
    ["component.contract.json.template", `${item.name}.contract.json`],
    ["component.spec.md.template", `${item.name}.spec.md`],
    ["component.mdx.template", `${item.name}.mdx`],
  ]) {
    const path = join(dir, out);
    if (existsSync(path)) continue;
    let body = fill(readFileSync(join(TEMPLATES, tpl), "utf8"), item);
    if (out.endsWith(".contract.json") && item.description) {
      body = body.replace(
        /"description": "TODO:[^"]*"/,
        `"description": ${JSON.stringify(item.description)}`,
      );
    }
    writeFileSync(path, body);
    created++;
    console.log("+", path);
  }
}
console.log("created", created);
