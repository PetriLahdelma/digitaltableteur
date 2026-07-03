import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import EmptyState from "./EmptyState";
import Button from "@dt/Button";
import contract from "./EmptyState.contract.json";

const meta = {
  title: "Content/EmptyState",
  component: EmptyState,
  tags: ["alpha", "autodocs"],
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    contractStatus: contract.status,
  },
  argTypes: {
    icon: { control: "text", description: "Phosphor icon name (decorative)" },
    title: { control: "text", description: "Short headline stating what is empty" },
    description: {
      control: "text",
      description: "Why it is empty, or what to do next",
    },
    headingLevel: {
      control: "radio",
      options: ["h2", "h3", "h4"],
      description: "Heading tag for the title",
      table: { defaultValue: { summary: "h2" } },
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Size token",
      table: { defaultValue: { summary: "md" } },
    },
    children: { control: false, description: "Action slot (Buttons)" },
  },
  args: {
    icon: "magnifying-glass",
    title: "No results found",
    description: "Try a different search term, or clear the filters to see everything.",
    size: "md",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: { story: "Search empty state: icon, headline, and a way forward in the description." },
    },
  },
};

export const Playground: Story = {};

export const WithAction: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "First-run empty state: the action slot carries the primary next step." },
    },
  },
  render: () => (
    <EmptyState
      icon="folder-open"
      title="No projects yet"
      description="Projects you create will show up here."
    >
      <Button variant="primary" size="md">
        New project
      </Button>
      <Button variant="tertiary" size="md">
        Import
      </Button>
    </EmptyState>
  ),
};

export const Sizes: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "sm for panels and cards, md for content areas, lg for full pages." },
    },
  },
  render: () => (
    <div>
      <EmptyState size="sm" icon="tray" title="Nothing here" headingLevel="h3" />
      <EmptyState
        size="md"
        icon="tray"
        title="Nothing here"
        headingLevel="h3"
        description="Items you add will appear in this list."
      />
    </div>
  ),
};

export const ClearedFilters: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Zero-results state with an escape hatch action that undoes the filters." },
    },
  },
  render: () => (
    <EmptyState
      size="sm"
      icon="funnel"
      title="No matches"
      headingLevel="h3"
      description="Nothing matches the current filters."
    >
      <Button variant="secondary" size="sm">
        Clear filters
      </Button>
    </EmptyState>
  ),
};

export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <EmptyState
      icon="magnifying-glass"
      title="No results found"
      description="Try a different search term."
    />
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  parameters: { a11y: { disable: true, test: "off" } },
};
