import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AppLoading from "@dt/AppLoading";

describe("AppLoading", () => {
  it("renders loading overlay", () => {
    render(<AppLoading />);

    expect(screen.getByTestId("app-loading-overlay")).toBeInTheDocument();
  });

  it("contains a status-role loading spinner", () => {
    render(<AppLoading />);

    // Spinner should render inside the overlay with role=status
    const overlay = screen.getByTestId("app-loading-overlay");
    expect(overlay).toContainElement(screen.getByRole("status"));
  });
});
