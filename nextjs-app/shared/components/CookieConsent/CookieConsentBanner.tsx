"use client";

/**
 * Compact cookie consent bar — default first-touch UI (no modal overlay).
 */

import React from "react";
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

  return (
    <div
      className={styles.banner}
      role="region"
      aria-label={t("cookieConsent.bannerLabel")}
    >
      <div className={styles.bar}>
        <div className={styles.copy}>
          <p className={styles.copyText}>
            {t("cookieConsent.bannerSummary")}{" "}
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
