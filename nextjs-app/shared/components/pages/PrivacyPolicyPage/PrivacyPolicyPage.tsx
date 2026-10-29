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

  const businessContacts = [
    "privacyPolicyBusinessContactsItem1",
    "privacyPolicyBusinessContactsItem2",
    "privacyPolicyBusinessContactsItem3",
    "privacyPolicyBusinessContactsItem4",
  ];

  const sharingItems = [
    "privacyPolicySharingItem1",
    "privacyPolicySharingItem2",
    "privacyPolicySharingItem3",
    "privacyPolicySharingItem4",
    "privacyPolicySharingItem5",
    "privacyPolicySharingItem6",
    "privacyPolicySharingItem7",
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
      <Title level={1} size="m">
        {t("privacyPolicyHeading")}
      </Title>
      <Text as="p" size="m" className={styles.lead}>
        {t("privacyPolicyIntro")}
      </Text>
      <Text as="p" size="xs" className={styles.meta}>
        {t("privacyPolicyLastUpdatedLabel")}{" "}
        <Timestamp value="2026-10-28" format="date" size="xs" />
      </Text>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("privacyPolicyControllerTitle")}
        </Title>
        <Text as="p" size="s" className={styles.preLine}>
          {renderContactLinks(
            t("privacyPolicyControllerBody"),
            "mail@digitaltableteur.com",
          )}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("privacyPolicyPurposeTitle")}
        </Title>
        <Text as="p" size="s">
          {t("privacyPolicyPurposeBody")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("privacyPolicyWhatWeCollectTitle")}
        </Title>
        <Title level={3} size="xxs">
          {t("privacyPolicyContactFormSubtitle")}
        </Title>
        <Text as="p" size="s">
          {t("privacyPolicyContactFormIntro")}
        </Text>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={whatWeCollect.map((key) => t(key))}
        />
        <Text as="p" size="s">
          {t("privacyPolicyContactFormUsage")}
        </Text>

        <Title level={3} size="xxs">
          {t("privacyPolicyWebsiteVisitorsSubtitle")}
        </Title>
        <Text as="p" size="s">
          {t("privacyPolicyWebsiteVisitorsIntro")}
        </Text>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={websiteVisitors.map((key) => t(key))}
        />
        <Text as="p" size="s">
          {t("privacyPolicyWebsiteVisitorsUsage")}
        </Text>

        <Title level={3} size="xxs">
          {t("privacyPolicyChatSubtitle")}
        </Title>
        <Text as="p" size="s">
          {t("privacyPolicyChatBody")}
        </Text>

        {/* Linked from the email signature: keep the id stable. */}
        <Section
          spacing="none"
          id="business-contacts"
          className={styles.anchorTarget}
        >
          <Title level={3} size="xxs">
            {t("privacyPolicyBusinessContactsSubtitle")}
          </Title>
          <Text as="p" size="s">
            {t("privacyPolicyBusinessContactsIntro")}
          </Text>
          <List
            as="ul"
            size="s"
            listStyleType="dash"
            items={businessContacts.map((key) => t(key))}
          />
          <Text as="p" size="s">
            {t("privacyPolicyBusinessContactsSource")}
          </Text>
          <Text as="p" size="s">
            {t("privacyPolicyBusinessContactsUsage")}
          </Text>
          <Text as="p" size="s">
            {t("privacyPolicyBusinessContactsRetention")}
          </Text>
          <Text as="p" size="s">
            {renderContactLinks(
              t("privacyPolicyBusinessContactsObjection"),
              "mail@digitaltableteur.com",
            )}
          </Text>
        </Section>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("privacyPolicyLegalBasisTitle")}
        </Title>
        <Text as="p" size="s">
          {t("privacyPolicyLegalBasisBody")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("privacyPolicySharingTitle")}
        </Title>
        <Text as="p" size="s">
          {t("privacyPolicySharingIntro")}
        </Text>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={sharingItems.map((key) => t(key))}
        />
        <Text as="p" size="s">
          {t("privacyPolicySharingFooter")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("privacyPolicyTransfersTitle")}
        </Title>
        <Text as="p" size="s">
          {t("privacyPolicyTransfersBody")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("privacyPolicyCookiesTitle")}
        </Title>
        <Text as="p" size="s">
          {t("privacyPolicyCookiesIntro")}
        </Text>
        <Text as="p" size="s">
          {t("privacyPolicyCookiesTypes")}
        </Text>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={cookiesItems.map((key) => t(key))}
        />
        <Text as="p" size="s">
          {t("privacyPolicyCookiesControl")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("privacyPolicyRetentionTitle")}
        </Title>
        <Text as="p" size="s">
          {t("privacyPolicyRetentionBody")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("privacyPolicyYourRightsTitle")}
        </Title>
        <Text as="p" size="s">
          {t("privacyPolicyYourRightsIntro")}
        </Text>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={rights.map((key) => t(key))}
        />
        <Text as="p" size="s">
          {t("privacyPolicyRightsExercise")}
        </Text>
        <Text as="p" size="s">
          {t("privacyPolicyRightsSelfService")}{" "}
          <Link href="/privacy-policy/delete" size="inherit">
            {t("privacyPolicyRightsSelfServiceLink")}
          </Link>
        </Text>
        <Text as="p" size="s">
          {t("privacyPolicyRightsComplaint")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("privacyPolicySecurityTitle")}
        </Title>
        <Text as="p" size="s">
          {t("privacyPolicySecurityIntro")}
        </Text>
        <List
          as="ul"
          size="s"
          listStyleType="dash"
          items={securityItems.map((key) => t(key))}
        />
        <Text as="p" size="s">
          {t("privacyPolicySecurityFooter")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("privacyPolicyChangesTitle")}
        </Title>
        <Text as="p" size="s">
          {t("privacyPolicyChangesBody")}
        </Text>
      </Section>

      <Section spacing="none">
        <Title level={2} size="xs">
          {t("privacyPolicyContactTitle")}
        </Title>
        <Text as="p" size="s">
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
