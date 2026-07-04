import { ContactHero } from "./ContactHero";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./ContactHero.contract.json";

const defaultArgs = {
  title: "Let's build something thoughtful",
  subtitle: "Tell us about your product, timeline, and team.",
  background: "minimal" as const,
  compact: true,
};

const meta = {
  title: "Patterns/ContactHero",
  component: ContactHero,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-contact-hero",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    title: { control: "text", description: "Hero headline" },
    subtitle: { control: "text", description: "Supporting line" },
    background: {
      control: "select",
      options: ["gradient", "minimal"],
      description: "Background treatment",
      table: { defaultValue: { summary: "minimal" } },
    },
    compact: { control: "boolean", description: "Use shorter min-height" },
    className: {
      control: "text",
      description: "Section class names",
      table: { disable: true },
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
  args: defaultArgs,
} satisfies Meta<typeof ContactHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  tags: ["beta-matrix"],
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (contact page hero)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  args: defaultArgs,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
