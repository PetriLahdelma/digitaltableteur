import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils/render";
import { ContactPage } from "@dt/ContactPage";

vi.mock("leaflet", () => {
  const noop = () => {};
  const dummyMap = {
    setView: () => dummyMap,
    remove: noop,
  };
  return {
    default: {
      map: vi.fn(() => dummyMap),
      tileLayer: vi.fn(() => ({ addTo: noop })),
      icon: vi.fn(() => ({})),
      marker: vi.fn(() => ({ addTo: () => ({ bindPopup: vi.fn() }) })),
      Icon: { Default: { prototype: { options: {} }, mergeOptions: vi.fn() } },
    },
  };
});

describe("ContactPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders contact hero and map fallback text", () => {
    renderWithProviders(<ContactPage />);

    expect(screen.getByRole("heading", { name: /Let's talk/i, level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText(/We'd love to hear about your project/i),
    ).toBeInTheDocument();
  });
});
