"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import PageLayout from "../../../patterns/PageLayout/PageLayout";
import Text from "@dt/Text";
import Title from "@dt/Title";
import styles from "./AboutPage.module.css";

export function AboutPage() {
  const { t } = useTranslation();
  const manifestoTokens = useMemo(
    () => [
      { text: "Digitaltableteur is", highlightable: false },
      { text: "No-Fluff Thinking", highlightable: true },
      { text: "AI-Powered Craft", highlightable: true },
      { text: "Design Systems Done Right", highlightable: true },
      { text: "Standards So High They Hurt", highlightable: true },
      { text: "Creativity With Structure", highlightable: true },
      { text: "Structure With Freedom", highlightable: true },
      { text: "Technology With Taste", highlightable: true },
      { text: "Human Insight Over Hype", highlightable: true },
      { text: "Pushing Boundaries", highlightable: true },
      { text: "Staying Curious", highlightable: true },
      { text: "Making Products Feel Effortless.", highlightable: true },
    ],
    [],
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
            Manifesto
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
