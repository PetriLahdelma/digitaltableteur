/**
 * Project periods as structured data, formatted per locale.
 *
 * `start` and `end` are "YYYY-MM" (month known) or "YYYY" (year only). A
 * missing `end` means ongoing. A row uses months only when both ends have
 * them, so one period never mixes "Mar 2022" with a bare "2026".
 */

export interface ProjectPeriod {
  /** "YYYY-MM" or "YYYY". */
  start: string;
  /** "YYYY-MM" or "YYYY"; omit while the project is ongoing. */
  end?: string;
}

const PATTERN = /^(\d{4})(?:-(\d{2}))?$/;

function parse(value: string): { year: number; month?: number } {
  const match = PATTERN.exec(value);
  if (!match) throw new Error(`Invalid period value "${value}" (want YYYY or YYYY-MM)`);
  return { year: Number(match[1]), month: match[2] ? Number(match[2]) : undefined };
}

function toDate({ year, month }: { year: number; month?: number }): Date {
  return new Date(Date.UTC(year, (month ?? 1) - 1, 1));
}

/**
 * Formats a period for `locale`. `ongoing` turns the formatted start into the
 * ongoing phrase, for example (start) => `${start} – Present`.
 */
export function formatPeriod(
  period: ProjectPeriod,
  locale: string,
  ongoing: (start: string) => string,
): string {
  const start = parse(period.start);
  const end = period.end ? parse(period.end) : undefined;
  const withMonths = start.month !== undefined && (!end || end.month !== undefined);
  const format = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    ...(withMonths ? { month: "short" } : {}),
    timeZone: "UTC",
  });

  if (!end) return ongoing(format.format(toDate(start)));
  const from = toDate(start);
  const to = toDate(end);
  if (format.format(from) === format.format(to)) return format.format(from);
  // Intl pads the dash with thin spaces; month ranges keep a plain space
  // either side ("Mar 2022 – Feb 2026"), year ranges close up ("2020–2022").
  const range = format.formatRange(from, to).replace(/\u2009/g, " ");
  return withMonths ? range : range.replace(/\s*–\s*/, "–");
}
