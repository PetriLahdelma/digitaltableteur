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
      description: "Test author description.",
      email: "hello@digitaltableteur.com",
      bio: "Test author bio for the author page.",
      imageUrl: "/test-image.jpg",
    };
  }),
}));

describe("AuthorPage", () => {
  it("uses 'About the author' as the level-1 heading, with the name in the bio card", () => {
    renderWithProviders(<AuthorPage slug="petri-lahdelma" />);
    expect(
      screen.getByRole("heading", { name: /About the author/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Petri Lahdelma")).toBeInTheDocument();
  });

  it("renders author bio excerpt", () => {
    renderWithProviders(<AuthorPage slug="petri-lahdelma" />);
    expect(screen.getAllByText(/Test author bio/i).length).toBeGreaterThan(0);
  });

  it("renders a back control", () => {
    renderWithProviders(<AuthorPage slug="petri-lahdelma" />);
    expect(
      screen.getByRole("button", { name: /Back/i }),
    ).toBeInTheDocument();
  });

  it("renders the contact email as a mailto link", () => {
    renderWithProviders(<AuthorPage slug="petri-lahdelma" />);
    const link = screen.getByRole("link", {
      name: /hello@digitaltableteur\.com/i,
    });
    expect(link).toHaveAttribute("href", "mailto:hello@digitaltableteur.com");
  });
});
