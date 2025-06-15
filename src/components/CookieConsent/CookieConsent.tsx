import React, { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import Link from "../Link/Link";
import styles from "./CookieConsent.module.css";

const CookieConsent = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsOpen(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsOpen(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem("cookie-consent", "essential-only");
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Cookie consent"
      footer={
        <>
          <Button variant="primary" onClick={handleAcceptAll}>
            Accept all
          </Button>
          <Button variant="secondary" onClick={handleEssentialOnly}>
            Only essential
          </Button>
        </>
      }
    >
      <p>
        Digitaltableteur uses cookies to improve your experience. Choosing
        &nbsp;<strong>Accept all</strong> enables optional analytics cookies.
        Selecting <strong>Only essential</strong> stores only the cookies
        required for the site to function.
        <br />
        <br />
        Read our&nbsp;
        <Link className={styles.link} size="S" href="/cookie-policy">
          cookie policy
        </Link>
        &nbsp;to learn more.
      </p>
    </Modal>
  );
};

export default CookieConsent;
