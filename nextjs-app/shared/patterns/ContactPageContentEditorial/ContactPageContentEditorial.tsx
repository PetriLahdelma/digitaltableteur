"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import Text from "@dt/Text";
import Title from "@dt/Title";
import Icon from "@dt/Icon";
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
}

/**
 * ContactPageContentEditorial component.
 */
export function ContactPageContentEditorial({
  className,
}: ContactPageContentEditorialProps) {
  const { t } = useTranslation();
  const [showSuccess, setShowSuccess] = useState(false);
  // Skip entrance animations under reduced-motion so axe never samples
  // partial-opacity frames as color-contrast violations.
  const prefersReducedMotion = useReducedMotion();

  const handleFormSuccess = () => {
    setShowSuccess(true);
  };

  const handleSendAnother = () => {
    setShowSuccess(false);
  };

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
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
              }
            >
              {t("contactHeadline", "Let's talk.")}
            </motion.h1>

            {/* Divider */}
            <motion.hr
              className={styles.divider}
              initial={prefersReducedMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }
              }
            />

            {/* Intro Paragraph */}
            <motion.p
              className={styles.intro}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }
              }
            >
              {t(
                "contactIntro",
                "We'd love to hear about your project, idea, or just say hello."
              )}
            </motion.p>

            {/* Contact Details */}
            <motion.div
              className={styles.contactDetails}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }
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

          {/* Right Column - Form */}
          <div className={styles.rightColumn}>
            <div id="contact-form" className={styles.formPanel}>
            <AnimatePresence mode="wait">
              {showSuccess ? (
                <motion.div
                  key="success"
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
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
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                >
                  <ContactFormEditorial onSuccess={handleFormSuccess} />
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>

          <motion.hr
            className={cn(styles.divider, styles.layoutDivider)}
            aria-hidden
            initial={prefersReducedMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.55 }
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
                  sizes="(min-width: 768px) 168px, 144px"
                  className={styles.newBusinessPortrait}
                />
              </div>
              <div className={styles.newBusinessContent}>
                <Title
                  level={3}
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
                    <a href="#contact-form" className={styles.newBusinessCta}>
                      <span className={styles.email}>
                        {t("contactNewBusinessLink", "Contact")}
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
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.45 }
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
