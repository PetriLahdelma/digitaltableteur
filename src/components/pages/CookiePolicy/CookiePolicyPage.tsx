"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./CookiePolicy.module.css";

export function CookiePolicyPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.policyPage}>
      <h1>{t("cookiePolicyTitle")}</h1>
      <p>{t("cookiePolicyP1")}</p>
      <p>{t("cookiePolicyP2")}</p>
      <p>{t("cookiePolicyP3")}</p>
      <p>{t("cookiePolicyP4")}</p>
      <h2>{t("cookiePolicyCategoriesTitle")}</h2>
      <ul>
        <li>{t("cookiePolicyCategoryEssential")}</li>
        <li>{t("cookiePolicyCategoryAnalytics")}</li>
        <li>{t("cookiePolicyCategoryFunctional")}</li>
        <li>{t("cookiePolicyCategoryMarketing")}</li>
      </ul>
      <h2>{t("cookiePolicyConsentTitle")}</h2>
      <p>{t("cookiePolicyConsentBody")}</p>
      <p>
        {t("cookiePolicyAiReference")}{" "}
        <a href="/ai-use">{t("cookiePolicyAiLinkText")}</a>.
      </p>
    </div>
  );
}
