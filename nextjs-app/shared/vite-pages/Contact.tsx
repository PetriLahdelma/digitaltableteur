import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";

import { ContactPage } from "../../shared/components/pages/ContactPage";

const Contact = () => {
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <>
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
        <ContactPage />
      </>
    </HelmetProvider>
  );
};

export default Contact;
