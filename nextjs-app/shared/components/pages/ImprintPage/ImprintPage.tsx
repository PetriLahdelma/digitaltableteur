"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { Title } from "@digitaltableteur/react";
import styles from "./ImprintPage.module.css";

export function ImprintPage() {
  const { t } = useTranslation();

  const imprintRows = [
    {
      label: t("imprintLegalBusinessNameLabel"),
      value: t("imprintLegalBusinessNameValue"),
    },
    {
      label: t("imprintBusinessFormLabel"),
      value: t("imprintBusinessFormValue"),
    },
    {
      label: t("imprintAddressLabel"),
      value: t("imprintAddressValue"),
    },
    {
      label: t("imprintEmailLabel"),
      value: t("imprintEmailValue"),
      href: "mailto:mail@digitaltableteur.com",
    },
    {
      label: t("imprintBusinessIdLabel"),
      value: t("imprintBusinessIdValue"),
    },
    {
      label: t("imprintVatIdLabel"),
      value: t("imprintVatIdValue"),
    },
  ];

  return (
    <div className={styles.page}>
      <Title level={1} size="xs">
        {t("imprintHeading")}
      </Title>
      <p>{t("imprintIntro")}</p>

      <section className={styles.section}>
        <div className={styles.details}>
          {imprintRows.map((row) => (
            <div key={row.label} className={styles.row}>
              <p className={styles.term}>{row.label}</p>
              {row.href ? (
                <p className={styles.value}>
                  <a href={row.href} className={styles.link}>
                    {row.value}
                  </a>
                </p>
              ) : (
                <p className={styles.value}>{row.value}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
