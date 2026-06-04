import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { ContactPage } from "@dt/ContactPage";

describe("ContactPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the editorial contact hero and intro", () => {
    renderWithProviders(<ContactPage />);

    expect(screen.getByRole("heading", { name: /Let's talk/i, level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText(/We'd love to hear about your project/i),
    ).toBeInTheDocument();
  });
});
