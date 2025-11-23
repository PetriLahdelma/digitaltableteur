import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { CookiePolicyFullSvPage } from "../../shared/components/pages/CookiePolicy";

const CookiePolicyFullSV = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <HelmetProvider>
      <>
        <Helmet>
          <title>{`${t("cookiePolicyMetaTitle")} – Fullständig version`}</title>
          <meta name="description" content={t("cookiePolicyMetaDescription")} />
        </Helmet>
        <CookiePolicyFullSvPage onBack={() => navigate("/")} />
      </>
    </HelmetProvider>
  );
};

export default CookiePolicyFullSV;
