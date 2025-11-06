import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Skeleton from "./Skeleton";

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
});
