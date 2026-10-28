"use client";

import React, {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Button from "@dt/Button";
import Progress from "@dt/Progress";
import { trackEvent } from "../../lib/analytics";
import { isAllowedDonnyBookingEmbedUrl } from "../../lib/donny-booking";
import { useLocalization } from "../../lib/translation";
import { useTheme } from "../ThemeProvider";
import styles from "./DonnyBookingEmbed.module.css";

// One shared import for the lazy embed component and its event API.
let calEmbedModule: Promise<typeof import("@calcom/embed-react")> | null = null;
const loadCalEmbed = () => (calEmbedModule ??= import("@calcom/embed-react"));
const Cal = lazy(loadCalEmbed);

function ClientOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return fallback ?? null;

  return <Suspense fallback={fallback ?? null}>{children}</Suspense>;
}

export interface DonnyBookingEmbedProps {
  configured: boolean;
  provider: "calcom" | "calendly" | "none";
  meetingLabel: string;
  embedUrl: string;
  fallbackUrl: string;
  prefillApplied?: boolean;
  calLink?: string;
  calOrigin?: string;
  embedJsUrl?: string;
  loadingFallback?: ReactNode;
  /**
   * Level of the "Book a call" title so it fits the page outline: h2 on a
   * page whose only heading above is the h1, h4 inside a chat message.
   */
  headingLevel?: "h2" | "h3" | "h4";
}

const SUPPORTED_CAL_LOCALES = ["en", "fi", "sv"] as const;

function resolveCalEmbedLocale(language: string | undefined): string {
  const base = (language ?? "en").split("-")[0]?.toLowerCase() ?? "en";
  return SUPPORTED_CAL_LOCALES.includes(base as (typeof SUPPORTED_CAL_LOCALES)[number])
    ? base
    : "en";
}

function isAllowedCalOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return (
      host === "cal.com" ||
      host === "cal.eu" ||
      host.endsWith(".cal.com") ||
      host.endsWith(".cal.eu")
    );
  } catch {
    return false;
  }
}

