"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useHydrationSafeMotion } from "../../hooks/useHydrationSafeMotion";
import { cn } from "@/lib/utils";
import Text from "@dt/Text";
import Title from "@dt/Title";
import Icon from "@dt/Icon";
import {
  ContactInquiryPanel,
  type ContactInquiryMode,
  type ContactInquiryPanelHandle,
} from "../ContactInquiryPanel";
import type { SiteBookingConfig } from "../../lib/donny-booking";
import { ContactFormEditorial } from "../../components/ContactFormEditorial";
import { ContactFormSuccessEditorial } from "../../components/ContactFormSuccessEditorial";
import styles from "./ContactPageContentEditorial.module.css";

const NEW_BUSINESS_PORTRAIT = {
  src: "/images/authors/petri-lahdelma-inquiries.png",
  width: 1023,
  height: 1537,
} as const;

export interface ContactPageContentEditorialProps {
  /** Custom className */
  className?: string;
  /** Deep-link from /contact?mode=book */
  initialInquiryMode?: ContactInquiryMode;
  /** Deep-link from /contact?package=ux-sprint */
  bookingPackageId?: string;
  /** Server-resolved booking embed config from env vars. */
  bookingConfig?: SiteBookingConfig;
}

/**
 * ContactPageContentEditorial component.
 */
