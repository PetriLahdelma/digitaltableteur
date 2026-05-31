import { describe, expect, it } from "vitest";
import { sanitizeAssistantChatMarkdown } from "./chatMarkdownSanitizer";

describe("sanitizeAssistantChatMarkdown", () => {
  it("removes markdown image syntax", () => {
    const input =
      "See DSharp:\n![DSharp Design System](/images/dsharp.png)\nMore text.";
    expect(sanitizeAssistantChatMarkdown(input, [])).toBe(
      "See DSharp:\n\nMore text.",
    );
  });

  it("removes redundant case study headings when cards render", () => {
    const input =
      "This fits your budget.\n\n## Notable Case Studies\n\nHere are some relevant projects we've worked on:";
    const result = sanitizeAssistantChatMarkdown(input, [
      {
        kind: "component",
        name: "ProjectCards",
        props: { projects: [] },
        meta: { toolName: "studio.getCaseStudies", toolLabel: "Case study lookup" },
      },
    ]);
    expect(result).not.toMatch(/Notable Case Studies/i);
    expect(result).toContain("This fits your budget.");
  });
});
