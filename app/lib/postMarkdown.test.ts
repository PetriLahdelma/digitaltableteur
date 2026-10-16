import { describe, expect, it } from "vitest";

import { getVisiblePosts } from "@/app/blog/postMetadata";
import { buildPostMarkdown, literalToJson, mdxToMarkdown } from "./postMarkdown";

const BASE = "https://www.digitaltableteur.com";

describe("post markdown", () => {
  it("turns a plain JS literal into JSON without evaluating it", () => {
    const json = literalToJson(`[
  { id: "a", label: "Scoping: early", stages: ["x", "y"], },
]`);
    expect(JSON.parse(json)).toEqual([{ id: "a", label: "Scoping: early", stages: ["x", "y"] }]);
  });

  it("converts figures, captions, embeds and relative links", () => {
    const md = mdxToMarkdown(
      [
        "<ArticleFigure layout=\"full\">",
        "",
        "<img src=\"/blog/a/fig.webp\" alt=\"A chart\" />",
        "",
        "<figcaption>Runs with <code>CI=1</code> set.</figcaption>",
        "",
        "</ArticleFigure>",
        "",
        "See [the audit](/engagements/design-system-audit).",
        "",
        "<Embed",
        "  provider=\"youtube\"",
        "  url=\"https://www.youtube.com/embed/x\"",
        "  title=\"Overview\"",
        "/>",
      ].join("\n"),
      BASE,
    );
    expect(md).toContain(`![A chart](${BASE}/blog/a/fig.webp)`);
    expect(md).toContain("*Runs with `CI=1` set.*");
    expect(md).toContain(`[the audit](${BASE}/engagements/design-system-audit)`);
    expect(md).toContain("[Overview](https://www.youtube.com/watch?v=x)");
    expect(md).not.toMatch(/<\/?(ArticleFigure|figcaption|img|Embed)/);
  });

  it("keeps import and export lines inside code fences", () => {
    const md = mdxToMarkdown(
      "Intro\n\n```ts\nimport x from \"y\";\nexport const list = [\n  1,\n];\n```",
      BASE,
    );
    expect(md).toContain('import x from "y";');
    expect(md).toContain("export const list = [");
  });

  it("keeps commas inside strings and handles CRLF, titled links and embeds", () => {
    expect(JSON.parse(literalToJson('[{ a: "x=1,]", },]'))).toEqual([{ a: "x=1,]" }]);
    const md = mdxToMarkdown(
      'See [p](/blog/a "T") and [cdn](//cdn.example.com/x).\r\n\r\n<Embed\r\n  url="https://www.youtube.com/embed/abc_1?si=z"\r\n  title="Clip"\r\n/>',
      BASE,
    );
    expect(md).toContain(`[p](${BASE}/blog/a "T")`);
    expect(md).toContain("[cdn](//cdn.example.com/x)");
    expect(md).toContain("[Clip](https://www.youtube.com/watch?v=abc_1)");
    expect(md).not.toContain("\r");
  });

  it("leaves code fences untouched", () => {
    const md = mdxToMarkdown("```tsx\n<img src=\"/x.png\" />\n```", BASE);
    expect(md).toBe("```tsx\n<img src=\"/x.png\" />\n```");
  });

  it("renders the Plausible Accessibility article in full, with every who-to-call case", () => {
    const post = getVisiblePosts().find((p) => p.slug === "plausible-accessibility");
    expect(post).toBeDefined();
    const md = buildPostMarkdown(post!, BASE) ?? "";
    expect(md.startsWith("# Plausible Accessibility")).toBe(true);
    expect(md).toContain(`- URL: ${BASE}/blog/plausible-accessibility`);
    expect(md).toContain("### Before you build");
    expect(md).toContain("- **Before any conformance claim** (Before the claim, leadership).");
    // Mirrors StageList: each case is placed once, later stages recur.
    expect(md.match(/^- \*\*/gm)?.length).toBe(14);
    expect(md).toContain("Again at release candidate.");
    expect(md).toContain('expect(trigger).toHaveAccessibleName("EN, English");');
    expect(md).not.toContain("export const");
    expect(md).not.toMatch(/<StageList|<ArticleFigure/);
  });

  it("finds a Markdown source for every visible post", () => {
    for (const post of getVisiblePosts()) {
      expect(buildPostMarkdown(post, BASE), post.slug).not.toBeNull();
    }
  });
});
