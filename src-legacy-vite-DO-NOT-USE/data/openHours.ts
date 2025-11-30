// Weekly open hours configuration (Europe/Helsinki)
// Weekdays 09:00–17:00 (inclusive start, exclusive end). Weekends closed.
export interface DayHours {
  day: string; // english lowercase weekday
  open: number | null; // opening hour inclusive
  close: number | null; // closing hour exclusive
}

export const WEEKLY_HOURS: DayHours[] = [
  { day: "monday", open: 9, close: 17 },
  { day: "tuesday", open: 9, close: 17 },
  { day: "wednesday", open: 9, close: 17 },
  { day: "thursday", open: 9, close: 17 },
  { day: "friday", open: 9, close: 17 },
  { day: "saturday", open: null, close: null },
  { day: "sunday", open: null, close: null },
];

// Determine open/closed status at a given Date (Europe/Helsinki timezone aware)
export const isOpenAt = (date: Date): boolean => {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Helsinki",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "long",
  });
  const parts = fmt.formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value || "0");
  const weekday = (
    parts.find((p) => p.type === "weekday")?.value || ""
  ).toLowerCase();
  const config = WEEKLY_HOURS.find((d) => weekday.startsWith(d.day));
  if (!config || config.open == null || config.close == null) return false;
  return hour >= config.open && hour < config.close;
};

export default WEEKLY_HOURS;
