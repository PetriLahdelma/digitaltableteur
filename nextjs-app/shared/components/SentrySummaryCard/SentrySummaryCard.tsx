/** Props for SentrySummaryCard. */
export interface SentrySummaryCardProps { className?: string }

import React, { useEffect, useState } from "react";
import Card from "@dt/Card";
import Text from "@dt/Text";
import styles from "./SentrySummaryCard.module.css";
import { useTranslate } from "../../lib/translation";

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

/**
 * SentrySummaryCard component.
 */
export const SentrySummaryCard: React.FC<Props> = ({
  className,
  maxIssues = 10,
  showEnvironment = true,
  dataOverride = null,
  forceLoading = false,
  forceError = false,
}) => {
  const t = useTranslate();
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

  if (forceLoading) {
    return (
      <Card
        title={t("observability.sentry.title", "Sentry Issues")}
        loading
        className={className}
      />
    );
  }

  if (forceError) {
    return (
      <Card
        title={t("observability.sentry.title", "Sentry Issues")}
        className={className}
      >
        <p className={styles.error} role="alert">
          {t("observability.sentry.error.fetch", "Failed to load Sentry data")}
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card
        title={t("observability.sentry.title", "Sentry Issues")}
        loading
        className={className}
      />
    );
  }

  if (error) {
    return (
      <Card
        title={t("observability.sentry.title", "Sentry Issues")}
        className={className}
      >
        <Text className={styles.error} role="alert">
          {t("observability.sentry.error.fetch", "Failed to load Sentry data")}
        </Text>
      </Card>
    );
  }

  if (!data || data.issues.length === 0) {
    const extraContent = data?.stub ? (
      <span
        className={styles.stubBadge}
        aria-label={t("observability.sentry.stubBadge", "Stub data")}
      >
        {t("observability.sentry.stubBadge", "Stub data")}
      </span>
    ) : (
      <span className={styles.count}>0</span>
    );

    return (
      <Card
        title={t("observability.sentry.title", "Sentry Issues")}
        extra={extraContent}
        variant={data?.stub ? "muted" : "default"}
        className={className}
      >
        <Text>{t("observability.sentry.empty", "No matching issues")}</Text>
      </Card>
    );
  }

  const issues = data.issues.slice(0, maxIssues);

  const extraContent = data?.stub ? (
    <span
      className={styles.stubBadge}
      aria-label={t("observability.sentry.stubBadge", "Stub data")}
    >
      {t("observability.sentry.stubBadge", "Stub data")}
    </span>
  ) : (
    <span className={styles.count}>{data?.count}</span>
  );

  const cardContent =
    data?.count === 0 || !data ? (
      <div className={styles.empty}>
        <Text>{t("observability.sentry.empty", "No matching issues")}</Text>
      </div>
    ) : (
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
    );

  return (
    <Card
      title={t("observability.sentry.title", "Sentry Issues")}
      extra={extraContent}
      variant={data?.stub ? "muted" : "default"}
      className={className}
    >
      {cardContent}
    </Card>
  );
};

export default SentrySummaryCard;
