import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntrumPage } from "./IntrumPage";

describe("IntrumPage", () => {
  it("renders page title", () => {
    render(<IntrumPage />);
    expect(screen.getByText(/Intrum/i)).toBeInTheDocument();
  });

  it("renders project overview", () => {
    render(<IntrumPage />);
    expect(screen.getByText(/Project Details|Overview/i)).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    render(<IntrumPage />);
    expect(
      screen.getByRole("link", { name: /back to work|work/i })
    ).toBeInTheDocument();
  });
});
