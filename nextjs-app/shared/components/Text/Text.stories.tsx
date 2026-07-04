import contract from "./Text.contract.json";
import React from "react";
import Text from "@dt/Text";
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
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import Title from "@dt/Title";
import type { ComplianceRule } from "@dt/ComplianceCard";
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import CodeSnippet from "@dt/CodeSnippet";
import styles from "./Text.stories.module.css";
import schema from "./schema.json";

const textComplianceRules: ComplianceRule[] = [
  {
    id: "file-structure",
    rule: "Complete file structure",
    status: "pass",
    details: "All 5 files present",
  },
  {
    id: "typescript-strict",
    rule: "TypeScript strict",
    status: "pass",
    details: "Proper typing with TextProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Content as children prop",
  },
  {
    id: "css-modules",
    rule: "CSS Modules",
    status: "pass",
    details: "Removed inline styles, using module classes",
  },
  {
    id: "design-tokens",
    rule: "Design tokens",
    status: "pass",
    details: "Replaced Moderat with var(--font-text)",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "Uses margin-block and margin-inline",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "CSS custom properties throughout",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Polymorphic as prop, size/lineHeight variants",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Semantic HTML with flexible tag",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Multiple variants with ComplianceCard",
  },
  { id: "tests", rule: "Tests", status: "pass", details: "Test file exists" },
];

export default {
  title: "Content/Text",
  component: Text,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=370-19",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    as: {
      control: { type: "select" },
      options: ["p", "span", "div", "strong", "em"],
      description: "HTML tag to render",
    },

    size: {
      control: { type: "select" },
      options: ["xxs", "xs", "s", "m", "l", "xl", "xxl"],
      description: "Text size variant",
      table: { defaultValue: { summary: "m" } },
    },

    terminals: {
      control: { type: "radio" },
      options: ["sans", "serif"],
      description: "Font family (sans or serif)",
      table: { defaultValue: { summary: "sans" } },
    },

    lineHeight: {
      control: { type: "select" },
      options: ["tight", "snug", "normal", "relaxed", "loose"],
      description: "Line height variant",
    },

    className: { control: "text", description: "Custom class name" },

    children: { control: "text", description: "Text content" },
      asChild: { table: { disable: true } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
} as Meta;

type Story = StoryObj<typeof Text>;

export const Z_TextCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={textComplianceRules}
  />
);

const TextStory: React.FC<any> = (args) => {
  const { t } = useTranslation();
  return <Text {...args}>{t(args.children as string)}</Text>;
};

const Template = (args: any) => <TextStory {...args} />;

export const Playground: any = Template.bind({});
Playground.args = {
  children: "storyTextPlayground",
  as: "p",
  size: "m",
  terminals: "sans",
  className: "",
};

Playground.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  // Match both English and Finnish, or use a function matcher
  await canvas.findByText((content) =>
    [
      "Play with the Text component!",
      "Leiki tekstikomponentilla!",
      "Lek med Text-komponenten!",
    ].includes(content),
  );
};

export const Default = () => {
  const { t } = useTranslation();
  return <Text>{t("storyTextDefault")}</Text>;
};

export const AsSpan = () => {
  const { t } = useTranslation();
  return <Text as="span">{t("storyTextSpan")}</Text>;
};

export const CustomClass = () => {
  const { t } = useTranslation();
  return <Text className="custom-class">{t("storyTextCustom")}</Text>;
};

export const AllTags = () => {
  const { t } = useTranslation();
  return (
    <>
      <Text as="p">{t("storyTextParagraph")}</Text>
      <Text as="span">{t("storyTextSpanTag")}</Text>
      <Text as="div">{t("storyTextDiv")}</Text>
      <Text as="strong">{t("storyTextStrong")}</Text>
      <Text as="em">{t("storyTextEmphasized")}</Text>
    </>
  );
};

AllTags.tags = ["example"];
AllTags.parameters = {
  ...(AllTags as { parameters?: object }).parameters,
  docs: { description: { story: "The polymorphic as surface: p, span, strong, em, cite, div and heading tags." } },
};

export const Sizes = () => {
  const { t } = useTranslation();
  return (
    <>
      <Text size="s">{t("storyTextSmall")}</Text>
      <Text size="m">{t("storyTextMedium")}</Text>
      <Text size="l">{t("storyTextLarge")}</Text>
    </>
  );
};

Sizes.tags = ["example"];
Sizes.parameters = {
  ...(Sizes as { parameters?: object }).parameters,
  docs: { description: { story: "The xxs to xxl body ramp." } },
};

export const SerifAndSans = () => {
  const { t } = useTranslation();
  return (
    <>
      <Text terminals="sans">{t("storyTextSans")}</Text>
      <Text terminals="serif">{t("storyTextSerif")}</Text>
    </>
  );
};

SerifAndSans.tags = ["example"];
SerifAndSans.parameters = {
  ...(SerifAndSans as { parameters?: object }).parameters,
  docs: { description: { story: "Terminal families: serif for editorial weight, sans for product chrome." } },
};

export const LineHeights = () => {
  const { t } = useTranslation();
  const sampleText =
    t("storyTextLineHeight") ||
    "This is a longer sample text that demonstrates the effect of different line heights. Line height affects readability and visual density. Proper line height creates comfortable reading rhythm and improves text comprehension.";

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <Title level={3} className={styles.sectionTitle}>
          {t("storyTextLineHeightTight") || "Tight (1.2)"}
        </Title>
        <Text lineHeight="tight">{sampleText}</Text>
      </div>
      <div className={styles.section}>
        <Title level={3} className={styles.sectionTitle}>
          {t("storyTextLineHeightSnug") || "Snug (1.375)"}
        </Title>
        <Text lineHeight="snug">{sampleText}</Text>
      </div>
      <div className={styles.section}>
        <Title level={3} className={styles.sectionTitle}>
          {t("storyTextLineHeightNormal") || "Normal (1.5)"}
        </Title>
        <Text lineHeight="normal">{sampleText}</Text>
      </div>
      <div className={styles.section}>
        <Title level={3} className={styles.sectionTitle}>
          {t("storyTextLineHeightRelaxed") || "Relaxed (1.625)"}
        </Title>
        <Text lineHeight="relaxed">{sampleText}</Text>
      </div>
      <div className={styles.section}>
        <Title level={3} className={styles.sectionTitle}>
          {t("storyTextLineHeightLoose") || "Loose (1.75)"}
        </Title>
        <Text lineHeight="loose">{sampleText}</Text>
      </div>
    </div>
  );
};

LineHeights.tags = ["example"];
LineHeights.parameters = {
  ...(LineHeights as { parameters?: object }).parameters,
  docs: { description: { story: "tight to loose line-height ladder." } },
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => {
    const { t } = useTranslation();
    return (
      <>
        <Title terminals="sans" level={1} size="l">
          {t("storyTitlePlayground")}
        </Title>
        <Text terminals="sans" size="l" as="p">
          {t("storyTextDefault")}
        </Text>
      </>
    );
  },
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: {
    children: "Body copy under forced-colors",
    as: "p",
    terminals: "sans",
  },
};
