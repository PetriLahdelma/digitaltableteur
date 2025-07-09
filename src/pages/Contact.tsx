import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "./Contact.module.css";
import ContactForm from "@dt/ContactForm";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Link from "@dt/Link";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t("contactMetaTitle")}</title>
          <meta name="description" content={t("contactMetaDescription")} />
          <meta property="og:title" content={t("contactMetaTitle")} />
          <meta
            property="og:description"
            content={t("contactMetaDescription")}
          />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={t("contactMetaTitle")} />
          <meta
            name="twitter:description"
            content={t("contactMetaDescription")}
          />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
      </HelmetProvider>
      <div className={styles.contact}>
        <Title size="L">{t("contactHeroTitle")}</Title>
        <Title level={2} size="S" className={styles.contactFormTitle}>
          {t("contactFormTitle")}
        </Title>
        <Text className={styles.contactInfo}>
          {t("contactInfo")}{" "}
          <Link size="S" href="mailto:mail@digitaltableteur.com">
            mail@digitaltableteur.com
          </Link>
        </Text>
        <ContactForm />
      </div>
    </>
  );
};

export default Contact;
