import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { CookiePolicyFullSvPage } from "./CookiePolicyFullSvPage";

describe("CookiePolicyFullSvPage", () => {
  it("renders page title in Swedish", () => {
    renderWithProviders(<CookiePolicyFullSvPage />);
    expect(screen.getByText(/Sekretesspolicy/i)).toBeInTheDocument();
  });

  it("renders full policy content", () => {
    renderWithProviders(<CookiePolicyFullSvPage />);
    expect(screen.getByText(/Digitaltableteur Tmi/i)).toBeInTheDocument();
  });

  it("renders back button when onBack is provided", () => {
    const onBack = vi.fn();
    renderWithProviders(<CookiePolicyFullSvPage onBack={onBack} />);
    expect(screen.getByRole("button", { name: /Tillbaka/i })).toBeInTheDocument();
  });
});
