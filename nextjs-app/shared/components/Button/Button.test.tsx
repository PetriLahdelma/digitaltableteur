import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import Button from "@dt/Button";
import Icon from "@dt/Icon";

expect.extend(toHaveNoViolations);

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(onClick).toHaveBeenCalled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when loading prop is true", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies loading class when loading prop is true", () => {
    const { container } = render(<Button loading>Loading</Button>);
    const button = container.firstChild as HTMLElement;
    expect(button.className).toMatch(/loading/);
  });

  it("composes a destructive secondary button from variant + tone", () => {
    const { container } = render(
      <Button variant="secondary" tone="error">
        Delete
      </Button>,
    );
    const button = container.firstChild as HTMLElement;
    expect(button.className).toMatch(/secondary/);
    expect(button.className).toMatch(/error/);
  });

  it("composes a destructive tertiary button from variant + tone", () => {
    const { container } = render(
      <Button variant="tertiary" tone="error">
        Delete
      </Button>,
    );
    const button = container.firstChild as HTMLElement;
    expect(button.className).toMatch(/tertiary/);
    expect(button.className).toMatch(/error/);
  });

  it("applies custom className", () => {
    const { container } = render(
      <Button className="custom-class">Custom</Button>,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(
      /custom-class/,
    );
  });

  it("applies onBrand surface class", () => {
    const { container } = render(
      <Button variant="primary" surface="onBrand">
        CTA
      </Button>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/onBrand/);
  });

  it("applies onDark surface class for contrast on dark bands", () => {
    const { container } = render(
      <Button variant="primary" surface="onDark">
        CTA
      </Button>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/onDark/);
  });

  it("renders a custom icon element passed as icon prop", () => {
    render(
      <Button icon={<Icon name="arrow-clockwise" ariaLabel="refresh" />}>
        Refresh
      </Button>,
    );
    const textSpan = screen.getByText("Refresh");
    const iconWrapper = textSpan.previousElementSibling as HTMLElement;
    expect(iconWrapper).toBeTruthy();
    expect(iconWrapper.getAttribute("data-button-slot")).toBe("icon");
  });

  it("ignores a plain object passed as icon prop", () => {
    // @ts-expect-error intentional invalid icon
    render(<Button icon={{}}>NoIcon</Button>);
    const btn = screen.getByText("NoIcon").parentElement as HTMLElement;
    // Should not have an icon element before the text
    const firstChild = btn.firstElementChild as HTMLElement;
    // If there is only one child span it should be the text
    expect(firstChild?.getAttribute("data-button-slot")).toBe("text");
  });

  it("renders an icon from a string registry key", () => {
    render(<Button icon="arrow-clockwise">RefreshStr</Button>);
    const textSpan = screen.getByText("RefreshStr");
    const iconWrapper = textSpan.previousElementSibling as HTMLElement;
    expect(iconWrapper).toBeTruthy();
    expect(iconWrapper.getAttribute("data-button-slot")).toBe("icon");
  });

  it("renders as an anchor when href prop is provided", () => {
    render(<Button href="/test-path">Link Button</Button>);
    const link = screen.getByText("Link Button").closest("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test-path");
  });

  it("applies rel='noopener noreferrer' automatically when target='_blank'", () => {
    render(
      <Button href="https://example.com" target="_blank">
        External Link
      </Button>,
    );
    const link = screen.getByText("External Link").closest("a");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("preserves custom rel when provided with target='_blank'", () => {
    render(
      <Button href="https://example.com" target="_blank" rel="custom">
        Custom Rel
      </Button>,
    );
    const link = screen.getByText("Custom Rel").closest("a");
    expect(link).toHaveAttribute("rel", "custom");
  });

  it("applies aria-disabled to links when disabled prop is true", () => {
    render(
      <Button href="/disabled-link" disabled>
        Disabled Link
      </Button>,
    );
    const link = screen.getByText("Disabled Link").closest("a");
    expect(link).toHaveAttribute("aria-disabled", "true");
  });

  it("renders link with icon and maintains visual structure", () => {
    render(
      <Button href="/icon-link" icon="arrow-right">
        Icon Link
      </Button>,
    );
    const link = screen.getByText("Icon Link").closest("a");
    expect(link).toBeInTheDocument();
    const textSpan = screen.getByText("Icon Link");
    const iconWrapper = textSpan.previousElementSibling as HTMLElement;
    expect(iconWrapper.getAttribute("data-button-slot")).toBe("icon");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations with icon", async () => {
    const { container } = render(
      <Button icon="check" variant="primary">
        Icon Button
      </Button>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations as link", async () => {
    const { container } = render(
      <Button href="/test" variant="secondary">
        Link Button
      </Button>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe("accessibility", () => {
    describe("icon-only buttons", () => {
      it("should warn in dev mode when icon-only button lacks accessible name", () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        render(<Button icon="search" />);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("Icon-only button without an accessible name")
        );
        consoleSpy.mockRestore();
      });

      it("should not warn when icon-only button has accessibleName", () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        render(<Button icon="search" accessibleName="Search" />);
        // Check that no Button-specific warning was called (other warnings may occur from Icon)
        const buttonWarnings = consoleSpy.mock.calls.filter(
          (call) => typeof call[0] === "string" && call[0].includes("[Button]")
        );
        expect(buttonWarnings).toHaveLength(0);
        consoleSpy.mockRestore();
      });

      it("should not warn when icon-only button has tooltip", () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        render(<Button icon="search" tooltip="Search" />);
        // Check that no Button-specific warning was called (other warnings may occur from Icon)
        const buttonWarnings = consoleSpy.mock.calls.filter(
          (call) => typeof call[0] === "string" && call[0].includes("[Button]")
        );
        expect(buttonWarnings).toHaveLength(0);
        consoleSpy.mockRestore();
      });

      it("should not warn when icon-only button has aria-label", () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        render(<Button icon="search" aria-label="Search" />);
        const buttonWarnings = consoleSpy.mock.calls.filter(
          (call) => typeof call[0] === "string" && call[0].includes("[Button]")
        );
        expect(buttonWarnings).toHaveLength(0);
        consoleSpy.mockRestore();
      });

      it("should use tooltip as aria-label when accessibleName is not provided", () => {
        const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        render(<Button icon="search" tooltip="Search the site" />);
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Search the site");
        consoleSpy.mockRestore();
      });
    });

    describe("loading state", () => {
      it("should have aria-busy when loading", () => {
        render(<Button loading>Submit</Button>);
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-busy", "true");
      });

      it("should not have aria-busy when not loading", () => {
        render(<Button>Submit</Button>);
        const button = screen.getByRole("button");
        expect(button).not.toHaveAttribute("aria-busy");
      });

      it("is disabled while loading", () => {
        render(<Button loading>Submit</Button>);
        expect(screen.getByRole("button")).toBeDisabled();
      });
    });
  });
});
