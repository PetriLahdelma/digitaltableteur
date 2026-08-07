/**
 * Cookie Consent Storage Utilities
 * Handles localStorage persistence and consent state management
 */
import type { ConsentState, CookieCategory, CategoryConsent } from "./types";
/**
 * Consent lapses after this age and the visitor is re-prompted. 12 months sits
 * under the EU (CNIL) 13-month ceiling for consent validity. Exported so tests
 * and callers can reason about the window.
 */
export declare const CONSENT_MAX_AGE_MS: number;
/**
 * Default consent state structure.
 *
 * Optional categories default to `false`: under an opt-in consent model the
 * baseline before any explicit choice (and the "reject all optional" outcome)
 * must NOT grant analytics/marketing/functional. Only `essential` is on.
 */
export declare const DEFAULT_CONSENTS: Record<CookieCategory, boolean>;
/**
 * Category metadata (required status)
 */
export declare const CATEGORY_CONFIG: Record<CookieCategory, {
    required: boolean;
}>;
/**
 * Load consent state from localStorage
 */
export declare function loadConsentState(): ConsentState | null;
/**
 * Save consent state to localStorage
 */
export declare function saveConsentState(categories: Record<CookieCategory, boolean>, language: string): void;
/**
 * Clear all consent data (revoke)
 */
export declare function clearConsentState(): void;
/**
 * Convert stored state to CategoryConsent array
 */
export declare function stateToConsents(state: ConsentState | null): CategoryConsent[];
/**
 * Check if any consent has been given (even if user rejected all optional)
 */
export declare function hasGivenConsent(): boolean;
/**
 * Cookie definitions for documentation (used in settings page)
 */
/**
 * Save minimized state to localStorage
 */
export declare function saveMinimizedState(isMinimized: boolean): void;
/**
 * Load minimized state from localStorage
 */
export declare function loadMinimizedState(): boolean;
/**
 * Clear minimized state from localStorage
 */
export declare function clearMinimizedState(): void;
export declare const COOKIE_DEFINITIONS: readonly [{
    readonly name: "dt-cookie-consent";
    readonly category: CookieCategory;
    readonly purpose: "Stores your cookie preferences";
    readonly duration: "1 year";
}, {
    readonly name: "i18nextLng";
    readonly category: CookieCategory;
    readonly purpose: "Stores your language preference";
    readonly duration: "Session";
}, {
    readonly name: "_ga, _ga_*";
    readonly category: CookieCategory;
    readonly purpose: "Google Analytics - tracks anonymous usage";
    readonly duration: "2 years";
    readonly provider: "Google LLC";
}, {
    readonly name: "chat-preferences";
    readonly category: CookieCategory;
    readonly purpose: "Remembers chat widget state and history";
    readonly duration: "30 days";
}];
//# sourceMappingURL=storage.d.ts.map