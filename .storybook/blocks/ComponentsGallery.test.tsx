import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DOC_TIER_1 } from "../../scripts/design-system/doc-tiers.mjs";
import { ComponentsGallery } from "./ComponentsGallery";

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
    const { container } = render(<ComponentsGallery />);
    // Spinner has no playground.defaults yet (Phase 3 feedback batch).
    const spinner = screen.getByText("Spinner").closest("a");
    expect(spinner?.querySelector("[class*='monogram']")).not.toBeNull();
    expect(container.querySelectorAll("[class*='monogram']").length).toBeGreaterThan(0);
  });
});
