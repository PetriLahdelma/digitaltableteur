/**
 * Cookie Consent Context Provider
 * Global state management for cookie consent inspired by HDS pattern
 */
import React from "react";
import type { CookieConsentContextValue, CookieConsentProviderProps } from "./types";
/**
 * Hook to access cookie consent context
 * @throws Error if used outside provider
 */
export declare function useCookieConsent(): CookieConsentContextValue;
/**
 * Non-throwing accessor for the cookie consent context.
 *
 * Returns `null` when rendered outside a `CookieConsentProvider` instead of
 * throwing. Use this only for optional UI affordances (e.g. a footer
 * "Cookie preferences" trigger) that should simply not render when consent
 * isn't wired — never to read or bypass consent state. For consumers that
 * require consent, use {@link useCookieConsent}.
 */
export declare function useCookieConsentOptional(): CookieConsentContextValue | null;
/**
 * Provider component that manages consent state
 */
export declare function CookieConsentProvider({ children, onChange, autoShow, }: CookieConsentProviderProps): React.JSX.Element;
//# sourceMappingURL=CookieConsentContext.d.ts.map