import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CookiePolicyFullEnPage } from "./CookiePolicyFullEnPage";

describe("CookiePolicyFullEnPage", () => {
  it("renders page title in English", () => {
    render(<CookiePolicyFullEnPage />);
    expect(screen.getByText(/cookie policy/i)).toBeInTheDocument();
  });

  it("renders full policy content", () => {
    render(<CookiePolicyFullEnPage />);
    expect(screen.getByText(/cookies|data|privacy/i)).toBeInTheDocument();
  });

  it("renders back button", () => {
    render(<CookiePolicyFullEnPage />);
    expect(screen.getByRole("link", { name: /back/i })).toBeInTheDocument();
  });
});
