import React, { useMemo } from "react";
import Button from "@dt/Button";
import Title from "@dt/Title";
import Text from "@dt/Text";
import styles from "./ChatWidget.module.css";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";

/**
 * Props for the ChatHeader component.
 *
 * @interface ChatHeaderProps
 * @property {string} title - Main heading displayed in the chat header
 * @property {string} description - Descriptive text shown below the title
 * @property {function} onReset - Callback fired when the reset button is clicked
 * @property {function} onMinimize - Callback fired when the minimize button is clicked
 * @property {boolean} isSending - Whether a message is currently being sent (disables reset button)
 * @property {Date} [currentDate] - Optional override for current date/time (used in tests to simulate open/closed hours). Defaults to new Date() when omitted.
 */
export interface ChatHeaderProps {
  title: string;
  description: string;
  onReset: () => void;
  onMinimize: () => void;
  isSending: boolean;
  /**
   * Optional override for current date/time (used in tests to simulate open/closed hours).
   * Defaults to new Date() when omitted.
   */
  currentDate?: Date;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  description,
  onReset,
  onMinimize,
  isSending,
  currentDate,
}) => {
  const { t } = useTranslation();
  const tagline = t("chatTagline", "DT Donny");
  const resetLabel = t("chatReset", "Reset");
  const resetAriaLabel = t("chatResetAria", "Reset conversation");
  const minimizeAriaLabel = t("chatMinimizeAria", "Minimize chat");

  // Finnish (Europe/Helsinki) business hours: Mon–Fri 09:00–17:00 local time (inclusive start, exclusive end)
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
  }, [currentDate]);

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
          onClick={onReset}
          disabled={isSending}
          aria-label={resetAriaLabel}
          variant="tertiary"
          size="m"
          icon={<Icon name="arrow-clockwise" ariaLabel={resetAriaLabel} />}
          className={styles.resetButton}
        >
          {resetLabel}
        </Button>
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
