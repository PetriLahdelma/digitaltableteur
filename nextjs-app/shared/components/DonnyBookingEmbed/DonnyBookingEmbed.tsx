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
import { isAllowedDonnyBookingEmbedUrl } from "../../lib/donny-booking";
import { useLocalization } from "../../lib/translation";
import styles from "./DonnyBookingEmbed.module.css";

const Cal = lazy(() => import("@calcom/embed-react"));

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
}: DonnyBookingEmbedProps) {
  const { translate: t, language, resolvedLanguage } = useLocalization();
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
            "Scheduling is not wired yet. Use the contact form and we will reply with times.",
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

  return (
    <div className={styles.donnyBookingEmbed} data-testid="donny-booking-embed">
      <div className={styles.header}>
        <h4 className={styles.title}>
          {t("donnyBookingTitle", "Book a {{meeting}}", {
            meeting: meetingLabel,
          })}
        </h4>
        <p className={styles.subtitle}>
          {prefillApplied
            ? t(
                "donnyBookingPrefillHint",
                "We prefilled your details when possible. Pick a time that works for you.",
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
              key={`${safeCalLink}-${calLocale}`}
              calLink={safeCalLink}
              calOrigin={calOrigin}
              embedJsUrl={embedJsUrl}
              config={{
                layout: "month_view",
                useSlotsViewOnSmallScreen: "true",
                theme: "auto",
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
