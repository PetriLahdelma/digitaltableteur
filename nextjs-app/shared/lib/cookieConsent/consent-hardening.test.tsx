/**
 * Consent hardening suite.
 *
 * Executable encoding of the consent correctness criteria (from the 2026-07-14
 * review follow-up). Each test names the criterion it enforces (C1..C10). This
 * file is the permanent regression gate for the two shipped consent fixes
 * (#1197) plus the surrounding trust guarantees; the remaining gaps are marked
 * `it.todo` and converted to real tests as they are implemented.
 */

import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

// The provider reads the active language via useLocalization; stub it so the
// suite exercises consent logic in isolation.
vi.mock("../translation", () => ({
  useLocalization: () => ({
    language: "en",
    resolvedLanguage: "en",
    translate: (key: string) => key,
  }),
  useTranslate: () => (key: string) => key,
}));

import {
  CookieConsentProvider,
  useCookieConsent,
} from "./CookieConsentContext";
import {
  loadConsentState,
  stateToConsents,
  hasGivenConsent,
  CONSENT_MAX_AGE_MS,
} from "./storage";
import type { CookieCategory } from "./types";

const STORAGE_KEY = "dt-cookie-consent";

const validState = (categories: Record<CookieCategory, boolean>) =>
  JSON.stringify({
    version: 1,
    timestamp: new Date().toISOString(),
    language: "en",
    categories,
  });

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <CookieConsentProvider autoShow={false}>{children}</CookieConsentProvider>
  );
}

async function mountConsent() {
  const hook = renderHook(() => useCookieConsent(), { wrapper });
  await waitFor(() => expect(hook.result.current.isReady).toBe(true));
  return hook;
}

const consentedFor = (
  consents: ReturnType<typeof stateToConsents>,
  category: CookieCategory,
) => consents.find((c) => c.category === category)?.consented;

beforeEach(() => {
  localStorage.clear();
});

describe("consent hardening — C1: 'only essential' rejects every optional category", () => {
  it("persists analytics/marketing/functional as false", async () => {
    const { result } = await mountConsent();
    act(() => result.current.acceptEssentialOnly());

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
    expect(stored.categories).toMatchObject({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  });
});

describe("consent hardening — C3: rejecting or revoking prevents tracking", () => {
  it("rejecting optional leaves tracking categories unconsented", async () => {
    const { result } = await mountConsent();
    act(() => result.current.acceptEssentialOnly());

    expect(result.current.hasConsent("analytics")).toBe(false);
    expect(result.current.hasConsent("marketing")).toBe(false);
    expect(result.current.hasConsent("functional")).toBe(false);
    expect(result.current.hasConsent("essential")).toBe(true);
  });

  it("revoking clears storage and flips granted categories back to false", async () => {
    const { result } = await mountConsent();
    act(() => result.current.acceptAll());
    expect(result.current.hasConsent("analytics")).toBe(true);

    act(() => result.current.revokeAll());
    expect(result.current.hasConsent("analytics")).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("consent hardening — C5: bad/missing/old storage fails closed", () => {
  it("missing storage grants no optional category", () => {
    expect(loadConsentState()).toBeNull();
    const consents = stateToConsents(loadConsentState());
    expect(consentedFor(consents, "analytics")).toBe(false);
    expect(consentedFor(consents, "marketing")).toBe(false);
    expect(consentedFor(consents, "functional")).toBe(false);
    expect(consentedFor(consents, "essential")).toBe(true);
  });

  it("corrupt storage fails closed and is cleared", () => {
    localStorage.setItem(STORAGE_KEY, "{ this is not valid json");
    expect(loadConsentState()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("an older schema version is discarded (treated as no consent)", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 0,
        timestamp: new Date().toISOString(),
        language: "en",
        categories: {
          essential: true,
          analytics: true,
          marketing: true,
          functional: true,
        },
      }),
    );
    expect(loadConsentState()).toBeNull();
    const consents = stateToConsents(loadConsentState());
    expect(consentedFor(consents, "analytics")).toBe(false);
  });

  it("a structurally incomplete record is rejected", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, categories: { essential: true } }),
    );
    expect(loadConsentState()).toBeNull();
  });

  it("consent older than the max age fails closed and re-prompts", () => {
    const expired = new Date(
      Date.now() - (CONSENT_MAX_AGE_MS + 60_000),
    ).toISOString();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        timestamp: expired,
        language: "en",
        categories: {
          essential: true,
          analytics: true,
          marketing: true,
          functional: true,
        },
      }),
    );

    expect(loadConsentState()).toBeNull();
    // Re-prompt: with no valid consent, hasGivenConsent is false so the banner
    // auto-shows again.
    expect(hasGivenConsent()).toBe(false);
    const consents = stateToConsents(loadConsentState());
    expect(consentedFor(consents, "analytics")).toBe(false);
  });

  it("consent within the max age is retained", () => {
    const recent = new Date(Date.now() - 60_000).toISOString();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        timestamp: recent,
        language: "en",
        categories: {
          essential: true,
          analytics: true,
          marketing: false,
          functional: true,
        },
      }),
    );

    const state = loadConsentState();
    expect(state).not.toBeNull();
    expect(state?.categories.analytics).toBe(true);
  });
});

describe("consent hardening — C8: consumers subscribe through the public API", () => {
  it("useCookieConsent throws outside the provider (no silent storage reads)", () => {
    // Analytics/consumers cannot bypass consent by reading storage directly;
    // the only entry point is the provider hook, which fails loudly if misused.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useCookieConsent())).toThrow(
      /CookieConsentProvider/,
    );
    spy.mockRestore();
  });
});

describe("consent hardening — C10: valid stored consent is backward compatible", () => {
  it("honors a valid v1 record on load", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      validState({
        essential: true,
        analytics: true,
        marketing: false,
        functional: true,
      }),
    );

    const { result } = await mountConsent();
    expect(result.current.hasConsent("analytics")).toBe(true);
    expect(result.current.hasConsent("marketing")).toBe(false);
    expect(result.current.hasConsent("functional")).toBe(true);
  });
});

describe("consent hardening — C4: preferences reopen without clearing storage", () => {
  it("openBanner re-opens the banner and leaves stored consent intact", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      validState({
        essential: true,
        analytics: true,
        marketing: false,
        functional: true,
      }),
    );

    const { result } = await mountConsent();
    expect(result.current.isBannerOpen).toBe(false);

    act(() => result.current.openBanner());

    expect(result.current.isBannerOpen).toBe(true);
    // Reopening preferences must not wipe the existing choice.
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(result.current.hasConsent("analytics")).toBe(true);
    expect(result.current.hasConsent("marketing")).toBe(false);
  });
});

// Remaining gap, tracked until implemented:
// C6 — consent state must not flash/change during hydration.
describe("consent hardening — open gaps", () => {
  it.todo("C6: consent state does not flash or change during hydration");
  // C7 (keyboard/focus/axe/forced-colors/mobile for banner + settings modal) is
  // covered by the Playwright a11y suite, not this unit gate.
});
