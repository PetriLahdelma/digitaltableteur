import { describe, expect, it } from "vitest";
import {
  adaptToolRecordKeys,
  fromOpenAiToolName,
  isDonnyToolPart,
  normalizeDonnyToolName,
  toOpenAiToolName,
} from "./donny-tool-names";

describe("donny-tool-names", () => {
  it("round-trips studio tool names", () => {
    expect(toOpenAiToolName("studio.getCaseStudies")).toBe(
      "studio_getCaseStudies",
    );
    expect(fromOpenAiToolName("studio_getCaseStudies")).toBe(
      "studio.getCaseStudies",
    );
  });

  it("leaves dotted names unchanged", () => {
    expect(normalizeDonnyToolName("studio.navigateTo")).toBe("studio.navigateTo");
  });

  it("adapts tool record keys", () => {
    const tools = { "studio.openHours": { execute: () => ({}) } };
    const adapted = adaptToolRecordKeys(tools, toOpenAiToolName);
    expect(Object.keys(adapted)).toEqual(["studio_openHours"]);
  });

  it("matches OpenAI underscore tool part types", () => {
    expect(
      isDonnyToolPart(
        { type: "tool-studio_getCaseStudies", toolName: "studio_getCaseStudies" },
        "studio.getCaseStudies",
      ),
    ).toBe(true);
  });
});
