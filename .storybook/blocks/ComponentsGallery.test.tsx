import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DOC_TIER_1 } from "../../scripts/design-system/doc-tiers.mjs";
import {
  ComponentsGallery,
  filterGalleryEntries,
  GalleryCard,
  GALLERY_ENTRIES,
} from "./ComponentsGallery";

describe("ComponentsGallery", () => {
  it("renders one card per DOC_TIER_1 component", () => {
    const { container } = render(<ComponentsGallery />);
    const cards = container.querySelectorAll("article");
    expect(cards).toHaveLength(DOC_TIER_1.length);
  });

  it("links the Button card to its documentation and playground", () => {
    render(<ComponentsGallery />);
    const buttonCard = screen.getByText("Button").closest("article");
    expect(
      buttonCard?.querySelector("a[href*='actions-button--docs']"),
    ).not.toBeNull();
    expect(
      buttonCard?.querySelector("a[href*='actions-button--playground']"),
    ).not.toBeNull();
  });

  it("falls back to a monogram when a component has no playground defaults", () => {
    // Synthetic name: no contract, no registry entry — the fallback path
    // stays testable even once every real Tier 1 contract has defaults.
    const { container } = render(
      <GalleryCard name="NoSuchComponent" category="Actions" />,
    );
    expect(container.querySelector("[class*='monogram']")).not.toBeNull();
  });

  it("matches every query word against contract search fields", () => {
    const matches = filterGalleryEntries(GALLERY_ENTRIES, {
      query: "primary action",
      category: "all",
      status: "all",
    });
    expect(matches.map(({ name }) => name)).toContain("Button");
  });

  it("filters the rendered catalog by intent and reports the result count", async () => {
    const user = userEvent.setup();
    render(<ComponentsGallery />);

    await user.type(
      screen.getByRole("searchbox", { name: "Search components" }),
      "multi select",
    );

    expect(screen.getByText("MultiCombobox")).toBeInTheDocument();
    expect(screen.queryByText("Button")).not.toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`^\\d+ of ${DOC_TIER_1.length} components$`)),
    ).toBeInTheDocument();
  });

  it("offers a reset action for an empty result", async () => {
    const user = userEvent.setup();
    render(<ComponentsGallery />);

    await user.type(
      screen.getByRole("searchbox", { name: "Search components" }),
      "not-a-real-interface-intent",
    );
    expect(
      screen.getByRole("heading", { name: "No matching components" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Show all components" }),
    );
    expect(screen.getByText("Button")).toBeInTheDocument();
  });
});
