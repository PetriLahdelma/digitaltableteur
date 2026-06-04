import React from "react";
import PageLayout from "../PageLayout";
import Title from "@dt/Title";
import Text from "@dt/Text";
import styles from "./ProofBlock.module.css";

export type ProofMetric = {
  value: string;
  label: string;
  detail?: string;
};

export interface ProofBlockProps {
  ariaLabel?: string;
  title: string;
  subTitle?: string;
  caption?: string;
  metrics: ProofMetric[];
  tight?: boolean;
  dark?: boolean;
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
              <Text size="M" terminals="sans" className={styles.metricsSubtitle}>
                {subTitle}
              </Text>
            )}
          </div>
          {caption && (
            <Text size="S" terminals="sans" className={styles.metricsCaption}>
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
              <Text size="S" className={styles.metricLabel}>
                {metric.label}
              </Text>
              {metric.detail && (
                <Text size="S" className={styles.metricDetail}>
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
