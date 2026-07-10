import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, test, expect, vi } from "vitest";
import HighlightSection from "./HighlightSection";

expect.extend(toHaveNoViolations);

// Mock the package translation adapter, not the app's i18next runtime.
vi.mock("../../lib/translation", () => {
  const t = (key: string) => key;
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

describe("HighlightSection", () => {
  describe("Rendering", () => {
    test("renders without crashing", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
        />
      );
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    test("renders as a section element", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
        />
      );
      const section = screen.getByRole("region");
      expect(section.tagName).toBe("SECTION");
    });

    test("renders title with correct heading level", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
        />
      );
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Test Title");
    });

    test("renders description text", () => {
      const description = "This is a test description with multiple words.";
      render(
        <HighlightSection
          title="Test Title"
          description={description}
        />
      );
      expect(screen.getByText(description)).toBeInTheDocument();
    });

    test("renders overline when provided", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          overline="New Release"
        />
      );
      expect(screen.getByText("New Release")).toBeInTheDocument();
    });

    test("does not render overline when not provided", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
        />
      );
      expect(screen.queryByText("New Release")).not.toBeInTheDocument();
    });

    test("renders CTA button when provided", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          cta={{ label: "Click Me" }}
        />
      );
      expect(screen.getByRole("button", { name: "Click Me" })).toBeInTheDocument();
    });

    test("does not render CTA button when not provided", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
        />
      );
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    test("renders CTA as link when href is provided", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          cta={{
            label: "Learn More",
            href: "https://example.com",
          }}
        />
      );
      const link = screen.getByRole("link", { name: "Learn More" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://example.com");
    });
  });

  describe("Props", () => {
    test("applies custom className", () => {
      const { container } = render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          className="custom-class"
        />
      );
      const section = container.querySelector("section");
      expect(section).toHaveClass("custom-class");
    });

    test("applies gradient variant class", () => {
      const { container } = render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          variant="gradient"
        />
      );
      const section = container.querySelector("section");
      expect(section?.className).toContain("gradient");
    });

    test("applies pattern variant class", () => {
      const { container } = render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          variant="pattern"
        />
      );
      const section = container.querySelector("section");
      expect(section?.className).toContain("pattern");
    });

    test("applies solid variant class", () => {
      const { container } = render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          variant="solid"
        />
      );
      const section = container.querySelector("section");
      expect(section?.className).toContain("solid");
    });

    test("applies compact size class", () => {
      const { container } = render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          size="compact"
        />
      );
      const section = container.querySelector("section");
      expect(section?.className).toContain("compact");
    });

    test("applies comfortable size class", () => {
      const { container } = render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          size="comfortable"
        />
      );
      const section = container.querySelector("section");
      expect(section?.className).toContain("comfortable");
    });

    test("applies spacious size class", () => {
      const { container } = render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          size="spacious"
        />
      );
      const section = container.querySelector("section");
      expect(section?.className).toContain("spacious");
    });

    test("uses custom ariaLabel when provided", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          ariaLabel="Custom Section Label"
        />
      );
      const section = screen.getByRole("region", { name: "Custom Section Label" });
      expect(section).toBeInTheDocument();
    });

    test("uses default ariaLabel from translation when not provided", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
        />
      );
      const section = screen.getByRole("region", { name: "createSection.ariaLabel" });
      expect(section).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    test("calls onClick when CTA button is clicked", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          cta={{
            label: "Click Me",
            onClick: handleClick,
          }}
        />
      );

      const button = screen.getByRole("button", { name: "Click Me" });
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("CTA link has correct target attribute", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          cta={{
            label: "External Link",
            href: "https://example.com",
            target: "_blank",
          }}
        />
      );

      const link = screen.getByRole("link", { name: "External Link" });
      expect(link).toHaveAttribute("target", "_blank");
    });

    test("CTA button receives keyboard focus", async () => {
      const user = userEvent.setup();

      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          cta={{ label: "Focus Me" }}
        />
      );

      const button = screen.getByRole("button", { name: "Focus Me" });
      await user.tab();
      expect(button).toHaveFocus();
    });
  });

  describe("Accessibility", () => {
    test("has no accessibility violations (default)", async () => {
      const { container } = render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("has no accessibility violations (with CTA)", async () => {
      const { container } = render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          cta={{ label: "Action Button" }}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("has no accessibility violations (with overline)", async () => {
      const { container } = render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          overline="New Feature"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("has no accessibility violations (all variants)", async () => {
      const variants: Array<"gradient" | "pattern" | "solid"> = [
        "gradient",
        "pattern",
        "solid",
      ];

      for (const variant of variants) {
        const { container } = render(
          <HighlightSection
            title="Test Title"
            description="Test Description"
            variant={variant}
          />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    test("background elements are aria-hidden", () => {
      const { container } = render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          variant="pattern"
        />
      );

      const backgroundElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(backgroundElements.length).toBeGreaterThan(0);
    });

    test("section has proper ARIA role", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
        />
      );
      expect(screen.getByRole("region")).toBeInTheDocument();
    });
  });

  describe("Translation Coverage", () => {
    test("uses translation for aria-label", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
        />
      );
      const section = screen.getByRole("region");
      expect(section).toHaveAttribute("aria-label", "createSection.ariaLabel");
    });
  });

  describe("Edge Cases", () => {
    test("handles very long title", () => {
      const longTitle = "A".repeat(200);
      render(
        <HighlightSection
          title={longTitle}
          description="Test Description"
        />
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    test("handles very long description", () => {
      const longDescription = "B".repeat(500);
      render(
        <HighlightSection
          title="Test Title"
          description={longDescription}
        />
      );
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    test("handles empty CTA label gracefully", () => {
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          cta={{ label: "" }}
        />
      );
      // Button should still render, just with empty label
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    test("handles both onClick and href in CTA", () => {
      const handleClick = vi.fn();
      render(
        <HighlightSection
          title="Test Title"
          description="Test Description"
          cta={{
            label: "Hybrid",
            onClick: handleClick,
            href: "https://example.com",
          }}
        />
      );
      // Should render as link when href is present
      expect(screen.getByRole("link")).toBeInTheDocument();
    });
  });
});
