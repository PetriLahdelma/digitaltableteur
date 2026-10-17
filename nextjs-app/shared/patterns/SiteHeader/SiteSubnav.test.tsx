import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SITE_SUBNAV_SLOT_ID, SiteSubnav } from "./SiteSubnav";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

function renderWithSlot() {
  return render(
    <>
      <header>
        <div id={SITE_SUBNAV_SLOT_ID} data-testid="slot" />
      </header>
      <SiteSubnav className="bar">
        <nav aria-label="Posts">Back</nav>
      </SiteSubnav>
    </>,
  );
}

describe("SiteSubnav", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a single in-flow bar from tablet up", () => {
    mockMatchMedia(false);
    renderWithSlot();
    expect(screen.getAllByRole("navigation", { name: "Posts" })).toHaveLength(1);
    expect(screen.getByTestId("slot")).toBeEmptyDOMElement();
  });

  it("adds a hidden, inert copy to the header slot on phones", () => {
    mockMatchMedia(true);
    renderWithSlot();
    const copy = screen.getByTestId("slot").firstElementChild as HTMLElement;
    expect(copy).toHaveAttribute("data-state", "hidden");
    // inert keeps the copy out of the tab order and accessibility tree
    // until it is revealed (jsdom has no inert property, so check the attribute).
    expect(copy).toHaveAttribute("inert");
    expect(copy).toHaveClass("bar");
  });
});
