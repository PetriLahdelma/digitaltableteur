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
});
