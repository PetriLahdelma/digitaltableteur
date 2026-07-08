"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@digitaltableteur/react";
import DonnyBookingEmbed from "@dt/DonnyBookingEmbed";
import {
  resolveSiteBookingConfig,
  type SiteBookingConfig,
} from "../../lib/donny-booking";
import styles from "./ContactInquiryPanel.module.css";

export type ContactInquiryMode = "message" | "book";

export interface ContactInquiryPanelProps {
  /** Initial tab selection. @default "message" */
  initialMode?: ContactInquiryMode;
  /** Optional pricing package id for booking prefill. */
  packageId?: string;
  /** Editorial contact form slot shown on the message tab. */
  messagePanel: React.ReactNode;
  /** Optional booking override; defaults from packageId. */
  bookingConfig?: SiteBookingConfig;
}

export interface ContactInquiryPanelHandle {
  /** Switch to the message tab and scroll the viewport to the form. */
  scrollToMessageForm: () => void;
}

/** Contact page panel: message tab + book-a-call tab with composed form slot. */
export const ContactInquiryPanel = forwardRef<
  ContactInquiryPanelHandle,
  ContactInquiryPanelProps
>(function ContactInquiryPanel(
  { initialMode = "message", packageId, messagePanel, bookingConfig },
  ref,
) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ContactInquiryMode>(initialMode);
  const messageTabRef = useRef<HTMLButtonElement>(null);
  const bookTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (initialMode === "book" || initialMode === "message") {
      setMode(initialMode);
    }
  }, [initialMode]);

  const booking = useMemo(() => {
    if (packageId) {
      return resolveSiteBookingConfig({ packageId });
    }
    return bookingConfig ?? resolveSiteBookingConfig({});
  }, [bookingConfig, packageId]);

  const handleSelectMessage = useCallback(() => {
    setMode("message");
  }, []);

  const scrollToMessageForm = useCallback(() => {
    setMode("message");
    requestAnimationFrame(() => {
      const formRoot = document.getElementById("contact-form");
      if (!formRoot) return;

      formRoot.scrollIntoView({ behavior: "smooth", block: "start" });

      const firstField = formRoot.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])',
      );
      firstField?.focus({ preventScroll: true });
    });
  }, []);

  useImperativeHandle(ref, () => ({ scrollToMessageForm }), [scrollToMessageForm]);

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }
      event.preventDefault();
      const nextMode: ContactInquiryMode =
        mode === "message" ? "book" : "message";
      setMode(nextMode);
      (nextMode === "message" ? messageTabRef : bookTabRef).current?.focus();
    },
    [mode],
  );

  return (
    <div
      className={styles.inquiryPanel}
      id="contact-inquiry"
      data-donny-target="contact.inquiry"
    >
      <div
        className={styles.modeSwitch}
        role="tablist"
        aria-label={t("contactInquiryModeLabel", "Contact options")}
      >
        <button
          ref={messageTabRef}
          type="button"
          role="tab"
          id="contact-tab-message"
          aria-selected={mode === "message"}
          aria-controls="contact-panel-message"
          tabIndex={mode === "message" ? 0 : -1}
          className={`${styles.modeButton}${mode === "message" ? ` ${styles.modeButtonActive}` : ""}`}
          onClick={handleSelectMessage}
          onKeyDown={handleTabKeyDown}
        >
          {t("contactInquiryMessageTab", "Send a message")}
        </button>
        <button
          ref={bookTabRef}
          type="button"
          role="tab"
          id="contact-tab-book"
          aria-selected={mode === "book"}
          aria-controls="contact-panel-book"
          tabIndex={mode === "book" ? 0 : -1}
          className={`${styles.modeButton}${mode === "book" ? ` ${styles.modeButtonActive}` : ""}`}
          onClick={() => setMode("book")}
          onKeyDown={handleTabKeyDown}
        >
          <span className={styles.modeButtonContent}>
            <span className={styles.modeButtonLabel}>
              {t("contactInquiryBookTab", "Book a call")}
            </span>
            <span className={styles.newBadge} aria-hidden="true">
              {t("contactInquiryBookTabNew", "NEW!")}
            </span>
          </span>
        </button>
      </div>

      <div className={styles.panelBody}>
        <div
          id="contact-panel-message"
          role="tabpanel"
          aria-labelledby="contact-tab-message"
          hidden={mode !== "message"}
          data-donny-target="contact.form"
        >
          <div id="contact-form" className={styles.contactFormAnchor}>
            {messagePanel}
          </div>
        </div>
        <div
          id="contact-panel-book"
          role="tabpanel"
          aria-labelledby="contact-tab-book"
          hidden={mode !== "book"}
          data-donny-target="contact.booking"
        >
          <div id="contact-booking">
            {booking.configured ? (
              <DonnyBookingEmbed {...booking} />
            ) : (
              <div className={styles.unconfigured}>
                <p className={styles.unconfiguredText}>
                  {t(
                    "contactBookingComingSoon",
                    "Online scheduling is not live yet. Send a message and we will reply with times — usually within one business day.",
                  )}
                </p>
                <div className={styles.unconfiguredActions}>
                  <Button
                    variant="primary"
                    size="lg"
                    className={styles.actionButton}
                    onClick={handleSelectMessage}
                  >
                    {t("contactBookingUseForm", "Use the contact form")}
                  </Button>
                  <Button
                    href="mailto:mail@digitaltableteur.com"
                    variant="secondary"
                    size="lg"
                    className={styles.actionButton}
                  >
                    {t("contactBookingEmail", "Email us instead")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ContactInquiryPanel.displayName = "ContactInquiryPanel";

export default ContactInquiryPanel;
