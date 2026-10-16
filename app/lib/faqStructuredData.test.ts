import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * FAQPage structured data must describe questions that are on the page
 * (search engines treat hidden FAQ markup as spam). Pages may only build it
 * from a visible FAQ source: the procurement FAQ, an engagement page's own
 * offer FAQ, or a pSEO leaf's `blocks.faqs` (PseoLeafPage renders the same
 * list in its FAQ section).
 */
const VISIBLE_SOURCES =
  /getFaqSchema\(\s*(procurementFaqEntries\s*\)|\[\.\.\.copy\.faq, \.\.\.procurementFaqEntries\]\s*\)|blocks\.faqs\.map)/;

function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return pages(path);
    return /^page\.tsx$/.test(name) ? [path] : [];
  });
}

describe("FAQ structured data", () => {
  const root = join(process.cwd(), "app");

  it("comes only from FAQs rendered on the page", () => {
    const offenders = pages(root)
      .map((path) => ({ path, source: readFileSync(path, "utf8") }))
      .filter(({ source }) => source.includes("getFaqSchema("))
      .filter(({ source }) =>
        [...source.matchAll(/getFaqSchema\([^)]*\)/g)].some(
          ([call]) => !VISIBLE_SOURCES.test(call),
        ),
      )
      .map(({ path }) => relative(process.cwd(), path));
    expect(offenders).toEqual([]);
  });

  it("is emitted where the procurement FAQ is shown", () => {
    for (const page of ["app/pricing/page.tsx", "app/engagements/[slug]/page.tsx"]) {
      expect(readFileSync(join(process.cwd(), page), "utf8")).toContain("procurementFaqEntries");
    }
  });
});
