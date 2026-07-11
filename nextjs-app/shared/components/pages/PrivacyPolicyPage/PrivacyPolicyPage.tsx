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
import styles from "../AiUsagePage/AiUsagePage.module.css";

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

export function PrivacyPolicyPage() {
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
    <Container size="sm" className={styles.prosePage}>

      <Title level={1} size="xs">
        {t("privacyPolicyHeading")}
      </Title>
      <Text as="p" size="xs">{t("privacyPolicyIntro")}</Text>
      <Text as="p" size="xs">
        {t("privacyPolicyLastUpdatedLabel")}{" "}
        <Timestamp value="2025-11-29" format="date" size="xs" />
      </Text>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("privacyPolicyControllerTitle")}
        </Title>
        <Text as="p" size="xs" className={styles.preLine}>
          {renderContactLinks(
            t("privacyPolicyControllerBody"),
            "mail@digitaltableteur.com",
          )}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("privacyPolicyPurposeTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyPurposeBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("privacyPolicyWhatWeCollectTitle")}
        </Title>
        <Title level={3} size="xxs">
          {t("privacyPolicyContactFormSubtitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyContactFormIntro")}</Text>
        <List as="ul" size="xs" listStyleType="dash" items={whatWeCollect.map((key) => t(key))} />
        <Text as="p" size="xs">{t("privacyPolicyContactFormUsage")}</Text>

        <Title level={3} size="xxs">
          {t("privacyPolicyWebsiteVisitorsSubtitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyWebsiteVisitorsIntro")}</Text>
        <List as="ul" size="xs" listStyleType="dash" items={websiteVisitors.map((key) => t(key))} />
        <Text as="p" size="xs">{t("privacyPolicyWebsiteVisitorsUsage")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("privacyPolicyLegalBasisTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyLegalBasisBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("privacyPolicySharingTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicySharingIntro")}</Text>
        <List as="ul" size="xs" listStyleType="dash" items={sharingItems.map((key) => t(key))} />
        <Text as="p" size="xs">{t("privacyPolicySharingFooter")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("privacyPolicyTransfersTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyTransfersBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("privacyPolicyCookiesTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyCookiesIntro")}</Text>
        <Text as="p" size="xs">{t("privacyPolicyCookiesTypes")}</Text>
        <List as="ul" size="xs" listStyleType="dash" items={cookiesItems.map((key) => t(key))} />
        <Text as="p" size="xs">{t("privacyPolicyCookiesControl")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("privacyPolicyRetentionTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyRetentionBody")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("privacyPolicyYourRightsTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyYourRightsIntro")}</Text>
        <List as="ul" size="xs" listStyleType="dash" items={rights.map((key) => t(key))} />
        <Text as="p" size="xs">{t("privacyPolicyRightsExercise")}</Text>
        <Text as="p" size="xs">{t("privacyPolicyRightsComplaint")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("privacyPolicySecurityTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicySecurityIntro")}</Text>
        <List as="ul" size="xs" listStyleType="dash" items={securityItems.map((key) => t(key))} />
        <Text as="p" size="xs">{t("privacyPolicySecurityFooter")}</Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xxs">
          {t("privacyPolicyChangesTitle")}
        </Title>
        <Text as="p" size="xs">{t("privacyPolicyChangesBody")}</Text>
      </Section>

      <Section spacing="none">
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
      </Section>
    </Container>
  );
}
