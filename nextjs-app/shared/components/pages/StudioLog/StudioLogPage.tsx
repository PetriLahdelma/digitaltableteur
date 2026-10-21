"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { Accordion, Button, Text, Title } from "@digitaltableteur/react";
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

/** Accordion item id for a year; the trigger renders as `trigger-${id}`, which
 *  the year index links to. */
const yearId = (year: string) => `log-${year}`;

export function StudioLogPage({
  entries = STUDIO_LOG,
}: {
  entries?: StudioLogEntry[];
}) {
  const { t } = useTranslation();
  const groups = groupByYear(entries);
  const allIds = groups.map((group) => yearId(group.year));

  // Newest year open; the rest collapse so two decades stay navigable.
  const [openIds, setOpenIds] = React.useState<string[]>(allIds.slice(0, 1));
  const allOpen = openIds.length === allIds.length;

  const openYear = (id: string) =>
    setOpenIds((current) => (current.includes(id) ? current : [...current, id]));

  // A shared link (/changelog#trigger-log-2014) opens its year on arrival.
  React.useEffect(() => {
    const match = window.location.hash.match(/^#(?:trigger-)?(log-\d{4})$/);
    if (match) openYear(match[1]);
  }, []);

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <Title level={1}>{t("studioLogTitle", "Changelog")}</Title>
        <Text as="p" className={styles.intro}>
          {t(
            "studioLogIntro",
            "Every dated event since 2002: roles, client work, launches, writing and talks. Linked lines lead to their proof: the case study, the article or the release.",
          )}
        </Text>
      </header>

      {groups.length > 1 ? (
        <div className={styles.toolbar}>
          <nav className={styles.years} aria-label={t("studioLogYears", "Years")}>
            <ol className={styles.yearsList}>
              {groups.map((group) => (
                <li key={group.year}>
                  <a
                    className={styles.yearLink}
                    href={`#trigger-${yearId(group.year)}`}
                    onClick={() => openYear(yearId(group.year))}
                  >
                    {group.year}
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
          id: yearId(group.year),
          title: group.year,
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

StudioLogPage.displayName = "StudioLogPage";
