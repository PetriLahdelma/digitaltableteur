/* stylelint-disable scale-unlimited/declaration-strict-value */
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import FlexBox, { FlexBoxProps } from "@dt/FlexBox";

const meta: Meta<typeof FlexBox> = {
  title: "Components/FlexBox",
  component: FlexBox,
  tags: ["autodocs"],
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

const swatches = {
  blue: "#0b3d91",
  cyan: "#0f766e",
  pink: "#9d174d",
  purple: "#5b21b6",
  neutral: "#f1f5f9",
} as const;

const lightText = "#f9fafb";
const darkText = "#1f2933";

const flexPalette = [
  { background: swatches.blue, color: lightText },
  { background: swatches.cyan, color: lightText },
  { background: swatches.pink, color: lightText },
  { background: swatches.purple, color: lightText },
  { background: swatches.neutral, color: darkText },
];

const swatchFor = (index: number) => flexPalette[index % flexPalette.length];

const createBlock = (
  key: string,
  label: React.ReactNode,
  index: number,
  extra: React.CSSProperties = {},
) => {
  const { background, color } = swatchFor(index);
  return (
    <div
      key={key}
      style={{
        background,
        // stylelint-disable-next-line scale-unlimited/declaration-strict-value
        color,
        padding: 16,
        ...extra,
      }}
    >
      {label}
    </div>
  );
};

export const Basic: Story = {
  args: {
    direction: "row",
    gap: "1rem",
    children: [
      createBlock("1", "Item 1", 0),
      createBlock("2", "Item 2", 1),
      createBlock("3", "Item 3", 2),
    ],
  },
};

export const Column: Story = {
  args: {
    direction: "column",
    gap: "1rem",
    children: [
      createBlock("1", "Column 1", 0),
      createBlock("2", "Column 2", 1),
      createBlock("3", "Column 3", 2),
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
      createBlock("1", "Left", 0),
      createBlock("2", "Center", 1),
      createBlock("3", "Right", 2),
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
      createBlock("1", "A", 0, { minWidth: 120 }),
      createBlock("2", "B", 1, { minWidth: 120 }),
      createBlock("3", "C", 2, { minWidth: 120 }),
      createBlock("4", "D", 3, { minWidth: 120 }),
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
      createBlock("1", "1", 0, { minWidth: 120 }),
      createBlock("2", "2", 1, { minWidth: 120 }),
      createBlock("3", "3", 2, { minWidth: 120 }),
      createBlock("4", "4", 3, { minWidth: 120 }),
    ],
  },
};
