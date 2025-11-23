import React from "react";
import Title from "./Title";
import { within } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";

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
