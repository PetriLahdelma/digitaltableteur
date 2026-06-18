"use client";

/**
 * Cookie consent — compact bottom bar by default; settings open a modal.
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@dt/Modal";
import Button from "@dt/Button";
import Link from "@dt/Link";
import Badge from "@dt/Badge";
import { useCookieConsent } from "../../lib/cookieConsent";
import type { CookieCategory } from "../../lib/cookieConsent/types";
import { clearMinimizedState } from "../../lib/cookieConsent/storage";
import CookieConsentBanner from "./CookieConsentBanner";
import styles from "./CookieConsent.module.css";

/** Props for CookieConsent. */
export interface CookieConsentProps {
  className?: string;
}

/**
 * CookieConsent component.
 */
export const CookieConsent: React.FC<CookieConsentProps> = () => {
  const { t } = useTranslation();
  const {
    isBannerOpen,
    acceptAll,
    acceptEssentialOnly,
    setConsents,
    consents,
    isReady,
  } = useCookieConsent();

  const [showCustomize, setShowCustomize] = useState(false);
  const [customConsents, setCustomConsents] = useState<
    Record<CookieCategory, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    consents.forEach((c) => {
      initial[c.category] = c.consented;
    });
    return initial as Record<CookieCategory, boolean>;
  });

  useEffect(() => {
    const updated: Record<string, boolean> = {};
    consents.forEach((c) => {
      updated[c.category] = c.consented;
    });
    setCustomConsents(updated as Record<CookieCategory, boolean>);
  }, [consents]);

  const handleToggleCategory = (
    category: CookieCategory,
    required: boolean,
  ) => {
    if (required) return;

    setCustomConsents((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSaveCustom = () => {
    setConsents(customConsents);
    clearMinimizedState();
    setShowCustomize(false);
  };

  const handleAcceptAll = () => {
    acceptAll();
    clearMinimizedState();
    setShowCustomize(false);
  };

  const handleAcceptEssential = () => {
    acceptEssentialOnly();
    clearMinimizedState();
    setShowCustomize(false);
  };

  if (!isReady || !isBannerOpen) {
    return null;
  }

  return (
    <>
      <CookieConsentBanner onCustomize={() => setShowCustomize(true)} />

      {showCustomize ? (
        <Modal
          isOpen={true}
          onClose={() => setShowCustomize(false)}
          title={t("cookieConsent.title")}
          titleSize="S"
          className={styles.consentModal}
          footer={
            <div className={styles.footerActions}>
              <div className={styles.leftActions}>
                <Link href="/privacy-policy" size="S">
                  {t("cookieConsent.viewFullPolicy")}
                </Link>
              </div>
              <div className={styles.rightActions}>
                <Button variant="secondary" size="md" onClick={handleAcceptEssential}>
                  {t("cookieConsent.acceptEssentialButton")}
                </Button>
                <Button variant="primary" size="md" onClick={handleSaveCustom}>
                  {t("cookieConsent.saveButton")}
                </Button>
                <Button variant="primary" size="md" onClick={handleAcceptAll}>
                  {t("cookieConsent.acceptAllButton")}
                </Button>
              </div>
            </div>
          }
        >
          <div className={styles.detailedView}>
            <p className={styles.description}>
              {t("cookieConsent.detailedDescription")}
            </p>

            <div className={styles.categories}>
              {consents.map((consent) => (
                <div key={consent.category} className={styles.categoryRow}>
                  <div className={styles.categoryInfo}>
                    <h3 className={styles.categoryTitle}>
                      {t(`cookieConsent.categories.${consent.category}.title`)}
                    </h3>
                    <p className={styles.categoryDescription}>
                      {t(
                        `cookieConsent.categories.${consent.category}.description`,
                      )}
                    </p>
                  </div>
                  <div className={styles.categoryToggle}>
                    {consent.required ? (
                      <Badge size="sm" variant="secondary" tone="info">
                        {t("cookieConsent.required")}
                      </Badge>
                    ) : null}
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={customConsents[consent.category]}
                        onChange={() =>
                          handleToggleCategory(
                            consent.category,
                            consent.required,
                          )
                        }
                        disabled={consent.required}
                        aria-label={t(
                          `cookieConsent.categories.${consent.category}.toggleLabel`,
                        )}
                      />
                      <span className={styles.slider} aria-hidden="true" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
};

export default CookieConsent;
