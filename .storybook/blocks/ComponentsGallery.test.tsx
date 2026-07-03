import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DOC_TIER_1 } from "../../scripts/design-system/doc-tiers.mjs";
import { ComponentsGallery, GalleryCard } from "./ComponentsGallery";

describe("ComponentsGallery", () => {
  it("renders one linked card per DOC_TIER_1 component", () => {
    const { container } = render(<ComponentsGallery />);
    const cards = container.querySelectorAll("a[href*='--docs']");
    expect(cards).toHaveLength(DOC_TIER_1.length);
  });

  it("links the Button card to the Actions docs id", () => {
    render(<ComponentsGallery />);
    const button = screen.getByText("Button").closest("a");
    expect(button?.getAttribute("href")).toContain("actions-button--docs");
  });

  it("falls back to a monogram when a component has no playground defaults", () => {
    // Synthetic name: no contract, no registry entry — the fallback path
    // stays testable even once every real Tier 1 contract has defaults.
    const { container } = render(
      <GalleryCard name="NoSuchComponent" category="Actions" />,
    );
    expect(container.querySelector("[class*='monogram']")).not.toBeNull();
  });
});
