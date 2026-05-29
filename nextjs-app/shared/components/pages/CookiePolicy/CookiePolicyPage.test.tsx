import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { CookiePolicyPage } from "./CookiePolicyPage";

describe("CookiePolicyPage", () => {
  it("renders page title", () => {
    renderWithProviders(<CookiePolicyPage />);
    expect(screen.getByText(/Cookie policy/i)).toBeInTheDocument();
  });

  it("renders cookie policy content", () => {
    renderWithProviders(<CookiePolicyPage />);
    expect(screen.getByText(/cookies to remember your preferences/i)).toBeInTheDocument();
  });

  it("renders AI policy link", () => {
    renderWithProviders(<CookiePolicyPage />);
    expect(screen.getByRole("link", { name: /AI/i })).toBeInTheDocument();
  });
});
