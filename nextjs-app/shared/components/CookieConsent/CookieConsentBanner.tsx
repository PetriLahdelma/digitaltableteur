"use client";

/**
 * Compact cookie consent bar — default first-touch UI (no modal overlay).
 */

import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Button from "@dt/Button";
import Link from "@dt/Link";
import { useCookieConsent } from "../../lib/cookieConsent";
import styles from "./CookieConsentBanner.module.css";

export interface CookieConsentBannerProps {
  onCustomize: () => void;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onCustomize,
}) => {
  const { t } = useTranslation();
  const { acceptAll, acceptEssentialOnly } = useCookieConsent();
  const bannerRef = useRef<HTMLDivElement>(null);

  // While the banner is mounted, flag it on <body> and publish its measured
  // height so the floating chat toggle can lift clear of the banner's CTAs
  // (the toggle keys off body[data-cookie-banner-open] in ChatWidget.module.css,
  // mirroring the existing data-mobile-menu-open pattern). Measuring the height
  // keeps the lift correct across locales and wrapped buttons. The banner is
  // conditionally mounted, so set-on-mount / clean-on-unmount tracks visibility.
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
      className={styles.banner}
      role="region"
      aria-label={t("cookieConsent.bannerLabel")}
    >
      <div className={styles.bar}>
        <div className={styles.copy}>
          <p className={styles.copyText}>
            {t("cookieConsent.bannerSummary")}{" "}
            {t("cookieConsent.readOur")}{" "}
            <Link href="/privacy-policy" size="M">
              {t("cookieConsent.policyLinkText")}
            </Link>
          </p>
        </div>
        <div className={styles.actions}>
          <Button variant="tertiary" size="m" onClick={onCustomize}>
            {t("cookieConsent.customizeButton")}
          </Button>
          <Button variant="secondary" size="m" onClick={acceptEssentialOnly}>
            {t("cookieConsent.acceptEssentialButton")}
          </Button>
          <Button variant="primary" size="m" onClick={acceptAll}>
            {t("cookieConsent.acceptAllButton")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
