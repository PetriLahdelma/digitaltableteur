"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ContactFormEditorial } from "../../components/ContactFormEditorial";
import { ContactFormSuccessEditorial } from "../../components/ContactFormSuccessEditorial";
import styles from "./ContactPageContentEditorial.module.css";

export interface ContactPageContentEditorialProps {
  /** Custom className */
  className?: string;
}

export function ContactPageContentEditorial({
  className,
}: ContactPageContentEditorialProps) {
  const { t } = useTranslation();
  const [showSuccess, setShowSuccess] = useState(false);

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
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {t("contactHeadline", "Let's talk.")}
            </motion.h1>

            {/* Divider */}
            <motion.hr
              className={styles.divider}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2,
              }}
            />

            {/* Intro Paragraph */}
            <motion.p
              className={styles.intro}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.3,
              }}
            >
              {t(
                "contactIntro",
                "We'd love to hear about your project, idea, or just say hello."
              )}
            </motion.p>

            {/* Contact Details */}
            <motion.div
              className={styles.contactDetails}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.4,
              }}
            >
              <address className={styles.address}>
                <span className={styles.addressLine}>
                  {t("contactAddressLine1", "HKI HQ")}
                </span>
                <span className={styles.addressLine}>
                  {t("contactAddressLine2", "Hämeentie 8")}
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
            <AnimatePresence mode="wait">
              {showSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ContactFormEditorial onSuccess={handleFormSuccess} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer Section - Founder */}
      <motion.div
        className={styles.founderSection}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.5,
        }}
      >
        <div className={styles.container}>
          <hr className={styles.dividerFull} />
          <div className={styles.founder}>
            <div className={styles.founderInfo}>
              <span className={styles.founderName}>
                {t("contactPersonName", "Petri Lahdelma")}
              </span>
              <span className={styles.founderTitle}>
                {t("contactPersonTitle", "Founder & Creative Director")}
              </span>
            </div>
            <div className={styles.socialLinks}>
              <a
                href="https://www.linkedin.com/in/petrilahdelma/"
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("contactLinkedInLabel", "LinkedIn")}
              >
                LinkedIn
              </a>
              <span className={styles.socialDivider}>·</span>
              <a
                href="https://github.com/PetriLahdelma"
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("contactGitHubLabel", "GitHub")}
              >
                GitHub
              </a>
              <span className={styles.socialDivider}>·</span>
              <a
                href="https://x.com/dtdoesdesign"
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("footerAriaX", "X")}
              >
                X
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

ContactPageContentEditorial.displayName = "ContactPageContentEditorial";
