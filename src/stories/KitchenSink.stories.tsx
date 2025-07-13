import React, { Suspense } from "react";
import { Meta } from "@storybook/react-vite";
import {
  ButtonVariantsComponent,
  AllSizes as ButtonSizes,
} from "../components/Button/Button.stories";
import {
  BadgeVariantsComponent,
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

export default {
  title: "Testing/Kitchen Sink",
} as Meta;

const AvatarWithImage = () => <Avatar {...AvatarWithImageStory.args} />;
const AvatarWithName = () => <Avatar {...AvatarWithNameStory.args} />;
const CheckboxDefault = () => (
  <Checkbox
    {...CheckboxDefaultStory.args}
    checked={CheckboxDefaultStory.args?.checked ?? false}
    onChange={() => {}}
  />
);
const CheckboxChecked = () => (
  <Checkbox
    {...CheckboxCheckedStory.args}
    checked={CheckboxCheckedStory.args?.checked ?? false}
    onChange={() => {}}
  />
);
const CheckboxIndeterminate = () => (
  <Checkbox
    {...CheckboxIndeterminateStory.args}
    checked={CheckboxIndeterminateStory.args?.checked ?? false}
    onChange={() => {}}
  />
);
const CheckboxGroupDefault = () => (
  <CheckboxGroup
    {...CheckboxGroupDefaultStory.args}
    label={CheckboxGroupDefaultStory.args?.label ?? ""}
    options={CheckboxGroupDefaultStory.args?.options ?? []}
    onChange={() => {}}
  />
);
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
const InputsText = () => (
  <Input
    {...(InputsStories.TextInput.args || {})}
    label={InputsStories.TextInput.args?.label ?? "Text Input"}
    type={InputsStories.TextInput.args?.type ?? "text"}
    placeholder={InputsStories.TextInput.args?.placeholder ?? "Enter text"}
  />
);
const InputsNumber = () => (
  <Input
    {...(InputsStories.NumberInput.args || {})}
    label={InputsStories.NumberInput.args?.label ?? "Number Input"}
    type={InputsStories.NumberInput.args?.type ?? "number"}
    placeholder={InputsStories.NumberInput.args?.placeholder ?? "Enter number"}
  />
);
const InputsEmail = () => (
  <Input
    {...(InputsStories.EmailInput.args || {})}
    label={InputsStories.EmailInput.args?.label ?? "Email Input"}
    type={InputsStories.EmailInput.args?.type ?? "email"}
    placeholder={InputsStories.EmailInput.args?.placeholder ?? "Enter email"}
  />
);
const InputsPassword = () => (
  <Input
    {...(InputsStories.PasswordInput.args || {})}
    label={InputsStories.PasswordInput.args?.label ?? "Password Input"}
    type={InputsStories.PasswordInput.args?.type ?? "password"}
    placeholder={
      InputsStories.PasswordInput.args?.placeholder ?? "Enter password"
    }
  />
);
const InputsSearch = () => (
  <Input
    {...(InputsStories.SearchInput.args || {})}
    label={InputsStories.SearchInput.args?.label ?? "Search Input"}
    type={InputsStories.SearchInput.args?.type ?? "search"}
    placeholder={InputsStories.SearchInput.args?.placeholder ?? "Search..."}
  />
);
const InputsWithError = () => (
  <Input
    {...(InputsStories.InputWithError.args || {})}
    label={InputsStories.InputWithError.args?.label ?? "Input with Error"}
    type={InputsStories.InputWithError.args?.type ?? "text"}
    placeholder={InputsStories.InputWithError.args?.placeholder ?? "Enter text"}
    error={InputsStories.InputWithError.args?.error ?? "This field is required"}
  />
);
const InputsDisabled = () => (
  <Input
    {...(InputsStories.DisabledInput.args || {})}
    label={InputsStories.DisabledInput.args?.label ?? "Disabled Input"}
    type={InputsStories.DisabledInput.args?.type ?? "text"}
    placeholder={InputsStories.DisabledInput.args?.placeholder ?? "Disabled"}
    disabled
  />
);

// Label wrappers
const LabelDefaultWrap = () => (
  <Label
    htmlFor={LabelStories.Default.args?.htmlFor ?? "label-default-kitchensink"}
  >
    {LabelStories.Default.args?.children ?? "Default Label"}
  </Label>
);
const LabelWithTooltipWrap = () => (
  <Label
    htmlFor={
      LabelStories.WithTooltip.args?.htmlFor ?? "label-tooltip-kitchensink"
    }
    tooltipText={
      LabelStories.WithTooltip.args?.tooltipText ?? "This is a tooltip"
    }
  >
    {LabelStories.WithTooltip.args?.children ?? "Label with Tooltip"}
  </Label>
);
const LabelRequiredWrap = () => (
  <Label
    htmlFor={
      LabelStories.Required.args?.htmlFor ?? "label-required-kitchensink"
    }
    required
  >
    {LabelStories.Required.args?.children ?? "Required Label"}
  </Label>
);
const LabelDisabledWrap = () => (
  <Label
    htmlFor={
      LabelStories.Disabled.args?.htmlFor ?? "label-disabled-kitchensink"
    }
    disabled
  >
    {LabelStories.Disabled.args?.children ?? "Disabled Label"}
  </Label>
);

// Link wrappers
const LinkPlaygroundWrap = () => (
  <Link href={LinkStories.Playground.args?.href ?? "#"}>
    {LinkStories.Playground.args?.children ?? "Playground Link"}
  </Link>
);
const LinkSmallWrap = () => (
  <Link href={LinkStories.Small.args?.href ?? "#"} size="S">
    {LinkStories.Small.args?.children ?? "Small Link"}
  </Link>
);
const LinkMediumWrap = () => (
  <Link href={LinkStories.Medium.args?.href ?? "#"} size="M">
    {LinkStories.Medium.args?.children ?? "Medium Link"}
  </Link>
);
const LinkLargeWrap = () => (
  <Link href={LinkStories.Large.args?.href ?? "#"} size="L">
    {LinkStories.Large.args?.children ?? "Large Link"}
  </Link>
);

const COMPONENTS = [
  { name: "Badge Variants", Variants: BadgeVariantsComponent },
  { name: "Button Variants", Variants: ButtonVariantsComponent },
  // Add more pure React components here as needed
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
      {COMPONENTS.map(({ name, Variants }) => (
        <React.Fragment key={name}>
          <Label
            htmlFor={name.toLowerCase().replace(/\s+/g, "-") + "-kitchensink"}
          >
            {name}
          </Label>
          <div>
            <Variants />
          </div>
        </React.Fragment>
      ))}
    </div>
  </Suspense>
);
