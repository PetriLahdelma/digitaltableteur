import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Icon from "@dt/Icon";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button";

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

  it("applies custom className", () => {
    const { container } = render(
      <Button className="custom-class">Custom</Button>,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(
      /custom-class/,
    );
  });

  it("applies inverse modifier class when inverse prop is true", () => {
    const { container } = render(
      <Button variant="secondary" inverse>
        Inverse
      </Button>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/inverse/);
  });

  it("renders a react-icons element passed as icon prop", () => {
    render(<Button icon={<Icon name="arrow-clockwise" />}>Refresh</Button>);
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

  it("syncs primary inverse text color with the nearest background", async () => {
    render(
      <div style={{ backgroundColor: "#123456" }}>
        <Button variant="primary" inverse>
          Dynamic primary inverse
        </Button>
      </div>,
    );
    const button = screen.getByRole("button", {
      name: /dynamic primary inverse/i,
    });
    await waitFor(() => {
      expect(button.style.getPropertyValue("--dt-button-inverse-color")).toBe(
        "rgb(18, 52, 86)",
      );
    });
  });

  it("preserves caller inline styles when injecting primary inverse color", async () => {
    render(
      <div style={{ backgroundColor: "#222222" }}>
        <Button variant="primary" inverse style={{ opacity: 0.5 }}>
          Styled primary inverse
        </Button>
      </div>,
    );
    const button = screen.getByRole("button", {
      name: /styled primary inverse/i,
    });
    await waitFor(() => {
      expect(button.style.getPropertyValue("--dt-button-inverse-color")).toBe(
        "rgb(34, 34, 34)",
      );
    });
    expect(button.style.opacity).toBe("0.5");
  });
});
