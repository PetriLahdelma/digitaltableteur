import React, { useEffect, useState } from "react";
import styles from "./SentrySummaryCard.module.css";
import { useTranslation } from "react-i18next";

export type SentryIssue = {
  id: string;
  title: string;
  culprit: string;
  level: string;
  userCount: number;
  status?: string;
  isUnhandled?: boolean;
  firstSeen: string;
  lastSeen: string;
  permalink: string;
  environment: string | null;
};

export interface SentrySummaryData {
  generatedAt: string;
  project: string;
  filters: { unresolved: boolean; environment: string | null };
  count: number;
  issues: SentryIssue[];
  /** Indicates the summary was generated in stub/fallback mode */
  stub?: boolean;
  /** Optional reason for stub (e.g., missing credentials, force-stub-flag) */
  reason?: string;
}

interface Props {
  className?: string;
  maxIssues?: number; // slice override
  showEnvironment?: boolean;
  dataOverride?: SentrySummaryData | null; // Provide data directly (Storybook/dashboard)
  /**
   * Force loading state for deterministic Storybook accessibility without triggering fetch side effects.
   */
  forceLoading?: boolean;
  /**
   * Force error state for deterministic Storybook accessibility without triggering fetch side effects.
   */
  forceError?: boolean;
}

const SentrySummaryCard: React.FC<Props> = ({
  className,
  maxIssues = 10,
  showEnvironment = true,
  dataOverride = null,
  forceLoading = false,
  forceError = false,
}) => {
  const { t } = useTranslation();
  const [data, setData] = useState<SentrySummaryData | null>(
    dataOverride ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!dataOverride);

  useEffect(() => {
    // Skip fetch if any deterministic override or direct data provided.
    if (dataOverride || forceLoading || forceError) return;
    let cancelled = false;
    fetch("/observability/sentry-summary.json", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("fetch-failed");
        return r.json();
      })
      .then((json: SentrySummaryData) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [dataOverride, forceLoading, forceError]);

  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  if (forceLoading) {
    return (
      <div className={rootClass} aria-busy="true">
        {t("observability.sentry.loading", "Loading Sentry summary...")}
      </div>
    );
  }

  if (forceError) {
    return (
      <div className={rootClass} role="alert">
        <p className={styles.error}>
          {t("observability.sentry.error.fetch", "Failed to load Sentry data")}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={rootClass} aria-busy="true">
        {t("observability.sentry.loading", "Loading Sentry summary...")}
      </div>
    );
  }

  if (error) {
    return (
      <div className={rootClass} role="alert">
        <p className={styles.error}>
          {t("observability.sentry.error.fetch", "Failed to load Sentry data")}
        </p>
      </div>
    );
  }

  if (!data || data.issues.length === 0) {
    return (
      <div
        className={rootClass}
        data-surface={data?.stub ? undefined : "elevated"}
      >
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h3>{t("observability.sentry.title", "Sentry Issues")}</h3>
            <span className={styles.count}>0</span>
          </div>
          {data?.stub && (
            <span
              className={styles.stubBadge}
              aria-label={t("observability.sentry.stubBadge", "Stub data")}
            >
              {t("observability.sentry.stubBadge", "Stub data")}
            </span>
          )}
        </div>
        <p className={styles.empty}>
          {t("observability.sentry.empty", "No matching issues")}
        </p>
      </div>
    );
  }

  const issues = data.issues.slice(0, maxIssues);

  return (
    <div
      className={rootClass}
      data-surface={data.stub ? undefined : "elevated"}
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3>{t("observability.sentry.title", "Sentry Issues")}</h3>
          <span className={styles.count}>{data.count}</span>
        </div>
        {data.stub && (
          <span
            className={styles.stubBadge}
            aria-label={t("observability.sentry.stubBadge", "Stub data")}
          >
            {t("observability.sentry.stubBadge", "Stub data")}
          </span>
        )}
      </div>
      <ul
        className={styles.issuesList}
        aria-label={t("observability.sentry.unresolvedHeading", "Issues")}
      >
        {issues.map((issue) => (
          <li key={issue.id} className={styles.issue}>
            <div className={styles.issueTitle}>{issue.title}</div>
            <div className={styles.meta}>
              <span>
                {t("observability.sentry.issue.status", "Status")}:{" "}
                {issue.status || "n/a"}
              </span>
              <span>
                {t("observability.sentry.issue.user", "Users")}
                {": "}
                {issue.userCount}
              </span>
              <span>
                {t("observability.sentry.issue.firstSeen", "First")}
                {": "}
                {new Date(issue.firstSeen).toLocaleDateString()}
              </span>
              <span>
                {t("observability.sentry.issue.lastSeen", "Last")}
                {": "}
                {new Date(issue.lastSeen).toLocaleDateString()}
              </span>
              {showEnvironment && issue.environment && (
                <span>env: {issue.environment}</span>
              )}
              <a
                href={issue.permalink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("observability.sentry.issue.open", "Open")}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SentrySummaryCard;
