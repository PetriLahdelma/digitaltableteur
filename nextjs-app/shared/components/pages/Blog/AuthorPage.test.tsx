import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { AuthorPage } from "./AuthorPage";

vi.mock("../../../data/authors", () => ({
  getAuthorBySlug: vi.fn((slug: string) => {
    if (slug !== "petri-lahdelma") return undefined;
    return {
      name: "Petri Lahdelma",
      slug: "petri-lahdelma",
      bio: "Test author bio for the author page.",
      imageUrl: "/test-image.jpg",
    };
  }),
}));

describe("AuthorPage", () => {
  it("renders author name in page title", () => {
    renderWithProviders(<AuthorPage slug="petri-lahdelma" />);
    expect(
      screen.getByRole("heading", { name: /Petri Lahdelma/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders author bio excerpt", () => {
    renderWithProviders(<AuthorPage slug="petri-lahdelma" />);
    expect(screen.getAllByText(/Test author bio/i).length).toBeGreaterThan(0);
  });
});
