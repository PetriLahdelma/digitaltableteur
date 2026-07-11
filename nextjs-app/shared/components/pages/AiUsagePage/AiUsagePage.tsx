"use client";

import React from "react";
import { useTranslation } from "react-i18next";

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
      <a href={`mailto:${email}`} className={styles.emailLink}>
        {email}
      </a>
      {after}
    </>
  );
};

const renderContactLinks = (text: string, email: string, phone: string) => {
  // Split by email first
  const emailParts = text.split(email);
  if (emailParts.length !== 2) return text;

  const [beforeEmail, afterEmail] = emailParts;

  // Split the afterEmail part by phone
  const phoneParts = afterEmail.split(phone);
  if (phoneParts.length !== 2) {
    // Phone not found, just render email
    return (
      <>
        {beforeEmail}
        <a href={`mailto:${email}`} className={styles.emailLink}>
          {email}
        </a>
        {afterEmail}
      </>
    );
  }

  const [betweenEmailPhone, afterPhone] = phoneParts;
  return (
    <>
      {beforeEmail}
      <a href={`mailto:${email}`} className={styles.emailLink}>
        {email}
      </a>
      {betweenEmailPhone}
      <a href={`tel:${phone.replace(/\s/g, "")}`} className={styles.emailLink}>
        {phone}
      </a>
      {afterPhone}
    </>
  );
};

export function AiUsagePage() {
  const { t } = useTranslation();

  const principles = [
    "aiPolicyPrincipleHuman",
    "aiPolicyPrincipleTransparency",
    "aiPolicyPrinciplePrivacy",
    "aiPolicyPrincipleQuality",
  ];

  const useCases = [
    "aiPolicyUseCaseDesign",
    "aiPolicyUseCaseContent",
    "aiPolicyUseCaseCode",
    "aiPolicyUseCaseOperations",
    "aiPolicyUseCaseChat",
  ];

  const providers = [
    "aiPolicyProviderOpenAI",
    "aiPolicyProviderGitHub",
    "aiPolicyProviderAnthropic",
  ];

  const dataItems = [
    "aiPolicyDataItem1",
    "aiPolicyDataItem2",
    "aiPolicyDataItem3",
    "aiPolicyDataItem4",
  ];

  const safeguards = [
    "aiPolicySafeguardHumanReview",
    "aiPolicySafeguardDataMinimisation",
    "aiPolicySafeguardVendorReview",
    "aiPolicySafeguardMonitoring",
    "aiPolicySafeguardTraining",
  ];

  const rights = [
    "aiPolicyRightInformation",
    "aiPolicyRightObjection",
    "aiPolicyRightErasure",
    "aiPolicyRightHumanReview",
  ];

  return (
    <div className={styles.policyPage}>
      <Title level={1} size="xs">
        {t("aiPolicyHeading")}
      </Title>
      <p>{t("aiPolicyIntro")}</p>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyPrinciplesTitle")}
        </Title>
        <ul>
          {principles.map((key) => {
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
        <Title level={2} size="xxs">
          {t("aiPolicyUseCasesTitle")}
        </Title>
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
        <Title level={2} size="xxs">
          {t("aiPolicyNotUsedTitle")}
        </Title>
        <p>{t("aiPolicyNotUsedBody")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyProvidersTitle")}
        </Title>
        <p>{t("aiPolicyProvidersIntro")}</p>
        <ul>
          {providers.map((key) => {
            const content = t(key);
            return (
              <li key={key}>
                <p>{emphasiseLeadingLabel(content)}</p>
              </li>
            );
          })}
        </ul>
        <p>{t("aiPolicyProvidersFooter")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyDataTitle")}
        </Title>
        <p>{t("aiPolicyDataIntro")}</p>
        <ul>
          {dataItems.map((key) => {
            const content = t(key);
            return (
              <li key={key}>
                <p>{emphasiseLeadingLabel(content)}</p>
              </li>
            );
          })}
        </ul>
        <p>{t("aiPolicyDataFooter")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicySafeguardsTitle")}
        </Title>
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
        <Title level={2} size="xxs">
          {t("aiPolicyLimitationsTitle")}
        </Title>
        <p>{t("aiPolicyLimitationsBody")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyRightsTitle")}
        </Title>
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

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyChangesTitle")}
        </Title>
        <p>{t("aiPolicyChangesBody")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyContactTitle")}
        </Title>
        <p>
          {renderContactLinks(
            t("aiPolicyContactBody"),
            "mail@digitaltableteur.com",
            "+358 45 657 4469",
          )}
        </p>
      </section>
    </div>
  );
}
