import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageJunctionPage } from "./GarageJunctionPage";

describe("GarageJunctionPage", () => {
  it("renders page title", () => {
    render(<GarageJunctionPage />);
    expect(screen.getByText(/Garage Junction/i)).toBeInTheDocument();
  });

  it("renders project description", () => {
    render(<GarageJunctionPage />);
    expect(screen.getByText(/description|project/i)).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    render(<GarageJunctionPage />);
    expect(
      screen.getByRole("link", { name: /back|work/i }),
    ).toBeInTheDocument();
  });
});
