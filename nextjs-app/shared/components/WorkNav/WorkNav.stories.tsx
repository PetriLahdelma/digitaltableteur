import contract from "./WorkNav.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect } from "storybook/test";
import WorkNav from "@dt/WorkNav";

const meta: Meta<typeof WorkNav> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  // `currentPath` is a plain text control seeded from a real work route so the
  // prev/next disabled state is operable from the panel.
  title: "Site/WorkNav",
  component: WorkNav,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-work-nav",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  argTypes: {
    currentPath: {
      control: "text",
      description:
        "Active route used to compute the prev/next disabled state. Defaults to the router pathname; seeded here to a real work route.",
      table: {
        category: "Behavior",
        defaultValue: { summary: "usePathname()" },
      },
    },
    pages: {
      description:
        "Ordered case-study paths supplied by the host project registry. Disabled in controls because entries include both path and label metadata.",
      table: { disable: true },
    },
    disabled: {
      control: "boolean",
      description: "Disables every action while host navigation is pending.",
      table: {
        category: "Behavior",
        defaultValue: { summary: "false" },
      },
    },
  },
  args: {
    currentPath: "/work/new-things-co",
  },
};

export default meta;

type Story = StoryObj<typeof WorkNav>;

/** Mid-sequence page: both Prev and Next are enabled. */
export const Default: Story = {
  tags: ["beta-matrix"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", {
      name: "Work project navigation",
    });
    expect(nav).toBeInTheDocument();
    // Mid sequence: neither edge button is disabled.
    expect(canvas.getByRole("button", { name: /prev/i })).toBeEnabled();
    expect(canvas.getByRole("button", { name: /next/i })).toBeEnabled();
  },
};

/** First work page: Prev is disabled. */
export const FirstPage: Story = {
  args: { currentPath: "/work/helsinki-design-system" },
};

/** Last work page: Next is disabled. */
export const LastPage: Story = {
  args: { currentPath: "/work/garage-junction" },
};

export const Playground: Story = Default;

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
