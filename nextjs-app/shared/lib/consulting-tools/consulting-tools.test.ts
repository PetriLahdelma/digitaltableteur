import { describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { CONSULTING_TOOL_NAMES, executeGetHourlyRate } from "./executors";
import { registerConsultingMcpTools } from "./register-mcp-tools";

type TextContent = { type: string; text: string };

const getText = (result: { content?: unknown }) =>
  ((result.content as TextContent[] | undefined)?.[0]?.text ?? "") as string;

/** Spin up a real server + client pair over an in-memory transport. */
async function connectedClient() {
  const server = new McpServer({ name: "test", version: "0.0.0" });
  registerConsultingMcpTools(server);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return client;
}

describe("consulting-tool executors", () => {
  it("exports nine tool names", () => {
    expect(CONSULTING_TOOL_NAMES).toHaveLength(9);
    expect(CONSULTING_TOOL_NAMES).toContain("get_hourly_rate");
  });

  it("get_hourly_rate returns €90–150 range", () => {
    const result = executeGetHourlyRate();
    const text = result.content[0]?.text ?? "";
    expect(text).toContain("90");
    expect(text).toContain("150");
  });
});

describe("registerConsultingMcpTools", () => {
  it("registers nine read-only tools", () => {
    const tool = vi.fn();
    const server = { tool } as unknown as Parameters<
      typeof registerConsultingMcpTools
    >[0];

    const count = registerConsultingMcpTools(server);
    expect(count).toBe(9);
    expect(tool).toHaveBeenCalledTimes(9);
    expect(tool.mock.calls[0]?.[3]?.readOnlyHint).toBe(true);
  });

  it("declares real schemas for every argument-taking tool", () => {
    // Regression guard: an empty schema makes the SDK strip every argument
    // before the handler sees it, silently breaking the tool.
    const tool = vi.fn();
    const server = { tool } as unknown as Parameters<
      typeof registerConsultingMcpTools
    >[0];
    registerConsultingMcpTools(server);

    const schemas = Object.fromEntries(
      tool.mock.calls.map((call) => [call[0], call[2]]),
    );
    expect(Object.keys(schemas.get_case_study)).toContain("slug");
    expect(Object.keys(schemas.get_consulting_fit)).toContain("problem");
    expect(Object.keys(schemas.list_case_studies)).toContain("featuredOnly");
  });

  it("passes arguments through the real SDK to the handlers", async () => {
    const client = await connectedClient();

    // arguments survive the SDK parse (this was the empty-schema bug)
    const fit = await client.callTool({
      name: "get_consulting_fit",
      arguments: { problem: "our design system drifted from production code" },
    });
    expect(fit.isError ?? false).toBe(false);
    expect(getText(fit).length).toBeGreaterThan(0);

    // slug round-trip: list first, then fetch one by its slug
    const list = await client.callTool({
      name: "list_case_studies",
      arguments: {},
    });
    const studies = JSON.parse(getText(list)) as Array<{ slug: string }>;
    expect(studies.length).toBeGreaterThan(0);

    const study = await client.callTool({
      name: "get_case_study",
      arguments: { slug: studies[0].slug },
    });
    expect(study.isError ?? false).toBe(false);
    expect(getText(study)).toContain(studies[0].slug);

    // unknown slug surfaces the executor's graceful error, not a strip-crash
    const missing = await client.callTool({
      name: "get_case_study",
      arguments: { slug: "definitely-not-a-real-slug" },
    });
    expect(missing.isError).toBe(true);
  });
});
