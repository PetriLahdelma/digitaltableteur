import type { Meta, StoryObj } from "@storybook/react-vite";
import { WipBadge } from "./WipBadge";

const meta: Meta<typeof WipBadge> = {
  title: "Site/WipBadge",
  component: WipBadge,
  tags: ["beta"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-wip-badge",
    },
    layout: "centered",
    docs: {
      description: {
        component:
          "Storybook chrome that surfaces a component's lifecycle status (alpha/beta/deprecated). Hidden when status is `stable`. Excluded from axe checks via `data-axe-ignore` because it intentionally sits outside the design system surface.",
      },
    },
  },
  argTypes: {
    status: {
      control: { type: "inline-radio" },
      options: ["alpha", "beta", "stable", "deprecated"],
      description:
        "Lifecycle tier mirrored from the host component's contract. `stable` hides the badge entirely.",
      table: { defaultValue: { summary: "alpha" } },
    },
    variant: {
      control: { type: "inline-radio" },
      options: ["canvas", "docs"],
      description:
        "Placement context. `canvas` floats the badge at the viewport corner inside story previews; `docs` flows inline with MDX prose.",
      table: { defaultValue: { summary: "canvas" } },
    },
  },
  args: {
    status: "beta",
    variant: "canvas",
  },
};

export default meta;
type Story = StoryObj<typeof WipBadge>;

export const Playground: Story = {
  tags: ["beta-matrix"],
};

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  args: { status: "alpha", variant: "canvas" },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  parameters: { controls: { disable: true } },
  args: { status: "beta", variant: "canvas" },
};
