import contract from "./BlogNav.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect } from "storybook/test";
import BlogNav from "@dt/BlogNav";

const meta: Meta<typeof BlogNav> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/BlogNav",
  component: BlogNav,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-blog-nav",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  argTypes: {
    currentPath: {
      control: "text",
      description:
        "Active route used to compute the prev/next disabled state. Defaults to the router pathname; seeded here to a real article route.",
      table: {
        category: "Behavior",
        defaultValue: { summary: "usePathname()" },
      },
    },
  },
  args: {
    currentPath: "/blog/digital-craftsmanship",
  },
};

export default meta;

type Story = StoryObj<typeof BlogNav>;

/** Mid-sequence article: both Prev and Next are enabled. */
export const Default: Story = {
  tags: ["beta-matrix"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("navigation", { name: "Blog article navigation" }),
    ).toBeInTheDocument();
    expect(canvas.getByRole("button", { name: /prev/i })).toBeEnabled();
    expect(canvas.getByRole("button", { name: /next/i })).toBeEnabled();
  },
};

/** First article: Prev is disabled. */
export const FirstArticle: Story = {
  args: { currentPath: "/blog/petri-lahdelma-bio" },
};

/** Last article: Next is disabled. */
export const LastArticle: Story = {
  args: {
    currentPath:
      "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-2",
  },
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
