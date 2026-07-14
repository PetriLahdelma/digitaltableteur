/**
 * Cookie Consent Storage Utilities
 * Handles localStorage persistence and consent state management
 */

import type { ConsentState, CookieCategory, CategoryConsent } from "./types";

const STORAGE_KEY = "dt-cookie-consent";
const MINIMIZED_KEY = "dt-cookie-consent-minimized";
const CURRENT_VERSION = 1;

/**
 * Consent lapses after this age and the visitor is re-prompted. 12 months sits
 * under the EU (CNIL) 13-month ceiling for consent validity. Exported so tests
 * and callers can reason about the window.
 */
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Default consent state structure.
 *
 * Optional categories default to `false`: under an opt-in consent model the
 * baseline before any explicit choice (and the "reject all optional" outcome)
 * must NOT grant analytics/marketing/functional. Only `essential` is on.
 */
export const DEFAULT_CONSENTS: Record<CookieCategory, boolean> = {
  essential: true, // Always true, can't be disabled
  analytics: false,
  marketing: false,
  functional: false,
};

/**
 * Category metadata (required status)
 */
export const CATEGORY_CONFIG: Record<CookieCategory, { required: boolean }> = {
  essential: { required: true },
  analytics: { required: false },
  marketing: { required: false },
  functional: { required: false },
};

/**
 * Load consent state from localStorage
 */
export function loadConsentState(): ConsentState | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as ConsentState;

    // Validate structure
    if (!parsed.version || !parsed.timestamp || !parsed.categories) {
      return null;
    }

    // Handle version migration if needed
    if (parsed.version < CURRENT_VERSION) {
      // Future: migration logic
      return null;
    }

    // Expiry: consent older than the max age (or with an unparseable
    // timestamp) fails closed so the visitor is re-prompted rather than tracked
    // on a stale choice.
    const savedAt = Date.parse(parsed.timestamp);
    if (!Number.isFinite(savedAt) || Date.now() - savedAt > CONSENT_MAX_AGE_MS) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore storage cleanup errors
      }
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load cookie consent:", error);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage cleanup errors
    }
    return null;
  }
}

/**
 * Save consent state to localStorage
 */
export function saveConsentState(
  categories: Record<CookieCategory, boolean>,
  language: string,
): void {
  if (typeof window === "undefined") return;

  const state: ConsentState = {
    version: CURRENT_VERSION,
    timestamp: new Date().toISOString(),
    language,
    categories: {
      ...categories,
      essential: true, // Force essential to always be true
    },
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save cookie consent:", error);
  }
}

/**
 * Clear all consent data (revoke)
 */
export function clearConsentState(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear cookie consent:", error);
  }
}

/**
 * Convert stored state to CategoryConsent array
 */
export function stateToConsents(state: ConsentState | null): CategoryConsent[] {
  const categories = state?.categories || DEFAULT_CONSENTS;

  return Object.entries(categories).map(([category, consented]) => ({
    category: category as CookieCategory,
    consented,
    required: CATEGORY_CONFIG[category as CookieCategory].required,
  }));
}

/**
 * Check if any consent has been given (even if user rejected all optional)
 */
export function hasGivenConsent(): boolean {
  return loadConsentState() !== null;
}

/**
 * Cookie definitions for documentation (used in settings page)
 */
/**
 * Save minimized state to localStorage
 */
export function saveMinimizedState(isMinimized: boolean): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(MINIMIZED_KEY, JSON.stringify(isMinimized));
  } catch (error) {
    console.error("Failed to save minimized state:", error);
  }
}

/**
 * Load minimized state from localStorage
 */
export function loadMinimizedState(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem(MINIMIZED_KEY);
    if (!stored) return false;
    return JSON.parse(stored) as boolean;
  } catch (error) {
    console.error("Failed to load minimized state:", error);
    try {
      localStorage.removeItem(MINIMIZED_KEY);
    } catch {
      // ignore storage cleanup errors
    }
    return false;
  }
}

/**
 * Clear minimized state from localStorage
 */
export function clearMinimizedState(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(MINIMIZED_KEY);
  } catch (error) {
    console.error("Failed to clear minimized state:", error);
  }
}

export const COOKIE_DEFINITIONS = [
  {
    name: "dt-cookie-consent",
    category: "essential" as CookieCategory,
    purpose: "Stores your cookie preferences",
    duration: "1 year",
  },
  {
    name: "i18nextLng",
    category: "essential" as CookieCategory,
    purpose: "Stores your language preference",
    duration: "Session",
  },
  {
    name: "_ga, _ga_*",
    category: "analytics" as CookieCategory,
    purpose: "Google Analytics - tracks anonymous usage",
    duration: "2 years",
    provider: "Google LLC",
  },
  {
    name: "chat-preferences",
    category: "functional" as CookieCategory,
    purpose: "Remembers chat widget state and history",
    duration: "30 days",
  },
] as const;
