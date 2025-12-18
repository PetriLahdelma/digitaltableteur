import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CookiePolicyFullSvPage } from "./CookiePolicyFullSvPage";

describe("CookiePolicyFullSvPage", () => {
  it("renders page title in Swedish", () => {
    render(<CookiePolicyFullSvPage />);
    expect(screen.getByText(/cookie policy|kakor/i)).toBeInTheDocument();
  });

  it("renders full policy content", () => {
    render(<CookiePolicyFullSvPage />);
    expect(screen.getByText(/kakor|cookies|data/i)).toBeInTheDocument();
  });

  it("renders back button", () => {
    render(<CookiePolicyFullSvPage />);
    expect(
      screen.getByRole("link", { name: /tillbaka|back/i }),
    ).toBeInTheDocument();
  });
});
