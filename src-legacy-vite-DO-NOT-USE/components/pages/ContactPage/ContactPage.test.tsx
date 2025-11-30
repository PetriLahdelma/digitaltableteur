import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n";
import { ContactPage } from "./ContactPage";

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
    render(
      <I18nextProvider i18n={i18n}>
        <ContactPage />
      </I18nextProvider>,
    );

    expect(
      screen.getByText(/Connect for a free discovery session/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Come visit/i)).toBeInTheDocument();
    expect(screen.getByText(/Loading map/i)).toBeInTheDocument();
  });
});
