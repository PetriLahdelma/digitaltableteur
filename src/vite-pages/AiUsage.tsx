import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { AiUsagePage } from "../../shared/components/pages/AiUsagePage";

const AiUsage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <HelmetProvider>
      <>
        <Helmet>
          <title>{t("aiPolicyMetaTitle")}</title>
          <meta name="description" content={t("aiPolicyMetaDescription")} />
        </Helmet>
        <AiUsagePage onBack={() => navigate("/")} />
      </>
    </HelmetProvider>
  );
};

export default AiUsage;
