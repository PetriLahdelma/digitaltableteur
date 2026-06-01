import { describe, expect, it } from "vitest";

import {
  buildLeafDescription,
  buildLeafTitle,
  getStackDisplayName,
} from "./display";
import { getPseoLeafPages } from "./catalog";
import { buildLeafStructuredBlocks } from "./leaf-blocks";
import { isPseoLeafIndexable } from "./indexing";

describe("pseo display", () => {
  it("preserves Next.js and TypeScript casing in titles", () => {
    const pages = getPseoLeafPages();
    const nextPage = pages.find((p) => p.stack.slug === "nextjs");
    const tsPage = pages.find((p) => p.stack.slug === "typescript");

    expect(nextPage?.title).toContain("Next.js");
    expect(nextPage?.title).not.toContain("Next.Js");
    expect(tsPage?.title).toContain("TypeScript");
  });

  it("builds leaf titles without broken title case", () => {
    const title = buildLeafTitle(
      { slug: "design-system-audit", name: "Design system audit", shortDescription: "" },
      { slug: "nextjs", name: "Next.js", displayName: "Next.js", shortDescription: "" },
      { slug: "startups", name: "startup teams", shortDescription: "" },
    );
    expect(title).toBe(
      "Design system audit for startup teams using Next.js",
    );
  });

  it("uses displayName for stacks", () => {
    expect(
      getStackDisplayName({
        slug: "nextjs",
        name: "Next.js",
        shortDescription: "",
      }),
    ).toBe("Next.js");
  });

  it("builds descriptions with stack display names", () => {
    const description = buildLeafDescription(
      { slug: "s", name: "Design system audit", shortDescription: "Assess UI." },
      { slug: "nextjs", name: "Next.js", displayName: "Next.js", shortDescription: "" },
      { slug: "startups", name: "startup teams", shortDescription: "" },
    );
    expect(description).toContain("Next.js");
  });
});

describe("pseo leaf blocks", () => {
  it("produces combo-specific structured content", () => {
    const pages = getPseoLeafPages();
    const reactStartup = pages.find(
      (p) =>
        p.service.slug === "design-system-audit" &&
        p.stack.slug === "react" &&
        p.audience.slug === "startups",
    );
    const figmaEnterprise = pages.find(
      (p) =>
        p.service.slug === "design-tokens-setup" &&
        p.stack.slug === "figma" &&
        p.audience.slug === "enterprises",
    );

    expect(reactStartup).toBeDefined();
    expect(figmaEnterprise).toBeDefined();

    const reactBlocks = buildLeafStructuredBlocks(reactStartup!);
    const figmaBlocks = buildLeafStructuredBlocks(figmaEnterprise!);

    expect(reactBlocks.situationMarkdown).toContain("startup teams");
    expect(figmaBlocks.situationMarkdown).toContain("enterprise teams");
    expect(reactBlocks.proofLinks.length).toBeGreaterThan(0);
    expect(reactBlocks.packageFit?.slug).toBe("ux-sprint");
    expect(figmaBlocks.packageFit?.slug).toBe("design-system-lift-off");
  });
});

describe("pseo indexing", () => {
  it("defaults leaves to noindex until pilot slugs are listed", () => {
    expect(isPseoLeafIndexable("design-system-audit-react-startups")).toBe(false);
  });
});
