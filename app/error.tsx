"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "@dt/Button";
import Icon from "@dt/Icon";
import styles from "./not-found.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className={styles.notFoundPage}>
      <h2>{t("errorTitle", "Something went wrong!")}</h2>
      <p>{t("errorDescription", "An unexpected error occurred.")}</p>
      <div className={styles.actions}>
        <Button
          variant="primary"
          size="l"
          onClick={reset}
          icon={<Icon name="arrowClockwise" />}
        >
          {t("errorRetry", "Try again")}
        </Button>
        <Button variant="secondary" size="l" href="/" icon={<Icon name="house" />}>
          {t("notFoundButton", "Go home")}
        </Button>
      </div>
    </div>
  );
}
