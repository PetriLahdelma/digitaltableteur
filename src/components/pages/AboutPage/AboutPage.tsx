"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import PageLayout from "../../../patterns/PageLayout/PageLayout";
import Text from "@dt/Text";
import Title from "@dt/Title";
import styles from "./AboutPage.module.css";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.about}>
      <PageLayout maxWidth="xl" spacing="comfortable" as="section">
        <section className={styles.who}>
          <Title size="L" level={2}>
            {t("aboutWhoTitle")}
          </Title>
        </section>
      </PageLayout>

      <PageLayout
        maxWidth="full"
        withMargins={false}
        spacing="compact"
        as="section"
      >
        <section className={styles.what}>
          <Title size="L" level={1}>
            {t("aboutHeroTitle")}
          </Title>
          <Text size="L">{t("aboutHeroText")}</Text>
        </section>
      </PageLayout>

      <PageLayout maxWidth="sm" spacing="spacious" as="section">
        <section className={styles.section}>
          <Title size="M" level={2}>
            {t("aboutDesignTitle")}
          </Title>
          <Text>{t("aboutDesignText")}</Text>
        </section>
      </PageLayout>

      <PageLayout maxWidth="sm" spacing="comfortable" as="section">
        <section className={styles.section}>
          <Title size="M" level={2}>
            {t("aboutDevelopmentTitle")}
          </Title>
          <Text>{t("aboutDevelopmentText")}</Text>
        </section>
      </PageLayout>

      <PageLayout maxWidth="sm" spacing="comfortable" as="section">
        <section className={styles.section}>
          <Title size="M" level={2}>
            {t("aboutCollaborationTitle")}
          </Title>
          <Text>{t("aboutCollaborationText")}</Text>
        </section>
      </PageLayout>
    </div>
  );
}
