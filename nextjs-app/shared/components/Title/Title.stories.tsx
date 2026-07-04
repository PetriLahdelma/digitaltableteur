import contract from "./Title.contract.json";
import React from "react";
import Title from "@dt/Title";
import type { Meta } from "@storybook/react-vite";
import { within } from "storybook/test";
import {
  Controls,
  Description,
  Heading,
  Primary,
  Stories,
  Subtitle,
  Title as DocTitle,
} from "@storybook/addon-docs/blocks";
import { useTranslation } from "react-i18next";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import Icon from "@dt/Icon";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";

const titleComplianceRules: ComplianceRule[] = [
  {
    id: "css-modules",
    rule: "CSS Modules only (no inline styles)",
    status: "pass",
    details: "All styles via CSS Modules",
  },
  {
    id: "design-tokens",
    rule: "Design tokens for spacing/colors/typography",
    status: "pass",
    details: "Uses CSS custom properties",
  },
  {
    id: "logical-properties",
    rule: "Logical CSS properties",
    status: "pass",
    details: "Uses logical spacing",
  },
  {
    id: "semantic-html",
    rule: "Semantic HTML (h1-h6 or custom)",
    status: "pass",
    details: "Polymorphic as prop",
  },
  {
    id: "typescript-strict",
    rule: "TypeScript strict mode",
    status: "pass",
    details: "Proper typing with TitleProps",
  },
  {
    id: "accessibility",
    rule: "Accessibility (proper heading levels)",
    status: "pass",
    details: "Semantic heading hierarchy",
  },
  {
    id: "translation-support",
    rule: "i18n for title text",
    status: "pass",
    details: "Stories use translation keys",
  },
  {
    id: "tests",
    rule: "Unit tests with .play functions",
    status: "pass",
    details: "Test file with interactions",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Multiple size and level variants",
  },
  {
    id: "font-tokens",
    rule: "Font token compliance (--font-text/--font-title)",
    status: "pass",
    details: "Uses design system fonts",
  },
  {
    id: "no-hardcoded",
    rule: "No hardcoded values",
    status: "pass",
    details: "All values from tokens",
  },
];

export default {
  title: "Content/Title",
  component: Title,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=370-12",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts,
  // registered in .storybook/controls-autogen.json). Author argTypes here only
  // for bespoke knobs or mapping presets — authored entries win over autogen.
} as Meta<typeof Title>;

export const AllSizes = () => {
  const { t } = useTranslation();
  return (
    <>
      <Title size="s">{t("storyTitleSmall")}</Title>
      <Title size="m">{t("storyTitleMedium")}</Title>
      <Title size="l">{t("storyTitleLarge")}</Title>
      <Title size="xl">{t("storyTitleXL")}</Title>
    </>
  );
};

AllSizes.tags = ["example"];
AllSizes.parameters = {
  ...(AllSizes as { parameters?: object }).parameters,
  docs: { description: { story: "The xxs to xxl heading scale, independent of the semantic level." } },
};

export const AllLevels = () => {
  const { t } = useTranslation();
  return (
    <>
      <Title level={1}>{t("storyHeading1")}</Title>
      <Title level={2}>{t("storyHeading2")}</Title>
      <Title level={3}>{t("storyHeading3")}</Title>
      <Title level={4}>{t("storyHeading4")}</Title>
      <Title level={5}>{t("storyHeading5")}</Title>
      <Title level={6}>{t("storyHeading6")}</Title>
    </>
  );
};

AllLevels.tags = ["example"];
AllLevels.parameters = {
  ...(AllLevels as { parameters?: object }).parameters,
  docs: { description: { story: "h1 to h6 via level, with the visual size held constant." } },
};

export const CustomTagAndClass = () => {
  const { t } = useTranslation();
  return (
    <Title as="div" className="custom-class" size="m">
      {t("storyTitleCustom")}
    </Title>
  );
};

export const Playground = (args: any) => {
  const { t } = useTranslation();
  return <Title {...args}>{t(args.children)}</Title>;
};
Playground.args = { level: 2, size: "m", children: "storyTitlePlayground" };

export const Default = Playground;
export const LineHeights = () => {
  const { t } = useTranslation();
  const sampleTitle =
    t("storyTitleLineHeight") || "Typography Line Height Demonstration";

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div>
        <p
          style={{
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "600",
          }}
        >
          {t("storyTitleLineHeightTight") || "Tight (1.2) - Large headings"}
        </p>
        <Title lineHeight="tight">{sampleTitle}</Title>
      </div>
      <div>
        <p
          style={{
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "600",
          }}
        >
          {t("storyTitleLineHeightSnug") || "Snug (1.375) - Medium headings"}
        </p>
        <Title lineHeight="snug">{sampleTitle}</Title>
      </div>
      <div>
        <p
          style={{
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "600",
          }}
        >
          {t("storyTitleLineHeightNormal") || "Normal (1.5) - Body text"}
        </p>
        <Title lineHeight="normal">{sampleTitle}</Title>
      </div>
      <div>
        <p
          style={{
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "600",
          }}
        >
          {t("storyTitleLineHeightRelaxed") || "Relaxed (1.625) - Long-form"}
        </p>
        <Title lineHeight="relaxed">{sampleTitle}</Title>
      </div>
      <div>
        <p
          style={{
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "600",
          }}
        >
          {t("storyTitleLineHeightLoose") || "Loose (1.75) - Max readability"}
        </p>
        <Title lineHeight="loose">{sampleTitle}</Title>
      </div>
    </div>
  );
};

AllSizes.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const headings = await canvas.findAllByRole("heading");
  if (headings.length < 4) {
    throw new Error("Expected four title sizes to be rendered");
  }
};

AllLevels.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const headings = await canvas.findAllByRole("heading");
  if (headings.length < 6) {
    throw new Error("Expected six heading levels to be rendered");
  }
};

LineHeights.tags = ["example"];
LineHeights.parameters = {
  ...(LineHeights as { parameters?: object }).parameters,
  docs: { description: { story: "tight to loose line-height ladder on headings." } },
};

export const Z_TitleCompliance: React.FC = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={titleComplianceRules}
  />
);

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => {
    const { t } = useTranslation();
    return (
      <Title terminals="sans" level={1} size="l">
        {t("storyTitlePlayground")}
      </Title>
    );
  },
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: {
    children: "Heading under forced-colors",
    level: 2,
    size: "m",
    terminals: "sans",
  },
};
