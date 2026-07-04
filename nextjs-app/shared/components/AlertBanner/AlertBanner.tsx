"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./AlertBanner.module.css";
import Icon from "@dt/Icon";
import Button from "@dt/Button";
import Text from "@dt/Text";
import Title from "@dt/Title";

type Tone = "info" | "success" | "warning" | "error";

export type AlertBannerProps = {
  /** Semantic tone controlling icon and surface colors. @default "info" */
  tone?: Tone;
  /** Alert heading text. */
  title?: string;
  /** Supporting body copy. */
  description?: React.ReactNode;
  /** Optional action slot rendered under the description (e.g. a tertiary Button). */
  action?: React.ReactNode;
  /** Override the tone icon with another registered icon name. */
  icon?: string;
  /** Shows a localized dismiss control when true. @default false */
  dismissible?: boolean;
  /** Called when the user dismisses the banner. */
  onDismiss?: () => void;
  /** Live region politeness for assistive tech (an explicit value wins over the tone default). */
  "aria-live"?: "polite" | "assertive" | "off";
};

const toneIcon: Record<Tone, string> = {
  info: "info",
  success: "check-circle",
  warning: "warning-circle",
  error: "x-circle",
};

/** Inline alert banner with semantic tones, action slot, and optional dismiss. */
const AlertBanner: React.FC<AlertBannerProps> = ({
  tone = "info",
  title,
  description,
  action,
  icon,
  dismissible = false,
  onDismiss,
  "aria-live": ariaLive,
}) => {
  const { t } = useTranslation();
  // Error banners must interrupt assistive tech (role=alert / assertive);
  // other tones are polite status updates. An explicit aria-live prop wins.
  const isError = tone === "error";
  const role = isError ? "alert" : "status";
  const liveRegion = ariaLive ?? (isError ? "assertive" : "polite");
  return (
    <div
      className={`${styles.banner} ${styles[tone]}`.trim()}
      role={role}
      aria-live={liveRegion}
    >
      <Icon name={icon ?? toneIcon[tone]} ariaLabel={tone} size="md" />
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
        {action && <div className={styles.action}>{action}</div>}
      </div>
      {dismissible && (
        <Button
          variant="tertiary"
          size="sm"
          className={styles.dismiss}
          onClick={onDismiss}
          aria-label={t("alertBanner.dismissLabel", "Dismiss alert")}
        >
          {t("alertBanner.close", "Close")}
        </Button>
      )}
    </div>
  );
};

export default AlertBanner;
