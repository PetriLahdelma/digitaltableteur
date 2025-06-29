import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import FlexBox, { FlexBoxProps } from "./FlexBox";

const meta: Meta<typeof FlexBox> = {
  title: "Components/FlexBox",
  component: FlexBox,
  argTypes: {
    direction: {
      control: "select",
      options: ["row", "row-reverse", "column", "column-reverse"],
    },
    wrap: {
      control: "select",
      options: ["nowrap", "wrap", "wrap-reverse"],
    },
    justify: {
      control: "select",
      options: [
        "flex-start",
        "flex-end",
        "center",
        "space-between",
        "space-around",
        "space-evenly",
      ],
    },
    align: {
      control: "select",
      options: ["stretch", "flex-start", "flex-end", "center", "baseline"],
    },
    gap: { control: "text" },
    rowGap: { control: "text" },
    columnGap: { control: "text" },
  },
};
export default meta;
type Story = StoryObj<typeof FlexBox>;

export const Basic: Story = {
  args: {
    direction: "row",
    gap: "1rem",
    children: [
      <div
        key="1"
        style={{
          background: "var(--storybook-blue)",
          color: "var(--storybook-on-blue)",
          padding: 16,
        }}
      >
        Item 1
      </div>,
      <div
        key="2"
        style={{
          background: "var(--storybook-pink)",
          color: "var(--storybook-on-pink)",
          padding: 16,
        }}
      >
        Item 2
      </div>,
      <div
        key="3"
        style={{
          background: "var(--storybook-yellow)",
          color: "var(--storybook-on-yellow)",
          padding: 16,
        }}
      >
        Item 3
      </div>,
    ],
  },
};

export const Column: Story = {
  args: {
    direction: "column",
    gap: "1rem",
    children: [
      <div
        key="1"
        style={{
          background: "var(--storybook-blue)",
          color: "var(--storybook-on-blue)",
          padding: 16,
        }}
      >
        Column 1
      </div>,
      <div
        key="2"
        style={{
          background: "var(--storybook-pink)",
          color: "var(--storybook-on-pink)",
          padding: 16,
        }}
      >
        Column 2
      </div>,
      <div
        key="3"
        style={{
          background: "var(--storybook-yellow)",
          color: "var(--storybook-on-yellow)",
          padding: 16,
        }}
      >
        Column 3
      </div>,
    ],
  },
};

export const JustifyAlign: Story = {
  args: {
    direction: "row",
    justify: "space-between",
    align: "center",
    gap: "1rem",
    style: { minHeight: 120 },
    children: [
      <div
        key="1"
        style={{
          background: "var(--storybook-blue)",
          color: "var(--storybook-on-blue)",
          padding: 16,
        }}
      >
        Left
      </div>,
      <div
        key="2"
        style={{
          background: "var(--storybook-pink)",
          color: "var(--storybook-on-pink)",
          padding: 16,
        }}
      >
        Center
      </div>,
      <div
        key="3"
        style={{
          background: "var(--storybook-yellow)",
          color: "var(--storybook-on-yellow)",
          padding: 16,
        }}
      >
        Right
      </div>,
    ],
  },
};

export const Wrap: Story = {
  args: {
    direction: "row",
    wrap: "wrap",
    gap: "1rem",
    style: { width: 300 },
    children: [
      <div
        key="1"
        style={{
          background: "var(--storybook-blue)",
          color: "var(--storybook-on-blue)",
          padding: 16,
          minWidth: 120,
        }}
      >
        A
      </div>,
      <div
        key="2"
        style={{
          background: "var(--storybook-pink)",
          color: "var(--storybook-on-pink)",
          padding: 16,
          minWidth: 120,
        }}
      >
        B
      </div>,
      <div
        key="3"
        style={{
          background: "var(--storybook-yellow)",
          color: "var(--storybook-on-yellow)",
          padding: 16,
          minWidth: 120,
        }}
      >
        C
      </div>,
      <div
        key="4"
        style={{
          background: "var(--storybook-gray)",
          color: "var(--storybook-on-gray)",
          padding: 16,
          minWidth: 120,
        }}
      >
        D
      </div>,
    ],
  },
};

export const GapVariants: Story = {
  args: {
    direction: "row",
    gap: "2rem",
    rowGap: "1rem",
    columnGap: "2rem",
    wrap: "wrap",
    style: { width: 400 },
    children: [
      <div
        key="1"
        style={{
          background: "var(--storybook-blue)",
          color: "var(--storybook-on-blue)",
          padding: 16,
          minWidth: 120,
        }}
      >
        1
      </div>,
      <div
        key="2"
        style={{
          background: "var(--storybook-pink)",
          color: "var(--storybook-on-pink)",
          padding: 16,
          minWidth: 120,
        }}
      >
        2
      </div>,
      <div
        key="3"
        style={{
          background: "var(--storybook-yellow)",
          color: "var(--storybook-on-yellow)",
          padding: 16,
          minWidth: 120,
        }}
      >
        3
      </div>,
      <div
        key="4"
        style={{
          background: "var(--storybook-gray)",
          color: "var(--storybook-on-gray)",
          padding: 16,
          minWidth: 120,
        }}
      >
        4
      </div>,
    ],
  },
};
