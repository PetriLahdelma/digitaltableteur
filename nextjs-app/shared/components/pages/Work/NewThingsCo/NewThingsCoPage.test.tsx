import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewThingsCoPage } from "./NewThingsCoPage";

describe("NewThingsCoPage", () => {
  it("renders page title", () => {
    render(<NewThingsCoPage />);
    expect(screen.getByText(/New Things Co/i)).toBeInTheDocument();
  });

  it("renders project description", () => {
    render(<NewThingsCoPage />);
    expect(screen.getByText(/description|project/i)).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    render(<NewThingsCoPage />);
    expect(
      screen.getByRole("link", { name: /back|work/i }),
    ).toBeInTheDocument();
  });
});
