import { userEvent, within } from "storybook/test";
import { SkipLink } from "./SkipLink";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./SkipLink.contract.json";

const defaultArgs = {
  href: "#main-content",
  children: "Skip to main content",
};

const meta = {
  title: "Navigation/SkipLink",
  component: SkipLink,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-skip-link",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    href: {
      control: "text",
      description: "Target fragment for main content",
      table: { defaultValue: { summary: "#main-content" } },
    },
    children: { control: "text", description: "Visible link text on focus" },
    className: {
      control: "text",
      description: "Link class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  tags: ["beta-matrix"],
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => <SkipLink />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};

/** Press Tab: the visually hidden link surfaces as a high-contrast pill. */
export const FocusReveal: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    layout: "padded",
    docs: {
      description: {
        story:
          "Hidden until keyboard focus lands on it, then rendered as a high-contrast pill. The play function tabs once so the revealed state is what you see here.",
      },
    },
  },
  render: () => <SkipLink />,
  play: async ({ canvasElement }) => {
    within(canvasElement);
    await userEvent.tab();
  },
};

/** First focusable element of the layout, ahead of the primary nav. */
export const InLayout: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    layout: "padded",
    docs: {
      description: {
        story:
          "Placement is the whole trick: render it before the header so the first Tab press on any page offers the bypass, and give the main wrapper the matching id.",
      },
    },
  },
  render: () => (
    <div>
      <SkipLink href="#demo-main" />
      <nav aria-label="Primary" style={{ display: "flex", gap: "1rem" }}>
        <a href="#one">Home</a>
        <a href="#two">Work</a>
        <a href="#three">Contact</a>
      </nav>
      <main id="demo-main" style={{ marginTop: "1rem" }}>
        Main content starts here.
      </main>
    </div>
  ),
};

/** The label is announced in isolation — keep it an action phrase. */
export const CustomTarget: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    layout: "padded",
    docs: {
      description: {
        story:
          "href points anywhere with a stable id — a search results region, a data table. Keep the label explicit about the destination.",
      },
    },
  },
  args: {
    href: "#results",
    children: "Skip to search results",
  },
  play: async ({ canvasElement }) => {
    within(canvasElement);
    await userEvent.tab();
  },
};
