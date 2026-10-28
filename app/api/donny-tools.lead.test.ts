import { describe, expect, it, vi } from "vitest";

import { getDatabase } from "../lib/mongodb";
import { getDonnyTools } from "./donny-tools";

vi.mock("../lib/mongodb", () => ({ getDatabase: vi.fn() }));

type LeadExecute = (
  input: Record<string, unknown>,
  options: { toolCallId: string; messages: [] },
) => Promise<{ stored: boolean; contactUrl: string; contactPrefill?: unknown }>;

async function createLead(input: Record<string, unknown>) {
  const tools = await getDonnyTools({ enableMcp: false, allowStdio: false });
  const execute = tools["studio.createLead"]?.execute as unknown as LeadExecute;
  return execute(input, { toolCallId: "t1", messages: [] });
}

describe("studio.createLead", () => {
  it("stores nothing, even with the model's consent flag and an email", async () => {
    const result = await createLead({
      persona: "client",
      consent: true,
      name: "Anna",
      email: "anna@example.com",
      need: "Design system audit",
    });

    expect(getDatabase).not.toHaveBeenCalled();
    expect(result.stored).toBe(false);
    expect(result.contactUrl).toBe("/contact");
    expect(result.contactPrefill).toBeTruthy();
    expect(JSON.stringify(result)).not.toContain("anna@example.com");
  });

  it("returns no prefill without consent", async () => {
    const result = await createLead({ persona: "client", consent: false });
    expect(result).toMatchObject({ stored: false, contactUrl: "/contact" });
    expect(result.contactPrefill).toBeUndefined();
  });
});
