"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { Accordion, Button, Text, Title } from "@digitaltableteur/react";
import DtLink from "../../Link";
import styles from "./DatedLog.module.css";

export interface DatedLogEntry {
  /** "YYYY-MM-DD", "YYYY-MM" or "YYYY". */
  date: string;
  text: string;
  /** Proof: a case study, article, release or commit. */
  href?: string;
  /** A dated event that has not happened yet. */
  upcoming?: boolean;
  /** Short area label shown after the line. */
  tag?: string;
}

export interface DatedLogGroup {
  /** Stable key, e.g. "2014" or "2026-10"; the trigger id is `trigger-log-${key}`. */
  key: string;
  label: string;
  entries: DatedLogEntry[];
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-10-17" → "17 Oct", "2026-10" → "Oct", "2026" → "". The entry lines
 *  are English, so the label is too. */
export function formatLogDate(date: string): string {
  const [, month, day] = date.split("-");
  if (!month) return "";
  const name = MONTHS[Number(month) - 1] ?? "";
  return day ? `${Number(day)} ${name}` : name;
}

/** Groups newest-first entries by year ("2014") or month ("October 2026"). */
export function groupLog(
  entries: DatedLogEntry[],
  by: "year" | "month",
): DatedLogGroup[] {
  const groups: DatedLogGroup[] = [];
  for (const entry of entries) {
    const key = entry.date.slice(0, by === "year" ? 4 : 7);
    const last = groups.at(-1);
    if (last?.key === key) {
      last.entries.push(entry);
      continue;
    }
    const [year, month] = key.split("-");
    const label = by === "year" ? year : `${MONTH_NAMES[Number(month) - 1]} ${year}`;
    groups.push({ key, label, entries: [entry] });
  }
  return groups;
}

const groupId = (key: string) => `log-${key}`;

/** A dated log in collapsible groups: the newest open, an index that jumps to
 *  (and opens) any group, and an Expand all / Collapse all toggle. */
export function DatedLog({
  title,
  intro,
  indexLabel,
  groups,
}: {
  title: string;
  intro: string;
  indexLabel: string;
  groups: DatedLogGroup[];
}) {
  const { t } = useTranslation();
  const allIds = groups.map((group) => groupId(group.key));

  // Newest group open; the rest collapse so the log stays navigable.
  const [openIds, setOpenIds] = React.useState<string[]>(allIds.slice(0, 1));
  const allOpen = openIds.length === allIds.length;

  const openGroup = (id: string) =>
    setOpenIds((current) => (current.includes(id) ? current : [...current, id]));

  // A shared link (#trigger-log-2014) opens its group on arrival.
  React.useEffect(() => {
    const match = window.location.hash.match(/^#(?:trigger-)?(log-[\d-]+)$/);
    if (match) openGroup(match[1]);
  }, []);

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <Title level={1}>{title}</Title>
        <Text as="p" className={styles.intro}>
          {intro}
        </Text>
      </header>

      {groups.length > 1 ? (
        <div className={styles.toolbar}>
          <nav className={styles.years} aria-label={indexLabel}>
            <ol className={styles.yearsList}>
              {groups.map((group) => (
                <li key={group.key}>
                  <a
                    className={styles.yearLink}
                    href={`#trigger-${groupId(group.key)}`}
                    onClick={() => openGroup(groupId(group.key))}
                  >
                    {group.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setOpenIds(allOpen ? [] : allIds)}
          >
            {allOpen
              ? t("studioLogCollapseAll", "Collapse all")
              : t("studioLogExpandAll", "Expand all")}
          </Button>
        </div>
      ) : null}

      <Accordion
        type="multiple"
        variant="divided"
        className={styles.log}
        openIds={openIds}
        onOpenChange={setOpenIds}
        items={groups.map((group) => ({
          id: groupId(group.key),
          title: group.label,
          content: (
            <ol className={styles.list}>
              {group.entries.map((entry) => (
                <li key={`${entry.date}-${entry.text}`} className={styles.item}>
                  <time dateTime={entry.date} className={styles.date}>
                    {formatLogDate(entry.date)}
                  </time>
                  <span className={styles.text}>
                    <span lang="en">
                      {entry.href ? (
                        <DtLink underline="hover" href={entry.href}>
                          {entry.text}
                        </DtLink>
                      ) : (
                        entry.text
                      )}
                    </span>
                    {entry.tag ? <span className={styles.tag}>{entry.tag}</span> : null}
                    {entry.upcoming ? (
                      <span className={styles.upcoming}>
                        {t("studioLogUpcoming", "Upcoming")}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>
          ),
        }))}
      />
    </article>
  );
}

DatedLog.displayName = "DatedLog";
