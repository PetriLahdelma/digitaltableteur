import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../../test-utils/render";
import { TulliPage } from "./TulliPage";

describe("TulliPage", () => {
  it("shows missing-project state until tulli is restored to projects data", () => {
    renderWithProviders(<TulliPage />);
    expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
  });
});
