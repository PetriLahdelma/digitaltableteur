import React, { useMemo } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import Button from "@dt/Button";
import styles from "./ChatWidget.module.css";
import Badge from "@dt/Badge";

// Lightweight calendar icons (Lucide-style approximations) without extra deps
const CalendarX: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
    <line x1={16} y1={2} x2={16} y2={6} />
    <line x1={8} y1={2} x2={8} y2={6} />
    <line x1={3} y1={10} x2={21} y2={10} />
    <line x1={10} y1={14} x2={14} y2={18} />
    <line x1={14} y1={14} x2={10} y2={18} />
  </svg>
);

const CalendarCheck: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
    <line x1={16} y1={2} x2={16} y2={6} />
    <line x1={8} y1={2} x2={8} y2={6} />
    <line x1={3} y1={10} x2={21} y2={10} />
    <polyline points="9 14 11 16 15 12" />
  </svg>
);
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

  // Determine Finnish (Europe/Helsinki) business hours: Mon-Fri 09:00-15:00 local time
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
    return isWeekday && hour >= 9 && hour < 15;
  }, [helsinkiNow]);

  const availabilityLabel = withinHours
    ? t("chatAvailabilityOpen", "Available now")
    : t("chatAvailabilityClosed", "Closed");

  return (
    <header className={styles.header}>
      <div className={styles.headerCopy}>
        <p className={styles.tagline}>{tagline}</p>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{description}</p>
        <Badge
          state={withinHours ? "success" : "error"}
          design="secondary"
          size="s"
          title={availabilityLabel}
          icon={
            withinHours ? (
              <CalendarCheck
                className={`${styles.availabilityIcon} ${styles.availabilityIconOpen}`}
              />
            ) : (
              <CalendarX
                className={`${styles.availabilityIcon} ${styles.availabilityIconClosed}`}
              />
            )
          }
        >
          {availabilityLabel}
        </Badge>
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
