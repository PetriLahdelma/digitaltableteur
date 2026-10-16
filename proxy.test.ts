import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { prefersMarkdown, proxy } from "./proxy";

const run = (path: string, accept = "text/html") =>
  proxy(new NextRequest(`https://www.digitaltableteur.com${path}`, { headers: { accept } }));
const rewriteOf = (res: Response) => res.headers.get("x-middleware-rewrite");

describe("markdown negotiation", () => {
  it("reads q-values instead of matching the substring", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown, text/html;q=0.8")).toBe(true);
    expect(prefersMarkdown("text/html, text/markdown;q=0.5")).toBe(false);
    expect(prefersMarkdown("text/markdown;q=0")).toBe(false);
    expect(prefersMarkdown("text/html,application/xhtml+xml,*/*;q=0.8")).toBe(false);
  });

  it("serves the Markdown version of a post for .md and for Accept", () => {
    expect(rewriteOf(run("/blog/plausible-accessibility.md"))).toContain(
      "/blog/plausible-accessibility/markdown",
    );
    expect(rewriteOf(run("/blog/plausible-accessibility", "text/markdown"))).toContain(
      "/blog/plausible-accessibility/markdown",
    );
    expect(rewriteOf(run("/blog/plausible-accessibility"))).toBeNull();
  });

  it("points the .md address at the HTML page as canonical", () => {
    const link = run("/engagements/agent-pilot.md").headers.get("link") ?? "";
    expect(link.startsWith('<https://www.digitaltableteur.com/engagements/agent-pilot>; rel="canonical"')).toBe(true);
    expect(link).toContain('/llms.txt>; rel="describedby"');
  });

  it("keeps the full case study for Accept and serves the summary only for .md", () => {
    expect(rewriteOf(run("/work/helsinki-design-system", "text/markdown"))).toBeNull();
    expect(rewriteOf(run("/work/helsinki-design-system.md"))).toContain(
      "/work/helsinki-design-system/markdown",
    );
  });

  it("leaves standalone case studies and other paths alone", () => {
    expect(rewriteOf(run("/work/intrum.md"))).toBeNull();
    expect(rewriteOf(run("/blog/feed.xml", "text/markdown"))).toBeNull();
    expect(rewriteOf(run("/blog/authors/petri-lahdelma", "text/markdown"))).toBeNull();
  });

  it("marks negotiable HTML responses with Vary: Accept", () => {
    expect(run("/blog/plausible-accessibility").headers.get("vary")).toBe("Accept");
  });
});
