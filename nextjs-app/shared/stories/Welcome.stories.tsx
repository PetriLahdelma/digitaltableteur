import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import { useTheme } from "@dt/ThemeProvider";
import styles from "./Welcome.module.css";

const WelcomeContent = () => {
  const { t } = useTranslation();
  useTheme(); // ensure story re-renders on theme change

  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <h1>{t("storybookWelcomeTitle")}</h1>
        <p className={styles.subtitle}>{t("storybookWelcomeSubtitle")}</p>
      </header>

      <section className={styles.section}>
        <h2>{t("storybookWelcomeQuickLinks")}</h2>
        <ul>
          <li>{t("storybookWelcomeLinkDashboard")}</li>
          <li>{t("storybookWelcomeLinkDocs")}</li>
          <li>{t("storybookWelcomeLinkComponents")}</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>{t("storybookWelcomeCommands")}</h2>
        <pre className={styles.code}>
          {`npm run storybook   # ${t("storybookWelcomeCommandStorybook")}\nnpm run test        # ${t("storybookWelcomeCommandTests")}\nnpm run test:a11y   # ${t("storybookWelcomeCommandA11y")}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>{t("storybookWelcomeInsideTitle")}</h2>
        <p>{t("storybookWelcomeInsideDescription")}</p>
        <ul>
          <li>{t("storybookWelcomeInsideTokens")}</li>
          <li>{t("storybookWelcomeInsideThemes")}</li>
          <li>{t("storybookWelcomeInsideLocalization")}</li>
        </ul>
      </section>
    </article>
  );
};

const meta: Meta<typeof WelcomeContent> = {
  title: "Overview/Welcome",
  component: WelcomeContent,
  tags: ["!autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof WelcomeContent>;

export const Welcome: Story = { render: () => <WelcomeContent /> };
