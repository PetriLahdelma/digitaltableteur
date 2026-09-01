"use client";

import { useLocalization } from "../../lib/translation";
import { cn } from "../../lib/cn";
import styles from "./ReliablePartnerBadge.module.css";

/** Language-matched green badge assets. The mark is Vastuu Group's; assets
 * are used as delivered (whitespace-trimmed only, geometry untouched). */
const GREEN_BADGE_BY_LANGUAGE: Record<string, string> = {
  fi: "/logos/partners/luotettava-kumppani-green.png",
  sv: "/logos/partners/palitlig-partner-green.jpg",
  en: "/logos/partners/reliable-partner-green.jpg",
};

/** Language-matched Reliable Partner report PDFs. Filenames are stable so a
 * refreshed report (validity ~3 months) is a drop-in file replacement. */
const REPORT_BY_LANGUAGE: Record<string, string> = {
  fi: "/docs/reliable-partner/reliable-partner-report-fi.pdf",
  sv: "/docs/reliable-partner/reliable-partner-report-sv.pdf",
  en: "/docs/reliable-partner/reliable-partner-report-en.pdf",
};

/** Resolve the Reliable Partner report PDF for a language ("fi" | "sv" | "en"). */
export function getReliablePartnerReportHref(language: string): string {
  return (
    REPORT_BY_LANGUAGE[language.slice(0, 2)] ?? REPORT_BY_LANGUAGE.en
  );
}

export interface ReliablePartnerBadgeProps {
  /** Badge height: sm 28px (footer), md 48px, lg 64px. */
  size?: "sm" | "md" | "lg";
  /**
   * Link target. Defaults to the language-matched Reliable Partner report
   * PDF. Pass null to render unlinked.
   */
  href?: string | null;
  className?: string;
}

/**
 * Vastuu Group "Luotettava Kumppani" (Reliable Partner) trust mark.
 * Renders the official green badge matched to the active language.
 */
export function ReliablePartnerBadge({
  size = "md",
  href,
  className,
}: ReliablePartnerBadgeProps) {
  const { translate: t, resolvedLanguage } = useLocalization();
  const language = (resolvedLanguage || "en").slice(0, 2);
  const resolvedHref =
    href === undefined
      ? (REPORT_BY_LANGUAGE[language] ?? REPORT_BY_LANGUAGE.en)
      : href;
  const alt = t(
    "reliablePartnerAlt",
    "Reliable Partner — verified by Vastuu Group",
  );

  const image = (
    <img
      src={GREEN_BADGE_BY_LANGUAGE[language] ?? GREEN_BADGE_BY_LANGUAGE.en}
      alt={alt}
      className={cn(styles.green, styles[size])}
    />
  );

  if (!resolvedHref) {
    return <span className={cn(styles.root, className)}>{image}</span>;
  }

  return (
    <a
      href={resolvedHref}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(styles.root, styles.link, className)}
      title={t(
        "reliablePartnerTitle",
        "Open the Reliable Partner report (PDF)",
      )}
    >
      {image}
    </a>
  );
}

export default ReliablePartnerBadge;
