"use client";

import React, { useEffect, useRef } from "react";
import { useTranslate } from "../../lib/translation";
import styles from "./AlertBanner.module.css";
import Icon from "@dt/Icon";
import Button from "@dt/Button";
import Text from "@dt/Text";

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
  /** Show the semantic tone icon. The icon is derived from `tone`; set false for a text-only banner. @default true */
  showIcon?: boolean;
  /** Shows a localized dismiss control when true. @default false */
  dismissible?: boolean;
  /** Called when the user dismisses the banner. */
  onDismiss?: () => void;
  /** Live region politeness for assistive tech (an explicit value wins over the tone default). */
  "aria-live"?: "polite" | "assertive" | "off";
  /**
   * Moves focus to the banner when it mounts, for form error summaries: keyboard
   * and screen reader users land on the list of problems after a failed submit.
   * @default false
   */
  focusOnMount?: boolean;
};

const toneIcon: Record<Tone, string> = {
  info: "info",
  success: "check-circle",
  warning: "warning-circle",
  error: "x-circle",
};

/**
 * The icon's accessible name, in the page's language: it tells screen reader
 * users which kind of message this is, which the colour shows everyone else.
 */
const toneLabel: Record<Tone, readonly [key: string, fallback: string]> = {
  info: ["alertBanner.tone.info", "Information"],
  success: ["alertBanner.tone.success", "Success"],
  warning: ["alertBanner.tone.warning", "Warning"],
  error: ["alertBanner.tone.error", "Error"],
};

/** Inline alert banner with semantic tones, action slot, and optional dismiss. */
const AlertBanner: React.FC<AlertBannerProps> = ({
  tone = "info",
  title,
  description,
  action,
  showIcon = true,
  dismissible = false,
  onDismiss,
  "aria-live": ariaLive,
  focusOnMount = false,
}) => {
  const t = useTranslate();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, [focusOnMount]);
  // Error banners must interrupt assistive tech (role=alert / assertive);
  // other tones are polite status updates. An explicit aria-live prop wins.
  const isError = tone === "error";
  const role = isError ? "alert" : "status";
  const liveRegion = ariaLive ?? (isError ? "assertive" : "polite");
  return (
    <div
      ref={ref}
      className={`${styles.banner} ${styles[tone]}`.trim()}
      role={role}
      aria-live={liveRegion}
      tabIndex={focusOnMount ? -1 : undefined}
    >
      {/* The icon is always the semantic tone icon; showIcon only toggles its
          presence (there is no per-instance icon override — the tone owns it). */}
      {showIcon && <Icon name={toneIcon[tone]} ariaLabel={t(...toneLabel[tone])} size="md" />}
      <div className={styles.content}>
        {title && (
          // A status/alert label, not a document heading: rendering it as a
          // heading (Title is always h1-h6) injects a stray heading into the
          // page outline wherever a banner appears. `strong` carries the
          // emphasis without the heading semantics (cf. Radix Toast.Title).
          <Text as="strong" className={styles.title}>
            {title}
          </Text>
        )}
        {description && (
          // Rich descriptions (an error summary's list of links) need a block
          // container: a paragraph cannot hold a list.
          <Text
            as={
              typeof description === "string" || typeof description === "number"
                ? "p"
                : "div"
            }
            size="m"
            className={styles.description}
          >
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
          // Starts with the visible "Close" (WCAG 2.5.3): a voice-control
          // user says what they see.
          aria-label={t("alertBanner.dismissLabel", "Close alert")}
        >
          {t("alertBanner.close", "Close")}
        </Button>
      )}
    </div>
  );
};

export default AlertBanner;
