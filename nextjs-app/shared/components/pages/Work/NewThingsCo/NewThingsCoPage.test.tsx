import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { NewThingsCoPage } from "./NewThingsCoPage";

describe("NewThingsCoPage", () => {
  it("renders page title", () => {
    renderWithProviders(<NewThingsCoPage />);
    expect(
      screen.getByRole("heading", { name: /New Things Co/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    renderWithProviders(<NewThingsCoPage />);
    expect(
      screen.getByRole("link", { name: /Back to work/i }),
    ).toBeInTheDocument();
  });
});
