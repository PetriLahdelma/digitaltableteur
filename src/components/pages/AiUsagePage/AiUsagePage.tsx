"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import Button from "@dt/Button";
import Icon from "@dt/Icon";
import Title from "@dt/Title";
import styles from "./AiUsagePage.module.css";

const delimiter = " – ";

const emphasiseLeadingLabel = (text: string) => {
  const delimiterIndex = text.indexOf(delimiter);
  if (delimiterIndex === -1) {
    return <strong>{text}</strong>;
  }
  const label = text.slice(0, delimiterIndex);
  const remainder = text.slice(delimiterIndex + delimiter.length);
  return (
    <>
      <strong>{label}</strong>
      {delimiter}
      {remainder}
    </>
  );
};

const renderEmailLink = (text: string, email: string) => {
  if (!text.includes(email)) {
    return text;
  }
  const [before, after = ""] = text.split(email);
  return (
    <>
      {before}
      <a href={`mailto:${email}`}>{email}</a>
      {after}
    </>
  );
};

export function AiUsagePage({ onBack }: { onBack?: () => void }) {
  const { t } = useTranslation();

  const useCases = [
    "aiPolicyUseCaseDesign",
    "aiPolicyUseCaseContent",
    "aiPolicyUseCaseOperations",
  ];

  const safeguards = [
    "aiPolicySafeguardHumanReview",
    "aiPolicySafeguardDataMinimisation",
    "aiPolicySafeguardVendorReview",
  ];

  const rights = [
    "aiPolicyRightInformation",
    "aiPolicyRightObjection",
    "aiPolicyRightErasure",
  ];

  return (
    <div className={styles.policyPage}>
      {onBack ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <Button variant="secondary" size="m" onClick={onBack}>
            <Icon
              name="arrow-left"
              ariaLabel="Back"
              style={{ marginInlineEnd: 8 }}
            />
            Back
          </Button>
        </div>
      ) : null}

      <Title level={1}>{t("aiPolicyHeading")}</Title>
      <p>{t("aiPolicyIntro")}</p>

      <section>
        <Title level={2}>{t("aiPolicyUseCasesTitle")}</Title>
        <ul>
          {useCases.map((key) => {
            const content = t(key);
            return (
              <li key={key}>
                <p>{emphasiseLeadingLabel(content)}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <Title level={2}>{t("aiPolicyDataTitle")}</Title>
        <p>{t("aiPolicyDataBody")}</p>
      </section>

      <section>
        <Title level={2}>{t("aiPolicySafeguardsTitle")}</Title>
        <ul>
          {safeguards.map((key) => {
            const content = t(key);
            return (
              <li key={key}>
                <p>{emphasiseLeadingLabel(content)}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <Title level={2}>{t("aiPolicyRightsTitle")}</Title>
        <ul>
          {rights.map((key) => {
            const content = t(key);
            return (
              <li key={key}>
                <p>{emphasiseLeadingLabel(content)}</p>
              </li>
            );
          })}
        </ul>
        <p>
          {renderEmailLink(
            t("aiPolicyRightsFooter"),
            "mail@digitaltableteur.com",
          )}
        </p>
      </section>
    </div>
  );
}