export function ContactPageContentEditorial({
  className,
  initialInquiryMode,
  bookingPackageId,
  bookingConfig,
}: ContactPageContentEditorialProps) {
  const { t } = useTranslation();
  const inquiryPanelRef = useRef<ContactInquiryPanelHandle>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  // Skip entrance animations under reduced-motion so axe never samples
  // partial-opacity frames as color-contrast violations.
  const { shouldAnimate } = useHydrationSafeMotion();

  const handleFormSuccess = () => {
    setShowSuccess(true);
  };

  const handleSendAnother = () => {
    setShowSuccess(false);
  };

  const handleScrollToContactForm = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      inquiryPanelRef.current?.scrollToMessageForm();
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "#contact-form");
      }
    },
    [],
  );

  return (
    <div className={cn(styles.page, className)}>
      {/* Main Content Area - Magazine Layout */}
      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Left Column - Typography & Contact Info */}
          <div className={styles.leftColumn}>
            {/* Display Headline */}
            <motion.h1
              className={styles.headline}
              initial={shouldAnimate ? { opacity: 0, y: 30 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={
                shouldAnimate
                  ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                  : { duration: 0 }
              }
            >
              {t("contactHeadline", "Let's talk.")}
            </motion.h1>

            {/* Divider */}
            <motion.hr
              className={styles.divider}
              initial={shouldAnimate ? { scaleX: 0 } : false}
              animate={{ scaleX: 1 }}
              transition={
                shouldAnimate
                  ? { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }
                  : { duration: 0 }
              }
            />

            {/* Intro Paragraph */}
            <motion.p
              className={styles.intro}
              initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={
                shouldAnimate
                  ? { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }
                  : { duration: 0 }
              }
            >
              {t(
                "contactIntro",
                "We'd love to hear about your project, idea or you can just say hello."
              )}
            </motion.p>

            {/* Contact Details */}
            <motion.div
              className={styles.contactDetails}
              data-donny-target="contact.location"
              initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={
                shouldAnimate
                  ? { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }
                  : { duration: 0 }
              }
            >
              <address className={styles.address}>
                <span className={styles.addressLine}>
                  {t("contactAddressLine1", "HKI HQ")}
                </span>
                <span className={styles.addressLine}>
                  {t("contactAddressLine2", "Hämeentie 8 C")}
                </span>
                <span className={styles.addressLine}>
                  {t("contactAddressLine3", "00530 Helsinki")}
                </span>
              </address>

              <a
                href="mailto:mail@digitaltableteur.com"
                className={styles.email}
              >
                mail@digitaltableteur.com
              </a>
            </motion.div>
          </div>

          {/* Right Column - Message or booking */}
          <div className={styles.rightColumn}>
            <div className={styles.formPanel}>
              <ContactInquiryPanel
                ref={inquiryPanelRef}
                initialMode={initialInquiryMode}
                packageId={bookingPackageId}
                bookingConfig={bookingConfig}
                messagePanel={
                  <AnimatePresence mode="wait">
                    {showSuccess ? (
                      <motion.div
                        key="success"
                        initial={shouldAnimate ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: shouldAnimate ? 0.3 : 0 }}
                      >
                        <ContactFormSuccessEditorial
                          title={t("contactSuccessTitle", "Message sent.")}
                          message={t(
                            "contactSuccessSubtitle",
                            "We'll be in touch shortly."
                          )}
                          onSendAnother={handleSendAnother}
                          sendAnotherLabel={t(
                            "contactSendAnother",
                            "Send another message"
                          )}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="form"
                        initial={shouldAnimate ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: shouldAnimate ? 0.3 : 0 }}
                      >
                        <ContactFormEditorial onSuccess={handleFormSuccess} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                }
              />
            </div>
          </div>

          <motion.hr
            className={cn(styles.divider, styles.layoutDivider)}
            aria-hidden
            initial={shouldAnimate ? { scaleX: 0 } : false}
            animate={{ scaleX: 1 }}
            transition={
              shouldAnimate
                ? { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.55 }
                : { duration: 0 }
            }
          />

          <div className={styles.newBusinessSection}>
            <div className={styles.newBusiness}>
              <div className={styles.newBusinessMedia}>
                <Image
                  src={NEW_BUSINESS_PORTRAIT.src}
                  alt={t(
                    "contactNewBusinessImageAlt",
                    "Portrait of Petri Lahdelma"
                  )}
                  width={NEW_BUSINESS_PORTRAIT.width}
                  height={NEW_BUSINESS_PORTRAIT.height}
                    sizes="(min-width: 768px) 240px, 152px"
                  className={styles.newBusinessPortrait}
                />
              </div>
              <div className={styles.newBusinessContent}>
                <Title
                  level={2}
                  size="M"
                  terminals="sans"
                  lineHeight="tight"
                  className={styles.newBusinessHeading}
                >
                  {t(
                    "contactNewBusinessHeading",
                    "New Business Inquiries"
                  )}
                </Title>
                  <div className={styles.newBusinessDetails}>
                    <div className={styles.newBusinessBody}>
                      <Text
                        as="p"
                        size="M"
                        terminals="sans"
                        className={styles.newBusinessLine}
                      >
                        {t("contactNewBusinessName", "Petri Lahdelma")}
                      </Text>
                      <Text
                        as="p"
                        size="S"
                        terminals="sans"
                        lineHeight="normal"
                        className={styles.newBusinessLineMuted}
                      >
                        {t(
                          "contactNewBusinessRole",
                          "Founder, Head of Design"
                        )}
                      </Text>
                    </div>
                    <a
                      href="#contact-form"
                      className={styles.newBusinessCta}
                      onClick={handleScrollToContactForm}
                    >
                      <span className={styles.email}>
                        {t("contactNewBusinessBookLink", "Book a call")}
                      </span>
                      <span className={styles.newBusinessLinkIcon} aria-hidden>
                        <Icon name="ArrowRight" size="sm" decorative />
                      </span>
                    </a>
                  </div>
              </div>
            </div>
          </div>

          <div className={styles.quoteSection}>
            <motion.blockquote
              className={styles.pullQuote}
              initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={
                shouldAnimate
                  ? { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.45 }
                  : { duration: 0 }
              }
            >
              <Text
                as="p"
                size="L"
                lineHeight="relaxed"
                terminals="serif"
                className={styles.pullQuoteText}
              >
                {t(
                  "contactPullQuote",
                  "We help ambitious teams turn what they do into products with clarity and conviction. Bring us your vision and we'll shape how it shows up in the world."
                )}
              </Text>
            </motion.blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}

ContactPageContentEditorial.displayName = "ContactPageContentEditorial";
