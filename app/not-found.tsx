"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button, FlexBox, Icon, Text, Title } from "@digitaltableteur/react";
import { useHideChatWidget } from "@dt/NextLayout";
import styles from "./not-found.module.css";

export default function NotFound() {
  const { t } = useTranslation();
  // An error page is not the place to offer a chat assistant.
  useHideChatWidget();

  return (
    <div className={styles.notFoundPage}>
      <Title level={1} size="xl">
        {t("notFoundTitle")}
      </Title>
      <Text className={styles.notFoundBody}>{t("notFoundBody")}</Text>

      {/* The site header already carries the full navigation, so the only
          destinations worth repeating here are home and the sitemap. */}
      <FlexBox
        wrap="wrap"
        justify="center"
        align="center"
        className={styles.actions}
      >
        <Button
          variant="primary"
          size="lg"
          href="/"
          icon={<Icon name="house" />}
        >
          {t("notFoundButton")}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          href="/sitemap"
          icon={<Icon name="treeView" />}
          className={styles.secondaryAction}
        >
          {t("notFoundViewSitemap")}
        </Button>
      </FlexBox>
    </div>
  );
}
