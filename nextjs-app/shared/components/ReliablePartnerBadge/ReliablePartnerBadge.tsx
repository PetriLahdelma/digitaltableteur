"use client";

import Image from "next/image";
import { useLocalization } from "../../lib/translation";
import { cn } from "../../lib/cn";
import DtLink from "../Link";
import styles from "./ReliablePartnerBadge.module.css";

/** Language-matched green badge assets. The mark is Vastuu Group's; assets
 * are used as delivered (whitespace-trimmed only, geometry untouched).
 * Intrinsic dimensions are carried here because next/image needs them and the
 * three files are not the same shape. */
const GREEN_BADGE_BY_LANGUAGE: Record<
  string,
  { src: string; width: number; height: number }
> = {
  fi: {
    src: "/logos/partners/luotettava-kumppani-green.png",
    width: 425,
    height: 200,
  },
  sv: {
    src: "/logos/partners/palitlig-partner-green.jpg",
    width: 545,
    height: 217,
  },
  en: {
    src: "/logos/partners/reliable-partner-green.jpg",
    width: 545,
    height: 217,
  },
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

  const asset = GREEN_BADGE_BY_LANGUAGE[language] ?? GREEN_BADGE_BY_LANGUAGE.en;
  const image = (
    <Image
      src={asset.src}
      alt={alt}
      width={asset.width}
      height={asset.height}
      className={cn(styles.green, styles[size])}
    />
  );

  if (!resolvedHref) {
    return <span className={cn(styles.root, className)}>{image}</span>;
  }

  return (
    <DtLink
      href={resolvedHref}
      target="_blank"
      rel="noopener noreferrer"
      // The mark is the whole link, so it carries no wavy underline.
      underline="none"
      className={cn(styles.root, styles.link, className)}
      title={t(
        "reliablePartnerTitle",
        "Open the Reliable Partner report (PDF)",
      )}
    >
      {image}
    </DtLink>
  );
}

export default ReliablePartnerBadge;
