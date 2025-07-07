import React, { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import Link from "../Link/Link";
import styles from "./CookieConsent.module.css";
import { useTranslation } from "react-i18next";

const CookieConsent = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsOpen(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsOpen(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem("cookieConsent", "essential-only");
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      title={t("cookieConsentTitle")}
      footer={
        <>
          <Button variant="primary" onClick={handleAcceptAll}>
            {t("cookieAcceptAll")}
          </Button>
          <Button variant="secondary" onClick={handleEssentialOnly}>
            {t("cookieAcceptEssential")}
          </Button>
        </>
      }
    >
      <p>
        {t("cookieConsentText")}
        <br />
        <br />
        {t("cookieConsentReadOur")}&nbsp;
        <Link
          className={styles.link}
          size="S"
          href={
            i18n.language === "fi"
              ? "/cookie-policy-full-fi"
              : i18n.language === "sv"
                ? "/cookie-policy-full-sv"
                : "/cookie-policy-full"
          }
        >
          {t("cookiePolicyLink")}
        </Link>
        &nbsp;{t("cookieConsentToLearnMore")}
      </p>
    </Modal>
  );
};

export default CookieConsent;
