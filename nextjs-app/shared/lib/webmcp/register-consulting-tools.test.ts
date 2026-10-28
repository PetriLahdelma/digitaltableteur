import { describe, expect, it, vi } from "vitest";

import {
  buildConsultingWebMcpTools,
  registerConsultingWebMcpTools,
} from "./register-consulting-tools";

describe("register-consulting-tools", () => {
  it("builds nine read-only consulting tools", () => {
    const tools = buildConsultingWebMcpTools();
    expect(tools).toHaveLength(9);
    expect(tools.every((t) => t.annotations?.readOnlyHint)).toBe(true);
    expect(tools.map((t) => t.name)).toContain("get_hourly_rate");
    expect(tools.map((t) => t.name)).toContain("list_case_studies");
  });

  it("registers all tools on modelContext", () => {
    const registerTool = vi.fn();
    const count = registerConsultingWebMcpTools({ registerTool });
    expect(count).toBe(9);
    expect(registerTool).toHaveBeenCalledTimes(9);
  });

  it("get_hourly_rate execute returns the pricing page's rates", async () => {
    const tool = buildConsultingWebMcpTools().find(
      (t) => t.name === "get_hourly_rate",
    );
    expect(tool).toBeDefined();
    const result = await tool!.execute!();
    const text = result.content[0]?.text ?? "";
    expect(JSON.parse(text)).toMatchObject({ standardEur: 120, partnershipEur: 90 });
  });
});
