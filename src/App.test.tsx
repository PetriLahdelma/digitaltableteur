import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "./pages/Home";

test("renders the home page title", () => {
  render(<Home />);
  const titleElement = screen.getByText(/Creative & Development/i);
  expect(titleElement).toBeInTheDocument();
});

test("renders the grid items", () => {
  const { container } = render(<Home />);
  const gridItems = container.querySelectorAll(".grid > div");
  expect(gridItems.length).toBeGreaterThan(0);
});
