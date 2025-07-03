import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "./Contact.module.css";
import ContactForm from "../components/Contact Form/ContactForm";
import Title from "../components/Title/Title";
import Text from "../components/Text/Text";
import Link from "../components/Link/Link";
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
          <meta property="og:description" content={t("contactMetaDescription")} />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={t("contactMetaTitle")} />
          <meta name="twitter:description" content={t("contactMetaDescription")} />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
      </HelmetProvider>
      <div className={styles.contact}>
        <Title size="L">{t("contactHeroTitle")}</Title>
        <Text className={styles.contactFormTitle}>{t("contactFormTitle")}</Text>
        <Text className={styles.contactInfo}>{t("contactInfo")}</Text>
        <Link href="mailto:mail@digitaltableteur.com">
          mail@digitaltableteur.com
        </Link>
        <ContactForm />
      </div>
    </>
  );
};

export default Contact;
