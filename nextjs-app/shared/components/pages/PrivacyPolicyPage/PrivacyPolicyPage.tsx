"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import Button from "@dt/Button";
import Icon from "@dt/Icon";
import Text from "@dt/Text";
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

      <Title level={1} size="xs">
        {t("privacyPolicyHeading")}
      </Title>
      <Text as="p" size="xs">{t("privacyPolicyIntro")}</Text>
      <Text as="p" size="xs">
        <em>{t("privacyPolicyLastUpdated")}</em>
      </Text>

      <section>
        <Title level={2} size="xxs">
          {t("privacyPolicyControllerTitle")}
        </Title>
        <Text as="p" size="xs" className={styles.preLine}>
          {t("privacyPolicyControllerBody")}
        </Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("privacyPolicyPurposeTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyPurposeBody")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("privacyPolicyWhatWeCollectTitle")}
        </Title>
        <Title level={3} size="xxs">
          {t("privacyPolicyContactFormSubtitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyContactFormIntro")}</Text>
        <ul>
          {whatWeCollect.map((key) => (
            <li key={key}>
              <Text as="p" size="xs">{t(key)}</Text>
            </li>
          ))}
        </ul>
        <Text as="p" size="xs">{t("privacyPolicyContactFormUsage")}</Text>

        <Title level={3} size="xxs">
          {t("privacyPolicyWebsiteVisitorsSubtitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyWebsiteVisitorsIntro")}</Text>
        <ul>
          {websiteVisitors.map((key) => (
            <li key={key}>
              <Text as="p" size="xs">{t(key)}</Text>
            </li>
          ))}
        </ul>
        <Text as="p" size="xs">{t("privacyPolicyWebsiteVisitorsUsage")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("privacyPolicyLegalBasisTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyLegalBasisBody")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("privacyPolicySharingTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicySharingIntro")}</Text>
        <ul>
          {sharingItems.map((key) => (
            <li key={key}>
              <Text as="p" size="xs">{t(key)}</Text>
            </li>
          ))}
        </ul>
        <Text as="p" size="xs">{t("privacyPolicySharingFooter")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("privacyPolicyTransfersTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyTransfersBody")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("privacyPolicyCookiesTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyCookiesIntro")}</Text>
        <Text as="p" size="xs">{t("privacyPolicyCookiesTypes")}</Text>
        <ul>
          {cookiesItems.map((key) => (
            <li key={key}>
              <Text as="p" size="xs">{t(key)}</Text>
            </li>
          ))}
        </ul>
        <Text as="p" size="xs">{t("privacyPolicyCookiesControl")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("privacyPolicyRetentionTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyRetentionBody")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("privacyPolicyYourRightsTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyYourRightsIntro")}</Text>
        <ul>
          {rights.map((key) => (
            <li key={key}>
              <Text as="p" size="xs">{t(key)}</Text>
            </li>
          ))}
        </ul>
        <Text as="p" size="xs">{t("privacyPolicyRightsExercise")}</Text>
        <Text as="p" size="xs">{t("privacyPolicyRightsComplaint")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("privacyPolicySecurityTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicySecurityIntro")}</Text>
        <ul>
          {securityItems.map((key) => (
            <li key={key}>
              <Text as="p" size="xs">{t(key)}</Text>
            </li>
          ))}
        </ul>
        <Text as="p" size="xs">{t("privacyPolicySecurityFooter")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("privacyPolicyChangesTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyChangesBody")}</Text>
      </section>

      <section>
        <Title level={2} size="xxs">
          {t("privacyPolicyContactTitle")}
        </Title>
        <Text as="p" size="xs">
          {renderContactLinks(
            t("privacyPolicyContactBody"),
            "mail@digitaltableteur.com",
            "+358 45 657 4469",
          )}
        </Text>
      </section>
    </div>
  );
}
