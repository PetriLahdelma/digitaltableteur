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

export function PrivacyPolicyPage({ onBack }: { onBack?: () => void }) {
  const { t } = useTranslation();

  const whatWeCollect = [
    "privacyPolicyWhatWeCollectItem1",
    "privacyPolicyWhatWeCollectItem2",
    "privacyPolicyWhatWeCollectItem3",
    "privacyPolicyWhatWeCollectItem4",
  ];

  const websiteVisitors = [
    "privacyPolicyWebsiteVisitorsItem1",
    "privacyPolicyWebsiteVisitorsItem2",
    "privacyPolicyWebsiteVisitorsItem3",
  ];

  const sharingItems = [
    "privacyPolicySharingItem1",
    "privacyPolicySharingItem2",
    "privacyPolicySharingItem3",
    "privacyPolicySharingItem4",
  ];

  const cookiesItems = [
    "privacyPolicyCookiesItem1",
    "privacyPolicyCookiesItem2",
    "privacyPolicyCookiesItem3",
  ];

  const rights = [
    "privacyPolicyRightAccess",
    "privacyPolicyRightRectification",
    "privacyPolicyRightErasure",
    "privacyPolicyRightRestriction",
    "privacyPolicyRightPortability",
    "privacyPolicyRightObject",
    "privacyPolicyRightWithdraw",
  ];

  const securityItems = [
    "privacyPolicySecurityItem1",
    "privacyPolicySecurityItem2",
    "privacyPolicySecurityItem3",
    "privacyPolicySecurityItem4",
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

      <Title level={1} terminals="sans" size="xs">
        {t("privacyPolicyHeading")}
      </Title>
      <p>{t("privacyPolicyIntro")}</p>
      <p>
        <em>{t("privacyPolicyLastUpdated")}</em>
      </p>

      <section>
        <Title level={2} terminals="sans" size="xxs">
          {t("privacyPolicyControllerTitle")}
        </Title>
        <p style={{ whiteSpace: "pre-line" }}>
          {t("privacyPolicyControllerBody")}
        </p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="xxs">
          {t("privacyPolicyPurposeTitle")}
        </Title>
        <p>{t("privacyPolicyPurposeBody")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="xxs">
          {t("privacyPolicyWhatWeCollectTitle")}
        </Title>
        <Title level={3} terminals="sans" size="xxs">
          {t("privacyPolicyContactFormSubtitle")}
        </Title>
        <p>{t("privacyPolicyContactFormIntro")}</p>
        <ul>
          {whatWeCollect.map((key) => (
            <li key={key}>
              <p>{t(key)}</p>
            </li>
          ))}
        </ul>
        <p>{t("privacyPolicyContactFormUsage")}</p>

        <Title level={3} terminals="sans" size="xxs">
          {t("privacyPolicyWebsiteVisitorsSubtitle")}
        </Title>
        <p>{t("privacyPolicyWebsiteVisitorsIntro")}</p>
        <ul>
          {websiteVisitors.map((key) => (
            <li key={key}>
              <p>{t(key)}</p>
            </li>
          ))}
        </ul>
        <p>{t("privacyPolicyWebsiteVisitorsUsage")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="xxs">
          {t("privacyPolicyLegalBasisTitle")}
        </Title>
        <p>{t("privacyPolicyLegalBasisBody")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="xxs">
          {t("privacyPolicySharingTitle")}
        </Title>
        <p>{t("privacyPolicySharingIntro")}</p>
        <ul>
          {sharingItems.map((key) => (
            <li key={key}>
              <p>{t(key)}</p>
            </li>
          ))}
        </ul>
        <p>{t("privacyPolicySharingFooter")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="xxs">
          {t("privacyPolicyTransfersTitle")}
        </Title>
        <p>{t("privacyPolicyTransfersBody")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="xxs">
          {t("privacyPolicyCookiesTitle")}
        </Title>
        <p>{t("privacyPolicyCookiesIntro")}</p>
        <p>{t("privacyPolicyCookiesTypes")}</p>
        <ul>
          {cookiesItems.map((key) => (
            <li key={key}>
              <p>{t(key)}</p>
            </li>
          ))}
        </ul>
        <p>{t("privacyPolicyCookiesControl")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="xxs">
          {t("privacyPolicyRetentionTitle")}
        </Title>
        <p>{t("privacyPolicyRetentionBody")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="xxs">
          {t("privacyPolicyYourRightsTitle")}
        </Title>
        <p>{t("privacyPolicyYourRightsIntro")}</p>
        <ul>
          {rights.map((key) => (
            <li key={key}>
              <p>{t(key)}</p>
            </li>
          ))}
        </ul>
        <p>{t("privacyPolicyRightsExercise")}</p>
        <p>{t("privacyPolicyRightsComplaint")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="xxs">
          {t("privacyPolicySecurityTitle")}
        </Title>
        <p>{t("privacyPolicySecurityIntro")}</p>
        <ul>
          {securityItems.map((key) => (
            <li key={key}>
              <p>{t(key)}</p>
            </li>
          ))}
        </ul>
        <p>{t("privacyPolicySecurityFooter")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="xxs">
          {t("privacyPolicyChangesTitle")}
        </Title>
        <p>{t("privacyPolicyChangesBody")}</p>
      </section>

      <section>
        <Title level={2} terminals="sans" size="xxs">
          {t("privacyPolicyContactTitle")}
        </Title>
        <p>
          {renderContactLinks(
            t("privacyPolicyContactBody"),
            "mail@digitaltableteur.com",
            "+358 45 657 4469",
          )}
        </p>
      </section>
    </div>
  );
}
