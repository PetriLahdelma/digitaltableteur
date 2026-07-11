import { describe, it, expect } from "vitest";
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

  it("renders the policy sections as a marker-less list layout", () => {
    renderWithProviders(<PrivacyPolicyPage />);
    // DS structure after the dogfooding swaps: Text paragraphs, DS List items,
    // DS Section wrappers (the dead onBack back-button affordance is gone).
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getAllByRole("list").length).toBe(6);
    expect(
      screen.getAllByText(/Last updated/i)[0].closest("p"),
    ).toBeInTheDocument();
  });
});
