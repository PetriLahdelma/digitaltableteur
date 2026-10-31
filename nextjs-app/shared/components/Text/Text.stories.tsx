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
import Title from "@dt/Title";
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import CodeSnippet from "@dt/CodeSnippet";
import styles from "./Text.stories.module.css";
import schema from "./schema.json";

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

    lineHeight: {
      control: { type: "select" },
      options: ["tight", "snug", "normal", "relaxed", "loose"],
      description: "Line height variant",
    },

    flush: {
      control: "boolean",
      description:
        "Drop the block margins when the parent owns spacing (a row, cell, card or gap)",
      table: { defaultValue: { summary: "false" } },
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
        <Title level={1} size="l">
          {t("storyTitlePlayground")}
        </Title>
        <Text size="l" as="p">
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
  },
};
