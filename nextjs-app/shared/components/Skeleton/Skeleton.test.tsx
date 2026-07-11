import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Skeleton from "@dt/Skeleton";

describe("Skeleton", () => {
  it("renders multiple lines for text variant", () => {
    render(<Skeleton variant="text" lines={5} />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status.querySelectorAll("span").length).toBe(5);
  });

  it("renders avatar variant", () => {
    render(<Skeleton variant="avatar" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("exposes the loading label as a polite live status", () => {
    render(<Skeleton variant="rect" label="Loading profile" />);
    const status = screen.getByRole("status", { name: "Loading profile" });

    expect(status).toHaveAttribute("aria-label", "Loading profile");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("applies animate class by default", () => {
    render(<Skeleton variant="text" lines={3} />);
    const status = screen.getByRole("status");
    expect(status.className).toContain("animate");
  });

  it("applies static class when animate is false", () => {
    render(<Skeleton variant="text" lines={3} animate={false} />);
    const status = screen.getByRole("status");
    expect(status.className).toContain("static");
    expect(status.className).not.toContain("animate");
  });

  it("applies text and animate classes together for text variant", () => {
    render(<Skeleton variant="text" lines={3} animate={true} />);
    const status = screen.getByRole("status");
    expect(status.className).toContain("text");
    expect(status.className).toContain("animate");
  });

  // Backs the audit:controls effect exemption for height: the text variant
  // sizes by line count, so height must prove itself on the block variants.
  it("applies width and height styles on the rect variant", () => {
    render(<Skeleton variant="rect" width="16rem" height={100} />);
    const status = screen.getByRole("status");
    expect(status.style.width).toBe("16rem");
    expect(status.style.height).toBe("100px");
  });

  it("applies width but not height on the text variant", () => {
    render(<Skeleton variant="text" lines={2} width="12rem" height={100} />);
    const status = screen.getByRole("status");
    expect(status.style.width).toBe("12rem");
    expect(status.style.height).toBe("");
  });
});
