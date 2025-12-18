import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./HelsinkiClock.module.css";

function getTranslatedDate(t: any, date: Date, lng: string) {
  const weekday = date.getDay(); // 0 (Sun) - 6 (Sat)
  const day = date.getDate();
  const month = date.getMonth(); // 0 (Jan) - 11 (Dec)

  // Map JS getDay to translation keys (Monday=1, Sunday=0)
  const weekdayKeys = [
    "weekdaySunday",
    "weekdayMonday",
    "weekdayTuesday",
    "weekdayWednesday",
    "weekdayThursday",
    "weekdayFriday",
    "weekdaySaturday",
  ];
  const monthKeys = [
    "monthJanuary",
    "monthFebruary",
    "monthMarch",
    "monthApril",
    "monthMay",
    "monthJune",
    "monthJuly",
    "monthAugust",
    "monthSeptember",
    "monthOctober",
    "monthNovember",
    "monthDecember",
  ];

  const weekdayKey = weekdayKeys[weekday];
  const monthKey = monthKeys[month];
  return `${t(weekdayKey)} ${day}. ${t(monthKey)}`;
}

const HelsinkiClock: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [helsinki, setHelsinki] = useState<{ date: Date; time: string } | null>(
    null,
  );

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setHelsinki({
        date: now,
        time: now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Europe/Helsinki",
        }),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Use translation key for Helsinki (helsinki, helsinkiFI, helsinkiSV)
  let helsinkiKey = "helsinki";
  if (i18n.language === "fi") helsinkiKey = "helsinkiFI";
  if (i18n.language === "sv") helsinkiKey = "helsinkiSV";

  return (
    <div className={styles.clockContainer}>
      <div className={styles.date}>
        {helsinki
          ? getTranslatedDate(t, helsinki.date, i18n.language)
          : "\u2007"}
      </div>
      <div className={styles.time}>
        {t(helsinkiKey)} (GMT+2)
        {helsinki ? `, ${helsinki.time}` : ""}
      </div>
    </div>
  );
};

export default HelsinkiClock;
