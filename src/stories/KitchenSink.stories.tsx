import React, { Suspense } from "react";
import { Meta } from "@storybook/react-vite";
import {
  AllVariants as ButtonVariants,
  AllSizes as ButtonSizes,
} from "../components/Button/Button.stories";
import {
  AllVariants as BadgeVariants,
  AllSizes as BadgeSizes,
} from "../components/Badge/Badge.stories";
import {
  Spans as GridSpans,
  Nested as GridNested,
} from "../components/Grid/Grid.stories";
import {
  Default as TextDefault,
  AsSpan as TextAsSpan,
  CustomClass as TextCustomClass,
  AllTags as TextAllTags,
  Sizes as TextSizes,
  SerifAndSans as TextSerifAndSans,
} from "../components/Text/Text.stories";
import {
  AllSizes as TitleSizes,
  AllLevels as TitleLevels,
  CustomTagAndClass as TitleCustomTag,
} from "../components/Title/Title.stories";
import {
  Default as ArticleCardDefault,
  WithCustomClass as ArticleCardWithCustomClass,
} from "../components/ArticleCard/ArticleCard.stories";
import Avatar from "@dt/Avatar";
import {
  WithImage as AvatarWithImageStory,
  WithName as AvatarWithNameStory,
} from "../components/Avatar/Avatar.stories";
import {
  Default as CheckboxDefaultStory,
  Checked as CheckboxCheckedStory,
  Indeterminate as CheckboxIndeterminateStory,
} from "../components/Checkbox/Checkbox.stories";
import { Default as CheckboxGroupDefaultStory } from "../components/CheckboxGroup/CheckboxGroup.stories";
import Checkbox from "@dt/Checkbox";
import CheckboxGroup from "@dt/CheckboxGroup";
import FlexBox from "@dt/FlexBox";
import {
  Basic as FlexBoxBasicStory,
  Column as FlexBoxColumnStory,
  JustifyAlign as FlexBoxJustifyAlignStory,
  Wrap as FlexBoxWrapStory,
  GapVariants as FlexBoxGapVariantsStory,
} from "../components/FlexBox/FlexBox.stories";
import * as InputsStories from "../components/Inputs/Inputs.stories";
import * as LabelStories from "../components/Label/Label.stories";
import * as LinkStories from "../components/Link/Link.stories";
import Input from "@dt/Inputs";
import Label from "@dt/Label";
import Link from "@dt/Link";
import { useTranslation } from "react-i18next";

export default {
  title: "Testing/Kitchen Sink",
  parameters: {
    test: { disable: true },
    visualRegression: { disable: true },
    a11y: { disable: true },
  },
} as Meta;

const AvatarWithImage = () => <Avatar {...AvatarWithImageStory.args} />;
const AvatarWithName = () => <Avatar {...AvatarWithNameStory.args} />;
const CheckboxDefault = () => (
  <Checkbox
    {...CheckboxDefaultStory.args}
    checked={CheckboxDefaultStory.args?.checked ?? false}
    onCheckedChange={() => {}}
  />
);
const CheckboxChecked = () => (
  <Checkbox
    {...CheckboxCheckedStory.args}
    checked={CheckboxCheckedStory.args?.checked ?? false}
    onCheckedChange={() => {}}
  />
);
const CheckboxIndeterminate = () => (
  <Checkbox
    {...CheckboxIndeterminateStory.args}
    checked={CheckboxIndeterminateStory.args?.checked ?? false}
    onCheckedChange={() => {}}
  />
);
const CheckboxGroupDefault = () => {
  const { t } = useTranslation();
  const labelKey = CheckboxGroupDefaultStory.args?.label;
  const translatedLabel = labelKey ? t(labelKey) : "";
  const translatedOptions =
    CheckboxGroupDefaultStory.args?.options?.map((option) => ({
      ...option,
      label:
        typeof option.label === "string"
          ? t(option.label)
          : (option.label ?? ""),
    })) ?? [];

  return (
    <CheckboxGroup
      {...CheckboxGroupDefaultStory.args}
      label={translatedLabel}
      options={translatedOptions}
      onChange={() => {}}
    />
  );
};
const CheckboxAllVariants = () => (
  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
    <CheckboxDefault />
    <CheckboxChecked />
    <CheckboxIndeterminate />
  </div>
);
const FlexBoxBasic = () => (
  <FlexBox {...FlexBoxBasicStory.args}>
    {FlexBoxBasicStory.args?.children ?? null}
  </FlexBox>
);
const FlexBoxColumn = () => (
  <FlexBox {...FlexBoxColumnStory.args}>
    {FlexBoxColumnStory.args?.children ?? null}
  </FlexBox>
);
const FlexBoxJustifyAlign = () => (
  <FlexBox {...FlexBoxJustifyAlignStory.args}>
    {FlexBoxJustifyAlignStory.args?.children ?? null}
  </FlexBox>
);
const FlexBoxWrap = () => (
  <FlexBox {...FlexBoxWrapStory.args}>
    {FlexBoxWrapStory.args?.children ?? null}
  </FlexBox>
);
const FlexBoxGapVariants = () => (
  <FlexBox {...FlexBoxGapVariantsStory.args}>
    {FlexBoxGapVariantsStory.args?.children ?? null}
  </FlexBox>
);

