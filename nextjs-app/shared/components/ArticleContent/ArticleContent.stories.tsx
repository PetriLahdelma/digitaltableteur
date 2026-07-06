import React from "react";
import contract from "./ArticleContent.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect } from "storybook/test";
import { ArticleContent, ArticleProse } from "./ArticleContent";

const articleBody = (
  <ArticleProse>
    <h2>Designing with systems</h2>
    <p>
      A design system is only as good as the decisions it makes easy. The goal
      is not to constrain, but to remove the thousand small choices that slow a
      team down and let people focus on the problem in front of them.
    </p>
    <h3>Start from the tokens</h3>
    <p>
      Tokens are the vocabulary. Colour, type, space and motion, named once and
      referenced everywhere, so a change in intent becomes a change in one
      place rather than a hunt across a codebase.
    </p>
    <ul>
      <li>Name things for their role, not their value.</li>
      <li>Let the platform enforce the rules you care about.</li>
    </ul>
  </ArticleProse>
);

const shortBody = (
  <ArticleProse>
    <p>A single paragraph sized to the article measure.</p>
  </ArticleProse>
);

const meta: Meta<typeof ArticleContent> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/ArticleContent",
  component: ArticleContent,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-article-content",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen",
  },
  argTypes: {
    children: {
      options: ["Short", "Article"],
      mapping: { Short: shortBody, Article: articleBody },
      control: { type: "select" },
      description: "Article body (MDX prose) rendered at the reading measure.",
      table: { category: "Content" },
    },
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "inline-radio" },
      description: "Container width preset for the reading measure.",
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    className: {
      control: "text",
      description: "Extra class names merged onto the container.",
      table: { category: "Appearance" },
    },
  },
  args: {
    children: articleBody,
    size: "md",
    className: "",
  },
};

export default meta;

type Story = StoryObj<typeof ArticleContent>;

/** Article body wrapped at the medium reading measure. */
export const Default: Story = {
  tags: ["beta-matrix"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("heading", { name: "Designing with systems" }),
    ).toBeInTheDocument();
  },
};

/** Narrower small measure for tighter columns. */
export const SmallMeasure: Story = {
  args: { size: "sm" },
};

/** Wider large measure for feature articles. */
export const LargeMeasure: Story = {
  args: { size: "lg" },
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
