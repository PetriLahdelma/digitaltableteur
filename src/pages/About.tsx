import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "./About.module.css";
import Title from "@dt/Title";
import Text from "@dt/Text";
import { useTranslation } from "react-i18next";
import PageLayout from "../patterns/PageLayout/PageLayout";

const About = () => {
  const { t } = useTranslation();
  return (
    <HelmetProvider>
      <Helmet>
        <title>{t("aboutMetaTitle")}</title>
        <meta name="description" content={t("aboutMetaDescription")} />
        <meta property="og:title" content={t("aboutMetaTitle")} />
        <meta property="og:description" content={t("aboutMetaDescription")} />
        <meta property="og:image" content="/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t("aboutMetaTitle")} />
        <meta name="twitter:description" content={t("aboutMetaDescription")} />
        <meta name="twitter:image" content="/logo512.png" />
      </Helmet>
      <div
        className={styles.about}
        tabIndex={0}
        role="region"
        aria-label={t("aboutMetaTitle")}
      >
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

        <PageLayout maxWidth="lg" spacing="spacious" as="section">
          <section className={styles.section}>
            <Title size="M" level={2}>
              {t("aboutDesignTitle")}
            </Title>
            <Text>{t("aboutDesignText")}</Text>
          </section>
        </PageLayout>

        <PageLayout maxWidth="md" spacing="comfortable" as="section">
          <section className={styles.section}>
            <Title size="M" level={2}>
              {t("aboutDevelopmentTitle")}
            </Title>
            <Text>{t("aboutDevelopmentText")}</Text>
          </section>
        </PageLayout>

        <PageLayout maxWidth="lg" spacing="comfortable" as="section">
          <section className={styles.section}>
            <Title size="M" level={2}>
              {t("aboutCollaborationTitle")}
            </Title>
            <Text>{t("aboutCollaborationText")}</Text>
          </section>
        </PageLayout>
      </div>
    </HelmetProvider>
  );
};

export default About;
