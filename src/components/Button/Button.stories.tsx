/* stylelint-disable value-keyword-case, scale-unlimited/declaration-strict-value */
import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import Button from "./Button";
import Icon from "@dt/Icon";
import { within, userEvent } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";

export default {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      control: {
        type: "select",
        options: [
          "primary",
          "secondary",
          "tertiary",
          "error",
          "warning",
          "success",
          "info",
        ],
      },
    },
    disabled: { control: "boolean" },
    inverse: { control: "boolean" },
    rounded: { control: "boolean" },
    tooltip: { control: "text" },
    accessibleName: { control: "text" },
    accessibleDescription: { control: "text" },
    icon: { control: "text" },
    endIcon: { control: "text" },
  },
} as Meta;

const ButtonStoryLabel = ({ tKey }: { tKey: string }) => {
  const { t } = useTranslation();
  return <>{t(tKey)}</>;
};

const Template: StoryFn = (args: React.ComponentProps<typeof Button>) => (
  <Button {...args} />
);

const visuallyHiddenStyle: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const INVERSE_SWATCHES = [
  { label: "Primary", color: "var(--color-primary)" },
  { label: "Accent Pink", color: "var(--accent-pink)" },
  { label: "Error", color: "var(--color-error)" },
  { label: "Success", color: "var(--color-success)" },
] as const;

export const Primary = Template.bind({});
Primary.args = {
  variant: "primary",
  children: <ButtonStoryLabel tKey="buttonPrimary" />,
  icon: "",
};
Primary.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /primary/i });
  await userEvent.click(button);
  // Focus test
  await userEvent.tab();
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: "secondary",
  children: <ButtonStoryLabel tKey="buttonSecondary" />,
};
Secondary.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", {
    name: /secondary/i,
  });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Tertiary = Template.bind({});
Tertiary.args = {
  variant: "tertiary",
  children: <ButtonStoryLabel tKey="buttonTertiary" />,
};
Tertiary.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", {
    name: /tertiary/i,
  });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Error = Template.bind({});
Error.args = {
  variant: "error",
  children: <ButtonStoryLabel tKey="buttonError" />,
};
Error.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /error/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Warning = Template.bind({});
Warning.args = {
  variant: "warning",
  children: <ButtonStoryLabel tKey="buttonWarning" />,
};
Warning.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /warning/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Success = Template.bind({});
Success.args = {
  variant: "success",
  children: <ButtonStoryLabel tKey="buttonSuccess" />,
};
Success.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /success/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Info = Template.bind({});
Info.args = {
  variant: "info",
  children: <ButtonStoryLabel tKey="buttonInfo" />,
};
Info.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /info/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const IconOnly = Template.bind({});
IconOnly.args = {
  variant: "primary",
  icon: "magnifying-glass",
  tooltip: "Search",
};
IconOnly.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /search/i });
  await userEvent.hover(button);
  await userEvent.tab();
};

export const IconLeft = Template.bind({});
IconLeft.args = {
  variant: "primary",
  icon: "arrow-left",
  children: <ButtonStoryLabel tKey="buttonLeftIcon" />,
};
IconLeft.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /left icon/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const IconRight = Template.bind({});
IconRight.args = {
  variant: "primary",
  endIcon: "arrow-right",
  children: <ButtonStoryLabel tKey="buttonRightIcon" />,
};
IconRight.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", { name: /right icon/i });
  await userEvent.click(button);
  await userEvent.tab();
};

export const Disabled = Template.bind({});
Disabled.args = {
  variant: "primary",
  children: <ButtonStoryLabel tKey="buttonDisabled" />,
  disabled: true,
};
Disabled.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const button = await canvas.findByRole("button", {
    name: /disabled/i,
  });
  await userEvent.tab();
};

export const AllVariants = () => (
  <div style={{ display: "flex", gap: "1rem" }}>
    <Button variant="primary">
      <ButtonStoryLabel tKey="buttonPrimary" />
    </Button>
    <Button variant="secondary">
      <ButtonStoryLabel tKey="buttonSecondary" />
    </Button>
    <Button variant="tertiary">
      <ButtonStoryLabel tKey="buttonTertiary" />
    </Button>
    <Button variant="error">
      <ButtonStoryLabel tKey="buttonError" />
    </Button>
    <Button variant="warning">
      <ButtonStoryLabel tKey="buttonWarning" />
    </Button>
    <Button variant="success">
      <ButtonStoryLabel tKey="buttonSuccess" />
    </Button>
    <Button variant="info">
      <ButtonStoryLabel tKey="buttonInfo" />
    </Button>
  </div>
);

export const Inverse = () => {
  // Static primary surface; show all inverse variants (no swatches).
  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        padding: "2rem",
        flexWrap: "wrap",
        /* stylelint-disable-next-line scale-unlimited/declaration-strict-value, value-keyword-case */
        backgroundColor: "var(--color-primary)",
        borderRadius: "var(--radius-md, 0.5rem)",
      }}
    >
      <Button variant="primary" size="l" inverse>
        Inverse primary
      </Button>
      <Button variant="secondary" size="l" inverse>
        Inverse secondary
      </Button>
      <Button variant="tertiary" size="l" inverse>
        Inverse tertiary
      </Button>
    </div>
  );
};

export const AllSizes = () => (
  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
    <Button size="s">
      <ButtonStoryLabel tKey="buttonSmall" />
    </Button>
    <Button size="m">
      <ButtonStoryLabel tKey="buttonMedium" />
    </Button>
    <Button size="l">
      <ButtonStoryLabel tKey="buttonLarge" />
    </Button>
  </div>
);

export const AsLink = () => (
  <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
    <div style={{ display: "flex", gap: "1rem" }}>
      <Button href="/about" variant="primary">
        Internal Link
      </Button>
      <Button href="https://example.com" variant="secondary" target="_blank">
        External Link
      </Button>
      <Button href="/contact" variant="tertiary" icon="arrow-right">
        Link with Icon
      </Button>
    </div>
    <div style={{ display: "flex", gap: "1rem" }}>
      <Button href="/disabled" variant="primary" disabled>
        Disabled Link
      </Button>
      <Button href="/rounded" variant="secondary" rounded>
        Rounded Link
      </Button>
    </div>
  </div>
);
