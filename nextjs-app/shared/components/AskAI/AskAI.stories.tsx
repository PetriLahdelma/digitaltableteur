import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Badge from "@dt/Badge";
import { AskAI } from "./AskAI";

/**
 * AskAI is a floating sidebar widget (position: fixed, right center) that
 * deep-links the current page subject into ChatGPT, Claude, Gemini, and
 * Perplexity. It portals to document.body, so the story canvas reserves
 * viewport height for it.
 *
 * Pre-contract component: no .contract.json yet — story added first for
 * visual + axe coverage. Backfill contract/spec/test to promote.
 */
const meta: Meta<typeof AskAI> = {
  argTypes: {},
  title: "Organisms/AskAI",
  component: AskAI,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-ask-ai",
    },
    a11y: { test: "error" },
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Floating 'Ask AI about' widget with a subject split button, a 2x2 grid of LLM provider deep links, and a personalize toggle.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: "32rem" }}>
        <div style={{ margin: "1rem" }}>
          <Badge tone="warning" size="sm">
            Work in progress
          </Badge>
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AskAI>;

/**
 * Default widget as rendered on /about and work case-study pages.
 * Fixed-positioned at the right edge, vertically centered.
 */
export const Default: Story = {
  tags: ["beta-matrix"],
};

export const Playground = Default;

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
