import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BusyIndicator from "./BusyIndicator";

describe("BusyIndicator", () => {
  it("renders spinner with default label", () => {
    render(<BusyIndicator />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
  it("renders determinate progress with correct dot activation and aria attributes", () => {
    render(<BusyIndicator progress={0.5} />); // 50% should activate first two dots
    const pb = screen.getByRole("progressbar");
    expect(pb).toHaveAttribute("aria-valuemin", "0");
    expect(pb).toHaveAttribute("aria-valuemax", "100");
    expect(pb).toHaveAttribute("aria-valuenow", "50");
    const ariaValueText = pb.getAttribute("aria-valuetext");
    expect(ariaValueText).toMatch(/50/);
    // Count active dots
    const activeDots = pb.querySelectorAll("[data-active='true']");
    expect(activeDots.length).toBeGreaterThanOrEqual(2);
  });
});
