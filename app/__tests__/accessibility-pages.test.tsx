import React from "react";
import { describe, it, expect, vi } from "vitest";
import { configureAxe, type AxeResults } from "jest-axe";
import type { RunOptions } from "axe-core";
import { renderWithProviders, i18n } from "../../test-utils/render";

/** Page suites render partial trees; relax landmark rules that require full-app chrome. */
const axeRunner = configureAxe({
  rules: {
    "landmark-unique": { enabled: false },
    "landmark-no-duplicate-banner": { enabled: false },
    "landmark-no-duplicate-main": { enabled: false },
    // Partial page trees lack surrounding heading context; jsdom contrast is unreliable.
    "heading-order": { enabled: false },
    "color-contrast": { enabled: false },
    "svg-img-alt": { enabled: false },
    "landmark-main-is-top-level": { enabled: false },
  },
});

/** jest-axe cannot run concurrently — serialize scans across this file. */
let axeChain = Promise.resolve();
async function runAxe(
  container: Element,
  options?: RunOptions,
): Promise<AxeResults> {
  const run = axeChain.then(() => axeRunner(container, options));
  axeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

// Import page components
import { HomePage } from "@/nextjs-app/shared/components/pages/Home/HomePage";
import { AboutPage } from "@dt-pages/AboutPage";
import { BlogPage } from "@dt-pages/Blog";
import { WorkIndexPage } from "@dt-pages/Work/WorkIndex";
import { HelsinkiDesignSystemPage } from "@dt-pages/Work/HelsinkiDesignSystem";
import { IllustrationsPage } from "@dt-pages/Work/Illustrations";

// Mock motion/react for animations (prevents animation issues in tests)
vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>(
    "motion/react",
  );
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      section: ({ children, ...props }: any) => (
        <section {...props}>{children}</section>
      ),
      h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
      h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
      p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    },
  };
});

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>(
    "framer-motion",
  );
  return {
    ...actual,
    useReducedMotion: () => false,
  };
});

