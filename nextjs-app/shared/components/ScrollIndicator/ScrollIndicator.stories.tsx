import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollIndicator } from "./ScrollIndicator";
import contract from "./ScrollIndicator.contract.json";

const meta = {
  title: "Navigation/ScrollIndicator",
  component: ScrollIndicator,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: {
      description: {
        component: contract.description,
      },
    },
  },
  // Custom MDX docs pages exist for all catalog entries; do not also enable autodocs
  // or Storybook will treat it as conflicting sources of truth for the docs page.
  tags: ["alpha", "!autodocs"],
  argTypes: {
    variant: {
      control: "radio",
      options: ["arrow", "mouse", "chevron"],
      description: "Icon treatment for the scroll cue.",
      table: { defaultValue: { summary: "chevron" }, category: "Appearance" },
    },
    position: {
      control: "radio",
      options: ["center", "left", "right"],
      description: "Horizontal placement within the containing hero.",
      table: { defaultValue: { summary: "center" }, category: "Layout" },
    },
    label: {
      control: "text",
      description:
        "Optional visible label. Name the destination, not the gesture.",
      table: { category: "Content" },
    },
    targetId: {
      control: "text",
      description:
        "Element id scrolled into view on activation. Without it the control does nothing.",
      table: { category: "Behavior" },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof ScrollIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A hero-shaped frame so the absolutely positioned control has something to sit in. */
function HeroFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        minBlockSize: "60vh",
        display: "grid",
        placeItems: "center",
        background: "var(--color-surface)",
        color: "var(--color-text)",
      }}
    >
      <p style={{ maxInlineSize: "32ch", textAlign: "center" }}>
        Hero copy sits here. The indicator anchors to the bottom of this frame.
      </p>
      {children}
    </div>
  );
}

export const Default: Story = {
  args: { targetId: "next-section", label: "See our work" },
  render: (args) => (
    <HeroFrame>
      <ScrollIndicator {...args} />
    </HeroFrame>
  ),
};

export const Playground: Story = {
  args: {
    targetId: "next-section",
    label: "See our work",
    variant: "chevron",
    position: "center",
  },
  render: (args) => (
    <HeroFrame>
      <ScrollIndicator {...args} />
    </HeroFrame>
  ),
};

/** The real usage: a hero followed by the section the control scrolls to. */
export const Example: Story = {
  args: { targetId: "work", label: "See our work" },
  render: (args) => (
    <div>
      <HeroFrame>
        <ScrollIndicator {...args} />
      </HeroFrame>
      <section
        id="work"
        style={{
          minBlockSize: "60vh",
          display: "grid",
          placeItems: "center",
          background: "var(--color-surface-alt, var(--color-surface))",
          color: "var(--color-text)",
        }}
      >
        <p>Target section. Activating the indicator scrolls here.</p>
      </section>
    </div>
  ),
};

/**
 * Forced-colors verification story. The control must keep a visible shape and focus ring
 * when the author's colours are replaced by the system palette.
 */
export const ForcedColors: Story = {
  args: { targetId: "next-section", label: "See our work" },
  parameters: {
    docs: {
      description: {
        story:
          "Verify in a real browser under forced-colors: active. The button outline and icon must both remain visible, and the focus ring must not rely on a custom colour.",
      },
    },
  },
  render: (args) => (
    <HeroFrame>
      <ScrollIndicator {...args} />
    </HeroFrame>
  ),
};
