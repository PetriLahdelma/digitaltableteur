import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "./About.module.css";
import Title from "../components/Title/Title";
import Text from "../components/Text/Text";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  return (
    <HelmetProvider>
      <Helmet>
        <title>{t("aboutMetaTitle")}</title>
        <meta name="description" content={t("aboutMetaDescription")} />
        <meta property="og:title" content={t("aboutMetaTitle")}/>
        <meta property="og:description" content={t("aboutMetaDescription")}/>
        <meta property="og:image" content="/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t("aboutMetaTitle")}/>
        <meta name="twitter:description" content={t("aboutMetaDescription")}/>
        <meta name="twitter:image" content="/logo512.png" />
      </Helmet>
      <div className={styles.about}>
        <section className={styles.hero}>
          <Title size="L">{t("aboutHeroTitle")}</Title>
          <Text>{t("aboutHeroText")}</Text>
        </section>

        <section className={styles.section}>
          <Title size="M">{t("aboutDesignTitle")}</Title>
          <Text>{t("aboutDesignText")}</Text>
        </section>

        <section className={styles.section}>
          <Title size="M">{t("aboutDevelopmentTitle")}</Title>
          <Text>{t("aboutDevelopmentText")}</Text>
        </section>

        <section className={styles.section}>
          <Title size="M">{t("aboutCollaborationTitle")}</Title>
          <Text>{t("aboutCollaborationText")}</Text>
        </section>
      </div>
    </HelmetProvider>
  );
};

export default About;
