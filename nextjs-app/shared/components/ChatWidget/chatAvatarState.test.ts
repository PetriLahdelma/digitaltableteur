import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import {
  extractLastToolActivity,
  messageHasVertaauxOffer,
  normalizeToolPhase,
  resolveChatAvatarState,
  resolveDraftAvatarState,
  resolveErrorAvatarState,
  resolveToolAvatarState,
} from "./chatAvatarState";

const ERROR_COPY = {
  network: "network",
  auth: "auth",
  notFound: "notFound",
  rateLimit: "rateLimit",
  server: "server",
  fallback: "fallback",
} as const;

const TOOL_KEYWORDS = ["search", "price", "contact"];

describe("chatAvatarState", () => {
  describe("normalizeToolPhase", () => {
    it("maps legacy and AI SDK v5 in-flight states to call", () => {
      expect(normalizeToolPhase("call")).toBe("call");
      expect(normalizeToolPhase("partial-call")).toBe("call");
      expect(normalizeToolPhase("input-streaming")).toBe("call");
      expect(normalizeToolPhase("input-available")).toBe("call");
    });

    it("maps completed states to result", () => {
      expect(normalizeToolPhase("result")).toBe("result");
      expect(normalizeToolPhase("output-available")).toBe("result");
    });
  });

  describe("extractLastToolActivity", () => {
    it("reads legacy tool-invocation parts", () => {
      const message: UIMessage = {
        id: "a1",
        role: "assistant",
        parts: [
          {
            type: "tool-invocation",
            toolInvocation: {
              toolName: "studio.navigateTo",
              state: "call",
            },
          } as never,
        ],
      };

      expect(extractLastToolActivity(message)).toEqual({
        toolName: "studio.navigateTo",
        phase: "call",
      });
    });

    it("reads AI SDK tool-studio parts and keeps the latest tool", () => {
      const message: UIMessage = {
        id: "a2",
        role: "assistant",
        parts: [
          {
            type: "tool-studio.projectShowcase",
            toolCallId: "call-1",
            state: "output-available",
            output: { projects: [] },
          } as never,
          {
            type: "tool-studio.vertaauxAccessibility",
            toolCallId: "call-2",
            state: "input-available",
          } as never,
        ],
      };

      expect(extractLastToolActivity(message)).toEqual({
        toolName: "studio.vertaauxAccessibility",
        phase: "call",
      });
    });
  });

  describe("resolveToolAvatarState", () => {
    it("maps navigation tools to handoff", () => {
      expect(
        resolveToolAvatarState({
          toolName: "studio.navigateTo",
          phase: "call",
        }),
      ).toBe("handoff");
    });

    it("maps VertaaUX tools to suggesting", () => {
      expect(
        resolveToolAvatarState({
          toolName: "studio.vertaauxAccessibility",
          phase: "result",
        }),
      ).toBe("suggesting");
    });

    it("maps mail compose to acknowledging while running and success when done", () => {
      expect(
        resolveToolAvatarState({
          toolName: "studio.composeMailRequest",
          phase: "call",
        }),
      ).toBe("acknowledging");
      expect(
        resolveToolAvatarState({
          toolName: "studio.composeMailRequest",
          phase: "result",
        }),
      ).toBe("success");
    });
  });

  describe("resolveDraftAvatarState", () => {
    it("uses confused for frustrated or unclear user input", () => {
      expect(resolveDraftAvatarState("this is confusing", TOOL_KEYWORDS)).toBe(
        "confused",
      );
    });
  });

  describe("resolveErrorAvatarState", () => {
    it("uses confused for fallback errors and error for known failures", () => {
      expect(resolveErrorAvatarState(ERROR_COPY.fallback, ERROR_COPY.fallback)).toBe(
        "confused",
      );
      expect(resolveErrorAvatarState(ERROR_COPY.network, ERROR_COPY.fallback)).toBe(
        "error",
      );
    });
  });

  describe("resolveChatAvatarState", () => {
    const greetingOnly: UIMessage[] = [
      {
        id: "intro",
        role: "assistant",
        parts: [{ type: "text", text: "Hi" }],
      },
    ];

    it("uses loading while waiting for the first stream chunk", () => {
      expect(
        resolveChatAvatarState({
          status: "submitted",
          resolvedErrorCopy: null,
          fallbackErrorCopy: ERROR_COPY.fallback,
          draft: "",
          toolKeywords: TOOL_KEYWORDS,
          emailWorkflowStep: "idle",
          messages: greetingOnly,
        }),
      ).toBe("loading");
    });

    it("uses tool states during submitted and streaming", () => {
      const messages: UIMessage[] = [
        ...greetingOnly,
        {
          id: "assistant-tool",
          role: "assistant",
          parts: [
            {
              type: "tool-studio.navigateTo",
              toolCallId: "call-nav",
              state: "input-available",
              input: { destination: "/pricing" },
            } as never,
          ],
        },
      ];

      expect(
        resolveChatAvatarState({
          status: "submitted",
          resolvedErrorCopy: null,
          fallbackErrorCopy: ERROR_COPY.fallback,
          draft: "",
          toolKeywords: TOOL_KEYWORDS,
          emailWorkflowStep: "idle",
          messages,
        }),
      ).toBe("handoff");
    });

    it("keeps suggesting visible after VertaaUX tool output completes", () => {
      const messages: UIMessage[] = [
        ...greetingOnly,
        {
          id: "assistant-vertaaux",
          role: "assistant",
          parts: [
            {
              type: "tool-studio.vertaauxAccessibility",
              toolCallId: "call-vertaaux",
              state: "output-available",
              output: {
                caseStudyUrl: "/work/vertaaux",
                productUrl: "https://vertaaux.ai",
              },
            } as never,
          ],
        },
      ];

      expect(messageHasVertaauxOffer(messages)).toBe(true);
      expect(
        resolveChatAvatarState({
          status: "ready",
          resolvedErrorCopy: null,
          fallbackErrorCopy: ERROR_COPY.fallback,
          draft: "",
          toolKeywords: TOOL_KEYWORDS,
          emailWorkflowStep: "idle",
          messages,
        }),
      ).toBe("suggesting");
    });
  });
});
