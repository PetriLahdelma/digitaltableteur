/**
 * Protocol-level regression test: calls every design-system MCP tool through
 * a real client over an in-memory transport. Unit tests on the executors
 * cannot catch schema bugs — an empty input shape made the SDK strip every
 * argument, so find_component_for_intent answered "query is required" to a
 * query for months while its executor tests stayed green.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import agentManifest from "../../foundations/dist/agent-manifest.json";
import { registerDocsRegistryMcpTools } from "./docs-registry-tools";
import { registerDesignSystemMcpTools } from "./register-mcp-tools";
import { registerPublicValidatorTool, SNIPPET_MAX_CHARS } from "./register-public-validator";
import { CONTRACT_REQUIRED_FIELDS, contractEnvelopeSchema } from "./tool-schemas";

const CALLS: Record<string, Record<string, unknown>> = {
  list_components: { status: "stable", limit: 3 },
  find_component_for_intent: { query: "dismissible warning banner", limit: 3 },
  suggest_pattern_for_layout: { query: "call to action section", limit: 2 },
  get_component_contract: { name: "Button" },
  get_tokens: {},
  validate_component_usage: { snippet: "<button>Go</button>" },
  search: { query: "toggle", limit: 3 },
  get: { name: "Button", section: "usage" },
};

let client: Client;

beforeAll(async () => {
  const server = new McpServer({ name: "test", version: "0.0.0" });
  registerDesignSystemMcpTools(server);
  registerDocsRegistryMcpTools(server);
  const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  client = new Client({ name: "test-client", version: "0.0.0" });
  await client.connect(clientTransport);
});

afterAll(async () => {
  await client.close();
});

describe("design-system MCP tools over the protocol", () => {
  it("advertises every argument each tool reads, plus an output schema", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(Object.keys(CALLS).sort());
    for (const tool of tools) {
      const declared = Object.keys(tool.inputSchema.properties ?? {});
      for (const arg of Object.keys(CALLS[tool.name])) {
        expect(declared, `${tool.name} must declare "${arg}"`).toContain(arg);
      }
      expect(tool.outputSchema, `${tool.name} outputSchema`).toBeDefined();
    }
  });

  it.each(Object.entries(CALLS))(
    "%s receives its arguments and returns valid structured content",
    async (name, args) => {
      const result = await client.callTool({ name, arguments: args });
      expect(result.isError, JSON.stringify(result.content)).toBeFalsy();
      expect(result.structuredContent).toBeTypeOf("object");
      // The text block mirrors the structured payload for older clients.
      const [block] = result.content as Array<{ type: string; text: string }>;
      expect(JSON.parse(block.text)).toEqual(result.structuredContent);
    },
  );

  it("passes the query through to the ranker", async () => {
    const result = await client.callTool({
      name: "find_component_for_intent",
      arguments: { query: "dismissible warning banner" },
    });
    const payload = result.structuredContent as { query: string; matches: unknown[] };
    expect(payload.query).toBe("dismissible warning banner");
    expect(payload.matches.length).toBeGreaterThan(0);
  });

  it("rejects a call that omits a required argument", async () => {
    const result = await client.callTool({
      name: "get_component_contract",
      arguments: {},
    });
    expect(result.isError).toBe(true);
  });
});

describe("contract envelope schema", () => {
  it("only types fields the contract JSON Schema requires or allows", () => {
    const typed = Object.keys(contractEnvelopeSchema.shape);
    const required = new Set(CONTRACT_REQUIRED_FIELDS);
    // Every required contract field is typed, so agents can rely on it.
    for (const field of required) {
      if (field === "schemaVersion") continue;
      expect(typed, `envelope must type required field "${field}"`).toContain(field);
    }
  });

  it("accepts every contract in the agent manifest", () => {
    const failures = (agentManifest as { components: Array<{ name: string; contract: unknown }> })
      .components.flatMap(({ name, contract }) => {
        const parsed = contractEnvelopeSchema.safeParse(contract);
        return parsed.success ? [] : [`${name}: ${parsed.error.issues[0]?.path.join(".")}`];
      });
    expect(failures).toEqual([]);
  });
});

describe("public validate_component_usage (snippet-only)", () => {
  let publicClient: Client;

  beforeAll(async () => {
    const server = new McpServer({ name: "public", version: "0.0.0" });
    registerPublicValidatorTool(server);
    const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    publicClient = new Client({ name: "public-client", version: "0.0.0" });
    await publicClient.connect(clientTransport);
  });

  afterAll(async () => {
    await publicClient.close();
  });

  it("never accepts a filePath argument", async () => {
    const { tools } = await publicClient.listTools();
    const [tool] = tools;
    expect(Object.keys(tool.inputSchema.properties ?? {}).sort()).toEqual([
      "component",
      "props",
      "snippet",
    ]);
  });

  it("finds contract violations in a snippet from the compact rule set", async () => {
    const result = await publicClient.callTool({
      name: "validate_component_usage",
      arguments: { snippet: '<Card title="Case" link="/work" footerEnd={<span />} />' },
    });
    const payload = result.structuredContent as {
      ok: boolean;
      contractFindings: Array<{ rule: string }>;
    };
    expect(payload.ok).toBe(false);
    expect(payload.contractFindings.map((f) => f.rule)).toEqual(["card-link-with-footer"]);
  });

  it("rejects snippets over the size cap", async () => {
    const result = await publicClient.callTool({
      name: "validate_component_usage",
      arguments: { snippet: "x".repeat(SNIPPET_MAX_CHARS + 1) },
    });
    expect(result.isError).toBe(true);
  });
});
