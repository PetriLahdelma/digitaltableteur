import React, { useMemo } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import Button from "@dt/Button";
import styles from "./ChatWidget.module.css";
import { useTranslation } from "react-i18next";

interface ChatHeaderProps {
  title: string;
  description: string;
  onReset: () => void;
  onMinimize: () => void;
  isSending: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  description,
  onReset,
  onMinimize,
  isSending,
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
      const parts = fmt.formatToParts(new Date());
      const hour = Number(parts.find((p) => p.type === "hour")?.value || "0");
      const minute = Number(
        parts.find((p) => p.type === "minute")?.value || "0",
      );
      const weekday = parts.find((p) => p.type === "weekday")?.value || ""; // e.g., Mon
      return { hour, minute, weekday };
    } catch {
      const d = new Date();
      return { hour: d.getHours(), minute: d.getMinutes(), weekday: "" };
    }
  }, []);

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
        <p className={styles.tagline}>
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
        </p>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.headerActions}>
        <Button
          type="button"
          onClick={onReset}
          disabled={isSending}
          aria-label={resetAriaLabel}
          variant="tertiary"
          size="m"
          icon={<IoMdRefresh />}
        >
          {resetLabel}
        </Button>
        <Button
          type="button"
          onClick={onMinimize}
          aria-label={minimizeAriaLabel}
          variant="tertiary"
          size="m"
          icon={<FaChevronDown />}
        />
      </div>
    </header>
  );
};

export default ChatHeader;
