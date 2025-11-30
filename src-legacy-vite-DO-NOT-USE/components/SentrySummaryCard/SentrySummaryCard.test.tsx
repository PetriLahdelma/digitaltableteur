import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import SentrySummaryCard from "./SentrySummaryCard";
import "@testing-library/jest-dom";

function withI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

// Mock fetch
const mockFetch = (data: any, ok = true) => {
  // @ts-ignore
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(data),
    }),
  );
};

describe("SentrySummaryCard", () => {
  it("renders loading state then data", async () => {
    mockFetch({
      generatedAt: new Date().toISOString(),
      project: "frontend",
      filters: { unresolved: true, environment: "production" },
      count: 1,
      issues: [
        {
          id: "1",
          title: "TypeError: Cannot read property 'foo' of undefined",
          culprit: "App.tsx",
          level: "error",
          userCount: 3,
          status: "unresolved",
          isUnhandled: true,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          permalink: "https://sentry.io/issue/1",
          environment: "production",
        },
      ],
    });
    render(withI18n(<SentrySummaryCard />));
    expect(
      screen.getByRole("status", { name: /Loading content/i }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText(/Sentry Issues/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/TypeError:/i)).toBeInTheDocument();
  });

  it("renders empty state", async () => {
    mockFetch({
      generatedAt: new Date().toISOString(),
      project: "frontend",
      filters: { unresolved: false, environment: null },
      count: 0,
      issues: [],
    });
    render(withI18n(<SentrySummaryCard />));
    await waitFor(() =>
      expect(screen.getByText(/No matching issues/i)).toBeInTheDocument(),
    );
  });

  it("renders error state", async () => {
    // @ts-ignore
    global.fetch = vi.fn(() => Promise.resolve({ ok: false }));
    render(withI18n(<SentrySummaryCard />));
    await waitFor(() =>
      expect(
        screen.getByText(/Failed to load Sentry data/i),
      ).toBeInTheDocument(),
    );
  });

  it("renders stub badge when stub true in data", () => {
    const stubData = {
      generatedAt: new Date().toISOString(),
      project: "frontend",
      filters: { unresolved: true, environment: null },
      count: 0,
      issues: [],
      stub: true,
      reason: "test",
    };
    render(withI18n(<SentrySummaryCard dataOverride={stubData} />));
    expect(screen.getByText(/Stub data/i)).toBeInTheDocument();
  });
});
