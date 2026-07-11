"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { Container, Link, List, Section, Text, Title } from "@digitaltableteur/react";
import Timestamp from "@dt/Timestamp";
import styles from "../AiUsagePage/AiUsagePage.module.css";

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

export function AccessibilityPage() {
  const { t } = useTranslation();

  const measures = [
    "accessibilityMeasuresItem1",
    "accessibilityMeasuresItem2",
    "accessibilityMeasuresItem3",
    "accessibilityMeasuresItem4",
    "accessibilityMeasuresItem5",
  ];

  const technicalSpecs = [
    "accessibilityTechnicalItem1",
    "accessibilityTechnicalItem2",
    "accessibilityTechnicalItem3",
    "accessibilityTechnicalItem4",
  ];

  const limitations = [
    "accessibilityLimitationsItem1",
    "accessibilityLimitationsItem2",
    "accessibilityLimitationsItem3",
  ];

  const shortcomings = [
    "accessibilityShortcomingsItem1",
    "accessibilityShortcomingsItem2",
    "accessibilityShortcomingsItem3",
  ];

  return (
    <Container size="sm" className={styles.prosePage}>
      <Title level={1} size="xs">
        {t("accessibilityHeading")}
      </Title>
      <Text as="p" size="xs">{t("accessibilityIntro")}</Text>
      <Text as="p" size="xs">
        {t("accessibilityLastUpdatedLabel")}{" "}
        <Timestamp value="2026-02-04" format="date" size="xs" />
      </Text>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityConformanceTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityConformanceBody")}</Text>
        <Text as="p" size="xs">{t("accessibilityConformanceLevel")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityMeasuresTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityMeasuresIntro")}</Text>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={measures.map((key) => t(key))}
        />
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityStandardsTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityStandardsBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityTechnicalTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityTechnicalIntro")}</Text>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={technicalSpecs.map((key) => emphasiseLeadingLabel(t(key)))}
        />
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityCompatibilityTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityCompatibilityBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityLimitationsTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityLimitationsIntro")}</Text>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={limitations.map((key) => t(key))}
        />
        <Text as="p" size="xs">{t("accessibilityLimitationsFooter")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityShortcomingsTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityShortcomingsIntro")}</Text>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={shortcomings.map((key) => t(key))}
        />
        <Text as="p" size="xs">{t("accessibilityShortcomingsFooter")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityTestingTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityTestingBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityMonitoringTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityMonitoringBody")}</Text>
        <Text as="p" size="xs">
          <strong>{t("accessibilityMonitoringAgency")}</strong>
        </Text>
        <Text as="p" size="xs">{t("accessibilityMonitoringWebsite")}</Text>
        <Text as="p" size="xs">{t("accessibilityMonitoringEmail")}</Text>
        <Text as="p" size="xs">{t("accessibilityMonitoringPhone")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityPublicationTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityPublicationWebsite")}</Text>
        <Text as="p" size="xs">{t("accessibilityPublicationStatement")}</Text>
        <Text as="p" size="xs">{t("accessibilityPublicationAct")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityFeedbackTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityFeedbackIntro")}</Text>
        <Text as="p" size="xs">{t("accessibilityFeedbackEmail")}</Text>
        <Text as="p" size="xs">
          {renderContactLinks(
            t("accessibilityContactBody"),
            "mail@digitaltableteur.com",
            "+358 45 657 4469",
          )}
        </Text>
        <Text as="p" size="xs">{t("accessibilityFeedbackResponse")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityComplaintTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityComplaintBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityAlternativeTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityAlternativeBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("accessibilityContactTitle")}
        </Title>
        <Text as="p" size="xs">
          {renderContactLinks(
            t("accessibilityContactBody"),
            "mail@digitaltableteur.com",
            "+358 45 657 4469",
          )}
        </Text>
      </Section>
    </Container>
  );
}
