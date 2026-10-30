import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTranslation } from "react-i18next";
import Code from "@dt/Code";
import CodeBlock from "@dt/CodeBlock";
import { useTheme } from "@dt/ThemeProvider";
import {
  GuideCards,
  GuideList,
  GuidePage,
  GuideSection,
} from "../../../.storybook/blocks/guide/GuidePage";

/** Sets a file path inside translated copy as code, so it never breaks. */
const withPathAsCode = (text: string) => {
  const match = text.match(/[\w.-]+(?:\/[\w.-]+)+/);
  if (!match || match.index === undefined) return text;
  return (
    <>
      {text.slice(0, match.index)}
      <Code size="inherit">{match[0]}</Code>
      {text.slice(match.index + match[0].length)}
    </>
  );
};

const WelcomeContent = () => {
  const { t } = useTranslation();
  useTheme(); // ensure story re-renders on theme change

  return (
    <GuidePage
      kicker="Storybook"
      title={t("storybookWelcomeTitle")}
      lede={t("storybookWelcomeSubtitle")}
    >
      <GuideSection title={t("storybookWelcomeQuickLinks")}>
        <GuideCards
          items={[
            {
              title: "Introduction",
              href: "?path=/docs/overview-introduction--docs",
              body: t("storybookWelcomeLinkDocs"),
            },
            {
              title: "Components",
              href: "?path=/docs/overview-components--docs",
              body: t("storybookWelcomeLinkComponents"),
            },
            {
              title: "Test health",
              href: "?path=/story/overview-test-health--dashboard",
              body: t("storybookWelcomeLinkDashboard"),
            },
          ]}
        />
      </GuideSection>

      <GuideSection title={t("storybookWelcomeCommands")}>
        <CodeBlock
          language="bash"
          copyable
          code={[
            `npm run storybook   # ${t("storybookWelcomeCommandStorybook")}`,
            `npm run test        # ${t("storybookWelcomeCommandTests")}`,
            `npm run test:a11y   # ${t("storybookWelcomeCommandA11y")}`,
          ].join("\n")}
        />
      </GuideSection>

      <GuideSection
        title={t("storybookWelcomeInsideTitle")}
        intro={t("storybookWelcomeInsideDescription")}
      >
        <GuideList
          items={[
            withPathAsCode(t("storybookWelcomeInsideTokens")),
            t("storybookWelcomeInsideThemes"),
            t("storybookWelcomeInsideLocalization"),
          ]}
        />
      </GuideSection>
    </GuidePage>
  );
};

const meta: Meta<typeof WelcomeContent> = {
  title: "Overview/Welcome",
  component: WelcomeContent,
  tags: ["!autodocs"],
  parameters: { layout: "fullscreen", wip: { disabled: true } },
};

export default meta;

type Story = StoryObj<typeof WelcomeContent>;

export const Welcome: Story = { render: () => <WelcomeContent /> };
