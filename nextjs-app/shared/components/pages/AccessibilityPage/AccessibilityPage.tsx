"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import List from "@dt/List";
import Text from "@dt/Text";
import Title from "@dt/Title";
import styles from "../AiUsagePage/AiUsagePage.module.css";

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
    <div className={styles.policyPage}>
      <Title level={1} size="xs">
        {t("accessibilityHeading")}
      </Title>
      <Text as="p" size="xs">{t("accessibilityIntro")}</Text>
      <Text as="p" size="xs">
        <em>{t("accessibilityLastUpdated")}</em>
      </Text>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityConformanceTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityConformanceBody")}</Text>
        <Text as="p" size="xs">{t("accessibilityConformanceLevel")}</Text>
      </section>

      <section>
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
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityStandardsTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityStandardsBody")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityTechnicalTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityTechnicalIntro")}</Text>
        <List
          as="ul"
          size="xs"
          listStyleType="dash"
          items={technicalSpecs.map((key) => t(key))}
        />
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityCompatibilityTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityCompatibilityBody")}</Text>
      </section>

      <section>
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
      </section>

      <section>
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
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityTestingTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityTestingBody")}</Text>
      </section>

      <section>
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
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityPublicationTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityPublicationWebsite")}</Text>
        <Text as="p" size="xs">{t("accessibilityPublicationStatement")}</Text>
        <Text as="p" size="xs">{t("accessibilityPublicationAct")}</Text>
      </section>

      <section>
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
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityComplaintTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityComplaintBody")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityAlternativeTitle")}
        </Title>
        <Text as="p" size="xs">{t("accessibilityAlternativeBody")}</Text>
      </section>

      <section>
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
      </section>
    </div>
  );
}
