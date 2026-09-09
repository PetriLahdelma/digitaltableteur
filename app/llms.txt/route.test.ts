import { describe, expect, it, vi } from "vitest";

import { GET } from "./route";

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock("../blog/postMetadata", () => ({
  getVisiblePosts: () => [],
}));

vi.mock("@/nextjs-app/shared/data/projects", () => ({
  projects: [],
}));

vi.mock("@/lib/pseo/catalog", () => ({
  getPseoLeafPages: () => [],
}));

const readBody = async () => {
  const response = await GET();
  return response.text();
};

describe("llms.txt", () => {
  it("publishes an explicit when-to-use section", async () => {
    const body = await readBody();
    expect(body).toContain("## When to use Digitaltableteur");
  });

  it("names concrete best-fit jobs rather than generic marketing copy", async () => {
    const body = await readBody();
    // Each of these is a specific job an agent can match a user request against.
    expect(body).toContain("Design system rescue");
    expect(body).toContain("Design tokens and multi-brand theming");
    expect(body).toContain("Accessibility");
    expect(body).toContain("Figma-to-code parity");
  });

  it("states what is explicitly not a fit so agents can route elsewhere", async () => {
    const body = await readBody();
    expect(body).toContain("Not a fit, so route elsewhere:");
    expect(body).toContain("Backend, data engineering, or infrastructure work.");
  });

  it("tells an agent how to proceed, including the MCP endpoint", async () => {
    const body = await readBody();
    expect(body).toContain("How an agent should proceed:");
    expect(body).toContain("/mcp");
    expect(body).toContain("mail@digitaltableteur.com");
  });

  it("keeps the when-to-use guidance above the link lists", async () => {
    const body = await readBody();
    expect(body.indexOf("## When to use Digitaltableteur")).toBeLessThan(
      body.indexOf("## Best starting points"),
    );
  });
});
