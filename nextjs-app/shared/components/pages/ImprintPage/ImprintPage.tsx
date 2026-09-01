"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { Icon, Title } from "@digitaltableteur/react";
import DtLink from "../../Link";
import { IconButton } from "../../IconButton";
import { VisuallyHidden } from "../../VisuallyHidden";
import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard";
import styles from "./ImprintPage.module.css";

export function ImprintPage() {
  const { t } = useTranslation();
  const { copiedKey, copy } = useCopyToClipboard();

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
    // E-invoicing route. This page is the register of company facts and
    // already lists the Business ID and VAT ID, so the invoicing identifiers
    // belong in the same list. They read from the same keys /pricing uses, so
    // the two pages cannot drift.
    // Identifiers keyed into an AP system, so they carry a copy control. The
    // operator is a company name and gets none, matching /pricing.
    {
      label: t("footerBillingEInvoiceLabel"),
      value: t("footerBillingEInvoice"),
      copyKey: "footerBillingEInvoice",
    },
    {
      label: t("footerBillingOperatorLabel"),
      value: t("footerBillingOperator"),
    },
    {
      label: t("footerBillingOperatorIdLabel"),
      value: t("footerBillingOperatorId"),
      copyKey: "footerBillingOperatorId",
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
          {imprintRows.map((row) => {
            const copied = Boolean(row.copyKey) && copiedKey === row.copyKey;
            return (
              <div key={row.label} className={styles.row}>
                <p className={styles.term}>{row.label}</p>
                {row.href ? (
                  <p className={styles.value}>
                    <DtLink href={row.href} underline="always">
                      {row.value}
                    </DtLink>
                  </p>
                ) : (
                  <p className={styles.value}>
                    <span className={styles.valueText}>{row.value}</span>
                    {row.copyKey ? (
                      <IconButton
                        size="sm"
                        variant="tertiary"
                        className={styles.copyControl}
                        onClick={() => copy(row.copyKey!, row.value)}
                        label={
                          copied
                            ? t("pricingBillingCopied")
                            : t("pricingBillingCopy", { field: row.label })
                        }
                        icon={
                          <Icon
                            name={copied ? "check-fat" : "copy-simple"}
                            size="sm"
                            decorative
                          />
                        }
                      />
                    ) : null}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* The icon swap and relabelled button are visual-only signals. */}
        <div aria-live="polite">
          <VisuallyHidden>
            {copiedKey ? t("pricingBillingCopied") : ""}
          </VisuallyHidden>
        </div>
      </section>
    </div>
  );
}
