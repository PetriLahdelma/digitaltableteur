import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { PrivacyPolicyPage } from "./PrivacyPolicyPage";

describe("PrivacyPolicyPage", () => {
  it("renders page title", () => {
    renderWithProviders(<PrivacyPolicyPage />);
    expect(
      screen.getByRole("heading", { name: /Privacy Policy/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders privacy policy content", () => {
    renderWithProviders(<PrivacyPolicyPage />);
    expect(
      screen.getByRole("heading", { name: /What data do we collect/i }),
    ).toBeInTheDocument();
  });

  it("renders back button when onBack is provided", () => {
    const onBack = vi.fn();
    renderWithProviders(<PrivacyPolicyPage onBack={onBack} />);
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
  });
});
