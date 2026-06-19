import React, { Suspense } from "react";
import { Meta } from "@storybook/react-vite";
import {
  Tones as ButtonVariants,
  Sizes as ButtonSizes,
} from "../components/Button/Button.stories";
import {
  Tones as BadgeVariantsStory,
  Sizes as BadgeSizesStory,
} from "../components/Badge/Badge.stories";
import Grid from "@dt/Grid";
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
import ArticleCard from "@dt/ArticleCard";
import Avatar from "@dt/Avatar";
import {
  WithImage as AvatarWithImageStory,
  WithInitials as AvatarWithInitialsStory,
  WithMenu as AvatarWithMenuStory,
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
const AvatarWithInitials = () => <Avatar {...AvatarWithInitialsStory.args} />;
const AvatarWithMenu = () => <Avatar {...AvatarWithMenuStory.args} />;

const storyToComponent = (storyExport: any): React.FC => {
  const WrappedComponent: React.FC = () => {
    if (typeof storyExport === "function") {
      const StoryComponent = storyExport as React.ComponentType<any>;
      return <StoryComponent {...((storyExport as any)?.args ?? {})} />;
    }
    if (
      storyExport &&
      typeof storyExport === "object" &&
      typeof storyExport.render === "function"
    ) {
      const RenderComponent = storyExport.render as React.ComponentType<any>;
      return <RenderComponent {...(storyExport.args ?? {})} />;
    }
    return null;
  };
  WrappedComponent.displayName =
    storyExport?.name ||
    storyExport?.displayName ||
    storyExport?.__docgenInfo?.displayName ||
    "StoryToComponent";
  return WrappedComponent;
};

const BadgeVariants = storyToComponent(BadgeVariantsStory);
const BadgeSizes = storyToComponent(BadgeSizesStory);
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
const kitchenSinkSwatches = {
  blue: "#0b3d91",
  cyan: "#0f766e",
  pink: "#9d174d",
  purple: "#5b21b6",
  neutral: "#f1f5f9",
} as const;

const kitchenSinkLightText = "#f9fafb";
const kitchenSinkDarkText = "#1f2933";

const flexSinkBlock = (
  key: string,
  label: React.ReactNode,
  index: number,
  extra: React.CSSProperties = {},
) => {
  const palette = [
    { background: kitchenSinkSwatches.blue, color: kitchenSinkLightText },
    { background: kitchenSinkSwatches.cyan, color: kitchenSinkLightText },
    { background: kitchenSinkSwatches.pink, color: kitchenSinkLightText },
    { background: kitchenSinkSwatches.purple, color: kitchenSinkLightText },
    { background: kitchenSinkSwatches.neutral, color: kitchenSinkDarkText },
  ];
  const { background, color } = palette[index % palette.length];
  return (
    <div key={key} style={{ background, color, padding: 16, ...extra }}>
      {label}
    </div>
  );
};

const gridItemStyle = (background: string, color: string) => ({
  background,
  color,
  padding: 16,
});

const GridSpans = () => (
  <div style={{ maxWidth: "90%", overflow: "hidden" }}>
    <Grid
      columns={4}
      gap="1rem"
      style={{
        background: "var(--storybook-bg)",
        padding: 24,
        overflow: "hidden",
      }}
    >
      <Grid.Item span={2} style={gridItemStyle(kitchenSinkSwatches.blue, kitchenSinkLightText)}>
        Span 2
      </Grid.Item>
      <Grid.Item style={gridItemStyle(kitchenSinkSwatches.neutral, kitchenSinkDarkText)}>
        Normal
      </Grid.Item>
      <Grid.Item span={2} style={gridItemStyle(kitchenSinkSwatches.pink, kitchenSinkLightText)}>
        Span 2
      </Grid.Item>
      <Grid.Item style={gridItemStyle(kitchenSinkSwatches.purple, kitchenSinkLightText)}>
        Normal
      </Grid.Item>
    </Grid>
  </div>
);

const GridNested = () => (
  <div style={{ maxWidth: "90%", overflow: "hidden" }}>
    <Grid
      columns={2}
      gap="2rem"
      style={{
        background: "var(--storybook-bg)",
        padding: 24,
        overflow: "hidden",
      }}
    >
      <Grid.Item
        style={{
          background: "var(--storybook-blue)",
          color: "var(--storybook-white)",
          padding: 16,
        }}
      >
        Parent 1
      </Grid.Item>
      <Grid columns={3} gap="0.5rem">
        <Grid.Item style={gridItemStyle(kitchenSinkSwatches.cyan, kitchenSinkLightText)}>A</Grid.Item>
        <Grid.Item style={gridItemStyle(kitchenSinkSwatches.pink, kitchenSinkLightText)}>B</Grid.Item>
        <Grid.Item style={gridItemStyle(kitchenSinkSwatches.purple, kitchenSinkLightText)}>C</Grid.Item>
      </Grid>
    </Grid>
  </div>
);

const FlexBoxBasic = () => (
  <FlexBox direction="row" gap="1rem">
    {flexSinkBlock("1", "Item 1", 0)}
    {flexSinkBlock("2", "Item 2", 1)}
    {flexSinkBlock("3", "Item 3", 2)}
  </FlexBox>
);
const FlexBoxColumn = () => (
  <FlexBox direction="column" gap="1rem">
    {flexSinkBlock("1", "Column 1", 0)}
    {flexSinkBlock("2", "Column 2", 1)}
    {flexSinkBlock("3", "Column 3", 2)}
  </FlexBox>
);
const FlexBoxJustifyAlign = () => (
  <FlexBox
    direction="row"
    justify="space-between"
    align="center"
    gap="1rem"
    style={{ minHeight: 120 }}
  >
    {flexSinkBlock("1", "Left", 0)}
    {flexSinkBlock("2", "Center", 1)}
    {flexSinkBlock("3", "Right", 2)}
  </FlexBox>
);
const FlexBoxWrap = () => (
  <FlexBox direction="row" wrap="wrap" gap="0.5rem" style={{ maxWidth: 320 }}>
    {Array.from({ length: 8 }, (_, index) =>
      flexSinkBlock(String(index), `Item ${index + 1}`, index, { minWidth: 96 }),
    )}
  </FlexBox>
);
const FlexBoxGapVariants = () => (
  <FlexBox direction="column" rowGap="1.5rem">
    <FlexBox gap="0.25rem">
      {flexSinkBlock("a", "gap 0.25rem", 0)}
      {flexSinkBlock("b", "gap 0.25rem", 1)}
    </FlexBox>
    <FlexBox columnGap="2rem">
      {flexSinkBlock("c", "columnGap 2rem", 2)}
      {flexSinkBlock("d", "columnGap 2rem", 3)}
    </FlexBox>
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

// The per-size Small/Medium/Large Link stories were consolidated into a single
// `Sizes` story in the platinum Link pass, so render that instead of three dead
// references. storyToComponent handles its object-with-render shape.
const LinkSizes = storyToComponent(LinkStories.Sizes);

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
  { name: "Text All Tags", Variants: TextAllTags },
  { name: "Text as Span", Variants: TextAsSpan },
  { name: "Text Custom Class", Variants: TextCustomClass },
  { name: "Text Default", Variants: TextDefault },
  { name: "Text Serif and Sans", Variants: TextSerifAndSans },
  { name: "Text Sizes", Variants: TextSizes },
  { name: "Title Custom Tag and Class", Variants: TitleCustomTag },
  { name: "Title Levels", Variants: TitleLevels },
  { name: "Title Sizes", Variants: TitleSizes },
  {
    name: "Article Card Default",
    Variants: () => (
      <ArticleCard
        title="Design System Best Practices"
        lead="Learn how to build, scale, and maintain a robust design system for modern teams."
        link="/blog/design-system-best-practices"
        readTime="8 min read"
      />
    ),
  },
  {
    name: "Article Card with Custom Class",
    Variants: () => (
      <ArticleCard
        title="Branding in 2025: Trends & Opportunities"
        lead="Explore the future of digital branding, emerging technologies, and resilient brand strategies."
        link="/blog/branding-2025"
        readTime="14 min read"
        className="customClass"
      />
    ),
  },
  { name: "Avatar with Image", Variants: AvatarWithImage },
  { name: "Avatar with Initials", Variants: AvatarWithInitials },
  { name: "Avatar with Menu", Variants: AvatarWithMenu },
  { name: "Checkbox all Variants", Variants: CheckboxAllVariants },
  { name: "CheckboxGroup Default", Variants: CheckboxGroupDefault },
  { name: "FlexBox Basic", Variants: FlexBoxBasic },
  { name: "FlexBox Column", Variants: FlexBoxColumn },
  { name: "FlexBox Justify Align", Variants: FlexBoxJustifyAlign },
  { name: "FlexBox Wrap", Variants: FlexBoxWrap },
  { name: "FlexBox Gap Variants", Variants: FlexBoxGapVariants },
  { name: "Inputs Text", Variants: InputsText },
  { name: "Inputs Number", Variants: InputsNumber },
  { name: "Inputs Email", Variants: InputsEmail },
  { name: "Inputs Password", Variants: InputsPassword },
  { name: "Inputs Search", Variants: InputsSearch },
  { name: "Inputs with Error", Variants: InputsWithError },
  { name: "Inputs Disabled", Variants: InputsDisabled },
  { name: "Label Default", Variants: LabelDefaultWrap },
  { name: "Label with Tooltip", Variants: LabelWithTooltipWrap },
  { name: "Label Required", Variants: LabelRequiredWrap },
  { name: "Label Disabled", Variants: LabelDisabledWrap },
  { name: "Link Playground", Variants: LinkPlaygroundWrap },
  { name: "Link Sizes", Variants: LinkSizes },
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
