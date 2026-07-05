import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolvePhosphorIcon } from "./iconRegistry";

/**
 * Guard against the recurring "silent-empty icon" class: a story that passes an
 * `icon="slug"` or `<Icon name="slug">` whose slug is not in the curated
 * iconRegistry renders NO svg at all (resolvePhosphorIcon returns null), which
 * is invisible until someone eyeballs the story. This test fails the build
 * instead, naming the offending slug + file.
 */
const COMPONENTS_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function collectStoryFiles(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectStoryFiles(full, out);
    else if (entry.endsWith(".stories.tsx")) out.push(full);
  }
}

const ICON_PROP_RE = /\bicon="([a-z][a-z0-9-]+)"/g;
const ICON_NAME_RE = /<Icon\b[^>]*?\bname="([a-z][a-z0-9-]+)"/g;

type Usage = { slug: string; file: string };

const usages: Usage[] = (() => {
  const files: string[] = [];
  collectStoryFiles(COMPONENTS_ROOT, files);
  const found: Usage[] = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const short = file.slice(COMPONENTS_ROOT.length + 1);
    for (const re of [ICON_PROP_RE, ICON_NAME_RE]) {
      re.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = re.exec(text)) !== null) {
        found.push({ slug: match[1], file: short });
      }
    }
  }
  return found;
})();

const uniqueSlugs = [...new Set(usages.map((u) => u.slug))].sort();

describe("iconRegistry story coverage", () => {
  it("finds icon slugs in component stories to validate", () => {
    expect(usages.length).toBeGreaterThan(0);
  });

  it.each(uniqueSlugs)('story icon slug "%s" resolves to a real icon', (slug) => {
    const where = usages
      .filter((u) => u.slug === slug)
      .map((u) => u.file)
      .join(", ");
    expect(
      resolvePhosphorIcon(slug),
      `icon slug "${slug}" (used in ${where}) is not registered in iconRegistry.ts, so it renders a silent-empty SVG. Register the Phosphor icon (import + PHOSPHOR_ICONS map) or use a registered slug.`,
    ).not.toBeNull();
  });
});
