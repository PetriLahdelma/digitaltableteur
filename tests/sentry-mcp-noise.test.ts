import type { ErrorEvent } from "@sentry/nextjs";
import { describe, expect, it } from "vitest";

import { dropMcpClientRequestNoise, isMcpClientRequestNoise } from "../sentry.mcp-noise";

function mcpEvent(type: string, value: string, errorType: string, mechanism = "auto.ai.mcp_server"): ErrorEvent {
  return {
    type: undefined,
    exception: {
      values: [{ type, value, mechanism: { type: mechanism, handled: false, data: { error_type: errorType } } }],
    },
  } as ErrorEvent;
}

const initializeValidationReport = JSON.stringify([
  { expected: "string", code: "invalid_type", path: ["params", "protocolVersion"], message: "Invalid input" },
  { expected: "object", code: "invalid_type", path: ["params", "capabilities"], message: "Invalid input" },
]);

describe("isMcpClientRequestNoise", () => {
  // Shapes taken from DIGITALTABLETEUR-NEXT-J, -K and -M (2026-10-23..26).
  it("drops a missing Accept header rejection", () => {
    const event = mcpEvent(
      "Error",
      "Not Acceptable: Client must accept both application/json and text/event-stream",
      "transport",
    );
    expect(isMcpClientRequestNoise(event)).toBe(true);
  });

  it("drops an empty or invalid request body", () => {
    expect(isMcpClientRequestNoise(mcpEvent("SyntaxError", "Unexpected end of JSON input", "transport"))).toBe(true);
  });

  it("drops a -32603 that carries a params schema validation report", () => {
    const event = mcpEvent("JsonRpcError_-32603", initializeValidationReport, "protocol");
    expect(isMcpClientRequestNoise(event)).toBe(true);
    expect(dropMcpClientRequestNoise(event)).toBeNull();
  });

  it("keeps a genuine -32603 internal error", () => {
    const event = mcpEvent("JsonRpcError_-32603", "Cannot read properties of undefined (reading 'map')", "protocol");
    expect(isMcpClientRequestNoise(event)).toBe(false);
    expect(dropMcpClientRequestNoise(event)).toBe(event);
  });

  it("keeps tool handler failures", () => {
    expect(isMcpClientRequestNoise(mcpEvent("Error", "Registry fetch failed", "handler_execution"))).toBe(false);
  });

  it("keeps unexpected transport errors", () => {
    expect(isMcpClientRequestNoise(mcpEvent("Error", "socket hang up", "transport"))).toBe(false);
  });

  it("ignores events from other mechanisms", () => {
    const event = mcpEvent("SyntaxError", "Unexpected end of JSON input", "transport", "auto.http.nextjs");
    expect(isMcpClientRequestNoise(event)).toBe(false);
  });

  it("ignores events without an exception", () => {
    expect(isMcpClientRequestNoise({ type: undefined, message: "hello" } as ErrorEvent)).toBe(false);
  });
});
