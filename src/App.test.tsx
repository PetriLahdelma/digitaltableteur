import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "./pages/Home";

describe("App", () => {
  it("renders the home page title", () => {
    render(<Home />);
    const titleElement = screen.getByText(/Creative & Development/i);
    expect(titleElement).toBeInTheDocument();
  });

  it("renders the grid items", () => {
    render(<Home />);
    // Try to find grid items by role or test id for robustness
    const gridItems = screen.queryAllByTestId("grid-item");
    if (gridItems.length > 0) {
      expect(gridItems.length).toBeGreaterThan(0);
    } else {
      // fallback: count all divs inside any element with class containing 'grid'
      const fallbackItems = document.querySelectorAll("[class*='grid'] > div");
      expect(fallbackItems.length).toBeGreaterThan(0);
    }
  });
});
