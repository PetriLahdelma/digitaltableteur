"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocalization } from "../../lib/translation";
import { Button, Progress } from "@digitaltableteur/react";
import DonnyBookingEmbed from "@dt/DonnyBookingEmbed";
import Tabs, { getTabPanelProps, type TabItem } from "@dt/Tabs";
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
  messagePanel: ReactNode;
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
  const {
    translate: t,
    language,
    resolvedLanguage,
  } = useLocalization();
  const activeLanguage = resolvedLanguage || language;
  const [mode, setMode] = useState<ContactInquiryMode>(initialMode);

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
  const bookingLoadingFallback = useMemo(
    () => (
      <div className={styles.bookingLoading}>
        <Progress
          indeterminate
          size="sm"
          state="info"
          label={t("donnyBookingLoading", "Loading booking calendar")}
        />
      </div>
    ),
    [activeLanguage, t],
  );

  const tabs = useMemo<TabItem[]>(
    () => [
      {
        key: "message",
        label: t("contactInquiryMessageTab", "Send a message"),
      },
      {
        key: "book",
        label: t("contactInquiryBookTab", "Book a call"),
      },
    ],
    [activeLanguage, t],
  );

  const handleSelectMessage = useCallback(() => {
    setMode("message");
  }, []);

  const handleModeChange = useCallback((key: string) => {
    if (key === "message" || key === "book") {
      setMode(key);
    }
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

  return (
    <div
      className={styles.inquiryPanel}
      id="contact-inquiry"
      data-donny-target="contact.inquiry"
    >
      <div className={styles.modeSwitch}>
        <Tabs
          tabs={tabs}
          activeTab={mode}
          onTabChange={handleModeChange}
          ariaLabel={t("contactInquiryModeLabel", "Contact options")}
          variant="underline"
          size="sm"
          className={styles.modeTabs}
        />
        <span className={styles.newBadge} aria-hidden="true">
          {t("contactInquiryBookTabNew", "NEW!")}
        </span>
      </div>

      <div className={styles.panelBody}>
        <div
          {...getTabPanelProps("message", mode === "message")}
          data-donny-target="contact.form"
        >
          <div id="contact-form" className={styles.contactFormAnchor}>
            {messagePanel}
          </div>
        </div>
        <div
          {...getTabPanelProps("book", mode === "book")}
          data-donny-target="contact.booking"
        >
          <div id="contact-booking">
            {booking.configured ? (
              <DonnyBookingEmbed
                {...booking}
                loadingFallback={bookingLoadingFallback}
              />
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
