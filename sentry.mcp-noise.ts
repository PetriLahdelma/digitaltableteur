import type { ErrorEvent } from "@sentry/nextjs";

/**
 * The public MCP endpoint (/mcp, /api/[transport]) is open to any client, and
 * scanners regularly send it malformed requests. Sentry's MCP server
 * integration (mechanism "auto.ai.mcp_server") reports the resulting
 * rejections as unhandled server errors. It already skips the JSON-RPC client
 * codes (-32700, -32600, -32601, -32602), but two client-caused shapes still
 * reach the issue feed and its alert emails:
 *
 * - transport errors raised before JSON-RPC parsing: a missing Accept header
 *   ("Not Acceptable"), the wrong Content-Type, or an empty or invalid body;
 * - -32603 responses whose message is a schema validation report, which the
 *   MCP SDK sends when a request such as `initialize` lacks required params.
 *
 * Genuine tool or handler failures keep their normal reporting.
 */
const MCP_MECHANISM = "auto.ai.mcp_server";

const CLIENT_TRANSPORT_MESSAGES = [
  /^Not Acceptable:/,
  /^Unsupported Media Type:/,
  /^Method Not Allowed/,
  /^Bad Request:/,
  /^Parse error/,
  /Unexpected end of JSON input/,
  /is not valid JSON/,
];

function isSchemaValidationReport(message: string): boolean {
  try {
    const issues: unknown = JSON.parse(message);
    return (
      Array.isArray(issues) &&
      issues.length > 0 &&
      issues.every(
        (issue) =>
          typeof issue === "object" &&
          issue !== null &&
          "code" in issue &&
          "path" in issue &&
          Array.isArray((issue as { path: unknown }).path) &&
          (issue as { path: unknown[] }).path[0] === "params",
      )
    );
  } catch {
    return false;
  }
}

export function isMcpClientRequestNoise(event: ErrorEvent): boolean {
  const exception = event.exception?.values?.at(-1);
  if (!exception || exception.mechanism?.type !== MCP_MECHANISM) return false;

  const message = exception.value ?? "";
  const errorType = exception.mechanism.data?.error_type;

  if (errorType === "transport") {
    return (
      exception.type === "SyntaxError" ||
      CLIENT_TRANSPORT_MESSAGES.some((pattern) => pattern.test(message))
    );
  }

  if (errorType === "protocol" && exception.type === "JsonRpcError_-32603") {
    return isSchemaValidationReport(message);
  }

  return false;
}

export function dropMcpClientRequestNoise(event: ErrorEvent): ErrorEvent | null {
  return isMcpClientRequestNoise(event) ? null : event;
}
