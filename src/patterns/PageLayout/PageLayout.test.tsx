import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PageLayout from "./PageLayout";
import styles from "./PageLayout.module.css";

describe("PageLayout", () => {
  describe("Rendering", () => {
    it("renders children correctly", () => {
      render(
        <PageLayout>
          <div data-testid="child-content">Test Content</div>
        </PageLayout>,
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("applies default props when not specified", () => {
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      );

      const layout = container.firstChild as HTMLElement;
      expect(layout).toHaveClass(styles.pageLayout);
      expect(layout).toHaveClass(styles.maxWidthLg); // default maxWidth
      expect(layout).toHaveClass(styles.spacingDefault); // default spacing
      expect(layout).toHaveClass(styles.withMargins); // default withMargins
    });
  });

  describe("Max Width", () => {
    it("applies small max-width class", () => {
      const { container } = render(
        <PageLayout maxWidth="sm">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveClass(styles.maxWidthSm);
    });

    it("applies medium max-width class", () => {
      const { container } = render(
        <PageLayout maxWidth="md">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveClass(styles.maxWidthMd);
    });

    it("applies large max-width class", () => {
      const { container } = render(
        <PageLayout maxWidth="lg">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveClass(styles.maxWidthLg);
    });

    it("applies extra large max-width class", () => {
      const { container } = render(
        <PageLayout maxWidth="xl">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveClass(styles.maxWidthXl);
    });

    it("applies full width class", () => {
      const { container } = render(
        <PageLayout maxWidth="full">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveClass(styles.maxWidthFull);
    });
  });

  describe("Spacing", () => {
    it("applies compact spacing", () => {
      const { container } = render(
        <PageLayout spacing="compact">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveClass(styles.spacingCompact);
    });

    it("applies default spacing", () => {
      const { container } = render(
        <PageLayout spacing="default">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveClass(styles.spacingDefault);
    });

    it("applies comfortable spacing", () => {
      const { container } = render(
        <PageLayout spacing="comfortable">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveClass(styles.spacingComfortable);
    });

    it("applies spacious spacing", () => {
      const { container } = render(
        <PageLayout spacing="spacious">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveClass(styles.spacingSpacious);
    });
  });

  describe("Grid System", () => {
    it("applies grid class when grid prop is true", () => {
      const { container } = render(
        <PageLayout grid>
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveClass(styles.grid);
    });

    it("does not apply grid class when grid prop is false", () => {
      const { container } = render(
        <PageLayout grid={false}>
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).not.toHaveClass(styles.grid);
    });

    it("applies custom grid columns via inline style", () => {
      const { container } = render(
        <PageLayout grid columns={6}>
          <div>Content</div>
        </PageLayout>,
      );

      const layout = container.firstChild as HTMLElement;
      expect(layout.style.gridTemplateColumns).toBe("repeat(6, 1fr)");
    });
  });

  describe("Margins", () => {
    it("applies margins by default", () => {
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveClass(styles.withMargins);
    });

    it("does not apply margins when withMargins is false", () => {
      const { container } = render(
        <PageLayout withMargins={false}>
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).not.toHaveClass(styles.withMargins);
    });
  });

  describe("Semantic HTML", () => {
    it("renders as div by default", () => {
      const { container } = render(
        <PageLayout>
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild?.nodeName).toBe("DIV");
    });

    it("renders as main when specified", () => {
      const { container } = render(
        <PageLayout as="main">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild?.nodeName).toBe("MAIN");
    });

    it("renders as section when specified", () => {
      const { container } = render(
        <PageLayout as="section">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild?.nodeName).toBe("SECTION");
    });

    it("renders as article when specified", () => {
      const { container } = render(
        <PageLayout as="article">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild?.nodeName).toBe("ARTICLE");
    });
  });

  describe("Accessibility", () => {
    it("applies ARIA role when provided", () => {
      const { container } = render(
        <PageLayout role="region">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveAttribute("role", "region");
    });

    it("applies ARIA label when provided", () => {
      const { container } = render(
        <PageLayout ariaLabel="Main content area">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveAttribute(
        "aria-label",
        "Main content area",
      );
    });

    it("applies both role and aria-label together", () => {
      const { container } = render(
        <PageLayout role="region" ariaLabel="Page content">
          <div>Content</div>
        </PageLayout>,
      );

      const layout = container.firstChild as HTMLElement;
      expect(layout).toHaveAttribute("role", "region");
      expect(layout).toHaveAttribute("aria-label", "Page content");
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <PageLayout className="custom-class">
          <div>Content</div>
        </PageLayout>,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("maintains built-in classes alongside custom className", () => {
      const { container } = render(
        <PageLayout maxWidth="sm" spacing="compact" className="custom-class">
          <div>Content</div>
        </PageLayout>,
      );

      const layout = container.firstChild as HTMLElement;
      expect(layout).toHaveClass(styles.pageLayout);
      expect(layout).toHaveClass(styles.maxWidthSm);
      expect(layout).toHaveClass(styles.spacingCompact);
      expect(layout).toHaveClass("custom-class");
    });
  });
});
