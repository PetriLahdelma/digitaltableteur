"use client";

/**
 * Compact cookie consent bar — default first-touch UI (no modal overlay).
 */

import React, { useEffect, useRef } from "react";
import { useTranslate } from "../../lib/translation";
import Button from "@dt/Button";
import Link from "@dt/Link";
import { useCookieConsent } from "../../lib/cookieConsent";
import styles from "./CookieConsentBanner.module.css";

export interface CookieConsentBannerProps {
  onCustomize: () => void;
  /** Additional CSS classes on the banner region. */
  className?: string;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onCustomize,
  className,
}) => {
  const t = useTranslate();
  const { acceptAll, acceptEssentialOnly } = useCookieConsent();
  const bannerRef = useRef<HTMLDivElement>(null);

  // While the banner is mounted, flag it on <body> and publish its measured
  // height so host-app floating UI can avoid covering the banner's CTAs.
  // Measuring keeps the offset correct across locales and wrapped buttons.
  useEffect(() => {
    const el = bannerRef.current;
    if (!el || typeof document === "undefined") return;

    document.body.dataset.cookieBannerOpen = "true";

    const publishHeight = () => {
      document.body.style.setProperty(
        "--cookie-banner-height",
        `${el.offsetHeight}px`,
      );
    };
    publishHeight();

    const observer = new ResizeObserver(publishHeight);
    observer.observe(el);

    return () => {
      observer.disconnect();
      delete document.body.dataset.cookieBannerOpen;
      document.body.style.removeProperty("--cookie-banner-height");
    };
  }, []);

  return (
    <div
      ref={bannerRef}
      className={className ? `${styles.banner} ${className}` : styles.banner}
      role="region"
      aria-label={t("cookieConsent.bannerLabel")}
    >
      <div className={styles.bar}>
        <div className={styles.copy}>
          <p className={styles.copyText}>
            {t("cookieConsent.bannerSummary")}{" "}
            {t("cookieConsent.readOur")}{" "}
            <Link href="/privacy-policy" size="md">
              {t("cookieConsent.policyLinkText")}
            </Link>
          </p>
        </div>
        <div className={styles.actions}>
          <Button variant="tertiary" size="md" onClick={onCustomize}>
            {t("cookieConsent.customizeButton")}
          </Button>
          <Button variant="secondary" size="md" onClick={acceptEssentialOnly}>
            {t("cookieConsent.acceptEssentialButton")}
          </Button>
          <Button variant="primary" size="md" onClick={acceptAll}>
            {t("cookieConsent.acceptAllButton")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
