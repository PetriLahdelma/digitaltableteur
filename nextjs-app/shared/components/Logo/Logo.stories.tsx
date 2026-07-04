import type { Meta, StoryObj } from "@storybook/react-vite";
import Logo from "./Logo";
import contract from "./Logo.contract.json";

const meta = {
  title: "Site/Logo",
  component: Logo,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=480-1588",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: { size: 24, animated: false, badge: false, decorative: false },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  ...Playground,
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true } },
  render: () => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        fontFamily: "var(--font-text)",
        fontWeight: 700,
      }}
    >
      <Logo size={28} />
      Digitaltableteur
    </span>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--space-layout-16)",
        alignItems: "flex-end",
      }}
    >
      {[16, 24, 40, 64].map((s) => (
        <Logo key={s} size={s} />
      ))}
    </div>
  ),
};

export const Animated: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Logo size={64} animated />,
};

export const Badge: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--space-layout-16)",
        alignItems: "center",
      }}
    >
      <Logo size={40} badge />
      <Logo size={40} badge animated />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
