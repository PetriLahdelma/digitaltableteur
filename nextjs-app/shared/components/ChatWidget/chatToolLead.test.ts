import { describe, expect, it, vi } from "vitest";
import {
  CREATE_LEAD_TOOL_NAME,
  extractCreateLeadResults,
  executeCreateLeadPrefill,
} from "./chatToolLead";
import { DONNY_PREFILL_CONTACT_EVENT } from "../DonnyActionProvider/donnyContactPrefill";

describe("chatToolLead", () => {
  it("extracts createLead tool output", () => {
    const results = extractCreateLeadResults({
      id: "m1",
      role: "assistant",
      parts: [
        {
          type: "tool-studio.createLead",
          toolCallId: "call-1",
          state: "output-available",
          output: {
            stored: true,
            leadId: "abc",
            contactUrl: "/contact",
            contactPrefill: {
              projectType: "ds-audit",
              message: "Need: design system audit",
              packageId: "design-system-lift-off",
            },
          },
        },
      ],
    } as never);

    expect(results).toHaveLength(1);
    expect(results[0]?.toolCallId).toBe("call-1");
    expect(results[0]?.contactPrefill?.packageId).toBe(
      "design-system-lift-off",
    );
  });

  it("dispatches contact prefill event", () => {
    const handler = vi.fn();
    window.addEventListener(DONNY_PREFILL_CONTACT_EVENT, handler);

    executeCreateLeadPrefill({
      toolCallId: "call-1",
      stored: true,
      contactUrl: "/contact",
      contactPrefill: {
        message: "Timeline: Q3",
        packageId: "ux-sprint",
        projectType: "component-library",
      },
    });

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(DONNY_PREFILL_CONTACT_EVENT, handler);
  });

  it("uses expected tool name constant", () => {
    expect(CREATE_LEAD_TOOL_NAME).toBe("studio.createLead");
  });
});
