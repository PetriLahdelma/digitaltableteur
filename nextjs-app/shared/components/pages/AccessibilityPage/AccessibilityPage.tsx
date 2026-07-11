"use client";

import React from "react";
import { useTranslation } from "react-i18next";

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
      <p>{t("accessibilityIntro")}</p>
      <p>
        <em>{t("accessibilityLastUpdated")}</em>
      </p>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityConformanceTitle")}
        </Title>
        <p>{t("accessibilityConformanceBody")}</p>
        <p>{t("accessibilityConformanceLevel")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityMeasuresTitle")}
        </Title>
        <p>{t("accessibilityMeasuresIntro")}</p>
        <ul>
          {measures.map((key) => (
            <li key={key}>
              <p>{t(key)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityStandardsTitle")}
        </Title>
        <p>{t("accessibilityStandardsBody")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityTechnicalTitle")}
        </Title>
        <p>{t("accessibilityTechnicalIntro")}</p>
        <ul>
          {technicalSpecs.map((key) => (
            <li key={key}>
              <p>{t(key)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityCompatibilityTitle")}
        </Title>
        <p>{t("accessibilityCompatibilityBody")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityLimitationsTitle")}
        </Title>
        <p>{t("accessibilityLimitationsIntro")}</p>
        <ul>
          {limitations.map((key) => (
            <li key={key}>
              <p>{t(key)}</p>
            </li>
          ))}
        </ul>
        <p>{t("accessibilityLimitationsFooter")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityShortcomingsTitle")}
        </Title>
        <p>{t("accessibilityShortcomingsIntro")}</p>
        <ul>
          {shortcomings.map((key) => (
            <li key={key}>
              <p>{t(key)}</p>
            </li>
          ))}
        </ul>
        <p>{t("accessibilityShortcomingsFooter")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityTestingTitle")}
        </Title>
        <p>{t("accessibilityTestingBody")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityMonitoringTitle")}
        </Title>
        <p>{t("accessibilityMonitoringBody")}</p>
        <p>
          <strong>{t("accessibilityMonitoringAgency")}</strong>
        </p>
        <p>{t("accessibilityMonitoringWebsite")}</p>
        <p>{t("accessibilityMonitoringEmail")}</p>
        <p>{t("accessibilityMonitoringPhone")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityPublicationTitle")}
        </Title>
        <p>{t("accessibilityPublicationWebsite")}</p>
        <p>{t("accessibilityPublicationStatement")}</p>
        <p>{t("accessibilityPublicationAct")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityFeedbackTitle")}
        </Title>
        <p>{t("accessibilityFeedbackIntro")}</p>
        <p>{t("accessibilityFeedbackEmail")}</p>
        <p>
          {renderContactLinks(
            t("accessibilityContactBody"),
            "mail@digitaltableteur.com",
            "+358 45 657 4469",
          )}
        </p>
        <p>{t("accessibilityFeedbackResponse")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityComplaintTitle")}
        </Title>
        <p>{t("accessibilityComplaintBody")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityAlternativeTitle")}
        </Title>
        <p>{t("accessibilityAlternativeBody")}</p>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("accessibilityContactTitle")}
        </Title>
        <p>
          {renderContactLinks(
            t("accessibilityContactBody"),
            "mail@digitaltableteur.com",
            "+358 45 657 4469",
          )}
        </p>
      </section>
    </div>
  );
}
