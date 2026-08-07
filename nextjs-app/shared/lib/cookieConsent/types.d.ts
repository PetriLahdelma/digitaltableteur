/**
 * Cookie Consent Management Types
 * Inspired by Helsinki Design System but built for Digitaltableteur
 */
/**
 * Cookie category identifiers
 */
export type CookieCategory = "essential" | "analytics" | "marketing" | "functional";
/**
 * Individual consent status for a category
 */
export interface CategoryConsent {
    category: CookieCategory;
    consented: boolean;
    required: boolean;
}
/**
 * Complete consent state stored in localStorage
 */
export interface ConsentState {
    version: number;
    timestamp: string;
    language: string;
    categories: Record<CookieCategory, boolean>;
}
/**
 * Cookie definition for documentation
 */
export interface CookieDefinition {
    name: string;
    category: CookieCategory;
    purpose: string;
    duration: string;
    provider?: string;
}
/**
 * Event emitted when consent changes
 */
export interface ConsentChangeEvent {
    type: "accept-all" | "accept-required" | "custom" | "revoke";
    categories: CategoryConsent[];
    timestamp: string;
}
/**
 * Props for consent context provider
 */
export interface CookieConsentProviderProps {
    children: React.ReactNode;
    onChange?: (event: ConsentChangeEvent) => void;
    /** Auto-show banner on mount if no consent stored */
    autoShow?: boolean;
}
/**
 * Context value shape
 */
export interface CookieConsentContextValue {
    /** Whether consent state is loaded and ready */
    isReady: boolean;
    /** Current consent state */
    consents: CategoryConsent[];
    /** Check if specific category is consented */
    hasConsent: (category: CookieCategory) => boolean;
    /** Accept all non-essential categories */
    acceptAll: () => void;
    /** Accept only essential (reject all optional) */
    acceptEssentialOnly: () => void;
    /** Set consent for specific categories */
    setConsents: (categories: Partial<Record<CookieCategory, boolean>>) => void;
    /** Revoke all consents (reset to unset state) */
    revokeAll: () => void;
    /** Open banner modal */
    openBanner: () => void;
    /** Close banner modal */
    closeBanner: () => void;
    /** Whether banner is currently visible */
    isBannerOpen: boolean;
}
//# sourceMappingURL=types.d.ts.map