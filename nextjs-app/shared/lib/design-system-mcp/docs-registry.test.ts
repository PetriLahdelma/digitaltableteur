/**
 * Drift guard for the docs-registry MCP surface (Astryx roadmap 3.3):
 * every Tier 1 component must be present with all required doc fields and at
 * least one extracted example source, search must rank obvious intents, and
 * the get() shape is snapshotted per stable component (field presence + story
 * names — not source text, which legitimately changes with story edits).
 */
import { describe, expect, it } from "vitest";

import registryJson from "../../foundations/dist/docs-registry.json";
import { DOC_TIER_1 } from "../../../../scripts/design-system/doc-tiers.mjs";
import {
  executeGet,
  executeSearch,
  scoreEntry,
  type RegistryEntry,
} from "./docs-registry-tools";

const registry = (registryJson as { components: Record<string, RegistryEntry> })
  .components;

const parse = (result: { content: [{ type: "text"; text: string }] }) =>
  JSON.parse(result.content[0].text);

describe("docs-registry drift guard", () => {
  it("contains every Tier 1 component with required doc fields", () => {
    const missing: string[] = [];
    for (const name of DOC_TIER_1 as string[]) {
      const entry = registry[name];
      if (!entry) {
        missing.push(`${name}: absent from registry`);
        continue;
      }
      if (!entry.dense) missing.push(`${name}: no dense description`);
      if ((entry.keywords ?? []).length < 4) missing.push(`${name}: <4 keywords`);
      if (!entry.usage || !(entry.usage as { description?: string }).description)
        missing.push(`${name}: no usage.description`);
      if (!entry.importLine.includes("@dt/")) missing.push(`${name}: bad import line`);
      if (entry.examples.length === 0) missing.push(`${name}: no example source extracted`);
    }
    expect(missing).toEqual([]);
  });

  it("every registry entry has the brief-critical fields", () => {
    for (const entry of Object.values(registry)) {
      expect(entry.name, entry.name).toBeTruthy();
      expect(entry.status, entry.name).toBeTruthy();
      expect(entry.importLine, entry.name).toContain("import");
      expect(entry.dense || entry.description, entry.name).toBeTruthy();
    }
  });
});

describe("search", () => {
  it('search("button") ranks Button first with a budgeted brief', () => {
    const payload = parse(executeSearch({ query: "button" }));
    expect(payload.results[0].name).toBe("Button");
    const top = payload.results[0];
    expect(top.import).toBe('import Button from "@dt/Button";');
    expect(top.keyProps.length).toBeGreaterThan(0);
    expect(top.keyProps.length).toBeLessThanOrEqual(6);
    expect(top.hint).toContain('get("Button")');
    expect(payload.results.length).toBeLessThanOrEqual(8);
  });

  it("keyword and intent queries resolve (toggle -> Switch, dismissible banner -> AlertBanner)", () => {
    const toggle = parse(executeSearch({ query: "toggle" }));
    expect(toggle.results.map((r: { name: string }) => r.name)).toContain("Switch");
    const banner = parse(executeSearch({ query: "dismissible banner" }));
    expect(banner.results.map((r: { name: string }) => r.name)).toContain("AlertBanner");
  });

  it("respects the limit clamp and empty-query error", () => {
    const wide = parse(executeSearch({ query: "form", limit: 50 }));
    expect(wide.results.length).toBeLessThanOrEqual(20);
    const err = executeSearch({ query: "  " });
    expect(err.isError).toBe(true);
  });

  it("demotes sub-components below their parents", () => {
    const subs = Object.values(registry).filter((e) => e.subComponentOf);
    for (const sub of subs) {
      const parent = registry[sub.subComponentOf as string];
      if (!parent) continue;
      const q = parent.name.toLowerCase();
      expect(scoreEntry(sub, q)).toBeLessThan(scoreEntry(parent, q));
    }
  });
});

describe("get", () => {
  it("unknown names return an error with suggestions", () => {
    const res = executeGet({ name: "Buton" });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain("search(");
  });

  it("sections narrow the payload", () => {
    const examples = parse(executeGet({ name: "Button", section: "examples" }));
    expect(examples.examples.length).toBeGreaterThan(0);
    expect(examples.props).toBeUndefined();
    const theming = parse(executeGet({ name: "Button", section: "theming" }));
    // Contract tokens are a categorized object ({colors, spacing, ...}).
    expect(theming.tokens).toBeTruthy();
    expect(typeof theming.tokens).toBe("object");
    const bad = executeGet({ name: "Button", section: "sauce" });
    expect(bad.isError).toBe(true);
  });

  it("snapshot: get() shape per stable component (fields + example story names)", () => {
    const stable = Object.values(registry)
      .filter((e) => e.status === "stable")
      .map((e) => e.name)
      .sort();
    const shapes = Object.fromEntries(
      stable.map((name) => {
        const payload = parse(executeGet({ name }));
        return [
          name,
          {
            fields: Object.keys(payload).sort(),
            group: payload.group,
            import: payload.import,
            exampleStories: payload.examples.map((e: { story: string }) => e.story),
          },
        ];
      }),
    );
    expect(shapes).toMatchSnapshot();
  });
});
