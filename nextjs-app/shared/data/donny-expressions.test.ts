import { describe, expect, it } from "vitest";
import {
  clampDonnyExpressionDurationMs,
  listDonnyShowcaseExpressions,
  resolveDonnyShowcaseExpression,
} from "./donny-expressions";

describe("donny-expressions", () => {
  it("resolves canonical expression ids", () => {
    expect(resolveDonnyShowcaseExpression("celebrating")).toBe("celebrating");
    expect(resolveDonnyShowcaseExpression("thinking")).toBe("thinking");
  });

  it("resolves common aliases", () => {
    expect(resolveDonnyShowcaseExpression("happy")).toBe("celebrating");
    expect(resolveDonnyShowcaseExpression("surprised")).toBe("impressed");
    expect(resolveDonnyShowcaseExpression("wave")).toBe("waving");
  });

  it("falls back to playful for unknown tokens", () => {
    expect(resolveDonnyShowcaseExpression("unknown-mood")).toBe("playful");
    expect(resolveDonnyShowcaseExpression("")).toBe("playful");
  });

  it("clamps duration to a safe range", () => {
    expect(clampDonnyExpressionDurationMs(undefined)).toBe(2_500);
    expect(clampDonnyExpressionDurationMs(100)).toBe(800);
    expect(clampDonnyExpressionDurationMs(20_000)).toBe(8_000);
  });

  it("lists all showcase expressions with labels", () => {
    const list = listDonnyShowcaseExpressions();
    expect(list.length).toBeGreaterThan(10);
    expect(list.some((entry) => entry.id === "playful")).toBe(true);
  });
});
