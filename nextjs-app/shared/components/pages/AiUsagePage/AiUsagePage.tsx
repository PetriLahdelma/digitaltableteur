"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import {
  Container,
  Link,
  List,
  Section,
  Text,
  Title,
} from "@digitaltableteur/react";
import Timestamp from "@dt/Timestamp";
import styles from "./AiUsagePage.module.css";

const delimiter = ": ";

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
      <Title level={1} size="m">
        {t("aiPolicyHeading")}
      </Title>
      <Text as="p" size="m" className={styles.lead}>
        {t("aiPolicyIntro")}
      </Text>
      <Text as="p" size="xs" className={styles.meta}>
        {t("aiPolicyLastUpdatedLabel")}{" "}
        <Timestamp value="2026-09-23" format="date" size="xs" />
      </Text>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("aiPolicyAssistantTitle")}
        </Title>
        <Text as="p" size="s">
          {t("aiPolicyAssistantScope")}
        </Text>
        <Text as="p" size="s">
          {t("aiPolicyAssistantBoundary")}
        </Text>
        <Text as="p" size="s">
          {t("aiPolicyAssistantData")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("aiPolicyPrinciplesTitle")}
        </Title>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={principles.map((key) => emphasiseLeadingLabel(t(key)))}
        />
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("aiPolicyUseCasesTitle")}
        </Title>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={useCases.map((key) => emphasiseLeadingLabel(t(key)))}
        />
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("aiPolicyNotUsedTitle")}
        </Title>
        <Text as="p" size="s">
          {t("aiPolicyNotUsedBody")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("aiPolicyProvidersTitle")}
        </Title>
        <Text as="p" size="s">
          {t("aiPolicyProvidersIntro")}
        </Text>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={providers.map((key) => emphasiseLeadingLabel(t(key)))}
        />
        <Text as="p" size="s">
          {t("aiPolicyProvidersFooter")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("aiPolicyDataTitle")}
        </Title>
        <Text as="p" size="s">
          {t("aiPolicyDataIntro")}
        </Text>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={dataItems.map((key) => emphasiseLeadingLabel(t(key)))}
        />
        <Text as="p" size="s">
          {t("aiPolicyDataFooter")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("aiPolicySafeguardsTitle")}
        </Title>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={safeguards.map((key) => emphasiseLeadingLabel(t(key)))}
        />
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("aiPolicyLimitationsTitle")}
        </Title>
        <Text as="p" size="s">
          {t("aiPolicyLimitationsBody")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("aiPolicyRightsTitle")}
        </Title>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={rights.map((key) => emphasiseLeadingLabel(t(key)))}
        />
        <Text as="p" size="s">
          {renderContactLinks(
            t("aiPolicyRightsFooter"),
            "mail@digitaltableteur.com",
          )}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("aiPolicyChangesTitle")}
        </Title>
        <Text as="p" size="s">
          {t("aiPolicyChangesBody")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("aiPolicyContactTitle")}
        </Title>
        <Text as="p" size="s">
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
