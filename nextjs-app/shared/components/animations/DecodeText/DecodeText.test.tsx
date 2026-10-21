import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecodeText, decodeFrame } from "./DecodeText";

const TEXT = "From concept to code";

describe("decodeFrame", () => {
  it("starts as ASCII, keeps spaces and ends as the text", () => {
    const start = decodeFrame(TEXT, 0, 4);
    expect(start).toHaveLength(TEXT.length);
    expect(start).toMatch(/^[.:\-=+*#%@ ]+$/);
    expect(start.split(" ")).toHaveLength(TEXT.split(" ").length);
    expect(decodeFrame(TEXT, TEXT.length + 4, 4)).toBe(TEXT);
  });

  it("decodes left to right behind a scrambling edge", () => {
    const mid = decodeFrame(TEXT, 10, 4);
    expect(mid.slice(0, 6)).toBe(TEXT.slice(0, 6));
    expect(mid.slice(10)).not.toBe(TEXT.slice(10));
  });
});

/** The global setup reports reduced motion; these tests need the animation. */
function allowMotion() {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
  );
}

describe("DecodeText", () => {
  afterEach(() => vi.restoreAllMocks());

  it("gives assistive tech the real text while the code layer is hidden", () => {
    allowMotion();
    const { container } = render(<DecodeText>{TEXT}</DecodeText>);
    const spans = [...container.querySelectorAll("p > span")];
    const exposed = spans.filter((span) => !span.hasAttribute("aria-hidden"));
    expect(exposed).toHaveLength(1);
    expect(exposed[0].textContent).toBe(TEXT);
    expect(spans.length).toBeGreaterThan(1);
  });

  it("settles into plain text", async () => {
    allowMotion();
    const { container } = render(
      <DecodeText delay={0} duration={0.05}>
        {TEXT}
      </DecodeText>,
    );
    await waitFor(() => expect(container.querySelector("p")?.textContent).toBe(TEXT), {
      timeout: 5000,
    });
    expect(container.querySelector("p span")).toBeNull();
  });

  it("shows the text at once under reduced motion", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({ matches: query.includes("reduce"), media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
    );
    const { container } = render(<DecodeText>{TEXT}</DecodeText>);
    await waitFor(() => expect(container.querySelector("p")?.textContent).toBe(TEXT));
  });
});
