"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon, Text, Title } from "@digitaltableteur/react";
import styles from "./not-found.module.css";

/**
 * Recovery targets offered on the 404 page.
 *
 * These are rendered as plain anchors so they survive in the raw HTML for
 * crawlers and agents that do not execute JavaScript. `llms.txt` is included
 * deliberately: it is the machine-readable entry point for this site.
 */
const recoveryLinks = [
  { href: "/sitemap", labelKey: "notFoundLinkSitemap" },
  { href: "/work", labelKey: "notFoundLinkWork" },
  { href: "/blog", labelKey: "notFoundLinkBlog" },
  { href: "/contact", labelKey: "notFoundLinkContact" },
  { href: "/llms.txt", labelKey: "notFoundLinkLlms" },
] as const;

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className={styles.notFoundPage}>
      <div className={styles.recovery}>
        <Title level={1} size="xs">
          {t("notFoundTitle")}
        </Title>
        <Text className={styles.recoveryBody}>{t("notFoundBody")}</Text>

        <Button variant="primary" size="lg" href="/" icon={<Icon name="house" />}>
          {t("notFoundButton")}
        </Button>

        <nav aria-label={t("notFoundLinksLabel")} className={styles.recoveryNav}>
          <ul className={styles.recoveryList}>
            {recoveryLinks.map(({ href, labelKey }) => (
              <li key={href}>
                <a href={href}>{t(labelKey)}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
