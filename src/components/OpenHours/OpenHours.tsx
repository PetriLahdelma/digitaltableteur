import React from "react";
import styles from "./OpenHours.module.css";
import { WEEKLY_HOURS, isCurrentlyOpen } from "../../data/openHours";
import { useTranslation } from "react-i18next";
import Badge from "@dt/Badge";

export interface OpenHoursProps {
  compact?: boolean;
  showAllDays?: boolean; // default true
  highlightToday?: boolean; // default true
  date?: Date; // inject custom date for testing
}

const OpenHours: React.FC<OpenHoursProps> = ({
  compact = false,
  showAllDays = true,
  highlightToday = true,
  date = new Date(),
}) => {
  const { t } = useTranslation();
  const todayIndex = date.getDay(); // 0 sunday
  const open = isCurrentlyOpen(date);

  return (
    <div
      className={compact ? `${styles.root} ${styles.compact}` : styles.root}
      aria-label={t("openHours.heading", "Open hours")}
    >
      <div className={styles.headerRow}>
        <strong>{t("openHours.heading", "Open hours")}</strong>
        <Badge
          design="secondary"
          square="true"
          size="s"
          className={styles.badge}
          aria-live="polite"
        >
          {open
            ? t("openHours.openNow", "Open now")
            : t("openHours.closedNow", "Closed now")}
        </Badge>
      </div>
      <table className={styles.table} role="table">
        <thead>
          <tr>
            <th>{t("openHours.day", "Day")}</th>
            <th>{t("openHours.opens", "Opens")}</th>
            <th>{t("openHours.closes", "Closes")}</th>
          </tr>
        </thead>
        <tbody>
          {WEEKLY_HOURS.filter(
            (_, idx) => showAllDays || idx === todayIndex,
          ).map((d, idx) => {
            const isToday = idx === todayIndex && highlightToday && showAllDays;
            const closed = !d.open || !d.close;
            return (
              <tr key={d.day} data-today={isToday || undefined}>
                <td>{t(`openHours.days.${d.day}`, d.day)}</td>
                <td className={closed ? styles.closed : undefined}>
                  {closed ? t("openHours.closed", "Closed") : d.open}
                </td>
                <td className={closed ? styles.closed : undefined}>
                  {closed ? t("openHours.closed", "Closed") : d.close}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OpenHours;
