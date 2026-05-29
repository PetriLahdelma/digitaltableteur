import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { FinnishTransportAgencyPage } from "./FinnishTransportAgencyPage";

describe("FinnishTransportAgencyPage", () => {
  it("renders page title", () => {
    renderWithProviders(<FinnishTransportAgencyPage />);
    expect(
      screen.getByRole("heading", {
        name: /Finnish Transport Agency/i,
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    renderWithProviders(<FinnishTransportAgencyPage />);
    expect(
      screen.getByRole("link", { name: /Back to work/i }),
    ).toBeInTheDocument();
  });
});
