import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import { IconButton } from "./IconButton";

expect.extend(toHaveNoViolations);

describe("IconButton", () => {
  it("renders a button named by the label prop", () => {
    render(<IconButton icon="x" label="Close dialog" />);
    expect(
      screen.getByRole("button", { name: "Close dialog" }),
    ).toBeInTheDocument();
  });

  it("accepts a rendered icon element and keeps it hidden from AT", () => {
    render(
      <IconButton
        icon={<svg data-testid="glyph" />}
        label="Share"
      />,
    );
    const button = screen.getByRole("button", { name: "Share" });
    expect(button).toBeInTheDocument();
    // the accessible name comes from label, never from the glyph
    expect(button).toHaveAccessibleName("Share");
  });

  it("prefers aria-labelledby over label when provided", () => {
    render(
      <>
        <span id="ext-label">Open settings</span>
        <IconButton icon="gear" label="Settings" aria-labelledby="ext-label" />
      </>,
    );
    expect(
      screen.getByRole("button", { name: "Open settings" }),
    ).toBeInTheDocument();
  });

  it("fires onClick and supports keyboard activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon="x" label="Close" onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Close" });
    await user.click(button);
    button.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon="x" label="Close" disabled onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("exposes tooltip as a native title without changing the accessible name", () => {
    render(
      <IconButton icon="clipboard" label="Copy link" tooltip="Copy link to clipboard" />,
    );
    const button = screen.getByRole("button", { name: "Copy link" });
    expect(button).toHaveAttribute("title", "Copy link to clipboard");
  });

  it("wraps in a span only when className is given", () => {
    const { container: bare } = render(<IconButton icon="x" label="Close" />);
    expect((bare.firstChild as HTMLElement).tagName).toBe("BUTTON");
    const { container: wrapped } = render(
      <IconButton icon="x" label="Close" className="lg:hidden" />,
    );
    expect((wrapped.firstChild as HTMLElement).tagName).toBe("SPAN");
    expect(wrapped.firstChild as HTMLElement).toHaveClass("lg:hidden");
  });

  describe("axe", () => {
    it.each(["primary", "secondary", "tertiary"] as const)(
      "has no violations as variant=%s",
      async (variant) => {
        const { container } = render(
          <IconButton icon="x" label="Close" variant={variant} />,
        );
        expect(await axe(container)).toHaveNoViolations();
      },
    );

    it("has no violations when disabled or with tone", async () => {
      const { container } = render(
        <>
          <IconButton icon="x" label="Close" disabled />
          <IconButton icon="trash" label="Delete row" tone="error" variant="secondary" />
        </>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
