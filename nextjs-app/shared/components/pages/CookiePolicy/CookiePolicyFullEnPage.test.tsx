import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { CookiePolicyFullEnPage } from "./CookiePolicyFullEnPage";

describe("CookiePolicyFullEnPage", () => {
  it("renders page title in English", () => {
    renderWithProviders(<CookiePolicyFullEnPage />);
    expect(
      screen.getByRole("heading", { name: /Privacy Policy/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders full policy content", () => {
    renderWithProviders(<CookiePolicyFullEnPage />);
    expect(screen.getByText(/Digitaltableteur Tmi/i)).toBeInTheDocument();
  });

  it("renders back button when onBack is provided", () => {
    const onBack = vi.fn();
    renderWithProviders(<CookiePolicyFullEnPage onBack={onBack} />);
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
  });
});
