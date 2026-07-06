import contract from "./ProjectNav.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect } from "storybook/test";
import { ProjectNav } from "./ProjectNav";

const meta: Meta<typeof ProjectNav> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/ProjectNav",
  component: ProjectNav,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-project-nav",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
  },
  argTypes: {
    currentSlug: {
      control: "text",
      description:
        "Slug of the project currently being viewed; determines the previous/next targets and which edge is disabled.",
      table: { category: "Content" },
    },
    className: {
      control: "text",
      description: "Extra class names merged onto the nav landmark.",
      table: { category: "Appearance" },
    },
  },
  args: {
    currentSlug: "project-spine",
    className: "",
  },
};

export default meta;

type Story = StoryObj<typeof ProjectNav>;

/** Mid-sequence project: both previous and next links are active. */
export const Default: Story = {
  tags: ["beta-matrix"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("navigation", { name: "Project navigation" }),
    ).toBeInTheDocument();
    expect(
      canvas.getByRole("link", { name: /previous project/i }),
    ).toBeInTheDocument();
    expect(
      canvas.getByRole("link", { name: /next project/i }),
    ).toBeInTheDocument();
  },
};

/** First project: the previous control is disabled. */
export const FirstProject: Story = {
  args: { currentSlug: "dsharp-design-system" },
};

/** Last project: the next control is disabled. */
export const LastProject: Story = {
  args: { currentSlug: "finnish-transport-agency" },
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
