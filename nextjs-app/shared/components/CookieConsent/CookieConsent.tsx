"use client";

/**
 * Enhanced Cookie Consent Banner Component
 * Granular category controls inspired by Helsinki Design System
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@dt/Modal";
import Button from "@dt/Button";
import Link from "@dt/Link";
import Badge from "@dt/Badge";
import { useCookieConsent } from "../../lib/cookieConsent";
import type { CookieCategory } from "../../lib/cookieConsent/types";
import {
  loadMinimizedState,
  saveMinimizedState,
  clearMinimizedState,
} from "../../lib/cookieConsent/storage";
import CookieConsentBanner from "./CookieConsentBanner";
import styles from "./CookieConsent.module.css";

/**
 * CookieConsent component.
 */
export const CookieConsent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    isBannerOpen,
    closeBanner,
    acceptAll,
    acceptEssentialOnly,
    setConsents,
    consents,
    isReady,
  } = useCookieConsent();

  const [showDetails, setShowDetails] = useState(false);
  // Only load minimized state if we're client-side
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window === "undefined") return false;
    return loadMinimizedState();
  });
  const [customConsents, setCustomConsents] = useState<
    Record<CookieCategory, boolean>
  >(() => {
    // Initialize with current consents
    const initial: Record<string, boolean> = {};
    consents.forEach((c) => {
      initial[c.category] = c.consented;
    });
    return initial as Record<CookieCategory, boolean>;
  });

  // Sync customConsents with consents from context when they change
  useEffect(() => {
    const updated: Record<string, boolean> = {};
    consents.forEach((c) => {
      updated[c.category] = c.consented;
    });
    setCustomConsents(updated as Record<CookieCategory, boolean>);
  }, [consents]);

  /**
   * Handle custom consent toggle
   */
  const handleToggleCategory = (
    category: CookieCategory,
    required: boolean,
  ) => {
    if (required) return; // Can't toggle required categories

    setCustomConsents((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  /**
   * Save custom selections
   */
  const handleSaveCustom = () => {
    setConsents(customConsents);
    clearMinimizedState();
  };

  /**
   * Get cookie policy link based on language
   */
  const getCookiePolicyLink = () => {
    return "/privacy-policy";
  };

  /**
   * Handle modal close - minimize to banner instead
   */
  const handleModalClose = () => {
    setIsMinimized(true);
    saveMinimizedState(true);
  };

  /**
   * Expand from banner back to full modal
   */
  const handleExpand = () => {
    setIsMinimized(false);
    saveMinimizedState(false);
  };

  if (!isReady || !isBannerOpen) {
    return null;
  }

  // If minimized, show compact banner
  if (isMinimized) {
    return <CookieConsentBanner onExpand={handleExpand} />;
  }

  // Otherwise show full modal
  return (
    <Modal
      isOpen={true}
      title={t("cookieConsent.title")}
      titleSize="S"
      className={styles.consentModal}
      footer={
        <div className={styles.footerActions}>
          <div className={styles.leftActions}>
            {!showDetails ? (
              <Button
                variant="tertiary"
                icon="caret-down"
                size="l"
                onClick={handleModalClose}
              >
                {t("cookieConsent.minimizeModal")}
              </Button>
            ) : (
              <Link href={getCookiePolicyLink()} size="S">
                {t("cookieConsent.viewFullPolicy")}
              </Link>
            )}
          </div>
          <div className={styles.rightActions}>
            {showDetails ? (
              <>
                <Button
                  variant="secondary"
                  size="l"
                  onClick={() => setShowDetails(false)}
                >
                  {t("cookieConsent.backButton")}
                </Button>
                <Button variant="primary" size="l" onClick={handleSaveCustom}>
                  {t("cookieConsent.saveButton")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  icon="gear"
                  size="l"
                  onClick={() => setShowDetails(true)}
                  aria-expanded={showDetails}
                >
                  {t("cookieConsent.customizeButton")}
                </Button>
                <Button
                  variant="secondary"
                  size="l"
                  onClick={acceptEssentialOnly}
                >
                  {t("cookieConsent.acceptEssentialButton")}
                </Button>
                <Button variant="primary" size="l" onClick={acceptAll}>
                  {t("cookieConsent.acceptAllButton")}
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      {!showDetails ? (
        // Simple view - description and quick actions
        <div className={styles.simpleView}>
          <p className={styles.description}>{t("cookieConsent.description")}</p>
          <p className={styles.policyLink}>
            {t("cookieConsent.readOur")}{" "}
            <Link href={getCookiePolicyLink()} size="S">
              {t("cookieConsent.policyLinkText")}
            </Link>{" "}
            {t("cookieConsent.toLearnMore")}
          </p>
        </div>
      ) : (
        // Detailed view - category toggles
        <div className={styles.detailedView}>
          <p className={styles.description}>
            {t("cookieConsent.detailedDescription")
              .split("<Link>")
              .map((part, i) => {
                if (i === 0) return part;
                const [linkText, rest] = part.split("</Link>");
                return (
                  <React.Fragment key={i}>
                    <Link href={getCookiePolicyLink()} size="S">
                      {linkText}
                    </Link>
                    {rest}
                  </React.Fragment>
                );
              })}
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
                  {consent.required && (
                    <Badge size="s" design="secondary" state="info">
                      {t("cookieConsent.required")}
                    </Badge>
                  )}
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={customConsents[consent.category]}
                      onChange={() =>
                        handleToggleCategory(consent.category, consent.required)
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
      )}
    </Modal>
  );
};

export default CookieConsent;
