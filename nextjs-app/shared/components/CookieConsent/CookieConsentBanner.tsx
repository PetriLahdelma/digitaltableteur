"use client";

/**
 * Compact Cookie Consent Banner
 * Minimized footer banner shown when user closes the full modal
 * Forces user to make a choice before entering the site
 */

import React from "react";
import { useTranslation } from "react-i18next";
import Button from "@dt/Button";
import Title from "@dt/Title";
import { useCookieConsent } from "../../lib/cookieConsent";
import styles from "./CookieConsentBanner.module.css";

interface CookieConsentBannerProps {
  onExpand: () => void;
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onExpand,
}) => {
  const { t } = useTranslation();
  const { acceptAll, acceptEssentialOnly } = useCookieConsent();

  return (
    <div
      className={styles.banner}
      role="region"
      aria-label={t("cookieConsent.bannerLabel")}
    >
      <div className={styles.container}>
        <Button
          size="l"
          variant="tertiary"
          icon="caret-up"
          className={styles.expandButton}
          onClick={onExpand}
          aria-label={t("cookieConsent.expandBanner")}
        >
          {t("cookieConsent.expandBanner")}
        </Button>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="l"
            onClick={acceptEssentialOnly}
            icon="cookie"
          >
            {t("cookieConsent.acceptEssentialButton")}
          </Button>
          <Button variant="primary" size="l" onClick={acceptAll} icon="check">
            {t("cookieConsent.acceptAllButton")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
