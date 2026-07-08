"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import SiteTree from "@dt/SiteTree";
import { Text, Title } from "@digitaltableteur/react";
import { buildSiteTree } from "@/app/lib/siteStructure";

import styles from "./SitemapPage.module.css";

export function SitemapPage() {
  const { t } = useTranslation();

  const nodes = useMemo(
    () =>
      buildSiteTree({
        sectionMain: t("sitemapSectionMain"),
        sectionWork: t("navWork"),
        sectionBlog: t("navBlog"),
        sectionAuthors: t("sitemapSectionAuthors"),
        sectionGuides: t("footerGuides"),
        sectionServices: t("sitemapSectionServices"),
        sectionStacks: t("sitemapSectionStacks"),
        sectionAudiences: t("sitemapSectionAudiences"),
        sectionTopics: t("sitemapSectionTopics"),
        sectionLegal: t("footerLegalTitle"),
        home: t("navHome"),
        about: t("navAbout"),
        contact: t("navContact"),
        pricing: t("navPricing"),
        blog: t("navBlog"),
        colophon: t("sitemapColophon"),
        privacyPolicy: t("footerPrivacyPolicy"),
        imprint: t("footerImprint"),
        aiUse: t("footerAiUse"),
        accessibility: t("footerAccessibility"),
        guides: t("footerGuides"),
        rssFeed: t("sitemapRssFeed"),
        xmlSitemap: t("sitemapXmlFeed"),
      }),
    [t],
  );

  return (
    <main className={styles.page}>
      <Title level={1}>
        {t("sitemapPageTitle")}
      </Title>
      <Text as="p" className={styles.intro}>
        {t("sitemapPageIntro")}
      </Text>
      <SiteTree
        nodes={nodes}
        aria-label={t("sitemapTreeLabel")}
        className={styles.tree}
      />
    </main>
  );
}
