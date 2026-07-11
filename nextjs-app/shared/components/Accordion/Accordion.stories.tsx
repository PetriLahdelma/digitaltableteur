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
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1223-2915",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // items keeps a mapping preset, defaultOpenId a radio over the preset's ids.
  argTypes: {
    items: {
      control: { type: "select" },
      options: ["faq", "twoItems"],
      mapping: {
        faq: [
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
        twoItems: [
          { id: "one", title: "First section", content: "First content." },
          { id: "two", title: "Second section", content: "Second content." },
        ],
      },
      description:
        "Accordion sections (id, title, content). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "AccordionItem[]" } },
    },
    defaultOpenId: {
      control: { type: "inline-radio" },
      options: ["one", "two", "three"],
      description: "Initially expanded item id (preset ids: one/two/three)",
      table: { category: "Content" },
    },
    type: {
      control: { type: "inline-radio" },
      options: ["single", "multiple"],
      description: "single keeps one section open; multiple allows several",
      table: { category: "Behavior", defaultValue: { summary: "single" } },
    },
    variant: {
      control: { type: "inline-radio" },
      options: ["contained", "enclosed", "divided"],
      description:
        "contained: border + dividers; enclosed: outer border only, seamless inside; divided: flush hairlines, no border",
      table: { category: "Appearance", defaultValue: { summary: "contained" } },
    },
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

// defaultOpenId is mount-only state; keying the render on it remounts so the
// radio actually drives the canvas. items arg is a mapping key.
export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <Accordion key={`open-${args.defaultOpenId}`} {...args} />,
  args: {
    items: "faq" as unknown as typeof defaultItems,
    defaultOpenId: "one",
  },
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

/** type="multiple" lets several sections stay open so users can compare content. */
export const Multiple: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "type=\"multiple\" keeps any number of sections open at once — use it when readers compare content across sections, like feature lists or pricing tiers." } },
  },
  render: () => (
    <Accordion
      type="multiple"
      defaultOpenIds={["features", "pricing"]}
      items={[
        { id: "features", title: "Features", content: "Real-time collaboration, version history, and granular permissions." },
        { id: "pricing", title: "Pricing", content: "Free for up to 5 users. Pro starts at €12/user/month billed annually." },
        { id: "integrations", title: "Integrations", content: "Connects to the tools your team already uses." },
      ]}
    />
  ),
};

/** Controlled: the parent owns open state via openIds + onOpenChange. */
export const Controlled: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Pass openIds + onOpenChange to drive the accordion from parent state — when open sections should sync with a URL param, form, or external control." } },
  },
  render: () => {
    const ControlledDemo = () => {
      const [openIds, setOpenIds] = React.useState<string[]>(["shipping"]);
      return (
        <Accordion
          type="multiple"
          openIds={openIds}
          onOpenChange={setOpenIds}
          items={[
            { id: "shipping", title: "Shipping", content: "Standard shipping takes 3–5 business days." },
            { id: "returns", title: "Returns", content: "Free returns within 30 days of delivery." },
            { id: "warranty", title: "Warranty", content: "Two-year limited warranty on all hardware." },
          ]}
        />
      );
    };
    return <ControlledDemo />;
  },
};

/** variant="enclosed" keeps the outer border but drops the between-row dividers. */
export const Enclosed: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "variant=\"enclosed\" wraps the group in a single rounded border with no dividers between rows — a seamless card. Row separation comes from spacing and the open/closed state." } },
  },
  render: () => (
    <Accordion
      variant="enclosed"
      defaultOpenId="notifications"
      items={[
        { id: "general", title: "General settings", content: "Language, timezone, and display options." },
        { id: "notifications", title: "Notifications", content: "Choose which email and push notifications you want to receive." },
        { id: "privacy", title: "Privacy", content: "Control who can see your profile and activity." },
      ]}
    />
  ),
};

/** variant="divided" drops the card border for flush hairline separators. */
export const Divided: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "variant=\"divided\" removes the container border for flush hairline separators — lighter weight for inline disclosure in sidebars or detail panels." } },
  },
  render: () => (
    <Accordion
      variant="divided"
      items={[
        { id: "deploy", title: "Deployment details", content: "Last deployed April 18, 2026 at 3:42 PM. Build duration 2m 14s." },
        { id: "env", title: "Environment variables", content: "12 variables configured across 3 environments." },
        { id: "logs", title: "Build logs", content: "No warnings. All checks passed." },
      ]}
    />
  ),
};

/** A disabled item stays visible but its trigger is inert. */
export const Disabled: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Mark an item disabled to show it in the set while its trigger is inert — for sections that are not yet available." } },
  },
  render: () => (
    <Accordion
      items={[
        { id: "available", title: "Available section", content: "This one opens normally." },
        { id: "soon", title: "Coming soon", content: "Not reachable yet.", disabled: true },
        { id: "also", title: "Another section", content: "This one opens too." },
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
