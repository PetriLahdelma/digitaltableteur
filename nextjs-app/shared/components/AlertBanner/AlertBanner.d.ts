import React from "react";
type Tone = "info" | "success" | "warning" | "error";
export type AlertBannerProps = {
    /** Semantic tone controlling icon and surface colors. @default "info" */
    tone?: Tone;
    /** Alert heading text. */
    title?: string;
    /** Supporting body copy. */
    description?: React.ReactNode;
    /** Optional action slot rendered under the description (e.g. a tertiary Button). */
    action?: React.ReactNode;
    /** Show the semantic tone icon. The icon is derived from `tone`; set false for a text-only banner. @default true */
    showIcon?: boolean;
    /** Shows a localized dismiss control when true. @default false */
    dismissible?: boolean;
    /** Called when the user dismisses the banner. */
    onDismiss?: () => void;
    /** Live region politeness for assistive tech (an explicit value wins over the tone default). */
    "aria-live"?: "polite" | "assertive" | "off";
};
/** Inline alert banner with semantic tones, action slot, and optional dismiss. */
declare const AlertBanner: React.FC<AlertBannerProps>;
export default AlertBanner;
//# sourceMappingURL=AlertBanner.d.ts.map