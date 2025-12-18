import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { CookiePolicyFullFiPage } from "../../shared/components/pages/CookiePolicy";

const CookiePolicyFullFI = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <HelmetProvider>
      <>
        <Helmet>
          <title>{`${t("cookiePolicyMetaTitle")} – Täysi versio`}</title>
          <meta name="description" content={t("cookiePolicyMetaDescription")} />
        </Helmet>
        <CookiePolicyFullFiPage onBack={() => navigate("/")} />
      </>
    </HelmetProvider>
  );
};

export default CookiePolicyFullFI;