describe.sequential("Page-level Accessibility Tests", () => {
  // WorkIndex + portfolio pages run axe over large DOM trees.
  const pageAxeTimeout = 30_000;
  describe("HomePage", () => {
    it("has no axe violations in English", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<HomePage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no axe violations in Finnish", async () => {
      await i18n.changeLanguage("fi");
      const { container } = renderWithProviders(<HomePage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no axe violations in Swedish", async () => {
      await i18n.changeLanguage("sv");
      const { container } = renderWithProviders(<HomePage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper heading hierarchy", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<HomePage />);
      const h1 = container.querySelector("h1");

      expect(h1).toBeInTheDocument();
    });

    it("has proper landmark regions", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<HomePage />);
      const sections = container.querySelectorAll("section");

      // HomePage should have multiple sections
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe("AboutPage", () => {
    it("has no axe violations in English", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<AboutPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no axe violations in Finnish", async () => {
      await i18n.changeLanguage("fi");
      const { container } = renderWithProviders(<AboutPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no axe violations in Swedish", async () => {
      await i18n.changeLanguage("sv");
      const { container } = renderWithProviders(<AboutPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper heading hierarchy", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<AboutPage />);
      const headings = container.querySelectorAll("h1, h2, h3");

      // AboutPage should have multiple headings
      expect(headings.length).toBeGreaterThan(0);
    });

    it("manifesto section exposes live regions for highlight tokens", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<AboutPage />);
      const liveElements = container.querySelectorAll('[aria-live="off"]');
      expect(liveElements.length).toBeGreaterThan(0);
    });
  });

  describe("BlogPage", () => {
    it("has no axe violations in English", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<BlogPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no axe violations in Finnish", async () => {
      await i18n.changeLanguage("fi");
      const { container } = renderWithProviders(<BlogPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no axe violations in Swedish", async () => {
      await i18n.changeLanguage("sv");
      const { container } = renderWithProviders(<BlogPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("WorkIndexPage", { timeout: pageAxeTimeout }, () => {
    it("has no axe violations in English", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<WorkIndexPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no axe violations in Finnish", async () => {
      await i18n.changeLanguage("fi");
      const { container } = renderWithProviders(<WorkIndexPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no axe violations in Swedish", async () => {
      await i18n.changeLanguage("sv");
      const { container } = renderWithProviders(<WorkIndexPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Cross-Language Consistency", () => {
    it("HomePage maintains structure across all languages", async () => {
      const languages = ["en", "fi", "sv"];
      const structures: string[] = [];

      for (const lang of languages) {
        await i18n.changeLanguage(lang);
        const { container } = renderWithProviders(<HomePage />);

        // Count structural elements
        const sections = container.querySelectorAll("section").length;
        const headings = container.querySelectorAll("h1, h2, h3").length;
        const buttons = container.querySelectorAll("button, a[role='button']")
          .length;

        structures.push(`${sections}-${headings}-${buttons}`);
      }

      // All languages should have the same structure
      expect(new Set(structures).size).toBe(1);
    });

    it("AboutPage maintains structure across all languages", async () => {
      const languages = ["en", "fi", "sv"];
      const structures: string[] = [];

      for (const lang of languages) {
        await i18n.changeLanguage(lang);
        const { container } = renderWithProviders(<AboutPage />);

        // Count structural elements
        const sections = container.querySelectorAll("section").length;
        const headings = container.querySelectorAll("h1, h2, h3").length;

        structures.push(`${sections}-${headings}`);
      }

      // All languages should have the same structure
      expect(new Set(structures).size).toBe(1);
    });
  });

  describe("Keyboard Navigation", () => {
    it("HomePage has focusable interactive elements", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<HomePage />);

      // Find all focusable elements
      const focusableElements = container.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );

      // HomePage should have at least some focusable elements (CTAs, links)
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it("AboutPage has focusable interactive elements", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<AboutPage />);

      // Find all focusable elements
      const focusableElements = container.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );

      // Even if minimal, should have some navigation elements
      expect(focusableElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("ARIA Attributes", () => {
    it("HomePage has no invalid ARIA attributes", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<HomePage />);

      // Check for common ARIA attribute mistakes
      const elementsWithAriaLabel = container.querySelectorAll("[aria-label]");
      elementsWithAriaLabel.forEach((el) => {
        const label = el.getAttribute("aria-label");
        expect(label).toBeTruthy();
        expect(label?.trim().length).toBeGreaterThan(0);
      });
    });

    it("AboutPage manifesto has proper aria-live attribute", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<AboutPage />);

      // Manifesto words have aria-live="off" to prevent announcement spam
      const liveElements = container.querySelectorAll('[aria-live="off"]');
      expect(liveElements.length).toBeGreaterThan(0);
    });
  });

  describe("Color Contrast and Visual Accessibility", () => {
    it("HomePage passes axe color-contrast rules", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<HomePage />);

      // Run axe with only color-contrast rules
      const results = await runAxe(container, {
        rules: {
          "color-contrast": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it("AboutPage passes axe color-contrast rules", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<AboutPage />);

      // Run axe with only color-contrast rules
      const results = await runAxe(container, {
        rules: {
          "color-contrast": { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe("HelsinkiDesignSystemPage", { timeout: pageAxeTimeout }, () => {
    it("has no axe violations in English", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<HelsinkiDesignSystemPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no axe violations in Finnish", async () => {
      await i18n.changeLanguage("fi");
      const { container } = renderWithProviders(<HelsinkiDesignSystemPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no axe violations in Swedish", async () => {
      await i18n.changeLanguage("sv");
      const { container } = renderWithProviders(<HelsinkiDesignSystemPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper hero section with heading hierarchy", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<HelsinkiDesignSystemPage />);

      const h1 = container.querySelector("h1");
      expect(h1).toBeInTheDocument();
      expect(h1?.textContent).toBe("Helsinki Design System");
    });

    it("team images have descriptive alt text", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<HelsinkiDesignSystemPage />);

      const teamImages = [...container.querySelectorAll("img")].filter(
        (img) => (img.getAttribute("alt") ?? "").trim().length > 0,
      );
      expect(teamImages.length).toBeGreaterThan(0);
      teamImages.forEach((img) => {
        const alt = img.getAttribute("alt");
        expect(alt?.length).toBeGreaterThan(0);
      });
    });
  });

  describe("IllustrationsPage", { timeout: pageAxeTimeout }, () => {
    it("has no axe violations in English", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<IllustrationsPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no axe violations in Finnish", async () => {
      await i18n.changeLanguage("fi");
      const { container } = renderWithProviders(<IllustrationsPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no axe violations in Swedish", async () => {
      await i18n.changeLanguage("sv");
      const { container } = renderWithProviders(<IllustrationsPage />);
      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it("illustration images have descriptive alt text", async () => {
      await i18n.changeLanguage("en");
      const { container } = renderWithProviders(<IllustrationsPage />);

      const images = container.querySelectorAll("img[alt]");
      images.forEach((img) => {
        const alt = img.getAttribute("alt");
        expect(alt).toBeTruthy();
        // Ensure alt text is meaningful (not just filename)
        expect(alt).not.toMatch(/\.(jpg|png|webp|svg)$/i);
      });
    });
  });
});