// Inputs wrappers
const InputsText = () => {
  const { t } = useTranslation();
  const args = InputsStories.TextInput.args || {};
  return (
    <Input
      {...args}
      label={
        typeof args.label === "string"
          ? t(args.label)
          : (args.label ?? "Text Input")
      }
      placeholder={
        typeof args.placeholder === "string"
          ? t(args.placeholder)
          : (args.placeholder ?? "Enter text")
      }
      type={InputsStories.TextInput.args?.type ?? "text"}
      error={
        typeof args.error === "string"
          ? t(args.error)
          : (args.error ?? undefined)
      }
    />
  );
};

const InputsNumber = () => {
  const { t } = useTranslation();
  const args = InputsStories.NumberInput.args || {};

  return (
    <Input
      {...args}
      label={
        typeof args.label === "string"
          ? t(args.label)
          : (args.label ?? "Number Input")
      }
      placeholder={
        typeof args.placeholder === "string"
          ? t(args.placeholder)
          : (args.placeholder ?? "Enter number")
      }
      type={InputsStories.NumberInput.args?.type ?? "number"}
      error={
        typeof args.error === "string"
          ? t(args.error)
          : (args.error ?? undefined)
      }
    />
  );
};

const InputsEmail = () => {
  const { t } = useTranslation();
  const args = InputsStories.EmailInput.args || {};

  return (
    <Input
      {...args}
      label={
        typeof args.label === "string"
          ? t(args.label)
          : (args.label ?? "Email Input")
      }
      placeholder={
        typeof args.placeholder === "string"
          ? t(args.placeholder)
          : (args.placeholder ?? "Enter email")
      }
      type={InputsStories.EmailInput.args?.type ?? "email"}
      error={
        typeof args.error === "string"
          ? t(args.error)
          : (args.error ?? undefined)
      }
    />
  );
};

const InputsPassword = () => {
  const { t } = useTranslation();
  const args = InputsStories.PasswordInput.args || {};

  return (
    <Input
      {...args}
      label={
        typeof args.label === "string"
          ? t(args.label)
          : (args.label ?? "Password Input")
      }
      placeholder={
        typeof args.placeholder === "string"
          ? t(args.placeholder)
          : (args.placeholder ?? "Enter password")
      }
      type={InputsStories.PasswordInput.args?.type ?? "password"}
      error={
        typeof args.error === "string"
          ? t(args.error)
          : (args.error ?? undefined)
      }
    />
  );
};

const InputsSearch = () => {
  const { t } = useTranslation();
  const args = InputsStories.SearchInput.args || {};

  return (
    <Input
      {...args}
      label={
        typeof args.label === "string"
          ? t(args.label)
          : (args.label ?? "Search Input")
      }
      placeholder={
        typeof args.placeholder === "string"
          ? t(args.placeholder)
          : (args.placeholder ?? "Search...")
      }
      type={InputsStories.SearchInput.args?.type ?? "search"}
      error={
        typeof args.error === "string"
          ? t(args.error)
          : (args.error ?? undefined)
      }
    />
  );
};

const InputsWithError = () => {
  const { t } = useTranslation();
  const args = InputsStories.InputWithError.args || {};

  return (
    <Input
      {...args}
      label={
        typeof args.label === "string"
          ? t(args.label)
          : (args.label ?? "Input with Error")
      }
      placeholder={
        typeof args.placeholder === "string"
          ? t(args.placeholder)
          : (args.placeholder ?? "Enter text")
      }
      type={InputsStories.InputWithError.args?.type ?? "text"}
      error={
        typeof args.error === "string"
          ? t(args.error)
          : (args.error ?? "This field is required")
      }
    />
  );
};

