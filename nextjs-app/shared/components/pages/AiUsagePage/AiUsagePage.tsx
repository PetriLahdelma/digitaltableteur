"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { Container } from "@dt/Container";
import Link from "@dt/Link";
import List from "@dt/List";
import { Section } from "@dt/Section";
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

const renderContactLinks = (text: string, email: string, phone?: string) => {
  // Split by email first
  const emailParts = text.split(email);
  if (emailParts.length !== 2) return text;

  const [beforeEmail, afterEmail] = emailParts;

  // Split the afterEmail part by phone (when given)
  const phoneParts = phone ? afterEmail.split(phone) : [afterEmail];
  if (!phone || phoneParts.length !== 2) {
    // Phone absent or not found, just render email
    return (
      <>
        {beforeEmail}
        <Link href={`mailto:${email}`} size="inherit">
          {email}
        </Link>
        {afterEmail}
      </>
    );
  }

  const [betweenEmailPhone, afterPhone] = phoneParts;
  return (
    <>
      {beforeEmail}
      <Link href={`mailto:${email}`} size="inherit">
        {email}
      </Link>
      {betweenEmailPhone}
      <Link href={`tel:${phone.replace(/\s/g, "")}`} size="inherit">
        {phone}
      </Link>
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
    <Container size="sm" className={styles.prosePage}>
      <Title level={1} size="xs">
        {t("aiPolicyHeading")}
      </Title>
      <Text as="p" size="xs">{t("aiPolicyIntro")}</Text>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("aiPolicyPrinciplesTitle")}
        </Title>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={principles.map((key) => emphasiseLeadingLabel(t(key)))}
        />
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("aiPolicyUseCasesTitle")}
        </Title>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={useCases.map((key) => emphasiseLeadingLabel(t(key)))}
        />
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("aiPolicyNotUsedTitle")}
        </Title>
        <Text as="p" size="xs">{t("aiPolicyNotUsedBody")}</Text>
      </Section>

      <Section spacing="none">
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
      </Section>

      <Section spacing="none">
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
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("aiPolicySafeguardsTitle")}
        </Title>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={safeguards.map((key) => emphasiseLeadingLabel(t(key)))}
        />
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("aiPolicyLimitationsTitle")}
        </Title>
        <Text as="p" size="xs">{t("aiPolicyLimitationsBody")}</Text>
      </Section>

      <Section spacing="none">
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
          {renderContactLinks(
            t("aiPolicyRightsFooter"),
            "mail@digitaltableteur.com",
          )}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("aiPolicyChangesTitle")}
        </Title>
        <Text as="p" size="xs">{t("aiPolicyChangesBody")}</Text>
      </Section>

      <Section spacing="none">
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
      </Section>
    </Container>
  );
}
