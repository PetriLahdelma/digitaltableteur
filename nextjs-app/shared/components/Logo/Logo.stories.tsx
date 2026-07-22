import type { Meta, StoryObj } from "@storybook/react-vite";
import Logo from "./Logo";
import contract from "./Logo.contract.json";

const meta = {
  title: "Content/Logo",
  component: Logo,
  tags: ["stable", "autodocs"],
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
  args: {
    src: "",
    size: 24,
    animated: false,
    background: false,
    decorative: false,
  },
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

export const Background: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--space-layout-16)",
        alignItems: "center",
      }}
    >
      <Logo size={40} background />
      <Logo size={40} background animated />
    </div>
  ),
};

export const CustomImage: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Any PNG, JPEG, or SVG logo via `src` — the image letterboxes inside the square `size` box and renders with its own colors (no `currentColor` inheritance). `title` is the alt text.",
      },
    },
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--space-layout-16)",
        alignItems: "center",
      }}
    >
      <Logo src="/logos/clients/dsharp.svg" title="DSharp" size={64} />
      <Logo src="/logos/clients/finnair.svg" title="Finnair" size={64} />
      <Logo src="/logos/clients/aalto.svg" title="Aalto University" size={64} />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
