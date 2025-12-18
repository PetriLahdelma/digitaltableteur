import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HelsinkiDesignSystemPage } from "./HelsinkiDesignSystemPage";

describe("HelsinkiDesignSystemPage", () => {
  it("renders page title", () => {
    render(<HelsinkiDesignSystemPage />);
    expect(screen.getByText(/Helsinki Design System/i)).toBeInTheDocument();
  });

  it("renders project description", () => {
    render(<HelsinkiDesignSystemPage />);
    expect(screen.getByText(/description|project/i)).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    render(<HelsinkiDesignSystemPage />);
    expect(
      screen.getByRole("link", { name: /back|work/i }),
    ).toBeInTheDocument();
  });
});
