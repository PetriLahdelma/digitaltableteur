import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AsciiSceneBackground } from "./AsciiSceneBackground";
import { ASCII_SCENES } from "./scenes";

vi.mock("./asciiSceneRenderer", () => ({
  createAsciiScene: vi.fn(async () => ({ setColors: vi.fn(), setRunning: vi.fn(), destroy: vi.fn() })),
}));

describe("AsciiSceneBackground", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders one decorative canvas tagged with its scene", () => {
    const { container } = render(<AsciiSceneBackground scene="glove" />);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveAttribute("data-ascii-scene", "glove");
  });

  it("starts nothing under forced colours", () => {
    const idle = vi.fn();
    vi.stubGlobal("requestIdleCallback", idle);
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ ...original(query), matches: query.includes("forced-colors") })) as typeof window.matchMedia;
    render(<AsciiSceneBackground scene="notes" />);
    expect(idle).not.toHaveBeenCalled();
    window.matchMedia = original;
    vi.unstubAllGlobals();
  });

  it("gives every scene a model and both colour tokens", () => {
    for (const preset of Object.values(ASCII_SCENES)) {
      expect(preset.modelUrl).toMatch(/^\/models\/.+\.glb$/);
      expect(preset.colors.fg).toMatch(/^--/);
      expect(preset.colors.bg).toMatch(/^--/);
      expect(preset.strength.default).toBeGreaterThan(0);
    }
  });
});
