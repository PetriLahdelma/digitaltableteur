import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import styles from "./ThemingAndLocalization.module.css";

const DocsContent = () => {
  const { t } = useTranslation();

  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <h1>{t("docsThemeTitle")}</h1>
        <p className={styles.lead}>{t("docsThemeSubtitle")}</p>
      </header>

      <section className={styles.section}>
        <h2>{t("docsThemePipelineHeading")}</h2>
        <ol>
          <li>{t("docsThemePipelineStep1")}</li>
          <li>{t("docsThemePipelineStep2")}</li>
          <li>{t("docsThemePipelineStep3")}</li>
        </ol>
        <p>{t("docsThemePipelineTipsIntro")}</p>
        <ul>
          <li>{t("docsThemePipelineTipVariables")}</li>
          <li>{t("docsThemePipelineTipTokens")}</li>
          <li>{t("docsThemePipelineTipForcedTheme")}</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>{t("docsLocalePipelineHeading")}</h2>
        <ol>
          <li>{t("docsLocalePipelineStep1")}</li>
          <li>{t("docsLocalePipelineStep2")}</li>
          <li>{t("docsLocalePipelineStep3")}</li>
        </ol>
        <ul>
          <li>{t("docsLocaleTipUseTranslation")}</li>
          <li>{t("docsLocaleTipParity")}</li>
          <li>{t("docsLocaleTipStoryCopy")}</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>{t("docsTestingHeading")}</h2>
        <ul>
          <li>{t("docsTestingCommandTest")}</li>
          <li>{t("docsTestingCommandA11y")}</li>
          <li>{t("docsTestingCommandStorybook")}</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>{t("docsFilesHeading")}</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("docsFilesColumnArea")}</th>
              <th>{t("docsFilesColumnPath")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t("docsFilesThemeTokens")}</td>
              <td>
                <code>src/styles/variables.css</code>
              </td>
            </tr>
            <tr>
              <td>{t("docsFilesThemeProvider")}</td>
              <td>
                <code>src/components/ThemeProvider/ThemeProvider.tsx</code>
              </td>
            </tr>
            <tr>
              <td>{t("docsFilesI18n")}</td>
              <td>
                <code>src/i18n.ts</code>
              </td>
            </tr>
            <tr>
              <td>{t("docsFilesPreview")}</td>
              <td>
                <code>.storybook/preview.tsx</code>
              </td>
            </tr>
            <tr>
              <td>{t("docsFilesCoverage")}</td>
              <td>
                <code>src/__tests__/translation-coverage.test.tsx</code>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  );
};

const meta: Meta<typeof DocsContent> = {
  title: "Docs/Theming & Localization",
  component: DocsContent,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof DocsContent>;

export const Overview: Story = {
  render: () => <DocsContent />,
};
