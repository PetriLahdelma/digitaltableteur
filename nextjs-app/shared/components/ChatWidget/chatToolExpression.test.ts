import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import {
  extractShowExpressionFromMessage,
  extractShowExpressionResults,
} from "./chatToolExpression";

describe("chatToolExpression", () => {
  it("extracts AI SDK showExpression output", () => {
    const message: UIMessage = {
      id: "assistant-1",
      role: "assistant",
      parts: [
        {
          type: "tool-studio.showExpression",
          toolCallId: "call-expr",
          state: "output-available",
          output: {
            expression: "celebrating",
            label: "Celebrating",
            durationMs: 3000,
          },
        } as never,
      ],
    };

    expect(extractShowExpressionResults(message)).toEqual([
      {
        toolCallId: "call-expr",
        expression: "celebrating",
        label: "Celebrating",
        durationMs: 3000,
      },
    ]);
    expect(extractShowExpressionFromMessage(message)).toBe("celebrating");
  });

  it("reads in-flight input while the tool is running", () => {
    const message: UIMessage = {
      id: "assistant-2",
      role: "assistant",
      parts: [
        {
          type: "tool-studio.showExpression",
          toolCallId: "call-expr-2",
          state: "input-available",
          input: { expression: "happy", durationMs: 2000 },
        } as never,
      ],
    };

    expect(extractShowExpressionFromMessage(message)).toBe("celebrating");
  });
});
