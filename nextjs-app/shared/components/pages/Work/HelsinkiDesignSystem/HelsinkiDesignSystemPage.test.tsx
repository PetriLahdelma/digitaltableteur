import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { HelsinkiDesignSystemPage } from "./HelsinkiDesignSystemPage";

describe("HelsinkiDesignSystemPage", () => {
  it("renders page title", () => {
    renderWithProviders(<HelsinkiDesignSystemPage />);
    expect(
      screen.getByRole("heading", {
        name: /Helsinki Design System/i,
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it("renders back to work link", () => {
    renderWithProviders(<HelsinkiDesignSystemPage />);
    expect(
      screen.getByRole("link", { name: /Back to work/i }),
    ).toBeInTheDocument();
  });
});
