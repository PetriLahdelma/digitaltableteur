"use client";

import React from "react";
import styles from "./AlertBanner.module.css";
import Icon from "@dt/Icon";
import Button from "@dt/Button";
import Text from "@dt/Text";
import Title from "@dt/Title";

type Tone = "info" | "success" | "warning" | "error";

export type AlertBannerProps = {
  tone?: Tone;
  title?: string;
  description?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  "aria-live"?: "polite" | "assertive" | "off";
};

const toneIcon: Record<Tone, string> = {
  info: "info",
  success: "check-circle",
  warning: "warning-circle",
  error: "x-circle",
};

/** Inline alert banner with semantic tones and optional dismiss. */
const AlertBanner: React.FC<AlertBannerProps> = ({
  tone = "info",
  title,
  description,
  dismissible = false,
  onDismiss,
  "aria-live": ariaLive = "polite",
}) => {
  return (
    <div
      className={`${styles.banner} ${styles[tone]}`.trim()}
      role="status"
      aria-live={ariaLive}
    >
      <Icon name={toneIcon[tone]} ariaLabel={tone} size="md" />
      <div className={styles.content}>
        {title && (
          <Title size="s" terminals="sans" className={styles.title}>
            {title}
          </Title>
        )}
        {description && (
          <Text size="m" terminals="sans" className={styles.description}>
            {description}
          </Text>
        )}
      </div>
      {dismissible && (
        <Button
          variant="tertiary"
          size="sm"
          className={styles.dismiss}
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          Close
        </Button>
      )}
    </div>
  );
};

export default AlertBanner;
