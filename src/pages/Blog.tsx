import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";

import { BlogPage } from "../../shared/components/pages/Blog";

const Blog = () => {
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <>
        <Helmet>
          <title>{t("blogMetaTitle")}</title>
          <meta name="description" content={t("blogMetaDescription")} />
          <meta property="og:title" content={t("blogMetaTitle") as string} />
          <meta
            property="og:description"
            content={t("blogMetaDescription") as string}
          />
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={t("blogMetaTitle") as string} />
          <meta
            name="twitter:description"
            content={t("blogMetaDescription") as string}
          />
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
        <BlogPage />
      </>
    </HelmetProvider>
  );
};

export default Blog;
