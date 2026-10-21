"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import {
  SITE_CHANGELOG,
  type SiteChangelogEntry,
} from "../../../data/site-changelog.generated";
import { DatedLog, groupLog } from "../StudioLog";

const REPO = "https://github.com/PetriLahdelma/digitaltableteur/commit/";

/** /changelog: what changed on this site, from git history, one collapsible
 *  row per month. Each line links to its commit. */
export function SiteChangelogPage({
  entries = SITE_CHANGELOG,
}: {
  entries?: SiteChangelogEntry[];
}) {
  const { t } = useTranslation();
  const lines = entries.map((entry) => ({
    date: entry.date,
    text: entry.text,
    href: `${REPO}${entry.sha}`,
    tag: entry.area,
  }));
  return (
    <DatedLog
      title={t("siteChangelogTitle", "Changelog")}
      intro={t(
        "siteChangelogIntro",
        "Every feature shipped on digitaltableteur.com and its design system, from git history. Each line links to its commit.",
      )}
      indexLabel={t("siteChangelogMonths", "Months")}
      groups={groupLog(lines, "month")}
    />
  );
}

SiteChangelogPage.displayName = "SiteChangelogPage";
