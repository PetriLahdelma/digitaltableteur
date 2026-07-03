import React from "react";
import styles from "./OpenHours.module.css";
import { WEEKLY_HOURS, isOpenAt } from "../../data/openHours";
import { useTranslation } from "react-i18next";
import Badge from "@dt/Badge";
import Icon from "@dt/Icon";

export interface OpenHoursProps {
  compact?: boolean;
  showAllDays?: boolean; // default true
  highlightToday?: boolean; // default true
  date?: Date; // inject custom date for testing
}

/**
 * OpenHours component.
 */
export const OpenHours: React.FC<OpenHoursProps> = ({
  compact = false,
  showAllDays = true,
  highlightToday = true,
  date = new Date(),
}) => {
  const { t } = useTranslation();
  /* WEEKLY_HOURS is Monday-first; getDay() is Sunday-based (0 = Sunday).
     Remap so the highlighted row is actually today (was off by one). */
  const todayIndex = (date.getDay() + 6) % 7;
  const open = isOpenAt(date);

  return (
    <div
      className={compact ? `${styles.root} ${styles.compact}` : styles.root}
      aria-label={t("openHours.heading", "Open hours")}
      data-testid="open-hours"
    >
      <div className={styles.headerRow}>
        <strong>{t("openHours.heading", "Open hours")}</strong>
        <Badge
          variant="primary"
          tone={open ? "success" : "error"}
          square={false}
          size="sm"
          className={styles.badge}
          aria-live="polite"
          icon={
            open ? (
              <Icon name="calendar-check" ariaLabel="Open" />
            ) : (
              <Icon name="calendar-x" ariaLabel="Closed" />
            )
          }
        >
          {open
            ? t("openHours.openNow", "Open now")
            : t("openHours.closedNow", "Closed now")}
        </Badge>
      </div>
      <table className={styles.table} role="table">
        <thead>
          <tr>
            <th scope="col">{t("openHours.day", "Day")}</th>
            <th scope="col">{t("openHours.opens", "Opens")}</th>
            <th scope="col">{t("openHours.closes", "Closes")}</th>
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
                  {closed ? t("openHours.closed", "Closed") : `${d.open}:00`}
                </td>
                <td className={closed ? styles.closed : undefined}>
                  {closed ? t("openHours.closed", "Closed") : `${d.close}:00`}
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
