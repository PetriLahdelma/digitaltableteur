"use client";

import { Button, Text, Title } from "@digitaltableteur/react";
import {
  getEngagementBySlug,
  getEngagementPath,
} from "@/nextjs-app/shared/data/engagements";
import { useTranslation } from "react-i18next";
import styles from "./ArticleOfferBlock.module.css";

/**
 * Closing block that turns an article into its engagement: the package the
 * post leads to (frontmatter `engagement`), its price and duration, and a
 * booking link. Copy comes from the same keys as the offer page.
 */
export function ArticleOfferBlock({ engagementSlug }: { engagementSlug?: string }) {
  const { t } = useTranslation();
  const engagement = engagementSlug ? getEngagementBySlug(engagementSlug) : undefined;
  if (!engagement) return null;

  const name = t(engagement.nameKey);
  const meta = [t(engagement.priceKey), t(engagement.durationKey)]
    .filter(Boolean)
    .join(", ");

  return (
    <aside className={styles.offer} aria-labelledby="article-offer-title">
      <Text as="p" size="s" className={styles.eyebrow}>
        {t("articleOfferEyebrow", "Put this into practice")}
      </Text>
      <Title level={2} size="xs" id="article-offer-title" className={styles.title}>
        {name}
      </Title>
      <Text as="p" size="m" className={styles.body}>
        {t(`engagementPages.${engagement.id}.metaDescription`)}
      </Text>
      <Text as="p" size="s" className={styles.meta}>
        {meta}
      </Text>
      <div className={styles.actions}>
        <Button href={engagement.primaryHref} variant="primary" size="md">
          {t("articleOfferBook", "Book a 30-minute call")}
        </Button>
        <Button href={getEngagementPath(engagement)} variant="secondary" size="md">
          {t("articleOfferDetails", { name, defaultValue: "About {{name}}" })}
        </Button>
      </div>
    </aside>
  );
}