const InputsDisabled = () => {
  const { t } = useTranslation();
  const args = InputsStories.DisabledInput.args || {};

  return (
    <Input
      {...args}
      label={
        typeof args.label === "string"
          ? t(args.label)
          : (args.label ?? "Disabled Input")
      }
      placeholder={
        typeof args.placeholder === "string"
          ? t(args.placeholder)
          : (args.placeholder ?? "Disabled")
      }
      type={InputsStories.DisabledInput.args?.type ?? "text"}
      disabled
      error={
        typeof args.error === "string"
          ? t(args.error)
          : (args.error ?? undefined)
      }
    />
  );
};

// Label wrappers
const LabelDefaultWrap = () => {
  const { t } = useTranslation();
  const rawContent = LabelStories.Default.args?.children;
  const content =
    typeof rawContent === "string"
      ? t(rawContent)
      : (rawContent ?? "Default Label");
  return (
    <Label
      htmlFor={
        LabelStories.Default.args?.htmlFor ?? "label-default-kitchensink"
      }
    >
      {content}
    </Label>
  );
};

const LabelWithTooltipWrap = () => {
  const { t } = useTranslation();
  const tooltipKey =
    LabelStories.WithTooltip.args?.tooltipText ??
    (typeof LabelStories.WithTooltip.args?.title === "string"
      ? LabelStories.WithTooltip.args?.title
      : undefined);
  const tooltipText = tooltipKey ? t(tooltipKey) : "This is a tooltip";
  const rawContent = LabelStories.WithTooltip.args?.children;
  const content =
    typeof rawContent === "string"
      ? t(rawContent)
      : (rawContent ?? "Label with Tooltip");
  return (
    <Label
      htmlFor={
        LabelStories.WithTooltip.args?.htmlFor ?? "label-tooltip-kitchensink"
      }
      tooltipText={tooltipText}
      title={tooltipText}
    >
      {content}
    </Label>
  );
};

const LabelRequiredWrap = () => {
  const { t } = useTranslation();
  const rawContent = LabelStories.Required.args?.children;
  const content =
    typeof rawContent === "string"
      ? t(rawContent)
      : (rawContent ?? "Required Label");
  return (
    <Label
      htmlFor={
        LabelStories.Required.args?.htmlFor ?? "label-required-kitchensink"
      }
      required
    >
      {content}
    </Label>
  );
};

const LabelDisabledWrap = () => {
  const { t } = useTranslation();
  const rawContent = LabelStories.Disabled.args?.children;
  const content =
    typeof rawContent === "string"
      ? t(rawContent)
      : (rawContent ?? "Disabled Label");
  return (
    <Label
      htmlFor={
        LabelStories.Disabled.args?.htmlFor ?? "label-disabled-kitchensink"
      }
      disabled
    >
      {content}
    </Label>
  );
};

// Link wrappers
const LinkPlaygroundWrap = () => {
  const { t } = useTranslation();
  const children = LinkStories.Playground.args?.children;
  const content =
    typeof children === "string"
      ? t(children)
      : (children ?? "Playground Link");
  return <Link href={LinkStories.Playground.args?.href ?? "#"}>{content}</Link>;
};

const LinkSmallWrap = () => {
  const { t } = useTranslation();
  const children = LinkStories.Small.args?.children;
  const content =
    typeof children === "string" ? t(children) : (children ?? "Small Link");
  return (
    <Link href={LinkStories.Small.args?.href ?? "#"} size="S">
      {content}
    </Link>
  );
};

const LinkMediumWrap = () => {
  const { t } = useTranslation();
  const children = LinkStories.Medium.args?.children;
  const content =
    typeof children === "string" ? t(children) : (children ?? "Medium Link");
  return (
    <Link href={LinkStories.Medium.args?.href ?? "#"} size="M">
      {content}
    </Link>
  );
};

const LinkLargeWrap = () => {
  const { t } = useTranslation();
  const children = LinkStories.Large.args?.children;
  const content =
    typeof children === "string" ? t(children) : (children ?? "Large Link");
  return (
    <Link href={LinkStories.Large.args?.href ?? "#"} size="L">
      {content}
    </Link>
  );
};

type ComponentVariant = {
  name: string;
  // Accept Storybook story functions (StoryAnnotations) or plain React components
  Variants: React.ComponentType<any>;
};

