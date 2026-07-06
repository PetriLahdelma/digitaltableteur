import contract from "./WorkGrid.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect } from "storybook/test";
import { WorkGrid } from "./WorkGrid";
import { projects } from "../../data/projects";

const six = projects.slice(0, 6);
const three = projects.slice(0, 3);

const meta: Meta<typeof WorkGrid> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/WorkGrid",
  component: WorkGrid,
  tags: ["stable", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-work-grid",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
  },
  argTypes: {
    projects: {
      options: ["Three", "Six"],
      mapping: { Three: three, Six: six },
      control: { type: "select" },
      description: "Projects to render, one EnhancedProjectCard per item.",
      table: { category: "Content" },
    },
    columns: {
      options: [2, 3, 4],
      control: { type: "inline-radio" },
      description: "Column count at the widest breakpoint.",
      table: { category: "Appearance", defaultValue: { summary: "3" } },
    },
    aspectRatio: {
      options: ["square", "video", "portrait", "landscape"],
      control: { type: "select" },
      description: "Aspect ratio applied to each card thumbnail.",
      table: { category: "Appearance", defaultValue: { summary: "video" } },
    },
    showCategory: {
      control: "boolean",
      description: "Show the formatted category label on each card.",
      table: { category: "Appearance", defaultValue: { summary: "true" } },
    },
    animateItems: {
      control: "boolean",
      description:
        "Stagger the cards in on scroll (GSAP). Disabled here so the grid renders settled.",
      table: { category: "Behavior", defaultValue: { summary: "true" } },
    },
    className: {
      control: "text",
      description: "Extra class names merged onto the grid.",
      table: { category: "Appearance" },
    },
  },
  args: {
    projects: six,
    columns: 3,
    aspectRatio: "video",
    showCategory: true,
    animateItems: false,
    className: "",
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 32 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof WorkGrid>;

/** Three-column work grid of project cards. */
export const Default: Story = {
  tags: ["beta-matrix"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("list", { name: /project gallery/i }),
    ).toBeInTheDocument();
    expect(canvas.getAllByRole("listitem").length).toBeGreaterThan(0);
  },
};

/** Two columns for a denser, larger-card layout. */
export const TwoColumns: Story = {
  args: { columns: 2, projects: three },
};

/** Empty state: a friendly message instead of a blank grid. */
export const EmptyState: Story = {
  args: { projects: [] },
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
