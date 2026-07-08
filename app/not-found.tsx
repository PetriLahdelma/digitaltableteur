"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@digitaltableteur/react";
import styles from "./not-found.module.css";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className={styles.notFoundPage}>
      <Button variant="primary" size="lg" href="/" icon={<Icon name="house" />}>
        {t("notFoundButton")}
      </Button>
    </div>
  );
}
