"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Title } from "@digitaltableteur/react";

import styles from "./CookiePolicy.module.css";

export function CookiePolicyPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.policyPage}>
      <Title level={1}>{t("cookiePolicyTitle")}</Title>
      <p>{t("cookiePolicyP1")}</p>
      <p>{t("cookiePolicyP2")}</p>
      <p>{t("cookiePolicyP3")}</p>
      <p>{t("cookiePolicyP4")}</p>
      <Title level={2}>{t("cookiePolicyCategoriesTitle")}</Title>
      <ul>
        <li>{t("cookiePolicyCategoryEssential")}</li>
        <li>{t("cookiePolicyCategoryAnalytics")}</li>
        <li>{t("cookiePolicyCategoryFunctional")}</li>
        <li>{t("cookiePolicyCategoryMarketing")}</li>
      </ul>
      <Title level={2}>{t("cookiePolicyConsentTitle")}</Title>
      <p>{t("cookiePolicyConsentBody")}</p>
      <p>
        {t("cookiePolicyAiReference")}{" "}
        <a href="/ai-use">{t("cookiePolicyAiLinkText")}</a>.
      </p>
    </div>
  );
}
