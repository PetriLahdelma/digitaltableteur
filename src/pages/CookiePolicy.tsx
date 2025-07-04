import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "./CookiePolicy.module.css";
import { useTranslation } from "react-i18next";

const CookiePolicy = () => {
  const { t } = useTranslation();
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t("cookiePolicyMetaTitle")}</title>
          <meta name="description" content={t("cookiePolicyMetaDescription")} />
          <meta
            property="og:title"
            content={t("cookiePolicyMetaTitle") as string}
          />
          <meta
            property="og:description"
            content={t("cookiePolicyMetaDescription") as string}
          />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content={t("cookiePolicyMetaTitle") as string}
          />
          <meta
            name="twitter:description"
            content={t("cookiePolicyMetaDescription") as string}
          />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
      </HelmetProvider>
      <div className={styles.policyPage}>
        <h1>{t("cookiePolicyTitle")}</h1>
        <p>{t("cookiePolicyP1")}</p>
        <p>{t("cookiePolicyP2")}</p>
        <p>{t("cookiePolicyP3")}</p>
      </div>
    </>
  );
};

export default CookiePolicy;
