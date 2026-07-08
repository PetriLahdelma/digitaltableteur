"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslate } from "../../lib/translation";
import { cn } from "../../lib/cn";
import Button from "@dt/Button";
import styles from "./ContactFormSuccessEditorial.module.css";

export interface ContactFormSuccessEditorialProps {
  /** Success title - e.g., "Message sent." */
  title: string;
  /** Success message - e.g., "We'll be in touch shortly." */
  message: string;
  /** Callback to send another message */
  onSendAnother?: () => void;
  /** Button label for sending another message */
  sendAnotherLabel?: string;
  /** Custom className */
  className?: string;
}

export function ContactFormSuccessEditorial({
  title,
  message,
  onSendAnother,
  sendAnotherLabel = "Send another message",
  className,
}: ContactFormSuccessEditorialProps) {
  const t = useTranslate();
  const prefersReducedMotion = useReducedMotion();
  const motionEase = [0.16, 1, 0.3, 1] as const;

  return (
    <motion.div
      className={cn(styles.container, className)}
      role="status"
      aria-live="polite"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.4, ease: motionEase }
      }
    >
      <p className={styles.eyebrow}>
        {t("contactSuccessEyebrow", "Inquiry received")}
      </p>

      <div className={styles.copy}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
      </div>

      <hr className={styles.divider} aria-hidden="true" />

      {onSendAnother ? (
        <div className={styles.action}>
          <Button
            variant="tertiary"
            className={styles.sendAnother}
            onClick={onSendAnother}
          >
            {sendAnotherLabel}
          </Button>
        </div>
      ) : null}
    </motion.div>
  );
}

ContactFormSuccessEditorial.displayName = "ContactFormSuccessEditorial";
