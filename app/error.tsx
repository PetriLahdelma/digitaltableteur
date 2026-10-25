"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@digitaltableteur/react";
import styles from "./not-found.module.css";
import {
  isChunkLoadError,
  readSsrSnapshot,
  useReloadWhenReachable,
} from "./lib/ssr-snapshot";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  // A chunk that failed to download keeps the server-rendered page segment
  // on screen (see lib/ssr-snapshot.ts); the page reloads once the site
  // answers. Read once, before React replaces the DOM.
  const [snapshot] = React.useState(() => readSsrSnapshot(error));
  useReloadWhenReachable(isChunkLoadError(error));

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  if (snapshot?.page) {
    return (
      <div
        className={styles.restoredPage}
        dangerouslySetInnerHTML={{ __html: snapshot.page }}
      />
    );
  }

  return (
    <div className={styles.notFoundPage}>
      <h2>{t("errorTitle", "Something went wrong!")}</h2>
      <p>{t("errorDescription", "An unexpected error occurred.")}</p>
      <div className={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          onClick={reset}
          icon={<Icon name="arrowClockwise" />}
        >
          {t("errorRetry", "Try again")}
        </Button>
        <Button variant="secondary" size="lg" href="/" icon={<Icon name="house" />}>
          {t("notFoundButton", "Go home")}
        </Button>
      </div>
    </div>
  );
}
