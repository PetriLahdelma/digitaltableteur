import type { Meta, StoryObj } from "@storybook/react-vite";
import { Display } from "./Display";
import contract from "./Display.contract.json";

const defaultArgs = {
  children: "Design systems that ship",
  as: "h1" as const,
};

const meta = {
  title: "Content/Display",
  component: Display,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-display",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: {
      control: "text",
      description: "Hero display copy",
    },
    as: {
      control: "select",
      options: ["h1", "h2", "p", "span", "div"],
      description: "Semantic element override",
      table: { defaultValue: { summary: "h1" } },
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Display>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <Display>Clarity at marketing scale</Display>
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};

/** One display moment per page: the hero. */
export const HeroMoment: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The intended habitat: one hero statement per page, everything below it on the Title/Text ladder. A page of Displays has no hero.",
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: "36rem" }}>
      <Display>Design systems, shipped.</Display>
      <p style={{ marginTop: "1rem" }}>Supporting copy returns to the text ladder immediately.</p>
    </div>
  ),
};

/** The as prop picks semantics; the scale never changes. */
export const SemanticVariants: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "as matches the document outline: h1 in the page hero, p or span for decorative taglines that must not enter the heading tree. Scale is identical in every case.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Display as="h2">As a section hero (h2)</Display>
      <Display as="p">As a decorative tagline (p)</Display>
    </div>
  ),
};

/** Constrain the measure — display type needs a short line. */
export const ConstrainedMeasure: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Give display type a max-width; once lines run long the impact collapses into shouting body text.",
      },
    },
  },
  render: () => (
    <Display as="p" className="max-w-xl">
      A hero line that wraps with intent, not by accident.
    </Display>
  ),
};
