import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VertaaUXPage } from "./VertaaUXPage";

describe("VertaaUXPage", () => {
  it("renders page title", () => {
    render(<VertaaUXPage />);
    expect(screen.getByText(/VertaaUX/i)).toBeInTheDocument();
  });

  it("renders project overview", () => {
    render(<VertaaUXPage />);
    expect(screen.getByText(/Project Details|Overview/i)).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    render(<VertaaUXPage />);
    expect(
      screen.getByRole("link", { name: /back to work|work/i }),
    ).toBeInTheDocument();
  });
});
