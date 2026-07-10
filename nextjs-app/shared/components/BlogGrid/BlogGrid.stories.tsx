import contract from "./BlogGrid.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect } from "storybook/test";
import { BlogGrid } from "./BlogGrid";
import type { EnhancedArticleCardProps } from "../EnhancedArticleCard";
import img1 from "../../assets/images/future1.webp";
import img2 from "../../assets/images/future2.webp";
import img3 from "../../assets/images/future3.webp";

const author = { name: "Petri Lahdelma" };

const sixArticles: EnhancedArticleCardProps[] = [
  { slug: "designing-in-2025", title: "Designing in 2025", excerpt: "Where craft meets systems.", author, publishedAt: "2025-01-15", readTime: "5 min read", tags: ["Design"], image: { src: img1, alt: "Abstract gradient" } },
  { slug: "figma-mcp-design-systems", title: "Figma MCP and design systems", excerpt: "Bridging design and code.", author, publishedAt: "2025-02-10", readTime: "8 min read", tags: ["Tooling"], image: { src: img2, alt: "Abstract gradient" } },
  { slug: "workflow-tips", title: "Workflow tips", excerpt: "Small habits, big output.", author, publishedAt: "2025-03-01", readTime: "4 min read", tags: ["Process"], image: { src: img3, alt: "Abstract gradient" } },
  { slug: "in-search-of-impact", title: "In search of impact", excerpt: "Designing for outcomes.", author, publishedAt: "2025-03-20", readTime: "6 min read", tags: ["Strategy"] },
  { slug: "digital-craftsmanship", title: "Digital craftsmanship", excerpt: "Sweating the details.", author, publishedAt: "2025-04-05", readTime: "7 min read", tags: ["Craft"] },
  { slug: "thoughts-on-future-branding", title: "Thoughts on future branding", excerpt: "Brands as living systems.", author, publishedAt: "2025-04-22", readTime: "5 min read", tags: ["Branding"] },
];

const threeArticles = sixArticles.slice(0, 3);

const columnPresets = {
  "Two": { sm: 1, md: 2, lg: 2 },
  "Three": { sm: 1, md: 2, lg: 3 },
  "Four": { sm: 1, md: 2, lg: 4 },
};

const meta: Meta<typeof BlogGrid> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/BlogGrid",
  component: BlogGrid,
  tags: ["stable", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-blog-grid",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
  },
  argTypes: {
    articles: {
      options: ["Three", "Six"],
      mapping: { Three: threeArticles, Six: sixArticles },
      control: { type: "select" },
      description: "Articles to render, one EnhancedArticleCard per item.",
      table: { category: "Content" },
    },
    featuredSlug: {
      control: "text",
      description: "Slug promoted to the featured slot (featured-first layout).",
      table: { category: "Content" },
    },
    layout: {
      options: ["standard", "featured-first", "masonry"],
      control: { type: "inline-radio" },
      description: "Grid layout variant.",
      table: { category: "Appearance", defaultValue: { summary: "standard" } },
    },
    columns: {
      options: Object.keys(columnPresets),
      mapping: columnPresets,
      control: { type: "select" },
      description: "Responsive column counts at sm/md/lg breakpoints.",
      table: { category: "Appearance" },
    },
    hideImages: {
      control: "boolean",
      description: "Hide the featured image on each card.",
      table: { category: "Appearance", defaultValue: { summary: "false" } },
    },
    className: {
      control: "text",
      description: "Extra class names merged onto the grid wrapper.",
      table: { category: "Appearance" },
    },
  },
  args: {
    articles: sixArticles,
    featuredSlug: "",
    layout: "standard",
    columns: columnPresets.Three as unknown as { sm?: 1 | 2; md?: 1 | 2 | 3; lg?: 1 | 2 | 3 | 4 },
    hideImages: false,
    className: "",
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 32 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof BlogGrid>;

/** Standard three-column grid of article cards. */
export const Default: Story = {
  tags: ["beta-matrix"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("heading", { name: "Designing in 2025" }),
    ).toBeInTheDocument();
  },
};

/** One article promoted to a full-width featured card, the rest below. */
export const FeaturedFirst: Story = {
  args: { layout: "featured-first", featuredSlug: "figma-mcp-design-systems" },
};

/** Empty state: a friendly dashed-border message instead of a blank grid. */
export const EmptyState: Story = {
  args: { articles: [] },
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
