import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Icon from "./Icon";

const meta: Meta<typeof Icon> = {
  title: "Components/Icon",
  component: Icon,
  args: {
    name: "circle-info",
    weight: "regular",
    size: "lg",
    ariaLabel: "Information",
  },
  argTypes: {
    name: { control: "text" },
    weight: {
      control: {
        type: "select",
        options: ["thin", "light", "regular", "bold", "fill", "duotone"],
      },
    },
    size: {
      control: {
        type: "select",
        options: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
      },
    },
    color: { control: "color" },
    rotate: {
      control: {
        type: "select",
        options: [0, 90, 180, 270],
      },
    },
    flip: {
      control: {
        type: "select",
        options: ["horizontal", "vertical", "both"],
      },
    },
    spin: { control: "boolean" },
    pulse: { control: "boolean" },
    decorative: { control: "boolean" },
    ariaLabel: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Playground: Story = {
  args: {
    name: "circle-info",
    ariaLabel: "Information icon",
  },
};

export const BrandIcon: Story = {
  args: {
    name: "github",
    size: "2xl",
    color: "#111",
    ariaLabel: "GitHub",
  },
};

export const Animated: Story = {
  args: {
    name: "circle-notch",
    spin: true,
    ariaLabel: "Loading",
  },
};

export const ColorShowcase: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "1.5rem",
        alignItems: "center",
        fontSize: "1.5rem",
      }}
    >
      <Icon name="circle-info" color="var(--color-info)" ariaLabel="Info" />
      <Icon
        name="triangle-exclamation"
        color="var(--color-warning)"
        ariaLabel="Warning"
      />
      <Icon
        name="circle-check"
        color="var(--color-success)"
        ariaLabel="Success"
      />
      <Icon name="circle-xmark" color="var(--color-error)" ariaLabel="Error" />
    </div>
  ),
};

export const Transformations: Story = {
  parameters: {// Disable WIP badge to prevent overlap
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "1.5rem",
        alignItems: "center",
        paddingBlockEnd: "3rem",
      }}
    >
      <Icon
        name="arrow-up"
        pulse
        color="var(--color-primary)"
        ariaLabel="Arrow down"
      />
      <Icon
        name="arrow-right"
        flip="horizontal"
        pulse
        color="var(--color-primary)"
        ariaLabel="Arrow left"
      />
      <Icon
        name="arrows-rotate"
        rotate={180}
        spin
        color="var(--color-primary)"
        ariaLabel="Refreshing"
      />
    </div>
  ),
};
