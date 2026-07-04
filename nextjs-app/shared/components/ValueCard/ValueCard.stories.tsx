import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sparkle } from "@phosphor-icons/react";
import { ValueCard } from "./ValueCard";
import contract from "./ValueCard.contract.json";

const defaultArgs = {
  icon: (
    <Sparkle weight="duotone" className="size-8 text-primary" aria-hidden />
  ),
  title: "Clarity first",
  description: "Interfaces should explain themselves before they decorate.",
  variant: "bordered" as const,
};

const meta = {
  title: "Site/ValueCard",
  component: ValueCard,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-value-card",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
} satisfies Meta<typeof ValueCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  argTypes: {
    icon: {
      control: { type: "select" },
      options: ["sparkle", "diamond"],
      mapping: {
        sparkle: defaultArgs.icon,
        diamond: <span aria-hidden="true">◆</span>,
      },
      description:
        "Icon slot (required). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "ReactNode" } },
    },
  },
  args: {
    icon: "sparkle" as never,
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        maxWidth: 720,
      }}
    >
      <ValueCard {...defaultArgs} />
      <ValueCard
        icon={
          <Sparkle
            weight="duotone"
            className="size-8 text-primary"
            aria-hidden
          />
        }
        title="Accessible by default"
        description="Keyboard, contrast, and semantics are part of the definition of done."
        variant="bordered"
      />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
