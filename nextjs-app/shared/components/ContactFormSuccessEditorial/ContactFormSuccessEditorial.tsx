"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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
  return (
    <motion.div
      className={cn(styles.container, className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.3, // Delay for form exit animation
      }}
    >
      {/* Title - typography carries the success */}
      <motion.h3
        className={styles.title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.4,
        }}
      >
        {title}
      </motion.h3>

      {/* Message */}
      <motion.p
        className={styles.message}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.4,
          delay: 0.5,
        }}
      >
        {message}
      </motion.p>

      {/* Send another - subtle text link */}
      {onSendAnother && (
        <motion.button
          type="button"
          onClick={onSendAnother}
          className={styles.sendAnother}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.4,
            delay: 0.6,
          }}
        >
          {sendAnotherLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

ContactFormSuccessEditorial.displayName = "ContactFormSuccessEditorial";
