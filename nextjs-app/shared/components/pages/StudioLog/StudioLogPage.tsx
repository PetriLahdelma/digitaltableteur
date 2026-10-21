"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { STUDIO_LOG, type StudioLogEntry } from "../../../data/studio-log";
import { DatedLog, groupLog } from "./DatedLog";

/** /timeline: the career and studio history, one collapsible row per year. */
export function StudioLogPage({
  entries = STUDIO_LOG,
}: {
  entries?: StudioLogEntry[];
}) {
  const { t } = useTranslation();
  return (
    <DatedLog
      title={t("studioLogTitle", "Timeline")}
      intro={t(
        "studioLogIntro",
        "Every dated event since 2002: roles, client work, launches, writing and talks. Linked lines lead to their proof: the case study, the article or the release.",
      )}
      indexLabel={t("studioLogYears", "Years")}
      groups={groupLog(entries, "year")}
    />
  );
}

StudioLogPage.displayName = "StudioLogPage";
