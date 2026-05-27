import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { RawViewPage } from "./RawViewPage";

describe("RawViewPage", () => {
  it("shows missing-project state until raw-view is restored to projects data", () => {
    renderWithProviders(<RawViewPage />);
    expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
  });
});
