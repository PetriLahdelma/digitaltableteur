import { describe, it, expect } from "vitest";
import type { UIMessage } from "ai";
import {
  processMessage,
  TOKEN_OPEN_HOURS,
  TOKEN_SERVICES_GRID,
  extractCopy,
} from "./messageProcessor";

const makeMsg = (role: UIMessage["role"], text: string): UIMessage => ({
  id: Math.random().toString(36).slice(2),
  role,
  parts: [{ type: "text", text }],
});

describe("messageProcessor | OpenHours + ServicesGrid", () => {
  it("extractCopy returns raw text for basic message", () => {
    const m = makeMsg("assistant", "Hello world");
    expect(extractCopy(m)).toBe("Hello world");
  });

  it("assistant explicit token splits and interleaves component parts", () => {
    const m = makeMsg(
      "assistant",
      `Here are details ${TOKEN_OPEN_HOURS} Please review.`,
    );
    const processed = processMessage(m);
    expect(processed.parts).toHaveLength(3);
    expect(processed.parts[0]).toMatchObject({ kind: "text" });
    expect(processed.parts[1]).toMatchObject({
      kind: "component",
      name: "OpenHours",
    });
    expect(processed.parts[2]).toMatchObject({ kind: "text" });
  });

  it("assistant heuristic mention appends component when no token", () => {
    const m = makeMsg(
      "assistant",
      "Can you tell me your open hours and closing time?",
    );
    const processed = processMessage(m);
    expect(processed.parts).toHaveLength(2);
    expect(processed.parts[0]).toMatchObject({ kind: "text" });
    expect(processed.parts[1]).toMatchObject({
      kind: "component",
      name: "OpenHours",
    });
  });

  it("user explicit token is stripped with NO component injection", () => {
    const original = `Show ${TOKEN_OPEN_HOURS} now please`;
    const m = makeMsg("user", original);
    const processed = processMessage(m);
    expect(processed.parts).toHaveLength(1);
    expect(processed.parts[0]).toMatchObject({ kind: "text" });
    expect((processed.parts[0] as any).content).not.toContain(TOKEN_OPEN_HOURS);
  });

  it("assistant multiple tokens produce multiple components", () => {
    const m = makeMsg(
      "assistant",
      `First ${TOKEN_OPEN_HOURS} middle ${TOKEN_OPEN_HOURS} end`,
    );
    const processed = processMessage(m);
    // segments: First | middle | end => text, comp, text, comp, text
    const componentCount = processed.parts.filter(
      (p) => p.kind === "component",
    ).length;
    expect(componentCount).toBe(2);
    expect(processed.parts.length).toBe(5);
  });

  // ServicesGrid token should interleave only once (dedup subsequent tokens)
  it("assistant servicesGrid token renders a single ServicesGrid component", () => {
    const m = makeMsg(
      "assistant",
      `Intro ${TOKEN_SERVICES_GRID} middle ${TOKEN_SERVICES_GRID} end`,
    );
    const processed = processMessage(m);
    const servicesParts = processed.parts.filter(
      (p) => p.kind === "component" && p.name === "ServicesGrid",
    );
    expect(servicesParts.length).toBe(1);
  });

  it("assistant heuristic services mention appends ServicesGrid when no token", () => {
    const m = makeMsg(
      "assistant",
      "Can you outline your services and capabilities?",
    );
    const processed = processMessage(m);
    const last = processed.parts[processed.parts.length - 1];
    expect(last).toMatchObject({ kind: "component", name: "ServicesGrid" });
  });

  it("user servicesGrid token is stripped with NO component injection", () => {
    const m = makeMsg("user", `Show ${TOKEN_SERVICES_GRID} now please`);
    const processed = processMessage(m);
    expect(processed.parts).toHaveLength(1);
    expect(processed.parts[0]).toMatchObject({ kind: "text" });
    expect((processed.parts[0] as any).content).not.toContain(
      TOKEN_SERVICES_GRID,
    );
  });

  it("user heuristic services mention does not inject ServicesGrid", () => {
    const m = makeMsg("user", "Tell me about your services and capabilities");
    const processed = processMessage(m);
    const hasServices = processed.parts.some(
      (p) => p.kind === "component" && p.name === "ServicesGrid",
    );
    expect(hasServices).toBe(false);
  });
});
