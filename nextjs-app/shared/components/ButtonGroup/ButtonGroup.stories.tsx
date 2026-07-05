import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import ButtonGroup from "./ButtonGroup";
import Button from "@dt/Button";
import { IconButton } from "@dt/IconButton";
import {
  CaretLeft,
  CaretRight,
  TextB,
  TextItalic,
  TextUnderline,
} from "@phosphor-icons/react";
import contract from "./ButtonGroup.contract.json";

// Children presets are generated, not hand-written: the select maps a segment
// count to that many secondary Buttons so the control drives the real prop.
const SEGMENT_LABELS = ["Day", "Week", "Month", "Quarter", "Year"];
const SEGMENT_COUNTS = [2, 3, 4, 5];
const segments = (count: number) =>
  SEGMENT_LABELS.slice(0, count).map((label) => (
    <Button key={label} variant="secondary" size="md">
      {label}
    </Button>
  ));

const meta = {
  title: "Actions/ButtonGroup",
  component: ButtonGroup,
  tags: ["alpha", "autodocs"],
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // only the composite children slot needs an authored mapping preset.
  argTypes: {
    children: {
      control: {
        type: "select",
        labels: Object.fromEntries(SEGMENT_COUNTS.map((n) => [n, `${n} segments`])),
      },
      options: SEGMENT_COUNTS,
      mapping: Object.fromEntries(SEGMENT_COUNTS.map((n) => [n, segments(n)])),
      description:
        "Buttons / IconButtons (same variant + size). Pick a segment count here; compose your own in code.",
      table: { type: { summary: "ReactNode" } },
    },
  },
  args: { ariaLabel: "Text alignment", attached: true, children: 3 },
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
      <IconButton
        variant="secondary"
        size="md"
        icon={<TextB weight="bold" style={{ width: 16, height: 16 }} />}
        label="Bold"
      />
      <IconButton
        variant="secondary"
        size="md"
        icon={<TextItalic weight="bold" style={{ width: 16, height: 16 }} />}
        label="Italic"
      />
      <IconButton
        variant="secondary"
        size="md"
        icon={<TextUnderline weight="bold" style={{ width: 16, height: 16 }} />}
        label="Underline"
      />
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
      <IconButton
        variant="secondary"
        size="md"
        icon={<CaretLeft weight="bold" style={{ width: 16, height: 16 }} />}
        label="Previous page"
      />
      <IconButton
        variant="secondary"
        size="md"
        icon={<CaretRight weight="bold" style={{ width: 16, height: 16 }} />}
        label="Next page"
      />
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
