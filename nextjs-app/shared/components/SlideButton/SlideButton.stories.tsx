import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { SlideButton } from "./SlideButton";
import contract from "./SlideButton.contract.json";

const meta = {
  title: "Actions/SlideButton",
  component: SlideButton,
  tags: ["stable", "autodocs"],
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: {
      description: {
        component: contract.description,
      },
    },
  },
  argTypes: {
    label: {
      control: "text",
      description: "Visible label. Name the destination, not the gesture.",
      table: { category: "Content", type: { summary: "string" } },
    },
    icon: {
      control: "text",
      description:
        "Registered Phosphor icon name for the sliding disc (PascalCase, e.g. 'Lightning', 'ArrowRight'; must exist in the Icon registry).",
      table: {
        category: "Content",
        type: { summary: "string" },
        defaultValue: { summary: "Lightning" },
      },
    },
    href: {
      control: "text",
      description: "Destination. Rendered as a real <a>.",
      table: { category: "Behavior", type: { summary: "string" } },
    },
    iconSide: {
      control: { type: "inline-radio" },
      options: ["left", "right"],
      description:
        "Side the disc rests on before it slides across on hover; the reverse starts on the trailing edge.",
      table: {
        category: "Appearance",
        type: { summary: "left | right" },
        defaultValue: { summary: "left" },
      },
    },
    className: {
      control: "text",
      description: "Additional CSS classes merged onto the anchor.",
      table: { category: "Advanced", type: { summary: "string" } },
    },
  },
  // Seeded so every control renders an operable widget instead of a "Set string" button.
  args: {
    label: "Start your sprint",
    href: "/contact?service=design-sprint",
    icon: "Lightning",
    iconSide: "left",
    className: "",
  },
} satisfies Meta<typeof SlideButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Start your sprint" });
    expect(link).toHaveAttribute("href", "/contact?service=design-sprint");
    // Keyboard reachability: the anchor takes focus on Tab.
    link.blur();
    await userEvent.tab();
    expect(link).toHaveFocus();
  },
};

/** The disc can rest on the trailing edge and slide the other way. */
export const IconRight: Story = {
  tags: ["example"],
  args: { iconSide: "right" },
  parameters: {
    docs: {
      description: {
        story: "iconSide=right mirrors the resting and hover positions.",
      },
    },
  },
};

/** Any Phosphor icon can ride the disc; pick one that reinforces the destination. */
export const Icons: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gap: "1rem", justifyItems: "start" }}>
      <SlideButton label="Start your sprint" href="#sprint" icon="Lightning" />
      <SlideButton label="See the work" href="#work" icon="ArrowRight" />
      <SlideButton label="Read the story" href="#story" icon="Bookmark" />
    </div>
  ),
};

/** Long labels and long fi/sv locale strings must not break the pill. */
export const LongLabel: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gap: "1rem", justifyItems: "start", maxWidth: 420 }}>
      <SlideButton label="Book a discovery call with the team" href="#call" />
      <SlideButton label="Aloita suunnittelusprintti tänään" href="#fi" icon="ArrowRight" />
    </div>
  ),
};

/** In context: a focal CTA sitting on a muted band, as on the home and about pages. */
export const InContext: Story = {
  tags: ["example"],
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minBlockSize: "40vh",
        padding: "2rem",
        background: "var(--color-surface)",
      }}
    >
      <SlideButton label="Start your sprint" href="#sprint" icon="Lightning" />
    </div>
  ),
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true, test: "off" } },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  args: { label: "See the work", href: "/work", icon: "ArrowRight" },
};

/**
 * Forced-colors verification story. The pill border, icon disc, and label must stay
 * visible when the author's colours are replaced by the system palette.
 */
export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  parameters: { a11y: { disable: true, test: "off" } },
};
