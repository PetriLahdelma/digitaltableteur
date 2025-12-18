import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CookiePolicyFullFiPage } from "./CookiePolicyFullFiPage";

describe("CookiePolicyFullFiPage", () => {
  it("renders page title in Finnish", () => {
    render(<CookiePolicyFullFiPage />);
    expect(screen.getByText(/evästekäytäntö|cookie/i)).toBeInTheDocument();
  });

  it("renders full policy content", () => {
    render(<CookiePolicyFullFiPage />);
    expect(screen.getByText(/evästeet|cookies|tiedot/i)).toBeInTheDocument();
  });

  it("renders back button", () => {
    render(<CookiePolicyFullFiPage />);
    expect(
      screen.getByRole("link", { name: /takaisin|back/i }),
    ).toBeInTheDocument();
  });
});
