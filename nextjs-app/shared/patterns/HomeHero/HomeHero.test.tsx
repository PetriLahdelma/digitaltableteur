import React from "react";
import { render, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi, afterEach } from "vitest";
import { HomeHero } from "./HomeHero";

expect.extend(toHaveNoViolations);

const TITLE_OPTIONS = ["First title", "Second title", "Third title"];
const SUBTEXT_OPTIONS = ["First subtext", "Second subtext"];

// Mock the package translation adapter with fixed option arrays so the
// per-visit randomization path (returnObjects lookups) is exercised.
vi.mock("../../lib/translation", () => {
  const t = (key: string, fallbackOrOptions?: unknown) => {
    if (key === "homeHeroGradientTitleOptions") return TITLE_OPTIONS;
    if (key === "homeHeroSubtextOptions") return SUBTEXT_OPTIONS;
    return typeof fallbackOrOptions === "string" ? fallbackOrOptions : key;
  };
  return {
    useTranslate: () => t,
    useLocalization: () => ({
      translate: t,
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: vi.fn(),
      getResourceBundle: vi.fn(),
    }),
  };
});

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useReducedMotion: () => false };
});

afterEach(() => {
  vi.restoreAllMocks();
});

// KineticTitle splits the title into per-word/letter spans, so textContent
// carries no reliable whitespace — compare with all whitespace stripped.
function headingTextCondensed(container: HTMLElement): string {
  return (container.querySelector("h1")?.textContent ?? "").replace(/\s+/g, "");
}

describe("HomeHero", () => {
  it("renders a randomly selected title from the options after mount", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const { container } = render(<HomeHero />);
    // Math.random()=0.99 over 3 options → index 2
    await waitFor(() => {
      expect(headingTextCondensed(container)).toBe("Thirdtitle");
    });
    // TextReveal splits the subtext the same way.
    expect(container.textContent?.replace(/\s+/g, "")).toContain(
      "Secondsubtext",
    );
  });

  it("selects the first option when random is pinned low (guards the returnObjects regression)", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { container } = render(<HomeHero />);
    // If option arrays arrive stringified (the #1035 regression), the static
    // fallback would render instead of any option — this assertion fails.
    await waitFor(() => {
      expect(headingTextCondensed(container)).toBe("Firsttitle");
    });
  });

  it("has no axe violations", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { container } = render(<HomeHero />);
    await waitFor(() => {
      expect(headingTextCondensed(container)).toBe("Firsttitle");
    });
    expect(await axe(container)).toHaveNoViolations();
  }, 30_000);
});
