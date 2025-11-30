import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import Badge from "./Badge";
import Icon from "@dt/Icon";

expect.extend(toHaveNoViolations);

describe("Badge", () => {
  describe("Rendering", () => {
    it("renders children", () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText("Test Badge")).toBeInTheDocument();
    });

    it("renders with role status for semantic awareness", () => {
      const { container } = render(<Badge state="success">Success</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveAttribute("role", "status");
    });

    it("applies design variant", () => {
      const { container } = render(<Badge state="success">Success</Badge>);
      expect((container.firstChild as HTMLElement).className).toMatch(
        /success/,
      );
    });

    it("applies custom className", () => {
      const { container } = render(
        <Badge className="custom-class">Custom</Badge>,
      );
      expect((container.firstChild as HTMLElement).className).toMatch(
        /custom-class/,
      );
    });

    it("renders with custom icon", () => {
      const { container } = render(
        <Badge icon={<Icon name="star" />}>With Icon</Badge>,
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("ignores invalid plain object icon prop without crashing", () => {
      // @ts-expect-error intentionally passing invalid icon type
      const { container } = render(
        <Badge icon={{ foo: "bar" }}>Obj Icon</Badge>,
      );
      expect(screen.getByText(/Obj Icon/)).toBeInTheDocument();
      expect(container.querySelector("svg")).not.toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    it("renders small size variant", () => {
      const { container } = render(<Badge size="s">Small</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toMatch(/\bs\b/);
    });

    it("renders medium size variant (default)", () => {
      const { container } = render(<Badge size="m">Medium</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toMatch(/\bm\b/);
    });

    it("renders large size variant", () => {
      const { container } = render(<Badge size="l">Large</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toMatch(/\bl\b/);
    });

    it("defaults to medium size when size prop omitted", () => {
      const { container } = render(<Badge>Default Size</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toMatch(/\bm\b/);
    });
  });

  describe("Design Variants", () => {
    it("renders primary design (default)", () => {
      const { container } = render(<Badge>Primary</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toMatch(/primary/);
    });

    it("renders secondary design", () => {
      const { container } = render(<Badge design="secondary">Secondary</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toMatch(/secondary/);
    });
  });

  describe("State Variants", () => {
    it("renders success state", () => {
      const { container } = render(<Badge state="success">Success</Badge>);
      expect((container.firstChild as HTMLElement).className).toMatch(
        /success/,
      );
    });

    it("renders info state", () => {
      const { container } = render(<Badge state="info">Info</Badge>);
      expect((container.firstChild as HTMLElement).className).toMatch(/info/);
    });

    it("renders error state", () => {
      const { container } = render(<Badge state="error">Error</Badge>);
      expect((container.firstChild as HTMLElement).className).toMatch(/error/);
    });

    it("renders warning state", () => {
      const { container } = render(<Badge state="warning">Warning</Badge>);
      expect((container.firstChild as HTMLElement).className).toMatch(
        /warning/,
      );
    });

    it("renders neutral state", () => {
      const { container } = render(<Badge state="neutral">Neutral</Badge>);
      expect((container.firstChild as HTMLElement).className).toMatch(
        /neutral/,
      );
    });
  });

  describe("Square Variant", () => {
    it("applies square class when square prop is true", () => {
      const { container } = render(<Badge square>Square Badge</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toMatch(/square/);
    });

    it("does not apply square class by default", () => {
      const { container } = render(<Badge>Round Badge</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).not.toMatch(/square/);
    });
  });

  describe("Removable Functionality", () => {
    it("shows close button if removable", () => {
      render(<Badge removable>Removable</Badge>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("calls onRemove when close button clicked", () => {
      const onRemove = vi.fn();
      render(
        <Badge removable onRemove={onRemove}>
          Removable
        </Badge>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onRemove).toHaveBeenCalled();
    });

    it("hides badge after removal", () => {
      const { container } = render(<Badge removable>Removable</Badge>);
      fireEvent.click(screen.getByRole("button"));
      expect(container.firstChild).toBeNull();
    });

    it("applies removable class when removable is true", () => {
      const { container } = render(<Badge removable>Removable</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toMatch(/removable/);
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations - default badge", async () => {
      const { container } = render(<Badge>Accessible Badge</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations - with state", async () => {
      const { container } = render(<Badge state="success">Success</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations - removable badge", async () => {
      const { container } = render(<Badge removable>Removable</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations - all sizes", async () => {
      const { container } = render(
        <>
          <Badge size="s">Small</Badge>
          <Badge size="m">Medium</Badge>
          <Badge size="l">Large</Badge>
        </>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has aria-label for semantic context", () => {
      const { container } = render(<Badge state="error">Error</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveAttribute("aria-label");
    });

    it("has aria-hidden on decorative icon", () => {
      const { container } = render(
        <Badge state="success" icon={<Icon name="check" />}>
          Success
        </Badge>,
      );
      const iconSpan = container.querySelector(".icon");
      expect(iconSpan).toHaveAttribute("aria-hidden", "true");
    });

    it("has accessible remove button with aria-label", () => {
      render(<Badge removable>Removable</Badge>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label");
    });
  });

  describe("Translation Support", () => {
    it("translates string children starting with 'badge'", () => {
      // Component uses t() internally for string children
      render(<Badge>badgeSuccess</Badge>);
      // The translation key would be passed through
      expect(screen.getByText("badgeSuccess")).toBeInTheDocument();
    });

    it("renders non-translation children as-is", () => {
      render(<Badge>Regular Text</Badge>);
      expect(screen.getByText("Regular Text")).toBeInTheDocument();
    });

    it("renders React node children", () => {
      render(
        <Badge>
          <span>Custom Content</span>
        </Badge>,
      );
      expect(screen.getByText("Custom Content")).toBeInTheDocument();
    });
  });

  describe("Ref Forwarding", () => {
    it("forwards ref to span element", () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Badge ref={ref}>Ref Badge</Badge>);
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current?.textContent).toContain("Ref Badge");
    });
  });

  describe("Title Prop", () => {
    it("applies title attribute when provided", () => {
      const { container } = render(<Badge title="Tooltip text">Badge</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge).toHaveAttribute("title", "Tooltip text");
    });
  });

  describe("Count Badge", () => {
    it("renders count number", () => {
      render(<Badge count={5}>Notification</Badge>);
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("renders zero when showZero is true", () => {
      render(
        <Badge count={0} showZero>
          Notification
        </Badge>,
      );
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("hides badge when count is zero by default", () => {
      const { container } = render(<Badge count={0}>Notification</Badge>);
      const countBadge = container.querySelector(".count");
      expect(countBadge).not.toBeInTheDocument();
    });

    it("renders overflow format (99+) when count exceeds overflowCount", () => {
      render(<Badge count={100}>Messages</Badge>);
      expect(screen.getByText("99+")).toBeInTheDocument();
    });

    it("respects custom overflowCount", () => {
      render(
        <Badge count={1000} overflowCount={999}>
          Items
        </Badge>,
      );
      expect(screen.getByText("999+")).toBeInTheDocument();
    });

    it("renders exact count when below overflow threshold", () => {
      render(<Badge count={50}>Alerts</Badge>);
      expect(screen.getByText("50")).toBeInTheDocument();
    });

    it("wraps children when count provided", () => {
      const { container } = render(
        <Badge count={3}>
          <Icon name="bell" />
        </Badge>,
      );
      const wrapper = container.querySelector(".wrapper");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper?.querySelector("svg")).toBeInTheDocument();
    });

    it("positions count badge absolutely when wrapping", () => {
      const { container } = render(
        <Badge count={5}>
          <Icon name="shopping-cart" />
        </Badge>,
      );
      const countBadge = container.querySelector(".count");
      expect(countBadge).toHaveClass("count");
      // Check positioning - parent should have wrapper class
      expect(countBadge?.parentElement).toHaveClass("wrapper");
    });

    it("applies state colors to count badge", () => {
      const { container } = render(
        <Badge count={5} state="error">
          Bell
        </Badge>,
      );
      const countBadge = container.querySelector(".count");
      expect(countBadge?.className).toMatch(/error/);
    });

    it("applies design variant to count badge", () => {
      const { container } = render(
        <Badge count={10} design="secondary">
          Cart
        </Badge>,
      );
      const countBadge = container.querySelector(".count");
      expect(countBadge?.className).toMatch(/secondary/);
    });

    it("has accessible aria-label with count", () => {
      const { container } = render(<Badge count={7}>Notifications</Badge>);
      const countBadge = container.querySelector(".count");
      expect(countBadge).toHaveAttribute("aria-label");
      expect(countBadge?.getAttribute("aria-label")).toContain("7");
    });

    it("handles large counts gracefully", () => {
      render(<Badge count={9999}>Max</Badge>);
      expect(screen.getByText("99+")).toBeInTheDocument();
    });

    it("handles negative counts gracefully", () => {
      render(<Badge count={-5}>Invalid</Badge>);
      // Should render but might show negative or be handled
      const badge = screen.queryByText("-5");
      expect(badge).toBeInTheDocument();
    });

    it("renders standalone count badge without wrapper when no children", () => {
      const { container } = render(<Badge count={5} />);
      const wrapper = container.querySelector(".wrapper");
      expect(wrapper).not.toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("applies square prop to count badge", () => {
      const { container } = render(
        <Badge count={8} square>
          Cart
        </Badge>,
      );
      const countBadge = container.querySelector(".count");
      expect(countBadge?.className).toMatch(/square/);
    });
  });

  describe("Dot Mode", () => {
    it("renders dot indicator", () => {
      const { container } = render(<Badge dot>Icon</Badge>);
      const dotBadge = container.querySelector(".dot");
      expect(dotBadge).toBeInTheDocument();
    });

    it("renders dot without text content", () => {
      const { container } = render(
        <Badge dot state="success">
          Online
        </Badge>,
      );
      const dotBadge = container.querySelector(".dot");
      expect(dotBadge).toBeInTheDocument();
      expect(dotBadge?.textContent).toBe("");
    });

    it("wraps children when dot provided", () => {
      const { container } = render(
        <Badge dot>
          <Icon name="user" />
        </Badge>,
      );
      const wrapper = container.querySelector(".wrapper");
      expect(wrapper).toBeInTheDocument();
    });

    it("positions dot badge absolutely when wrapping", () => {
      const { container } = render(
        <Badge dot>
          <span>User Avatar</span>
        </Badge>,
      );
      const dotBadge = container.querySelector(".dot");
      expect(dotBadge?.parentElement).toHaveClass("wrapper");
    });

    it("applies state colors to dot", () => {
      const { container } = render(<Badge dot state="success" />);
      const dotBadge = container.querySelector(".dot");
      expect(dotBadge?.className).toMatch(/success/);
    });

    it("applies design variant to dot", () => {
      const { container } = render(<Badge dot design="secondary" />);
      const dotBadge = container.querySelector(".dot");
      expect(dotBadge?.className).toMatch(/secondary/);
    });

    it("has accessible aria-label", () => {
      const { container } = render(<Badge dot title="Online status" />);
      const dotBadge = container.querySelector(".dot");
      expect(dotBadge).toHaveAttribute("aria-label");
    });

    it("renders standalone dot without wrapper when no children", () => {
      const { container } = render(<Badge dot />);
      const wrapper = container.querySelector(".wrapper");
      expect(wrapper).not.toBeInTheDocument();
      expect(container.querySelector(".dot")).toBeInTheDocument();
    });
  });

  describe("Offset Positioning", () => {
    it("applies custom offset with transform style", () => {
      const { container } = render(
        <Badge count={5} offset={[10, -10]}>
          Icon
        </Badge>,
      );
      const countBadge = container.querySelector(".count") as HTMLElement;
      expect(countBadge?.style.transform).toContain("translate(10px, -10px)");
    });

    it("applies offset to dot badge", () => {
      const { container } = render(
        <Badge dot offset={[5, 5]}>
          Avatar
        </Badge>,
      );
      const dotBadge = container.querySelector(".dot") as HTMLElement;
      expect(dotBadge?.style.transform).toContain("translate(5px, 5px)");
    });

    it("applies offset to standard badge", () => {
      const { container } = render(<Badge offset={[-5, 10]}>Standard</Badge>);
      const badge = container.firstChild as HTMLElement;
      expect(badge.style.transform).toContain("translate(-5px, 10px)");
    });

    it("handles zero offset", () => {
      const { container } = render(
        <Badge count={3} offset={[0, 0]}>
          Icon
        </Badge>,
      );
      const countBadge = container.querySelector(".count") as HTMLElement;
      expect(countBadge?.style.transform).toContain("translate(0px, 0px)");
    });

    it("handles negative offset values", () => {
      const { container } = render(
        <Badge dot offset={[-15, -20]}>
          Icon
        </Badge>,
      );
      const dotBadge = container.querySelector(".dot") as HTMLElement;
      expect(dotBadge?.style.transform).toContain("translate(-15px, -20px)");
    });

    it("does not apply transform when offset not provided", () => {
      const { container } = render(<Badge count={5}>Icon</Badge>);
      const countBadge = container.querySelector(".count") as HTMLElement;
      expect(countBadge?.style.transform).toBeFalsy();
    });
  });

  describe("Accessibility - Count Badge", () => {
    it("count badge has no axe violations", async () => {
      const { container } = render(<Badge count={5}>Messages</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("count badge with zero and showZero has no violations", async () => {
      const { container } = render(
        <Badge count={0} showZero>
          Items
        </Badge>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("count badge overflow has no violations", async () => {
      const { container } = render(<Badge count={150}>Alerts</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Accessibility - Dot Mode", () => {
    it("dot badge has no axe violations", async () => {
      const { container } = render(
        <Badge dot title="Online">
          <Icon name="user" />
        </Badge>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("standalone dot has no violations", async () => {
      const { container } = render(<Badge dot title="Status indicator" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
