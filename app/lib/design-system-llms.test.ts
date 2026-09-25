import { describe, expect, it } from "vitest";

import { buildDesignSystemLlmsTxt } from "./design-system-llms";

const body = buildDesignSystemLlmsTxt("https://example.test");

describe("design-system llms.txt", () => {
  it("points agents at the MCP tools, including the validator", () => {
    expect(body).toContain("https://example.test/mcp");
    expect(body).toContain("`validate_component_usage`");
    expect(body).toContain("/contracts/v1/index.json");
  });

  it("shows the npm import for exported components and never the internal alias", () => {
    expect(body).toMatch(/- Button \(stable\): .+`import \{ Button \} from "@digitaltableteur\/react"`/);
    expect(body).not.toContain("@dt/");
  });

  it("omits deprecated components", () => {
    expect(body).not.toMatch(/^- Hero \(deprecated/m);
  });
});
