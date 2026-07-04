import contract from "./Breadcrumb.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Breadcrumb from "@dt/Breadcrumb";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";

const meta: Meta<typeof Breadcrumb> = {
  title: "Navigation/Breadcrumb",
  component: Breadcrumb,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=381-31",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // items is the one composite slot and keeps an authored mapping preset.
  argTypes: {
    items: {
      control: { type: "select" },
      options: ["site", "deep", "linklessMiddle"],
      mapping: {
        site: [
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: "Article" },
        ],
        deep: [
          { label: "Home", href: "/" },
          { label: "Work", href: "/work" },
          { label: "Design systems", href: "/work/design-systems" },
          { label: "DSharp case study" },
        ],
        linklessMiddle: [
          { label: "Home", href: "/" },
          { label: "2026" },
          { label: "July" },
          { label: "Weekly notes" },
        ],
      },
      description:
        "Breadcrumb items in root-to-current order (label, optional href). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "BreadcrumbItem[]" } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  parameters: { a11y: { disable: true } },
  tags: ["beta-matrix"],
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: "Article" },
    ],
  },
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  // items arg is a mapping key resolved by the preset above.
  args: {
    items: "site" as unknown as React.ComponentProps<
      typeof Breadcrumb
    >["items"],
  },
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Contact", href: "/contact" },
    ],
  },
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};

/** A four-level trail: every level except the current one is a link. */
export const DeepTrail: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Items render in root-to-current order; the last one is always plain text with no self-link. Keep labels short — the trail is orientation, not headline copy.",
      },
    },
  },
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Work", href: "/work" },
      { label: "Design systems", href: "/work/design-systems" },
      { label: "DSharp case study" },
    ],
  },
};

/** Middle levels without a landing page stay as plain text. */
export const LinklessMiddle: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Omit href on levels that have no page of their own — they render as text instead of dead links. Collapsed middles (\"…\") are not supported; shorten labels or drop levels instead.",
      },
    },
  },
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "2026" },
      { label: "July" },
      { label: "Weekly notes" },
    ],
  },
};

/** A second trail on the same page needs its own accessible name. */
export const CustomLabel: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The nav landmark defaults to aria-label=\"Breadcrumb\". Override it only when a page carries two different trails, so screen-reader users can tell the landmarks apart.",
      },
    },
  },
  args: {
    "aria-label": "Archive location",
    items: [
      { label: "Archive", href: "/archive" },
      { label: "Projects", href: "/archive/projects" },
      { label: "2025" },
    ],
  },
};
