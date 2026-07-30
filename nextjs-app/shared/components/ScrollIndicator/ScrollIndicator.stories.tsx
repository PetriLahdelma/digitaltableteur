import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
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
  tags: ["stable", "autodocs"],
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
    motion: {
      control: "radio",
      options: ["bounce", "pulse", "fade", "none"],
      description:
        "Looping motion hint on the icon. Suppressed under prefers-reduced-motion.",
      table: { defaultValue: { summary: "bounce" }, category: "Motion" },
    },
    speed: {
      control: { type: "range", min: 0.2, max: 2, step: 0.1 },
      description: "Duration of one motion half-cycle, in seconds.",
      table: { defaultValue: { summary: "0.6" }, category: "Motion" },
    },
    distance: {
      control: { type: "range", min: 2, max: 20, step: 1 },
      description: "Vertical travel of the bounce motion, in pixels (bounce only).",
      table: { defaultValue: { summary: "8" }, category: "Motion" },
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
  // Seeded so the text controls render operable widgets instead of "Set string" buttons.
  args: { label: "", targetId: "" },
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
  tags: ["beta-matrix"],
  args: { targetId: "next-section", label: "See our work" },
  render: (args) => (
    <HeroFrame>
      <ScrollIndicator {...args} />
    </HeroFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "See our work" });
    // Keyboard reachability: the control takes focus on Tab and activates on click.
    await userEvent.tab();
    expect(button).toHaveFocus();
    await userEvent.click(button);
    expect(button).toBeInTheDocument();
  },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  args: {
    targetId: "next-section",
    label: "See our work",
    variant: "chevron",
    position: "center",
    motion: "bounce",
    speed: 0.6,
    distance: 8,
  },
  render: (args) => (
    <HeroFrame>
      <ScrollIndicator {...args} />
    </HeroFrame>
  ),
};

/** The real usage: a hero followed by the section the control scrolls to. */
export const Example: Story = {
  tags: ["beta-matrix"],
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
  tags: ["beta-matrix"],
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
