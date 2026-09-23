import { describe, expect, it } from "vitest";

import { buildSystemPrompt } from "./chat-shared";

describe("Donny AI Act boundaries", () => {
  it("identifies the assistant as AI and forbids regulated decision uses", () => {
    const prompt = buildSystemPrompt([]);

    expect(prompt).toContain("an AI assistant");
    expect(prompt).toContain("never a human");
    expect(prompt).toContain("Do NOT rank, score, profile");
    expect(prompt).toContain("recruitment");
    expect(prompt).toContain("Do NOT infer emotions, biometric traits");
    expect(prompt).toContain("Do NOT make binding commitments");
  });
});
