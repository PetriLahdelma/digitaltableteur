import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IllustrationsPage } from "./IllustrationsPage";

describe("IllustrationsPage", () => {
  it("renders page title", () => {
    render(<IllustrationsPage />);
    expect(screen.getByText(/illustrations/i)).toBeInTheDocument();
  });

  it("renders illustration gallery", () => {
    render(<IllustrationsPage />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
  });

  it("renders back to work link", () => {
    render(<IllustrationsPage />);
    expect(
      screen.getByRole("link", { name: /back|work/i }),
    ).toBeInTheDocument();
  });
});
