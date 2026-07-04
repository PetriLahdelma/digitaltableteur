import { userEvent, within } from "storybook/test";
import ArticleCard from "./ArticleCard";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./ArticleCard.contract.json";

const defaultArgs = {
  title: "Design systems that survive contact with AI",
  lead: "How we keep generated UI on-brand with schemas, tokens, and review gates.",
  link: "/blog/design-systems-ai",
  readTime: "6 min read",
};

const meta = {
  title: "Site/ArticleCard",
  component: ArticleCard,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-article-card",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    title: { control: "text", description: "Article headline" },
    lead: { control: "text", description: "Deck / summary line" },
    link: { control: "text", description: "Article URL" },
    readTime: { control: "text", description: "Estimated reading time label" },
    loading: { control: "boolean", description: "Skeleton loading state" },
    className: {
      control: "text",
      description: "Card class names",
      table: { disable: true },
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
  args: defaultArgs,
} satisfies Meta<typeof ArticleCard>;

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
  name: "Example (blog index teaser)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <ArticleCard {...defaultArgs} />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
