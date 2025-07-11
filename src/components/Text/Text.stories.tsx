import React from "react";
import Text from "./Text";
import { within } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";

export default {
  title: "Components/Text",
  component: Text,
  argTypes: {
    as: {
      control: { type: "select" },
      options: ["p", "span", "div", "strong", "em"],
      description: "HTML tag to render",
    },
    size: {
      control: { type: "radio" },
      options: ["S", "M", "L"],
      description: "Text size variant",
    },
    terminals: {
      control: { type: "radio" },
      options: ["sans", "serif"],
      description: "Font family (sans or serif)",
    },
    className: { control: "text", description: "Custom class name" },
    children: { control: "text", description: "Text content" },
  },
};

const TextStory: React.FC<any> = (args) => {
  const { t } = useTranslation();
  return <Text {...args}>{t(args.children as string)}</Text>;
};

const Template = (args: any) => <TextStory {...args} />;

export const Playground: any = Template.bind({});
Playground.args = {
  children: "storyTextPlayground",
  as: "p",
  size: "M",
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

export const Sizes = () => {
  const { t } = useTranslation();
  return (
    <>
      <Text size="S">{t("storyTextSmall")}</Text>
      <Text size="M">{t("storyTextMedium")}</Text>
      <Text size="L">{t("storyTextLarge")}</Text>
    </>
  );
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
