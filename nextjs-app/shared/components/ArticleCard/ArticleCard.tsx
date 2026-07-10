import React from "react";
import { useTranslate } from "../../lib/translation";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Skeleton from "@dt/Skeleton";
import styles from "./ArticleCard.module.css";

export interface ArticleCardProps {
  title: string;
  lead?: string;
  link: string;
  readTime?: string;
  className?: string;
  /** Show skeleton placeholders while content is loading */
  loading?: boolean;
}

/**
 * ArticleCard component.
 */
export const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  lead,
  link,
  readTime,
  className = "",
  loading = false,
}) => {
  const t = useTranslate();

  if (loading) {
    return (
      <div
        className={`${styles.card} ${styles.loading} ${className}`.trim()}
        aria-busy="true"
        role="status"
      >
        <Skeleton
          variant="text"
          lines={2}
          className={styles.titleSkeleton}
          label={t("articleCard.loadingTitle")}
        />
        <Skeleton
          variant="text"
          lines={3}
          className={styles.leadSkeleton}
          label={t("articleCard.loadingLead")}
        />
        <div className={styles.meta}>
          <Skeleton
            variant="text"
            width="40%"
            lines={1}
            label={t("articleCard.loadingMeta")}
          />
          <Skeleton
            variant="text"
            width="24%"
            lines={1}
            label={t("articleCard.loadingMeta")}
          />
        </div>
      </div>
    );
  }

  let readTimeDisplay = readTime;
  if (readTime) {
    const match = readTime.match(/^(\d+)\s*(min)\s*(read)$/i);
    if (match) {
      readTimeDisplay = `${match[1]} min ${t("blogRead")}`;
    }
  }
  return (
    <a href={link} className={`${styles.card} ${className}`.trim()}>
      <Title level={2} size="s" className={styles.title}>
        {title}
      </Title>
      {lead ? (
        <Text as="p" className={styles.lead}>
          {lead}
        </Text>
      ) : null}
      <div className={styles.meta}>
        {readTimeDisplay && (
          <Text as="span" className={styles.readTime}>
            {readTimeDisplay}
          </Text>
        )}
        <Text as="span" className={styles.readMore}>
          {t("blogReadMore")}
        </Text>
      </div>
    </a>
  );
};

export default ArticleCard;
