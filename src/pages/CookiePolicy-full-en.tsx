import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { CookiePolicyFullEnPage } from "../../shared/components/pages/CookiePolicy";

const CookiePolicyFullEN = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <HelmetProvider>
      <>
        <Helmet>
          <title>{`${t("cookiePolicyMetaTitle")} – Full`}</title>
          <meta name="description" content={t("cookiePolicyMetaDescription")} />
        </Helmet>
        <CookiePolicyFullEnPage onBack={() => navigate("/")} />
      </>
    </HelmetProvider>
  );
};

export default CookiePolicyFullEN;
