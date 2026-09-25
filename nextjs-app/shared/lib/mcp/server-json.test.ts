import { describe, expect, it } from "vitest";

import serverJson from "../../../../server.json";
import { MCP_SERVER_VERSION } from "./constants";

/**
 * server.json is the MCP Registry metadata for the public /mcp endpoint
 * (published with `mcp-publisher publish`, DNS auth for com.digitaltableteur).
 * Keep it in step with the server it describes.
 */
describe("MCP Registry server.json", () => {
  it("advertises the running server version", () => {
    expect(serverJson.version).toBe(MCP_SERVER_VERSION);
  });

  it("points at the public Streamable HTTP endpoint under a DNS-verifiable name", () => {
    expect(serverJson.name).toMatch(/^com\.digitaltableteur\//);
    expect(serverJson.remotes).toEqual([
      { type: "streamable-http", url: "https://www.digitaltableteur.com/mcp" },
    ]);
  });

  it("keeps the description within the registry's 100-character limit", () => {
    expect(serverJson.description.length).toBeLessThanOrEqual(100);
  });
});
