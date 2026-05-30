import { describe, expect, it, vi } from "vitest";
import { CONSULTING_TOOL_NAMES, executeGetHourlyRate } from "./executors";
import { registerConsultingMcpTools } from "./register-mcp-tools";

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
});
