import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrivacyPolicyPage } from "./PrivacyPolicyPage";

describe("PrivacyPolicyPage", () => {
  it("renders page title", () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
  });

  it("renders privacy policy content", () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByText(/data|privacy|personal information/i),
    ).toBeInTheDocument();
  });

  it("renders back button", () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByRole("link", { name: /back/i })).toBeInTheDocument();
  });
});
