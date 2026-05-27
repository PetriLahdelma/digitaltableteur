import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { IntrumPage } from "./IntrumPage";

describe("IntrumPage", () => {
  it("shows missing-project state until intrum is restored to projects data", () => {
    renderWithProviders(<IntrumPage />);
    expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
  });
});
