import contract from "./BlogCategoryFilter.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { within, userEvent, expect, waitFor } from "storybook/test";
import { BlogCategoryFilter } from "./BlogCategoryFilter";

const tags = ["Design", "Tooling", "Process", "Branding"];
const tagCountPresets = {
  None: {},
  Sample: { Design: 6, Tooling: 3, Process: 4, Branding: 2 },
};
const selectedTagPresets = {
  "All Posts": null,
  Design: "Design",
  Tooling: "Tooling",
  Process: "Process",
  Branding: "Branding",
};

const meta: Meta<typeof BlogCategoryFilter> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/BlogCategoryFilter",
  component: BlogCategoryFilter,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-blog-category-filter",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  argTypes: {
    tags: {
      options: ["Two", "Four"],
      mapping: { Two: ["Design", "Tooling"], Four: tags },
      control: { type: "select" },
      description: "Tags to expose as filters, in addition to the All tab.",
      table: { category: "Content" },
    },
    selectedTag: {
      options: Object.keys(selectedTagPresets),
      mapping: selectedTagPresets,
      control: { type: "select" },
      description: "Active tag; the All tab corresponds to null.",
      table: { category: "Content" },
    },
    showCounts: {
      control: "boolean",
      description: "Show a post count beside each tag.",
      table: { category: "Content", defaultValue: { summary: "false" } },
    },
    tagCounts: {
      options: Object.keys(tagCountPresets),
      mapping: tagCountPresets,
      control: { type: "select" },
      description: "Per-tag post counts, used when showCounts is on.",
      table: { category: "Content" },
    },
    variant: {
      options: ["pills", "underline", "minimal"],
      control: { type: "inline-radio" },
      description: "Visual treatment of the filter row.",
      table: { category: "Appearance", defaultValue: { summary: "pills" } },
    },
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "inline-radio" },
      description: "Control size.",
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    className: {
      control: "text",
      description: "Extra class names merged onto the tablist.",
      table: { category: "Appearance" },
    },
    onTagChange: { table: { disable: true } },
  },
  args: {
    tags,
    selectedTag: null,
    showCounts: true,
    tagCounts: tagCountPresets.Sample,
    variant: "pills",
    size: "md",
    className: "",
  },
  render: function Render(args) {
    const [{ selectedTag }, updateArgs] = useArgs();
    return (
      <BlogCategoryFilter
        {...args}
        selectedTag={selectedTag}
        onTagChange={(tag) => updateArgs({ selectedTag: tag })}
      />
    );
  },
};

export default meta;

type Story = StoryObj<typeof BlogCategoryFilter>;

/** Pill-style filter with post counts; clicking a tab updates the selection. */
export const Default: Story = {
  tags: ["beta-matrix"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tab = canvas.getByRole("tab", { name: /Design/ });
    await userEvent.click(tab);
    // Selection is written back through Storybook args (async channel).
    await waitFor(() =>
      expect(tab).toHaveAttribute("aria-selected", "true"),
    );
  },
};

/** Underline treatment for in-page section filtering. */
export const Underline: Story = {
  args: { variant: "underline", showCounts: false },
};

/** Minimal text-only treatment. */
export const Minimal: Story = {
  args: { variant: "minimal", showCounts: false, selectedTag: "Tooling" },
};

export const Playground: Story = Default;

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
