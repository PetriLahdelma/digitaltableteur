/**
 * Consent hardening — C2: no optional analytics loads before explicit consent.
 *
 * DeferredAnalytics must render zero GA/GTM/ahrefs script tags until the
 * visitor has granted the `analytics` category, regardless of interaction or
 * the idle fallback. next/script is stubbed to an identifiable marker so we can
 * assert presence/absence without a real Next runtime.
 */

import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("next/script", () => ({
  default: (props: { id?: string; src?: string }) => (
    <script data-testid="analytics-script" data-id={props.id} data-src={props.src} />
  ),
}));

vi.mock("@/nextjs-app/shared/lib/translation", () => ({
  useLocalization: () => ({
    language: "en",
    resolvedLanguage: "en",
    translate: (key: string) => key,
  }),
  useTranslate: () => (key: string) => key,
}));

import { DeferredAnalytics } from "./DeferredAnalytics";
import { CookieConsentProvider } from "@/nextjs-app/shared/lib/cookieConsent";

const STORAGE_KEY = "dt-cookie-consent";

function seedConsent(categories: Record<string, boolean>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      timestamp: new Date().toISOString(),
      language: "en",
      categories,
    }),
  );
}

function renderAnalytics() {
  return render(
    <CookieConsentProvider autoShow={false}>
      <DeferredAnalytics gaMeasurementId="G-TEST123" />
    </CookieConsentProvider>,
  );
}

async function fireInteraction() {
  await act(async () => {
    window.dispatchEvent(new Event("pointerdown"));
    window.dispatchEvent(new Event("scroll"));
    await Promise.resolve();
  });
}

beforeEach(() => {
  localStorage.clear();
});

describe("DeferredAnalytics — C2: consent-gated loading", () => {
  it("renders no analytics scripts with no stored consent, even after interaction", async () => {
    const { queryAllByTestId } = renderAnalytics();
    await fireInteraction();
    expect(queryAllByTestId("analytics-script")).toHaveLength(0);
  });

  it("renders no analytics scripts when analytics is explicitly rejected", async () => {
    seedConsent({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
    const { queryAllByTestId } = renderAnalytics();
    await fireInteraction();
    expect(queryAllByTestId("analytics-script")).toHaveLength(0);
  });

  it("loads analytics only after consent is granted and the user interacts", async () => {
    seedConsent({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
    const { queryAllByTestId } = renderAnalytics();

    // Consent is granted but nothing should load until an interaction fires.
    await act(async () => {
      await Promise.resolve();
    });
    expect(queryAllByTestId("analytics-script")).toHaveLength(0);

    await fireInteraction();
    await waitFor(() =>
      expect(queryAllByTestId("analytics-script").length).toBeGreaterThan(0),
    );
  });
});
