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

    const { body, documentElement } = document;
    const originalBodyPadding = body.style.paddingBlockEnd;
    const originalScrollPadding = documentElement.style.scrollPaddingBlockEnd;
    const baseBodyPadding = getComputedStyle(body).paddingBlockEnd || "0px";

    body.dataset.cookieBannerOpen = "true";

    const publishHeight = () => {
      const height = el.offsetHeight;
      body.style.setProperty("--cookie-banner-height", `${height}px`);
      body.style.paddingBlockEnd = `calc(${baseBodyPadding} + ${height}px)`;
      documentElement.style.scrollPaddingBlockEnd = `calc(${height}px + var(--space-layout-16))`;
    };

    const keepFocusedControlVisible = (event: FocusEvent) => {
      const target = event.target;
      if (
        !(target instanceof HTMLElement) ||
        el.contains(target) ||
        target.closest('[role="dialog"][aria-modal="true"]')
      ) {
        return;
      }

      const targetRect = target.getBoundingClientRect();
      const bannerRect = el.getBoundingClientRect();
      const overlapsBanner =
        targetRect.bottom > bannerRect.top &&
        targetRect.top < bannerRect.bottom;

      if (overlapsBanner) {
        target.scrollIntoView({
          behavior: "auto",
          block: "center",
          inline: "nearest",
        });
        requestAnimationFrame(() => {
          const refreshedTarget = target.getBoundingClientRect();
          const refreshedBanner = el.getBoundingClientRect();
          const clearance = 16;
          const coveredBy =
            refreshedTarget.bottom - (refreshedBanner.top - clearance);
          if (coveredBy > 0) {
            window.scrollBy({ top: coveredBy, behavior: "auto" });
          }
        });
      }
    };

    publishHeight();

    const observer = new ResizeObserver(publishHeight);
    observer.observe(el);
    document.addEventListener("focusin", keepFocusedControlVisible);

    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", keepFocusedControlVisible);
      delete body.dataset.cookieBannerOpen;
      body.style.removeProperty("--cookie-banner-height");
      if (originalBodyPadding) body.style.paddingBlockEnd = originalBodyPadding;
      else body.style.removeProperty("padding-block-end");
      if (originalScrollPadding) {
        documentElement.style.scrollPaddingBlockEnd = originalScrollPadding;
      } else {
        documentElement.style.removeProperty("scroll-padding-block-end");
      }
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
            {t("cookieConsent.bannerSummary")} {t("cookieConsent.readOur")}{" "}
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
