import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";

import {
  EXT,
  convertValue,
  layoutTree,
  parseCssColor,
  parseCubicBezier,
  parseDimension,
  splitTopLevel,
} from "./dtcg-2025-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "../../nextjs-app/shared/foundations/tokens/production");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const tokenFiles = [
  ...readdirSync(OUT)
    .filter((f) => f.endsWith(".json") && !f.endsWith(".resolver.json"))
    .map((f) => join(OUT, f)),
  ...readdirSync(join(OUT, "themes")).map((f) => join(OUT, "themes", f)),
];

function ajvFor(schemaFile) {
  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);
  return ajv.compile(readJson(join(HERE, "schemas", schemaFile)));
}

/** Every token in a tree, keyed by its reference path (with $root). */
function collectTokens(node, prefix = [], out = new Map()) {
  for (const [key, child] of Object.entries(node ?? {})) {
    if (!child || typeof child !== "object") continue;
    if (key.startsWith("$") && key !== "$root") continue;
    const path = [...prefix, key];
    if ("$value" in child) out.set(path.join("."), child);
    else collectTokens(child, path, out);
  }
  return out;
}

describe("DTCG 2025.10 export", () => {
  it("validates every token file against the official format schema", () => {
    const validate = ajvFor("dtcg-2025.10-format.json");
    const failures = tokenFiles.flatMap((file) =>
      validate(readJson(file))
        ? []
        : [`${file.slice(OUT.length + 1)}: ${JSON.stringify(validate.errors?.[0])}`],
    );
    expect(failures).toEqual([]);
  });

  it("validates the resolver document against the official resolver schema", () => {
    const validate = ajvFor("dtcg-2025.10-resolver.json");
    const resolver = readJson(join(OUT, "digitaltableteur.resolver.json"));
    expect(validate(resolver), JSON.stringify(validate.errors?.[0])).toBe(true);
    const refs = [
      ...resolver.sets.foundation.sources,
      ...Object.values(resolver.modifiers.theme.contexts).flat(),
    ].map((source) => source.$ref);
    for (const ref of refs) expect(() => readJson(join(OUT, ref))).not.toThrow();
  });

  it("resolves every alias to a token of the same type", () => {
    const foundation = new Map();
    for (const file of tokenFiles.filter((f) => !f.includes("/themes/"))) {
      for (const [path, token] of collectTokens(readJson(file))) foundation.set(path, token);
    }
    const broken = [];
    for (const file of tokenFiles) {
      for (const [path, token] of collectTokens(readJson(file))) {
        const ref =
          typeof token.$value === "string" && token.$value.startsWith("{")
            ? token.$value.slice(1, -1)
            : token.$value?.$ref?.replace(/^#\//, "").replace(/\/\$value$/, "").split("/").join(".");
        if (!ref) continue;
        const target = foundation.get(ref);
        if (!target || target.$type !== token.$type) broken.push(`${path} -> ${JSON.stringify(token.$value)}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it("accounts for every catalog token: exported, or listed as non-DTCG with a reason", () => {
    const catalog = readJson(resolve(HERE, "../../nextjs-app/shared/foundations/token-catalog.json"));
    const seen = new Set();
    for (const file of tokenFiles.filter((f) => !f.includes("/themes/"))) {
      const json = readJson(file);
      for (const token of collectTokens(json).values()) seen.add(token.$extensions[EXT].cssVar);
      for (const listed of json.$extensions?.[EXT]?.nonDtcg ?? []) {
        expect(listed.reason).toBeTruthy();
        seen.add(listed.cssVar);
      }
    }
    expect(seen.size).toBe(catalog.tokenCount);
  });
});

describe("value conversion", () => {
  const ctx = { aliasFor: () => null, resolve: () => null };

  it("parses hex, rgb, modern rgb with slash alpha, and transparent", () => {
    expect(parseCssColor("#f205c5")).toEqual({
      colorSpace: "srgb",
      components: [0.949, 0.0196, 0.7725],
      hex: "#f205c5",
    });
    expect(parseCssColor("rgb(0 0 0 / 6%)")).toMatchObject({ components: [0, 0, 0], alpha: 0.06 });
    expect(parseCssColor("rgba(255, 255, 255, 0.5)")).toMatchObject({ components: [1, 1, 1], alpha: 0.5 });
    expect(parseCssColor("transparent")).toMatchObject({ alpha: 0 });
    expect(parseCssColor("Canvas")).toBeNull();
  });

  it("computes static color-mix in srgb", () => {
    expect(parseCssColor("color-mix(in srgb, #fff 60%, #000)")?.hex).toBe("#999999");
  });

  it("parses px/rem dimensions and cubic-bezier curves only", () => {
    expect(parseDimension("1.5rem")).toEqual({ value: 1.5, unit: "rem" });
    expect(parseDimension("0")).toEqual({ value: 0, unit: "px" });
    expect(parseDimension("50%")).toBeNull();
    expect(parseCubicBezier("cubic-bezier(\n 0.16,\n 1,\n 0.3,\n 1\n)")).toEqual([0.16, 1, 0.3, 1]);
  });

  it("converts multi-layer shadows and gradients", () => {
    expect(convertValue("shadow", "0 1px 2px rgb(0 0 0 / 6%)", ctx).value).toMatchObject({
      offsetY: { value: 1, unit: "px" },
      blur: { value: 2, unit: "px" },
      spread: { value: 0, unit: "px" },
    });
    expect(
      convertValue("gradient", "linear-gradient(120deg, #007cf0 0%, #ff0080 50%, #fff200 100%)", ctx).value,
    ).toHaveLength(3);
  });

  it("writes aliases for token references and inlines font stacks", () => {
    const aliasCtx = {
      aliasFor: (name) => (name === "--color-primary" ? "{color.primary}" : null),
      resolve: (name) => (name === "--font-body" ? '"Inter", sans-serif' : null),
    };
    expect(convertValue("color", "var(--color-primary)", aliasCtx)).toEqual({ value: "{color.primary}" });
    expect(convertValue("fontFamily", "var(--font-body), system-ui", aliasCtx)).toEqual({
      value: ["Inter", "sans-serif", "system-ui"],
    });
  });

  it("refuses values DTCG 2025.10 cannot express", () => {
    expect(convertValue("dimension", "clamp(1rem, 2vi, 2rem)", ctx)).toHaveProperty("reason");
    expect(convertValue("dimension", "-0.05em", ctx)).toHaveProperty("reason");
  });
});

describe("layoutTree", () => {
  it("moves a token that is also a group under $root", () => {
    const paths = layoutTree(["--font-size-text", "--font-size-text-lg"]);
    expect(paths.get("--font-size-text")).toEqual(["font", "size", "text", "$root"]);
    expect(paths.get("--font-size-text-lg")).toEqual(["font", "size", "text", "lg"]);
  });

  it("splits top-level commas only", () => {
    expect(splitTopLevel("rgb(0, 0, 0) 0%, #fff 100%")).toEqual(["rgb(0, 0, 0) 0%", "#fff 100%"]);
  });
});
