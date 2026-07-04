import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import ButtonGroup from "./ButtonGroup";
import Button from "@dt/Button";
import { IconButton } from "@dt/IconButton";
import contract from "./ButtonGroup.contract.json";

const meta = {
  title: "Actions/ButtonGroup",
  component: ButtonGroup,
  tags: ["alpha", "autodocs"],
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
  },
  argTypes: {
    ariaLabel: { control: "text", description: "Accessible group name" },
    attached: {
      control: "boolean",
      description: "Fuse children into one segmented surface",
      table: { defaultValue: { summary: "true" } },
    },
    children: {
      control: {
        type: "select",
        labels: { two: "2 segments", three: "3 segments" },
      },
      options: ["two", "three"],
      mapping: {
        two: [
          <Button key="one" variant="secondary" size="md">One</Button>,
          <Button key="two" variant="secondary" size="md">Two</Button>,
        ],
        three: [
          <Button key="one" variant="secondary" size="md">One</Button>,
          <Button key="two" variant="secondary" size="md">Two</Button>,
          <Button key="three" variant="secondary" size="md">Three</Button>,
        ],
      },
      description:
        "Buttons / IconButtons (same variant + size). Segment presets here; compose your own in code.",
      table: { type: { summary: "ReactNode" } },
    },
  },
  args: { ariaLabel: "Text alignment", attached: true, children: "three" },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: { story: "Attached segments share seams; use one variant and size across the group." },
    },
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="secondary" size="md">Day</Button>
      <Button variant="secondary" size="md">Week</Button>
      <Button variant="secondary" size="md">Month</Button>
    </ButtonGroup>
  ),
};

export const Playground: Story = {};

export const Spaced: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "attached=false keeps the group semantics but spaces the buttons on the token gap." },
    },
  },
  render: () => (
    <ButtonGroup ariaLabel="Form actions" attached={false}>
      <Button variant="primary" size="md">Save</Button>
      <Button variant="tertiary" size="md">Cancel</Button>
    </ButtonGroup>
  ),
};

export const WithIconButtons: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "IconButtons make a compact toolbar cluster; every segment still carries its own label." },
    },
  },
  render: () => (
    <ButtonGroup ariaLabel="Text formatting">
      <IconButton variant="secondary" size="md" icon="text-b" label="Bold" />
      <IconButton variant="secondary" size="md" icon="text-italic" label="Italic" />
      <IconButton variant="secondary" size="md" icon="text-underline" label="Underline" />
    </ButtonGroup>
  ),
};

export const Pager: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Prev/next pager: two attached secondary segments with icon labels." },
    },
  },
  render: () => (
    <ButtonGroup ariaLabel="Pagination">
      <IconButton variant="secondary" size="md" icon="caret-left" label="Previous page" />
      <IconButton variant="secondary" size="md" icon="caret-right" label="Next page" />
    </ButtonGroup>
  ),
};

export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ButtonGroup ariaLabel="View">
      <Button variant="secondary" size="md">List</Button>
      <Button variant="secondary" size="md">Grid</Button>
    </ButtonGroup>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  parameters: { a11y: { disable: true, test: "off" } },
  render: () => (
    <ButtonGroup ariaLabel="View">
      <Button variant="secondary" size="md">List</Button>
      <Button variant="secondary" size="md">Grid</Button>
    </ButtonGroup>
  ),
};