export function DonnyBookingEmbed({
  configured,
  provider,
  meetingLabel,
  embedUrl,
  fallbackUrl,
  prefillApplied = false,
  calLink,
  calOrigin,
  embedJsUrl,
  loadingFallback,
  headingLevel: Heading = "h4",
}: DonnyBookingEmbedProps) {
  const { translate: t, language, resolvedLanguage } = useLocalization();
  // Follow the site theme, not the OS: with "auto" a visitor who picked the
  // light theme on a phone in dark mode got a dark calendar on a light page.
  const { theme: siteTheme } = useTheme();
  const calTheme =
    siteTheme === "dark" || siteTheme === "hcb" ? "dark" : "light";
  const calLocale = useMemo(
    () => resolveCalEmbedLocale(resolvedLanguage || language),
    [language, resolvedLanguage],
  );
  const safeCalLink =
    configured &&
    provider === "calcom" &&
    calLink &&
    calOrigin &&
    isAllowedCalOrigin(calOrigin)
      ? calLink
      : "";

  // A confirmed Cal.com booking becomes a GA4 book_meeting event through the
  // site's consent-gated gtag. Cal's own GA app would load analytics on the
  // booking page itself, where the visitor never gave analytics consent.
  // bookingSuccessfulV2 carries booking metadata only; none of it is sent.
  useEffect(() => {
    if (!safeCalLink) return;
    let cal: Awaited<ReturnType<typeof import("@calcom/embed-react").getCalApi>> | null = null;
    let cancelled = false;
    const onBooked = () => {
      trackEvent("book_meeting", {
        booking_source: window.location.pathname.startsWith("/contact") ? "contact_page" : "chat",
      });
    };
    void loadCalEmbed()
      .then(({ getCalApi }) => getCalApi(embedJsUrl ? { embedJsUrl } : undefined))
      .then((api) => {
        if (cancelled) return;
        cal = api;
        api("on", { action: "bookingSuccessfulV2", callback: onBooked });
      })
      .catch(() => {
        // Analytics only: a failed embed API load must not affect booking.
      });
    return () => {
      cancelled = true;
      cal?.("off", { action: "bookingSuccessfulV2", callback: onBooked });
    };
  }, [safeCalLink, embedJsUrl]);

  const safeEmbedUrl =
    configured &&
    provider === "calendly" &&
    isAllowedDonnyBookingEmbedUrl(embedUrl)
      ? embedUrl
      : "";
  const providerLabel =
    provider === "calcom"
      ? t("donnyBookingProviderCalcom", "Cal.com")
      : provider === "calendly"
        ? t("donnyBookingProviderCalendly", "Calendly")
        : t("donnyBookingProviderNone", "Contact form");
  const defaultLoadingFallback = (
    <div className={styles.loadingProgress}>
      <Progress
        indeterminate
        size="sm"
        state="info"
        label={t("donnyBookingLoading", "Loading booking calendar")}
      />
    </div>
  );

  if (!safeCalLink && !safeEmbedUrl) {
    const contactHref = fallbackUrl.startsWith("/") ? fallbackUrl : "/contact";
    return (
      <div className={styles.fallback} data-testid="donny-booking-fallback">
        <p className={styles.subtitle}>
          {t(
            "donnyBookingNotConfigured",
            "Scheduling is not wired yet. Use the contact form and a reply with times will follow.",
          )}
        </p>
        <div className={styles.fallbackActions}>
          <Button
            href={contactHref}
            variant="primary"
            size="lg"
            className={styles.actionButton}
          >
            {t("donnyBookingOpenContact", "Open contact form")}
          </Button>
        </div>
      </div>
    );
  }

  // Cal.com event slugs are often a duration ("30min"); read as a meeting
  // name that gave "Book a 30min". Name the call by its length instead.
  const durationMinutes = /^(\d+)\s*min(?:ute)?s?$/i.exec(meetingLabel.trim())?.[1];

  return (
    <div className={styles.donnyBookingEmbed} data-testid="donny-booking-embed">
      <div className={styles.header}>
        <Heading className={styles.title}>
          {durationMinutes
            ? t("donnyBookingDurationTitle", "Book a {{minutes}}-minute call", {
                minutes: durationMinutes,
              })
            : t("donnyBookingTitle", "Book a {{meeting}}", {
                meeting: meetingLabel,
              })}
        </Heading>
        <p className={styles.subtitle}>
          {prefillApplied
            ? t(
                "donnyBookingPrefillHint",
                "Your details are prefilled where possible. Pick a time that works for you.",
              )
            : t(
                "donnyBookingHint",
                "Choose a slot below. You will get a calendar invite by email.",
              )}
        </p>
      </div>
      <div className={styles.frameWrap}>
        {safeCalLink ? (
          <ClientOnly fallback={loadingFallback ?? defaultLoadingFallback}>
            <Cal
              key={`${safeCalLink}-${calLocale}-${calTheme}`}
              calLink={safeCalLink}
              calOrigin={calOrigin}
              embedJsUrl={embedJsUrl}
              config={{
                layout: "month_view",
                useSlotsViewOnSmallScreen: "true",
                theme: calTheme,
                lang: calLocale,
              }}
              className={styles.calEmbed}
            />
          </ClientOnly>
        ) : (
          <iframe
            title={t(
              "donnyBookingFrameTitle",
              "Schedule a call with Digitaltableteur",
            )}
            src={safeEmbedUrl}
            className={styles.frame}
            loading="lazy"
            scrolling="yes"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </div>
      <a
        href={fallbackUrl}
        className={styles.externalLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("donnyBookingOpenExternal", "Open in {{provider}}", {
          provider: providerLabel,
        })}{" "}
        ↗
      </a>
    </div>
  );
}

DonnyBookingEmbed.displayName = "DonnyBookingEmbed";

export default DonnyBookingEmbed;
