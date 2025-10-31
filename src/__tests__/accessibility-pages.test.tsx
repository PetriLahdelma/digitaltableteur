import React, { type ReactNode } from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import axe from "axe-core";

import i18n, { initI18n } from "../i18n";
import { ThemeProvider } from "@dt/ThemeProvider";

import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Work from "../pages/Work";
import Blog from "../pages/Blog";
import NotFound from "../pages/NotFound";

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children?: ReactNode }) => (
    <div data-testid="mock-map">{children}</div>
  ),
  Marker: ({ children }: { children?: ReactNode }) => (
    <div data-testid="mock-marker">{children}</div>
  ),
  Popup: ({ children }: { children?: ReactNode }) => (
    <div data-testid="mock-popup">{children}</div>
  ),
  TileLayer: () => null,
  useMap: () => ({}),
}));

vi.mock("leaflet", () => {
  const icon = {
    Default: {
      prototype: { options: {} as Record<string, unknown> },
      mergeOptions: vi.fn(),
    },
  };
  return {
    __esModule: true,
    default: { Icon: icon },
    Icon: icon,
  };
});

async function renderWithProviders(ui: React.ReactElement) {
  const renderResult = render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <ThemeProvider forcedTheme="light">{ui}</ThemeProvider>
      </MemoryRouter>
    </I18nextProvider>,
  );
  // Allow any queued microtasks/effects to complete before running axe
  await new Promise((resolve) => setTimeout(resolve, 0));
  return renderResult;
}

async function expectNoA11yViolations(component: React.ReactElement) {
  const { container } = await renderWithProviders(component);
  const results = await axe.run(container);
  const formattedViolations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      failureSummary: node.failureSummary,
    })),
  }));
  expect(formattedViolations).toEqual([]);
}

beforeAll(async () => {
  if (!i18n.isInitialized) {
    await initI18n();
  }
  HTMLCanvasElement.prototype.getContext = vi.fn();
});

describe("Accessibility | Pages", () => {
  it("home page has no detectable accessibility violations", async () => {
    await expectNoA11yViolations(<Home />);
  });

  it("about page has no detectable accessibility violations", async () => {
    await expectNoA11yViolations(<About />);
  });

  it("contact page has no detectable accessibility violations", async () => {
    await expectNoA11yViolations(<Contact />);
  });

  it("work page has no detectable accessibility violations", async () => {
    await expectNoA11yViolations(<Work />);
  });

  it("blog page has no detectable accessibility violations", async () => {
    await expectNoA11yViolations(<Blog />);
  });

  it("not found page has no detectable accessibility violations", async () => {
    await expectNoA11yViolations(<NotFound />);
  });
});
