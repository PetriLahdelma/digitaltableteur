import React, { useEffect, useState } from "react";
import { useLocalization } from "../../lib/translation";
import styles from "./HelsinkiClock.module.css";

type DateParts = {
  weekdayIndex: number;
  day: number;
  monthIndex: number;
};

const HELSINKI_TIME_ZONE = "Europe/Helsinki";
const WEEKDAY_ABBREVIATIONS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getTranslatedDate(t: (key: string) => string, parts: DateParts) {
  // Translation keys aligned with Sunday=0, Saturday=6.
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

  const weekdayKey = weekdayKeys[parts.weekdayIndex] ?? weekdayKeys[0];
  const monthKey = monthKeys[parts.monthIndex] ?? monthKeys[0];
  return `${t(weekdayKey)} ${parts.day}. ${t(monthKey)}`;
}

const getHelsinkiDateParts = (date: Date): DateParts => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: HELSINKI_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const weekdayValue = parts.find((part) => part.type === "weekday")?.value;
  const dayValue = parts.find((part) => part.type === "day")?.value;
  const monthValue = parts.find((part) => part.type === "month")?.value;

  const weekdayIndex = WEEKDAY_ABBREVIATIONS.indexOf(weekdayValue ?? "");
  const day = Number(dayValue) || 1;
  const monthIndex = Number(monthValue) ? Number(monthValue) - 1 : 0;

  return {
    weekdayIndex: weekdayIndex >= 0 ? weekdayIndex : 0,
    day,
    monthIndex,
  };
};

const getHelsinkiTime = (date: Date) =>
  date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: HELSINKI_TIME_ZONE,
  });

const getHelsinkiTimeZoneLabel = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: HELSINKI_TIME_ZONE,
    timeZoneName: "short",
  });
  const parts = formatter.formatToParts(date);
  return parts.find((part) => part.type === "timeZoneName")?.value || "GMT+2";
}

const HelsinkiClock: React.FC = () => {
  const { translate: t, language, resolvedLanguage } = useLocalization();
  const [helsinki, setHelsinki] = useState<{
    dateParts: DateParts;
    time: string;
    timeZoneLabel: string;
  } | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setHelsinki({
        dateParts: getHelsinkiDateParts(now),
        time: getHelsinkiTime(now),
        timeZoneLabel: getHelsinkiTimeZoneLabel(now),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Use translation key for Helsinki (helsinki, helsinkiFI, helsinkiSV)
  let helsinkiKey = "helsinki";
  const languageCode = (resolvedLanguage || language || "en").split("-")[0];
  if (languageCode === "fi") helsinkiKey = "helsinkiFI";
  if (languageCode === "sv") helsinkiKey = "helsinkiSV";

  return (
    <div className={styles.clockContainer}>
      <div className={styles.date}>
        {helsinki
          ? getTranslatedDate(t, helsinki.dateParts)
          : "\u2007"}
      </div>
      <div className={styles.time}>
        {t(helsinkiKey)} ({helsinki?.timeZoneLabel ?? "GMT+2"})
        {helsinki ? `, ${helsinki.time}` : ""}
      </div>
    </div>
  );
};

export default HelsinkiClock;
