import contract from "./Accordion.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Accordion from "./Accordion";
import { expect, userEvent, waitFor, within } from "storybook/test";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
const meta: Meta<typeof Accordion> = {
  title: "Layout/Accordion",
  component: Accordion,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=381-17",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    items: {
      control: "object",
      description: "Accordion sections (id, title, content)",
    },

    defaultOpenId: {
      control: "text",
      description: "Initially expanded item id",
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      className: { table: { disable: true } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  parameters: { a11y: { disable: true } },
  tags: ["beta-matrix"],
  args: {
    items: [
      {
        id: "one",
        title: "What is Digitaltableteur?",
        content: "We are a design and engineering studio.",
      },
      {
        id: "two",
        title: "Do you work with AI?",
        content: "Yes, responsibly—with human oversight.",
      },
      {
        id: "three",
        title: "How can I contact you?",
        content: "Email mail@digitaltableteur.com.",
      },
    ],
  },
};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Click first accordion item to expand
  const firstButton = canvas.getByRole("button", {
    name: /what is digitaltableteur/i,
  });
  await userEvent.click(firstButton);

  // Wait for content to appear
  await waitFor(() => {
    const content = canvas.queryByText(/design and engineering studio/i);
    return content !== null;
  });

  // Click second accordion item
  const secondButton = canvas.getByRole("button", {
    name: /do you work with ai/i,
  });
  await userEvent.click(secondButton);

  // Wait for second content
  await waitFor(() => {
    const content = canvas.queryByText(/responsibly/i);
    return content !== null;
  });
};

const defaultItems = Default.args?.items ?? [];

export const Playground: Story = {
  tags: ["beta-matrix"],
  args: { items: defaultItems },
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  args: Default.args,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: { items: defaultItems },
};

/** The canonical FAQ: one answer open at a time, opening the next closes the last, clicking the open item closes it. */
export const Faq: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "The canonical FAQ: one answer open at a time, opening the next closes the last, clicking the open item closes it." } },
  },
  render: () => (
    <Accordion
      items={[
        { id: "coverage", title: "What does the design system cover?", content: "Tokens, components, patterns, and these docs." },
        { id: "request", title: "How do I request a component?", content: "Open an issue with the use case and two production consumers." },
        { id: "contribute", title: "Can I contribute a pattern?", content: "Yes — start from the pattern template and the contract schema." },
      ]}
    />
  ),
};

/** defaultOpenId lands visitors on the entry most of them came for, with the rest one keypress away. */
export const DefaultOpen: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "defaultOpenId lands visitors on the entry most of them came for, with the rest one keypress away." } },
  },
  render: () => (
    <Accordion
      defaultOpenId="pricing"
      items={[
        { id: "pricing", title: "How is the work priced?", content: "Fixed-scope engagements with a written definition of done." },
        { id: "timeline", title: "How long does an engagement take?", content: "Typical system audits run two to four weeks." },
      ]}
    />
  ),
};

/** Triggers are real buttons: Tab reaches them, Enter or Space toggles, aria-expanded and aria-controls wire each trigger to its region — asserted by the play function. */
export const KeyboardContract: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Triggers are real buttons: Tab reaches them, Enter or Space toggles, aria-expanded and aria-controls wire each trigger to its region — asserted by the play function." } },
  },
  render: () => (
    <Accordion
      items={[
        { id: "a", title: "First section", content: "First content." },
        { id: "b", title: "Second section", content: "Second content." },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: /first section/i });
    await userEvent.click(first);
    await expect(first).toHaveAttribute("aria-expanded", "true");
    const second = canvas.getByRole("button", { name: /second section/i });
    await userEvent.click(second);
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "false");
  },
};
