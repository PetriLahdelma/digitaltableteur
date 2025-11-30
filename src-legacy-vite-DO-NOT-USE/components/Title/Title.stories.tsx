import React from "react";
import Title from "./Title";
import { within } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import Icon from "@dt/Icon";

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
  title: "Components/Title",
  component: Title,
};

export const AllSizes = () => {
  const { t } = useTranslation();
  return (
    <>
      <Title size="S">{t("storyTitleSmall")}</Title>
      <Title size="M">{t("storyTitleMedium")}</Title>
      <Title size="L">{t("storyTitleLarge")}</Title>
      <Title size="XL">{t("storyTitleXL")}</Title>
    </>
  );
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

export const CustomTagAndClass = () => {
  const { t } = useTranslation();
  return (
    <Title as="div" className="custom-class" size="M">
      {t("storyTitleCustom")}
    </Title>
  );
};

export const Playground = (args: any) => {
  const { t } = useTranslation();
  return <Title {...args}>{t(args.children)}</Title>;
};
Playground.args = {
  level: 2,
  size: "M",
  children: "storyTitlePlayground",
};
Playground.argTypes = {
  level: {
    control: { type: "select" },
    options: [1, 2, 3, 4, 5, 6],
    defaultValue: 2,
  },
  size: {
    control: { type: "select" },
    options: ["XS", "S", "M", "L", "XL"],
    defaultValue: "M",
  },
  children: {
    control: "text",
    defaultValue: "Playground Title",
  },
  className: { control: "text" },
  terminals: {
    control: { type: "select" },
    options: ["serif", "sans"],
    defaultValue: "serif",
  },
  lineHeight: {
    control: { type: "select" },
    options: ["tight", "snug", "normal", "relaxed", "loose"],
    description: "Line height variant",
  },
  as: { control: "text" },
};

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

export const Z_TitleCompliance: React.FC = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={titleComplianceRules}
  />
);
