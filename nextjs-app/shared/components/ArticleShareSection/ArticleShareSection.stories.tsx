import contract from "./ArticleShareSection.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect } from "storybook/test";
import { ArticleShareSection } from "./ArticleShareSection";

const meta: Meta<typeof ArticleShareSection> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/ArticleShareSection",
  component: ArticleShareSection,
  tags: ["stable", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-article-share-section",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  argTypes: {
    url: { control: "text", description: "Article URL to share.", table: { category: "Content" } },
    title: { control: "text", description: "Article title used as share text.", table: { category: "Content" } },
    layout: {
      options: ["horizontal", "vertical"],
      control: { type: "inline-radio" },
      description: "Stack the buttons in a row or a column.",
      table: { category: "Appearance", defaultValue: { summary: "horizontal" } },
    },
    showTitle: {
      control: "boolean",
      description: "Show the \"Share this article\" heading.",
      table: { category: "Appearance", defaultValue: { summary: "true" } },
    },
    className: { control: "text", description: "Extra class names merged onto the wrapper.", table: { category: "Appearance" } },
  },
  args: {
    url: "https://digitaltableteur.com/blog/designing-in-2025",
    title: "Designing in 2025",
    layout: "horizontal",
    showTitle: true,
    className: "",
  },
};

export default meta;

type Story = StoryObj<typeof ArticleShareSection>;

/** Horizontal share row with the section heading. */
export const Default: Story = {
  tags: ["beta-matrix"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Real i18n renders "Share on Twitter"; the component's "Share on X" is a fallback.
    expect(
      canvas.getByRole("link", { name: /share on (x|twitter)/i }),
    ).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: /copy link/i }),
    ).toBeInTheDocument();
  },
};

/** Vertical layout for a sticky article rail. */
export const Vertical: Story = {
  args: { layout: "vertical" },
};

/** Buttons only, without the section heading. */
export const NoTitle: Story = {
  args: { showTitle: false },
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
