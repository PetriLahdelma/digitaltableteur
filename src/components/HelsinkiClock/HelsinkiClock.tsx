import React, { useEffect, useState } from "react";
import styles from "./HelsinkiClock.module.css";

const helsinkiOptions: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "long",
  day: "numeric",
};

const timeOptions: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
};

function getHelsinkiTime() {
  const now = new Date();
  // Europe/Helsinki is always UTC+2 or UTC+3 (with DST)
  return {
    date: now.toLocaleDateString("en-US", {
      ...helsinkiOptions,
      timeZone: "Europe/Helsinki",
    }),
    time: now.toLocaleTimeString("en-US", {
      ...timeOptions,
      timeZone: "Europe/Helsinki",
    }),
  };
}

const HelsinkiClock: React.FC = () => {
  const [helsinki, setHelsinki] = useState(getHelsinkiTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setHelsinki(getHelsinkiTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.clockContainer}>
      <div className={styles.date}>{helsinki.date}</div>
      <div className={styles.time}>Helsinki, {helsinki.time}</div>
    </div>
  );
};

export default HelsinkiClock;
