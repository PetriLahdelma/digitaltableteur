import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import Card from "./Card";

expect.extend(toHaveNoViolations);

describe("Card", () => {
  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<Card />);
      expect(screen.getByText(/lorem ipsum/i)).toBeInTheDocument();
    });

    it("renders title when provided", () => {
      render(<Card title="Test Card" />);
      expect(screen.getByText("Test Card")).toBeInTheDocument();
    });

    it("hides header when showHeader is false", () => {
      render(<Card title="Test Card" showHeader={false} />);
      expect(screen.queryByText("Test Card")).not.toBeInTheDocument();
    });

    it("renders custom children content", () => {
      render(
        <Card>
          <p>Custom content</p>
        </Card>,
      );
      expect(screen.getByText("Custom content")).toBeInTheDocument();
      expect(screen.queryByText(/lorem ipsum/i)).not.toBeInTheDocument();
    });

    it("renders icon when provided", () => {
      const TestIcon = () => <span data-testid="test-icon">Icon</span>;
      render(<Card icon={<TestIcon />} />);
      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("renders footer when showFooter is true and actions provided", () => {
      render(<Card showFooter actions={<button>Action</button>} />);
      expect(
        screen.getByRole("button", { name: /action/i }),
      ).toBeInTheDocument();
    });

    it("does not render footer when showFooter is false", () => {
      render(<Card showFooter={false} actions={<button>Action</button>} />);
      expect(
        screen.queryByRole("button", { name: /action/i }),
      ).not.toBeInTheDocument();
    });

    it("does not render footer when showFooter is true but no actions", () => {
      render(<Card showFooter />);
      const footers = document.querySelectorAll('[class*="footer"]');
      expect(footers.length).toBe(0);
    });
  });

  describe("Size Variants", () => {
    it("applies small size class", () => {
      const { container } = render(<Card size="S" />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("sizeS");
    });

    it("applies medium size class by default", () => {
      const { container } = render(<Card />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("sizeM");
    });

    it("applies large size class", () => {
      const { container } = render(<Card size="L" />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("sizeL");
    });

    it("applies full width size class", () => {
      const { container } = render(<Card size="full" />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("sizeFull");
    });
  });

  describe("Props", () => {
    it("applies custom className", () => {
      const { container } = render(<Card className="custom-class" />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations", async () => {
      const { container } = render(
        <Card
          title="Accessible Card"
          showFooter
          actions={<button>Submit</button>}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("maintains semantic structure with header", () => {
      render(<Card title="Card Title" />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Card Title");
    });
  });
});
