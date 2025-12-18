import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CookiePolicyPage } from "./CookiePolicyPage";

describe("CookiePolicyPage", () => {
  it("renders page title", () => {
    render(<CookiePolicyPage />);
    expect(screen.getByText(/cookie/i)).toBeInTheDocument();
  });

  it("renders cookie policy content", () => {
    render(<CookiePolicyPage />);
    expect(screen.getByText(/policy|cookies/i)).toBeInTheDocument();
  });

  it("renders language-specific links", () => {
    render(<CookiePolicyPage />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});
