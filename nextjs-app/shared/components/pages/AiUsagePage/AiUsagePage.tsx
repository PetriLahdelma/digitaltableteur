"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import List from "@dt/List";
import Text from "@dt/Text";
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
      <Text as="p" size="xs">{t("aiPolicyIntro")}</Text>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyPrinciplesTitle")}
        </Title>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={principles.map((key) => emphasiseLeadingLabel(t(key)))}
        />
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyUseCasesTitle")}
        </Title>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={useCases.map((key) => emphasiseLeadingLabel(t(key)))}
        />
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyNotUsedTitle")}
        </Title>
        <Text as="p" size="xs">{t("aiPolicyNotUsedBody")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyProvidersTitle")}
        </Title>
        <Text as="p" size="xs">{t("aiPolicyProvidersIntro")}</Text>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={providers.map((key) => emphasiseLeadingLabel(t(key)))}
        />
        <Text as="p" size="xs">{t("aiPolicyProvidersFooter")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyDataTitle")}
        </Title>
        <Text as="p" size="xs">{t("aiPolicyDataIntro")}</Text>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={dataItems.map((key) => emphasiseLeadingLabel(t(key)))}
        />
        <Text as="p" size="xs">{t("aiPolicyDataFooter")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicySafeguardsTitle")}
        </Title>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={safeguards.map((key) => emphasiseLeadingLabel(t(key)))}
        />
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyLimitationsTitle")}
        </Title>
        <Text as="p" size="xs">{t("aiPolicyLimitationsBody")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyRightsTitle")}
        </Title>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={rights.map((key) => emphasiseLeadingLabel(t(key)))}
        />
        <Text as="p" size="xs">
          {renderEmailLink(
            t("aiPolicyRightsFooter"),
            "mail@digitaltableteur.com",
          )}
        </Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyChangesTitle")}
        </Title>
        <Text as="p" size="xs">{t("aiPolicyChangesBody")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("aiPolicyContactTitle")}
        </Title>
        <Text as="p" size="xs">
          {renderContactLinks(
            t("aiPolicyContactBody"),
            "mail@digitaltableteur.com",
            "+358 45 657 4469",
          )}
        </Text>
      </section>
    </div>
  );
}
