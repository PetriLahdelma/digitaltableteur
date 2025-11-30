import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";

import { HomePage } from "../../shared/components/pages/Home/HomePage";

const Home = () => {
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <>
        <Helmet>
          <title>{t("homeMetaTitle")}</title>
          <meta name="description" content={t("homeMetaDescription")} />
          <meta property="og:title" content={t("homeMetaTitle")} />
          <meta property="og:description" content={t("homeMetaDescription")} />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={t("homeMetaTitle")} />
          <meta name="twitter:description" content={t("homeMetaDescription")} />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
        <HomePage />
      </>
    </HelmetProvider>
  );
};

export default Home;
