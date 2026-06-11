import React, { useMemo, useState, useEffect } from "react";
import Button from "@dt/Button";
import Title from "@dt/Title";
import Text from "@dt/Text";
import { DonnyAvatar, type DonnyState } from "@dt/DonnyAvatar";
import styles from "./ChatWidget.module.css";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";

/**
 * Props for the ChatHeader component.
 *
 * @interface ChatHeaderProps
 * @property {string} title - Main heading displayed in the chat header
 * @property {string} description - Descriptive text shown below the title
 * @property {function} onMinimize - Callback fired when the minimize button is clicked
 * @property {DonnyState} [avatarState] - Current state of Donny avatar animation
 * @property {boolean} [enableIdleExpressions] - Enable random expressions when Donny is idle
 * @property {Date} [currentDate] - Optional override for current date/time (used in tests to simulate open/closed hours). Defaults to new Date() when omitted.
 */
export interface ChatHeaderProps {
  title: string;
  description: string;
  onMinimize: () => void;
  /**
   * Current state for Donny avatar animation.
   * Maps to chat interaction states like idle, listening, thinking, success, error.
   */
  avatarState?: DonnyState;
  /**
   * Enable random idle expressions to make Donny feel more alive when idle.
   */
  enableIdleExpressions?: boolean;
  /**
   * Enable cursor tracking - Donny's eyes will follow the user's mouse.
   */
  trackMouse?: boolean;
  /**
   * Animate mouth as if speaking (used during streaming responses).
   */
  isSpeaking?: boolean;
  /**
   * Enable sleep detection when mouse is idle.
   */
  enableSleepDetection?: boolean;
  /**
   * Optional override for current date/time (used in tests to simulate open/closed hours).
   * Defaults to new Date() when omitted.
   */
  currentDate?: Date;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  description,
  onMinimize,
  avatarState = "idle",
  enableIdleExpressions = false,
  trackMouse = false,
  isSpeaking = false,
  enableSleepDetection = false,
  currentDate,
}) => {
  const { t } = useTranslation();
  const tagline = t("chatTagline", "DT Donny");
  const minimizeAriaLabel = t("chatMinimizeAria", "Minimize chat");

  // Finnish (Europe/Helsinki) business hours: Mon–Fri 09:00–17:00 local time (inclusive start, exclusive end)
  // Recalculates every 60s so the status dot updates without a page refresh
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (currentDate) return; // tests pass a fixed date — no timer needed
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [currentDate]);

  const helsinkiNow = useMemo(() => {
    try {
      const fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Helsinki",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        weekday: "short",
      });
      const parts = fmt.formatToParts(currentDate || new Date());
      const hour = Number(parts.find((p) => p.type === "hour")?.value || "0");
      const minute = Number(
        parts.find((p) => p.type === "minute")?.value || "0",
      );
      const weekday = parts.find((p) => p.type === "weekday")?.value || ""; // e.g., Mon
      return { hour, minute, weekday };
    } catch {
      const d = currentDate || new Date();
      return { hour: d.getHours(), minute: d.getMinutes(), weekday: "" };
    }
  }, [currentDate, tick]);

  const withinHours = useMemo(() => {
    const { hour, weekday } = helsinkiNow;
    const isWeekday = /mon|tue|wed|thu|fri/i.test(weekday);
    // Open at 09:00 inclusive, closes right at 17:00 (i.e. 16:59 still open)
    return isWeekday && hour >= 9 && hour < 17;
  }, [helsinkiNow]);

  const availabilityTooltip = withinHours
    ? t("chatAvailabilityOpen", "Open")
    : t("chatAvailabilityClosed", "Closed");

  return (
    <header className={styles.header}>
      <DonnyAvatar
        state={avatarState}
        size="md"
        className={styles.headerAvatar}
        enableIdleExpressions={enableIdleExpressions}
        idleExpressionInterval={10000}
        trackMouse={trackMouse}
        isSpeaking={isSpeaking}
        enableSleepDetection={enableSleepDetection}
      />
      <div className={styles.headerCopy}>
        <Text as="p" terminals="sans" className={styles.tagline}>
          {tagline}
          <span
            className={
              withinHours
                ? `${styles.availabilityDot} ${styles.availabilityDotOpen} ${styles.availabilityDotInline}`
                : `${styles.availabilityDot} ${styles.availabilityDotClosed} ${styles.availabilityDotInline}`
            }
            title={availabilityTooltip}
            aria-label={availabilityTooltip}
            role="status"
            data-testid="chat-availability-dot"
          />
          {!withinHours && (
            <span
              className={styles.offlineText}
              data-testid="chat-offline-text"
            >
              {t("chatStudioOffline", "Studio offline")}
            </span>
          )}
        </Text>
        <Title level={2} terminals="sans" size="S" className={styles.title}>
          {title}
        </Title>
      </div>
      <div className={styles.headerActions}>
        <Button
          type="button"
          onClick={onMinimize}
          aria-label={minimizeAriaLabel}
          variant="tertiary"
          size="m"
          icon={<Icon name="caret-down" ariaLabel={minimizeAriaLabel} />}
          className={styles.minimizeButton}
        />
      </div>
    </header>
  );
};

export default ChatHeader;
