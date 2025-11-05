export interface DayHours {
  day: string; // lowercase english key
  open: string | null; // HH:MM 24h or null
  close: string | null; // HH:MM 24h or null
}

export const WEEKLY_HOURS: DayHours[] = [
  { day: "monday", open: "09:00", close: "17:00" },
  { day: "tuesday", open: "09:00", close: "17:00" },
  { day: "wednesday", open: "09:00", close: "17:00" },
  { day: "thursday", open: "09:00", close: "17:00" },
  { day: "friday", open: "09:00", close: "17:00" },
  { day: "saturday", open: null, close: null },
  { day: "sunday", open: null, close: null },
];

export function getTodayHours(date = new Date()): DayHours | undefined {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const key = days[date.getDay()];
  return WEEKLY_HOURS.find((d) => d.day === key);
}

export function isCurrentlyOpen(date = new Date()): boolean {
  const today = getTodayHours(date);
  if (!today || !today.open || !today.close) return false;
  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);
  const minutesNow = date.getHours() * 60 + date.getMinutes();
  const minutesOpen = openH * 60 + openM;
  const minutesClose = closeH * 60 + closeM;
  return minutesNow >= minutesOpen && minutesNow < minutesClose;
}
