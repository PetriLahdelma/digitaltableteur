"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { Text, Title } from "@digitaltableteur/react";
import DtLink from "../../Link";
import { STUDIO_LOG, type StudioLogEntry } from "../../../data/studio-log";
import styles from "./StudioLogPage.module.css";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-10-17" → "17 Oct", "2026-10" → "Oct", "2026" → "". The entry lines
 *  are English, so the label is too. */
export function formatLogDate(date: string): string {
  const [, month, day] = date.split("-");
  if (!month) return "";
  const name = MONTHS[Number(month) - 1] ?? "";
  return day ? `${Number(day)} ${name}` : name;
}

function groupByYear(entries: StudioLogEntry[]) {
  const groups: { year: string; entries: StudioLogEntry[] }[] = [];
  for (const entry of entries) {
    const year = entry.date.slice(0, 4);
    const last = groups.at(-1);
    if (last?.year === year) last.entries.push(entry);
    else groups.push({ year, entries: [entry] });
  }
  return groups;
}

export function StudioLogPage({
  entries = STUDIO_LOG,
}: {
  entries?: StudioLogEntry[];
}) {
  const { t } = useTranslation();
  const groups = groupByYear(entries);

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <Title level={1}>{t("studioLogTitle", "Changelog")}</Title>
        <Text as="p" className={styles.intro}>
          {t(
            "studioLogIntro",
            "Every dated event since day one, each linked to its proof: the case study, the article or the release.",
          )}
        </Text>
      </header>

      {groups.map((group) => (
        <section
          key={group.year}
          className={styles.year}
          aria-labelledby={`log-${group.year}`}
        >
          <Title level={2} id={`log-${group.year}`} className={styles.yearTitle}>
            {group.year}
          </Title>
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
                  {entry.upcoming ? (
                    <span className={styles.upcoming}>
                      {t("studioLogUpcoming", "Upcoming")}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </article>
  );
}

StudioLogPage.displayName = "StudioLogPage";
