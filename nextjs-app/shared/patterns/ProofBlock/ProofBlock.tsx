import React from "react";
import PageLayout from "../PageLayout";
import { Text, Title } from "@digitaltableteur/react";
import styles from "./ProofBlock.module.css";

export type ProofMetric = {
  value: string;
  label: string;
  detail?: string;
};

export interface ProofBlockProps {
  /** Accessible name for the proof section landmark. */
  ariaLabel?: string;
  /** Section heading. */
  title: string;
  /** Supporting line under the title. */
  subTitle?: string;
  /** Small print under the metrics (source, timeframe). */
  caption?: string;
  /** Proof metrics: value + label pairs. */
  metrics: ProofMetric[];
  /** Reduce the band vertical padding. */
  tight?: boolean;
  /** Render on the dark band treatment. */
  dark?: boolean;
  /** Additional CSS classes on the section. */
  className?: string;
}

/**
 * ProofBlock component.
 */
export const ProofBlock: React.FC<ProofBlockProps> = ({
  ariaLabel,
  title,
  subTitle,
  caption,
  metrics,
  tight = false,
  dark = false,
  className,
}) => {
  const gridClass =
    `${styles.metricsGrid} ${tight ? styles.metricsGridTight : ""}`.trim();
  return (
    <section
      className={`${styles.metricsBand} ${className || ""}`.trim()}
      aria-label={ariaLabel || title}
    >
      <PageLayout maxWidth="lg" spacing="comfortable" withMargins={false}>
        <div className={styles.metricsHeader}>
          <div>
            <Title level={2} unstyled className={styles.metricsTitle}>
              {title}
            </Title>
            {subTitle && (
              <Text size="m" className={styles.metricsSubtitle}>
                {subTitle}
              </Text>
            )}
          </div>
          {caption && (
            <Text size="s" className={styles.metricsCaption}>
              {caption}
            </Text>
          )}
        </div>
        <div className={gridClass}>
          {metrics.map((metric) => (
            <div
              className={`${styles.metricCard} ${dark ? styles.metricCardDark : ""}`.trim()}
              key={`${metric.label}-${metric.value}`}
            >
              <Title level={3} unstyled className={styles.metricValue}>
                {metric.value}
              </Title>
              <Text size="s" className={styles.metricLabel}>
                {metric.label}
              </Text>
              {metric.detail && (
                <Text size="s" className={styles.metricDetail}>
                  {metric.detail}
                </Text>
              )}
            </div>
          ))}
        </div>
      </PageLayout>
    </section>
  );
};

export default ProofBlock;
