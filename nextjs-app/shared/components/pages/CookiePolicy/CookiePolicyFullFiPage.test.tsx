import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { CookiePolicyFullFiPage } from "./CookiePolicyFullFiPage";

describe("CookiePolicyFullFiPage", () => {
  it("renders page title in Finnish", () => {
    renderWithProviders(<CookiePolicyFullFiPage />);
    expect(screen.getByText(/Tietosuojakäytäntö/i)).toBeInTheDocument();
  });

  it("renders full policy content", () => {
    renderWithProviders(<CookiePolicyFullFiPage />);
    expect(screen.getByText(/Digitaltableteur Tmi/i)).toBeInTheDocument();
  });

  it("renders back button when onBack is provided", () => {
    const onBack = vi.fn();
    renderWithProviders(<CookiePolicyFullFiPage onBack={onBack} />);
    expect(screen.getByRole("button", { name: /Takaisin/i })).toBeInTheDocument();
  });
});
