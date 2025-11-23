import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";

import { AboutPage } from "../../shared/components/pages/AboutPage";

const About = () => {
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <>
        <Helmet>
          <title>{t("aboutMetaTitle")}</title>
          <meta name="description" content={t("aboutMetaDescription")} />
          <meta property="og:title" content={t("aboutMetaTitle")} />
          <meta property="og:description" content={t("aboutMetaDescription")} />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={t("aboutMetaTitle")} />
          <meta
            name="twitter:description"
            content={t("aboutMetaDescription")}
          />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
        <AboutPage />
      </>
    </HelmetProvider>
  );
};

export default About;