// Use loose typing here because Storybook story exports carry StoryAnnotations generic types not assignable directly to React.ComponentType.
// Rendering is still safe since we invoke them as components.
const COMPONENTS = [
  { name: "Badge Sizes", Variants: BadgeSizes },
  { name: "Badge Variants", Variants: BadgeVariants },
  { name: "Button Sizes", Variants: ButtonSizes },
  { name: "Button Variants", Variants: ButtonVariants },
  { name: "Grid Nested", Variants: GridNested },
  { name: "Grid Spans", Variants: GridSpans },
  { name: "Text AllTags", Variants: TextAllTags },
  { name: "Text AsSpan", Variants: TextAsSpan },
  { name: "Text CustomClass", Variants: TextCustomClass },
  { name: "Text Default", Variants: TextDefault },
  { name: "Text SerifAndSans", Variants: TextSerifAndSans },
  { name: "Text Sizes", Variants: TextSizes },
  { name: "Title CustomTagAndClass", Variants: TitleCustomTag },
  { name: "Title Levels", Variants: TitleLevels },
  { name: "Title Sizes", Variants: TitleSizes },
  {
    name: "ArticleCard Default",
    Variants: () => (
      <ArticleCardDefault
        title="Design System Best Practices"
        lead="Learn how to build, scale, and maintain a robust design system for modern teams."
        link="/blog/design-system-best-practices"
        readTime="8 min read"
      />
    ),
  },
  {
    name: "ArticleCard WithCustomClass",
    Variants: () => (
      <ArticleCardWithCustomClass
        title="Branding in 2025: Trends & Opportunities"
        lead="Explore the future of digital branding, emerging technologies, and resilient brand strategies."
        link="/blog/branding-2025"
        readTime="14 min read"
        className="customClass"
      />
    ),
  },
  {
    name: "Avatar WithImage",
    Variants: AvatarWithImage,
  },
  {
    name: "Avatar WithName",
    Variants: AvatarWithName,
  },
  {
    name: "Checkbox AllVariants",
    Variants: CheckboxAllVariants,
  },
  {
    name: "CheckboxGroup Default",
    Variants: CheckboxGroupDefault,
  },
  {
    name: "FlexBox Basic",
    Variants: FlexBoxBasic,
  },
  {
    name: "FlexBox Column",
    Variants: FlexBoxColumn,
  },
  {
    name: "FlexBox JustifyAlign",
    Variants: FlexBoxJustifyAlign,
  },
  {
    name: "FlexBox Wrap",
    Variants: FlexBoxWrap,
  },
  {
    name: "FlexBox GapVariants",
    Variants: FlexBoxGapVariants,
  },
  { name: "Inputs Text", Variants: InputsText },
  { name: "Inputs Number", Variants: InputsNumber },
  { name: "Inputs Email", Variants: InputsEmail },
  { name: "Inputs Password", Variants: InputsPassword },
  { name: "Inputs Search", Variants: InputsSearch },
  { name: "Inputs WithError", Variants: InputsWithError },
  { name: "Inputs Disabled", Variants: InputsDisabled },
  { name: "Label Default", Variants: LabelDefaultWrap },
  { name: "Label WithTooltip", Variants: LabelWithTooltipWrap },
  { name: "Label Required", Variants: LabelRequiredWrap },
  { name: "Label Disabled", Variants: LabelDisabledWrap },
  { name: "Link Playground", Variants: LinkPlaygroundWrap },
  { name: "Link Small", Variants: LinkSmallWrap },
  { name: "Link Medium", Variants: LinkMediumWrap },
  { name: "Link Large", Variants: LinkLargeWrap },
]
  .filter(
    (c) =>
      [
        "Checkbox Default",
        "Checkbox Checked",
        "Checkbox Indeterminate",
      ].includes(c.name) === false,
  )
  .sort((a, b) => a.name.localeCompare(b.name));

export const AllComponents = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <div
      style={{
        padding: "2rem",
        display: "grid",
        gap: "2rem",
        gridTemplateColumns: "max-content 1fr",
        alignItems: "start",
      }}
    >
      {COMPONENTS.map(({ name, Variants }) => {
        const Render = Variants as any;
        return (
          <React.Fragment key={name}>
            <Label
              htmlFor={name.toLowerCase().replace(/\s+/g, "-") + "-kitchensink"}
            >
              {name}
            </Label>
            <div>{typeof Render === "function" ? <Render /> : null}</div>
          </React.Fragment>
        );
      })}
    </div>
  </Suspense>
);
