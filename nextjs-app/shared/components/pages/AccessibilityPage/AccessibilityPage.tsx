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
      <Title level={1} size="m">
        {t("accessibilityHeading")}
      </Title>
      <Text as="p" size="m" className={styles.lead}>{t("accessibilityIntro")}</Text>
      <Text as="p" size="xs" className={styles.meta}>
        {t("accessibilityLastUpdatedLabel")}{" "}
        <Timestamp value="2026-09-27" format="date" size="xs" />
      </Text>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityConformanceTitle")}
        </Title>
        <Text as="p" size="s">{t("accessibilityConformanceBody")}</Text>
        <Text as="p" size="s">{t("accessibilityConformanceLevel")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityMeasuresTitle")}
        </Title>
        <Text as="p" size="s">{t("accessibilityMeasuresIntro")}</Text>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={measures.map((key) => t(key))}
        />
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityStandardsTitle")}
        </Title>
        <Text as="p" size="s">{t("accessibilityStandardsBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityTechnicalTitle")}
        </Title>
        <Text as="p" size="s">{t("accessibilityTechnicalIntro")}</Text>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={technicalSpecs.map((key) => emphasiseLeadingLabel(t(key)))}
        />
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityCompatibilityTitle")}
        </Title>
        <Text as="p" size="s">{t("accessibilityCompatibilityBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityLimitationsTitle")}
        </Title>
        <Text as="p" size="s">{t("accessibilityLimitationsIntro")}</Text>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={limitations.map((key) => t(key))}
        />
        <Text as="p" size="s">{t("accessibilityLimitationsFooter")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityShortcomingsTitle")}
        </Title>
        <Text as="p" size="s">{t("accessibilityShortcomingsIntro")}</Text>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={shortcomings.map((key) => t(key))}
        />
        <Text as="p" size="s">{t("accessibilityShortcomingsFooter")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityTestingTitle")}
        </Title>
        <Text as="p" size="s">{t("accessibilityTestingBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityMonitoringTitle")}
        </Title>
        <Text as="p" size="s">{t("accessibilityMonitoringBody")}</Text>
        <Text as="p" size="s">
          <strong>{t("accessibilityMonitoringAgency")}</strong>
        </Text>
        <Text as="p" size="s">{t("accessibilityMonitoringWebsite")}</Text>
        <Text as="p" size="s">{t("accessibilityMonitoringEmail")}</Text>
        <Text as="p" size="s">{t("accessibilityMonitoringPhone")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityPublicationTitle")}
        </Title>
        <Text as="p" size="s">{t("accessibilityPublicationWebsite")}</Text>
        <Text as="p" size="s">{t("accessibilityPublicationStatement")}</Text>
        <Text as="p" size="s">{t("accessibilityPublicationAct")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityFeedbackTitle")}
        </Title>
        <Text as="p" size="s">{t("accessibilityFeedbackIntro")}</Text>
        <Text as="p" size="s">{t("accessibilityFeedbackEmail")}</Text>
        <Text as="p" size="s">
          {renderContactLinks(
            t("accessibilityContactBody"),
            "mail@digitaltableteur.com",
            "+358 45 657 4469",
          )}
        </Text>
        <Text as="p" size="s">{t("accessibilityFeedbackResponse")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityComplaintTitle")}
        </Title>
        <Text as="p" size="s">{t("accessibilityComplaintBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityAlternativeTitle")}
        </Title>
        <Text as="p" size="s">{t("accessibilityAlternativeBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("accessibilityContactTitle")}
        </Title>
        <Text as="p" size="s">
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
