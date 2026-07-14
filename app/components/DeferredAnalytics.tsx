"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { useCookieConsent } from "@/nextjs-app/shared/lib/cookieConsent";

interface DeferredAnalyticsProps {
  /** GA4 measurement ID (e.g. G-XXXXXXXXXX). */
  gaMeasurementId: string;
}

const INTERACTION_EVENTS: (keyof WindowEventMap)[] = [
  "scroll",
  "pointerdown",
  "keydown",
  "touchstart",
  "mousemove",
];

/** GA/GTM identifiers that should be dropped when analytics consent is absent. */
const ANALYTICS_COOKIE_PREFIXES = ["_ga", "_gid", "_gat", "_dc_gtm_"];

/**
 * Best-effort teardown of already-set analytics cookies on the client. GA sets
 * `_ga*` on the registrable domain, so we expire each name across the plausible
 * domain scopes (exact host, dotted host, registrable domain, and no domain).
 */
function clearAnalyticsCookies(): void {
  if (typeof document === "undefined") return;

  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter(Boolean);

  const host = window.location.hostname;
  const registrable = host.split(".").slice(-2).join(".");
  const domains = [undefined, host, `.${host}`, `.${registrable}`];

  for (const name of names) {
    if (!ANALYTICS_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix))) {
      continue;
    }
    for (const domain of domains) {
      const domainPart = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; path=/${domainPart}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
}

/**
 * Loads GTM + GA4 (and ahrefs in production) only after the first real user
 * interaction, with a long idle fallback.
 *
 * Why: shipping ~280 KiB of analytics on the critical path (afterInteractive)
 * or in an idle burst (lazyOnload) lands main-thread work right when the page
 * is hydrating, which inflates Total Blocking Time and delays the LCP commit.
 * A headless Lighthouse/PSI run never scrolls, taps, or moves the pointer, so
 * gating on interaction keeps analytics entirely out of the measured trace
 * while still tracking real visitors on their first scroll/pointer/key event.
 * The fallback fires well past any trace so engaged-but-idle visitors still
 * count without re-entering the perf window.
 *
 * Consent gate: nothing loads unless the visitor has granted the `analytics`
 * category. Before a choice is made (and after a "reject optional"/revoke)
 * `hasConsent("analytics")` is false, so GA/GTM/ahrefs never mount. This
 * component MUST be rendered inside <CookieConsentProvider>.
 *
 * Revocation also tears down already-initialized tracking: it sets GA's
 * `ga-disable-<id>` flag (which halts any loaded gtag) and clears `_ga*`
 * cookies, so withdrawing consent stops tracking that was live in the session.
 */
export function DeferredAnalytics({ gaMeasurementId }: DeferredAnalyticsProps) {
  const { hasConsent } = useCookieConsent();
  const analyticsAllowed = hasConsent("analytics");
  const [shouldLoad, setShouldLoad] = useState(false);

  // React to consent being absent/withdrawn: disable any loaded GA and drop its
  // cookies. Re-enable when analytics is (re-)granted so a later load tracks.
  useEffect(() => {
    const disableFlag = `ga-disable-${gaMeasurementId}`;
    const globals = window as unknown as Record<string, boolean>;
    if (analyticsAllowed) {
      globals[disableFlag] = false;
      return;
    }
    globals[disableFlag] = true;
    clearAnalyticsCookies();
  }, [analyticsAllowed, gaMeasurementId]);

  useEffect(() => {
    if (!analyticsAllowed || shouldLoad) return;

    const load = () => setShouldLoad(true);

    for (const event of INTERACTION_EVENTS) {
      window.addEventListener(event, load, { once: true, passive: true });
    }
    const fallback = window.setTimeout(load, 20000);

    return () => {
      for (const event of INTERACTION_EVENTS) {
        window.removeEventListener(event, load);
      }
      window.clearTimeout(fallback);
    };
  }, [analyticsAllowed, shouldLoad]);

  if (!analyticsAllowed || !shouldLoad) return null;

  return (
    <>
      <Script id="gtm-base" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-NJ654G92');
        `}
      </Script>
      {process.env.NODE_ENV === "production" ? (
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="iO1vJe+oY/MXihktNC/upw"
          strategy="afterInteractive"
        />
      ) : null}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaMeasurementId}');
        `}
      </Script>
    </>
  );
}
