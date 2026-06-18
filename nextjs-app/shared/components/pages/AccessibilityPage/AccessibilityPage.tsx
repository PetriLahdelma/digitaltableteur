"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import Button from "@dt/Button";
import Icon from "@dt/Icon";
import Title from "@dt/Title";
import styles from "../AiUsagePage/AiUsagePage.module.css";

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

export function AccessibilityPage({ onBack }: { onBack?: () => void }) {
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
      {onBack ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <Button variant="secondary" size="md" onClick={onBack}>
            <Icon
              name="arrow-left"
              ariaLabel={t("back")}
              style={{ marginInlineEnd: 8 }}
            />
            {t("back")}
          </Button>
        </div>
      ) : null}

      <Title level={1} terminals="sans" size="XS">
        {t("accessibilityHeading")}
      </Title>
      <p>{t("accessibilityIntro")}</p>
      <p>
        <em>{t("accessibilityLastUpdated")}</em>
      </p>

      <section>
        <Title level={2} terminals="sans" size="XXS">
          {t("accessibilityConformanceTitle")}
        </Title>
        <p>{t("accessibilityConformanceBody")}</p>
        <p>{t("accessibilityConformanceLevel")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="XXS">
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
        <Title level={2} terminals="sans" size="XXS">
          {t("accessibilityStandardsTitle")}
        </Title>
        <p>{t("accessibilityStandardsBody")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="XXS">
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
        <Title level={2} terminals="sans" size="XXS">
          {t("accessibilityCompatibilityTitle")}
        </Title>
        <p>{t("accessibilityCompatibilityBody")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="XXS">
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
        <Title level={2} terminals="sans" size="XXS">
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
        <Title level={2} terminals="sans" size="XXS">
          {t("accessibilityTestingTitle")}
        </Title>
        <p>{t("accessibilityTestingBody")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="XXS">
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
        <Title level={2} terminals="sans" size="XXS">
          {t("accessibilityPublicationTitle")}
        </Title>
        <p>{t("accessibilityPublicationWebsite")}</p>
        <p>{t("accessibilityPublicationStatement")}</p>
        <p>{t("accessibilityPublicationAct")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="XXS">
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
        <Title level={2} terminals="sans" size="XXS">
          {t("accessibilityComplaintTitle")}
        </Title>
        <p>{t("accessibilityComplaintBody")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="XXS">
          {t("accessibilityAlternativeTitle")}
        </Title>
        <p>{t("accessibilityAlternativeBody")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="XXS">
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
