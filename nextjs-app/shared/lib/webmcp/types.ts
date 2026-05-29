/** Minimal WebMCP types (W3C preview — not yet in TypeScript DOM lib). */

export interface WebMcpTextContent {
  type: "text";
  text: string;
}

export interface WebMcpToolResult {
  content: WebMcpTextContent[];
}

export type WebMcpExecuteArgs = Record<string, unknown>;

export interface WebMcpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args?: WebMcpExecuteArgs) => Promise<WebMcpToolResult> | WebMcpToolResult;
  annotations?: { readOnlyHint?: boolean };
}

export interface WebMcpModelContext {
  registerTool: (
    tool: WebMcpToolDefinition,
    options?: { signal?: AbortSignal },
  ) => void;
}

export interface NavigatorWithWebMcp extends Navigator {
  modelContext?: WebMcpModelContext;
}
