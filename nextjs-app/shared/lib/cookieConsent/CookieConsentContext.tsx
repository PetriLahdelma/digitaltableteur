"use client";

/**
 * Cookie Consent Context Provider
 * Global state management for cookie consent inspired by HDS pattern
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useLocalization } from "../translation";
import type {
  CookieConsentContextValue,
  CookieConsentProviderProps,
  CategoryConsent,
  CookieCategory,
  ConsentChangeEvent,
} from "./types";
import {
  loadConsentState,
  saveConsentState,
  clearConsentState,
  stateToConsents,
  hasGivenConsent,
  DEFAULT_CONSENTS,
  clearMinimizedState,
} from "./storage";

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null,
);

/**
 * Hook to access cookie consent context
 * @throws Error if used outside provider
 */
export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      "useCookieConsent must be used within CookieConsentProvider",
    );
  }
  return context;
}

/**
 * Non-throwing accessor for the cookie consent context.
 *
 * Returns `null` when rendered outside a `CookieConsentProvider` instead of
 * throwing. Use this only for optional UI affordances (e.g. a footer
 * "Cookie preferences" trigger) that should simply not render when consent
 * isn't wired — never to read or bypass consent state. For consumers that
 * require consent, use {@link useCookieConsent}.
 */
export function useCookieConsentOptional(): CookieConsentContextValue | null {
  return useContext(CookieConsentContext);
}

/**
 * Provider component that manages consent state
 */
export function CookieConsentProvider({
  children,
  onChange,
  autoShow = true,
}: CookieConsentProviderProps) {
  const { language, resolvedLanguage } = useLocalization();
  const [isReady, setIsReady] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [consents, setConsents] = useState<CategoryConsent[]>([]);

  // Load initial state from localStorage
  useEffect(() => {
    const state = loadConsentState();
    const initialConsents = stateToConsents(state);
    setConsents(initialConsents);
    setIsReady(true);

    if (autoShow && !hasGivenConsent()) {
      setIsBannerOpen(true);
    }
  }, [autoShow]);

  /**
   * Emit consent change event
   */
  const emitChange = useCallback(
    (type: ConsentChangeEvent["type"], categories: CategoryConsent[]) => {
      const event: ConsentChangeEvent = {
        type,
        categories,
        timestamp: new Date().toISOString(),
      };
      onChange?.(event);
    },
    [onChange],
  );

  /**
   * Update consents and save to storage
   */
  const updateConsents = useCallback(
    (
      categories: Record<CookieCategory, boolean>,
      eventType: ConsentChangeEvent["type"],
    ) => {
      saveConsentState(categories, resolvedLanguage || language || "en");
      clearMinimizedState(); // Clear minimized state when consent is given
      const newConsents = stateToConsents(loadConsentState());
      setConsents(newConsents);
      emitChange(eventType, newConsents);
      setIsBannerOpen(false);
    },
    [emitChange, language, resolvedLanguage],
  );

  /**
   * Accept all categories
   */
  const acceptAll = useCallback(() => {
    const allAccepted: Record<CookieCategory, boolean> = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    updateConsents(allAccepted, "accept-all");
  }, [updateConsents]);

  /**
   * Accept only essential (reject all optional)
   */
  const acceptEssentialOnly = useCallback(() => {
    const essentialOnly: Record<CookieCategory, boolean> = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    updateConsents(essentialOnly, "accept-required");
  }, [updateConsents]);

  /**
   * Set specific category consents (custom selection)
   */
  const setConsentCategories = useCallback(
    (categories: Partial<Record<CookieCategory, boolean>>) => {
      const state = loadConsentState();
      const currentCategories = state?.categories || DEFAULT_CONSENTS;
      const newCategories = {
        ...currentCategories,
        ...categories,
        essential: true, // Always force essential to true
      };
      updateConsents(newCategories, "custom");
    },
    [updateConsents],
  );

  /**
   * Revoke all consents (clear storage)
   */
  const revokeAll = useCallback(() => {
    clearConsentState();
    const resetConsents = stateToConsents(null);
    setConsents(resetConsents);
    emitChange("revoke", resetConsents);
    setIsBannerOpen(true); // Re-open banner after revoke
  }, [emitChange]);

  /**
   * Check if specific category is consented
   */
  const hasConsent = useCallback(
    (category: CookieCategory): boolean => {
      const consent = consents.find((c) => c.category === category);
      return consent?.consented ?? false;
    },
    [consents],
  );

  /**
   * Open banner modal
   */
  const openBanner = useCallback(() => {
    setIsBannerOpen(true);
  }, []);

  /**
   * Close banner modal
   */
  const closeBanner = useCallback(() => {
    setIsBannerOpen(false);
  }, []);

  const value: CookieConsentContextValue = {
    isReady,
    consents,
    hasConsent,
    acceptAll,
    acceptEssentialOnly,
    setConsents: setConsentCategories,
    revokeAll,
    openBanner,
    closeBanner,
    isBannerOpen,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}
