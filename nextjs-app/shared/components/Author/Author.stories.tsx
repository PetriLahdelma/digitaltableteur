import contract from "./Author.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Author from "./Author";
import { getAuthors } from "../../data/authors";

/**
 * Author component displays a simple author byline with avatar and optional profile link.
 * Typically used in blog post headers, article cards, or comment threads.
 *
 * Features:
 * - Avatar integration with configurable size
 * - Optional profile link
 * - Compact inline layout
 * - Design system compliant (Avatar component reuse)
 */
const meta: Meta<typeof Author> = {
  title: "Content/Author",
  component: Author,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-author",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "centered",
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
};

export default meta;

type Story = StoryObj<typeof Author>;

// Helper to get first author from data
const [defaultAuthor] = getAuthors();

/**
 * Default Author byline with avatar and name.
 * No profile link - displays static "By {name}" text.
 */
export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    name: defaultAuthor?.name ?? "Petri Lahdelma",
    imageUrl: defaultAuthor?.imageUrl ?? "/images/authors/petri-lahdelma.jpg",
  },
};

/**
 * Author byline with clickable profile link.
 * Common pattern for blog posts and articles.
 */
export const WithProfileLink: Story = {
  args: {
    name: defaultAuthor?.name ?? "Petri Lahdelma",
    imageUrl: defaultAuthor?.imageUrl ?? "/images/authors/petri-lahdelma.jpg",
    profileUrl: "/authors/petri-lahdelma",
  },
};

/**
 * Small avatar size for compact layouts.
 * Useful in comment threads or dense article lists.
 */
export const SmallSize: Story = {
  args: {
    name: "Anna Virtanen",
    size: "sm",
    profileUrl: "/authors/anna-virtanen",
  },
};

/**
 * Large avatar size for prominent bylines.
 * Suitable for featured articles or author pages.
 */
export const LargeSize: Story = {
  args: {
    name: "Mika Korhonen",
    size: "xl",
    profileUrl: "/authors/mika-korhonen",
  },
};

/**
 * Multiple authors demonstration.
 * Shows stacking pattern for co-authored content.
 */
export const MultipleAuthors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Author
        name="Petri Lahdelma"
        imageUrl="/images/authors/petri-lahdelma.jpg"
        profileUrl="/authors/petri-lahdelma"
      />
      <Author name="Anna Virtanen" profileUrl="/authors/anna-virtanen" />
      <Author name="Mika Korhonen" profileUrl="/authors/mika-korhonen" />
    </div>
  ),
};

/**
 * No profile link variant.
 * Used when author profile pages don't exist or for guest authors.
 */
export const NoProfileLink: Story = {
  args: {
    name: "Guest Author",
    size: "md",
  },
};

/**
 * Long name edge case.
 * Tests text overflow and wrapping behavior.
 */
export const LongName: Story = {
  args: {
    name: "Dr. Alexander Wellington-Worthington III",
    profileUrl: "/authors/alexander-wellington-worthington",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tests how the component handles exceptionally long author names. Text should wrap gracefully without breaking layout.",
      },
    },
  },
};

/**
 * Custom size with CSS units.
 * Demonstrates flexibility of Avatar size prop.
 */
export const CustomSize: Story = {
  args: {
    name: "Sarah Chen",
    size: "3.5rem",
    profileUrl: "/authors/sarah-chen",
  },
};

/**
 * Real-world blog post example.
 * Typical usage in article headers with medium avatar.
 */
export const BlogPostByline: Story = {
  args: {
    name: defaultAuthor?.name ?? "Petri Lahdelma",
    imageUrl: defaultAuthor?.imageUrl ?? "/images/authors/petri-lahdelma.jpg",
    size: "md",
    profileUrl: "/authors/petri-lahdelma",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Standard blog post byline pattern with default size and profile link. Most common use case.",
      },
    },
  },
};

/**
 * Card footer attribution.
 * Compact size for use in article cards or list items.
 */
export const CardFooter: Story = {
  args: {
    name: "Emma Lindström",
    size: "sm",
    profileUrl: "/authors/emma-lindstrom",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Slightly smaller size optimized for article cards and preview components.",
      },
    },
  },
};

/**
 * In article context demonstration.
 * Shows Author component within typical blog post layout.
 */
export const InArticleContext: Story = {
  render: () => (
    <article
      style={{
        maxWidth: "42rem",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          marginBottom: "1rem",
          lineHeight: "1.2",
        }}
      >
        Building Modern Web Applications with Next.js
      </h1>
      <div style={{ marginBottom: "2rem" }}>
        <Author
          name={defaultAuthor?.name ?? "Petri Lahdelma"}
          imageUrl={
            defaultAuthor?.imageUrl ?? "/images/authors/petri-lahdelma.jpg"
          }
          profileUrl="/authors/petri-lahdelma"
        />
      </div>
      <p style={{ color: "var(--color-gray-medium)", lineHeight: "1.6" }}>
        This article explores the latest features in Next.js and how they enable
        developers to build fast, scalable web applications...
      </p>
    </article>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Shows how the Author component integrates into a typical article layout with heading and content.",
      },
    },
  },
};

/**
 * Custom byline prefix for non-authorship attributions or a fixed language.
 * The default prefix is localized ("By" / "Kirjoittanut" / "Av").
 */
export const CustomBylinePrefix: Story = {
  args: {
    name: "Anna Virtanen",
    bylinePrefix: "Reviewed by",
  },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl", "3.5rem"],
      description:
        "Avatar size, exposed from the Avatar atom: sm/md/lg/xl tokens are canonical (any CSS length works in code)",
      table: { category: "Appearance", type: { summary: "AvatarSize" } },
    },
  },
  args: {
    ...Default.args,
    size: "lg",
  },
};
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
