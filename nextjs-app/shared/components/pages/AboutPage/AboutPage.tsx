"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import PageLayout from "../../../patterns/PageLayout/PageLayout";
import Text from "@dt/Text";
import Title from "@dt/Title";
import styles from "./AboutPage.module.css";
import Badge from "../../Badge";

export function AboutPage() {
  const { t, i18n } = useTranslation();

  const manifestoTokens = useMemo(
    () => [
      { text: t("aboutManifestoIntro"), highlightable: false },
      { text: t("aboutManifestoPhrase1"), highlightable: true },
      { text: t("aboutManifestoPhrase2"), highlightable: true },
      { text: t("aboutManifestoPhrase3"), highlightable: true },
      { text: t("aboutManifestoPhrase4"), highlightable: true },
      { text: t("aboutManifestoPhrase5"), highlightable: true },
      { text: t("aboutManifestoPhrase6"), highlightable: true },
      { text: t("aboutManifestoPhrase7"), highlightable: true },
      { text: t("aboutManifestoPhrase8"), highlightable: true },
      { text: t("aboutManifestoPhrase9"), highlightable: true },
      { text: t("aboutManifestoPhrase10"), highlightable: true },
      { text: t("aboutManifestoPhrase11"), highlightable: true },
    ],
    [t, i18n.language],
  );

  const highlightableIndices = useMemo(
    () =>
      manifestoTokens
        .map((token, idx) => (token.highlightable ? idx : -1))
        .filter((idx) => idx >= 0),
    [manifestoTokens],
  );

  const [activeIdx, setActiveIdx] = useState<number | null>(
    highlightableIndices[0] ?? null,
  );

  useEffect(() => {
    if (!highlightableIndices.length) return;
    let current = highlightableIndices[0];
    const id = window.setInterval(() => {
      let next = current;
      if (highlightableIndices.length > 1) {
        while (next === current) {
          next =
            highlightableIndices[
              Math.floor(Math.random() * highlightableIndices.length)
            ];
        }
      }
      current = next;
      setActiveIdx(next);
    }, 2400);
    return () => window.clearInterval(id);
  }, [highlightableIndices]);

  return (
    <div className={styles.about}>
      <PageLayout maxWidth="xl" spacing="comfortable" as="section">
        <section className={styles.who}>
          <Title size="L" level={2}>
            {t("aboutWhoTitle")}
          </Title>
        </section>
      </PageLayout>

      <PageLayout
        maxWidth="full"
        withMargins={false}
        spacing="compact"
        as="section"
      >
        <section className={styles.what}>
          <Title size="L" level={1}>
            {t("aboutHeroTitle")}
          </Title>
          <Text size="L">{t("aboutHeroText")}</Text>
        </section>
      </PageLayout>

      <PageLayout maxWidth="sm" spacing="spacious" as="section">
        <section className={styles.section}>
          <Title size="M" level={2}>
            {t("aboutDesignTitle")}
          </Title>
          <Text>{t("aboutDesignText")}</Text>
        </section>
      </PageLayout>

      <PageLayout maxWidth="sm" spacing="comfortable" as="section">
        <section className={styles.section}>
          <Title size="M" level={2}>
            {t("aboutDevelopmentTitle")}
          </Title>
          <Text>{t("aboutDevelopmentText")}</Text>
        </section>
      </PageLayout>

      <PageLayout maxWidth="sm" spacing="comfortable" as="section">
        <section className={styles.section}>
          <Title size="M" level={2}>
            {t("aboutCollaborationTitle")}
          </Title>
          <Text>{t("aboutCollaborationText")}</Text>
        </section>
      </PageLayout>

      <PageLayout maxWidth="full" spacing="comfortable" as="section">
        <section
          className={styles.manifesto}
          aria-label="Digitaltableteur manifesto"
        >
          <Title
            size="M"
            level={2}
            className={styles.manifestoTitle}
            terminals="sans"
          >
            {t("aboutManifestoTitle")}
          </Title>
          <p className={styles.manifestoLine}>
            {manifestoTokens.map((token, idx) => {
              const isActive = token.highlightable && activeIdx === idx;
              const hasNextHighlightable = manifestoTokens
                .slice(idx + 1)
                .some((t) => t.highlightable);
              return (
                <React.Fragment key={`${idx}-${token.text}`}>
                  <span
                    className={`${styles.manifestoWord} ${
                      isActive ? styles.manifestoWordActive : ""
                    }`.trim()}
                    aria-live="off"
                  >
                    {token.text}
                  </span>
                  {token.highlightable && hasNextHighlightable && (
                    <span
                      className={styles.manifestoSeparator}
                      aria-hidden="true"
                    >
                      ✕
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </p>
        </section>
      </PageLayout>
    </div>
  );
}
