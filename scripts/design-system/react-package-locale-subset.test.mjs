import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

import {
  collectPackageSources,
  subsetLocale,
} from "./react-package-locale-subset.mjs";

const repoRoot = resolve(import.meta.dirname, "../..");
const componentsRoot = resolve(repoRoot, "nextjs-app/shared/components");
const entryFiles = ["index", "content", "navigation", "forms"].map((name) =>
  resolve(repoRoot, `packages/react/src/${name}.ts`),
);
const locale = JSON.parse(
  readFileSync(resolve(repoRoot, "nextjs-app/shared/locales/en/translation.json"), "utf8"),
);

test("walks the package graph from its entry points, not the site's pages", () => {
  const sources = collectPackageSources({ entryFiles, componentsRoot });
  expect(sources.some((file) => file.endsWith("StageList/StageList.tsx"))).toBe(true);
  expect(sources.some((file) => file.includes("/components/pages/"))).toBe(false);
  expect(sources.some((file) => /\.(test|stories)\./.test(file))).toBe(false);
});

test("keeps component strings and drops site copy", () => {
  const sources = collectPackageSources({ entryFiles, componentsRoot });
  const subset = subsetLocale(locale, sources);
  expect(subset.stageListAgainAt).toBe(locale.stageListAgainAt);
  expect(subset.projectListComingSoon).toBe(locale.projectListComingSoon);
  expect(subset.cookieConsent?.title).toBe(locale.cookieConsent.title);
  expect(subset.engagementPages).toBeUndefined();
  expect(subset.privacyPolicyIntro).toBeUndefined();
  expect(JSON.stringify(subset).length).toBeLessThan(JSON.stringify(locale).length / 5);
});

test("keeps every key under a template-literal prefix", () => {
  const sources = [resolve(import.meta.dirname, "__fixtures__/locale-subset-source.tsx")];
  const subset = subsetLocale(
    { status: { open: "Open", closed: "Closed" }, unrelated: "x", direct: "y" },
    sources,
  );
  expect(subset).toEqual({ status: { open: "Open", closed: "Closed" }, direct: "y" });
});
