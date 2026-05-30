import { describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";
import {
  executeChatMailRequest,
  extractComposeMailRequestResults,
} from "./chatToolMailRequest";
import { buildDonnyMailtoUrl } from "../../data/donny-mail-requests";

describe("chatToolMailRequest", () => {
  it("extracts AI SDK composeMailRequest output", () => {
    const mailtoUrl = buildDonnyMailtoUrl("cv");
    const message = {
      id: "assistant-1",
      role: "assistant",
      parts: [
        {
          type: "tool-studio.composeMailRequest",
          toolCallId: "mail-1",
          state: "output-available",
          output: {
            requestType: "cv",
            mailtoUrl,
            opened: true,
          },
        },
      ],
    } as UIMessage;

    expect(extractComposeMailRequestResults(message)).toEqual([
      {
        toolCallId: "mail-1",
        requestType: "cv",
        mailtoUrl,
        opened: true,
      },
    ]);
  });

  it("opens allowed mailto URLs in the browser", () => {
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { assign },
    });

    const mailtoUrl = buildDonnyMailtoUrl("portfolio");
    expect(
      executeChatMailRequest({
        toolCallId: "mail-2",
        requestType: "portfolio",
        mailtoUrl,
        opened: true,
      }),
    ).toBe(true);
    expect(assign).toHaveBeenCalledWith(mailtoUrl);
  });
});
