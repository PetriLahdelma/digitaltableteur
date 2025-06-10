import React, { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import Link from "../Link/Link";

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
          <Button variant="secondary" onClick={handleEssentialOnly}>
            Accept only essential
          </Button>
          <Button variant="primary" onClick={handleAcceptAll}>
            Accept all
          </Button>
        </>
      }
    >
      <p>
        We use cookies to improve your experience. Choosing
        <strong>Accept all</strong> enables optional analytics cookies.
        Selecting <strong>Accept only essential</strong> stores only the cookies
        required for the site to function. Read our
        <Link href="/cookie-policy"> cookie policy</Link> to learn more.
      </p>
    </Modal>
  );
};

export default CookieConsent;
