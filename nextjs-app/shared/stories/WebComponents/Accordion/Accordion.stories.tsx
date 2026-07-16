import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useLayoutEffect, useRef, useState } from "react";
import { expect, userEvent } from "storybook/test";
import { Stage, assertNative, nativeStoryParameters } from "../NativeStory";
import {
  DtAccordionElement,
  type DtAccordionItem,
} from "../../../../../packages/web-components/src/native/accordion";

if (!customElements.get("dt-accordion")) {
  customElements.define("dt-accordion", DtAccordionElement);
}

type Args = {
  items: DtAccordionItem[];
  type: "single" | "multiple";
  variant: "contained" | "enclosed" | "divided";
  defaultOpenId?: string;
  defaultOpenIds?: string[];
  openIds?: string[];
  slots?: Array<{ slot: string; content: React.ReactNode }>;
};

const faqItems: DtAccordionItem[] = [
  {
    id: "one",
    title: "What is Digitaltableteur?",
    content: "We are a design and engineering studio.",
  },
  {
    id: "two",
    title: "Do you work with AI?",
    content: "Yes, responsibly-with human oversight.",
  },
  {
    id: "three",
    title: "How can I contact you?",
    content: "Email mail@digitaltableteur.com.",
  },
];

function NativeAccordion({
  items,
  type,
  variant,
  defaultOpenId,
  defaultOpenIds,
  openIds,
  slots,
}: Args) {
  const ref = useRef<DtAccordionElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.items = items;
    element.type = type;
    element.variant = variant;
    element.defaultOpenId = defaultOpenId ?? "";
    element.defaultOpenIds = Array.isArray(defaultOpenIds)
      ? defaultOpenIds
      : [];
    element.openIds = Array.isArray(openIds) ? openIds : undefined;
  }, [defaultOpenId, defaultOpenIds, items, openIds, type, variant]);

  return React.createElement(
    "dt-accordion",
    { ref },
    slots?.map((entry) =>
      React.createElement(
        "div",
        { key: entry.slot, slot: entry.slot },
        entry.content,
      ),
    ),
  );
}

function ControlledAccordionDemo() {
  const [openIds, setOpenIds] = useState<string[]>(["shipping"]);
  const ref = useRef<DtAccordionElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ openIds: string[] }>).detail;
      setOpenIds(detail.openIds);
    };
    element.addEventListener("open-change", handleChange);
    return () => element.removeEventListener("open-change", handleChange);
  }, []);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.items = [
      {
        id: "shipping",
        title: "Shipping",
        content: "Standard shipping takes 3-5 business days.",
      },
      {
        id: "returns",
        title: "Returns",
        content: "Free returns within 30 days of delivery.",
      },
      {
        id: "warranty",
        title: "Warranty",
        content: "Two-year limited warranty on all hardware.",
      },
    ];
    element.type = "multiple";
    element.variant = "contained";
    element.openIds = openIds;
  }, [openIds]);

  return React.createElement("dt-accordion", { ref });
}

const meta = {
  title: "Web Components/Layout/Accordion",
  component: NativeAccordion,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    contractStatus: "beta",
    docs: {
      description: {
        component:
          "Native `dt-accordion` with single/multiple disclosure, slotted panel content, and bubbled `open-change` events.",
      },
    },
  },
  args: {
    items: faqItems,
    type: "single",
    variant: "contained",
  },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multiple"] },
    variant: {
      control: "inline-radio",
      options: ["contained", "enclosed", "divided"],
    },
  },
} satisfies Meta<typeof NativeAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await assertNative("dt-accordion")({ canvasElement });
    const first = canvasElement
      .querySelector("dt-accordion")
      ?.shadowRoot?.querySelector<HTMLButtonElement>("button[id$='-one']");
    await userEvent.click(first!);
    const updated = canvasElement
      .querySelector("dt-accordion")
      ?.shadowRoot?.querySelector<HTMLButtonElement>("button[id$='-one']");
    await expect(updated).toHaveAttribute("aria-expanded", "true");
  },
};

export const Playground: Story = {};

export const Example: Story = {
  tags: ["example"],
  render: () => (
    <Stage width="min(40rem, 90vw)">
      <NativeAccordion items={faqItems} type="single" variant="contained" />
    </Stage>
  ),
};

export const ForcedColors: Story = {
  tags: ["example"],
  globals: { forcedColors: "active" },
};

export const Faq: Story = {
  tags: ["example"],
  render: () => (
    <NativeAccordion
      items={[
        {
          id: "coverage",
          title: "What does the design system cover?",
          content: "Tokens, components, patterns, and these docs.",
        },
        {
          id: "request",
          title: "How do I request a component?",
          content:
            "Open an issue with the use case and two production consumers.",
        },
        {
          id: "contribute",
          title: "Can I contribute a pattern?",
          content:
            "Yes-start from the pattern template and the contract schema.",
        },
      ]}
      type="single"
      variant="contained"
    />
  ),
};

export const DefaultOpen: Story = {
  tags: ["example"],
  render: () => (
    <NativeAccordion
      defaultOpenId="pricing"
      items={[
        {
          id: "pricing",
          title: "How is the work priced?",
          content: "Fixed-scope engagements with a written definition of done.",
        },
        {
          id: "timeline",
          title: "How long does an engagement take?",
          content: "Typical system audits run two to four weeks.",
        },
      ]}
      type="single"
      variant="contained"
    />
  ),
};

export const Multiple: Story = {
  tags: ["example"],
  render: () => (
    <NativeAccordion
      type="multiple"
      variant="contained"
      defaultOpenIds={["features", "pricing"]}
      items={[
        {
          id: "features",
          title: "Features",
          content:
            "Real-time collaboration, version history, and granular permissions.",
        },
        {
          id: "pricing",
          title: "Pricing",
          content:
            "Free for up to 5 users. Pro starts at EUR12/user/month billed annually.",
        },
        {
          id: "integrations",
          title: "Integrations",
          content: "Connects to the tools your team already uses.",
        },
      ]}
    />
  ),
};

export const Controlled: Story = {
  tags: ["example"],
  render: () => <ControlledAccordionDemo />,
};

export const Enclosed: Story = {
  tags: ["example"],
  render: () => (
    <NativeAccordion
      variant="enclosed"
      defaultOpenId="notifications"
      items={[
        {
          id: "general",
          title: "General settings",
          content: "Language, timezone, and display options.",
        },
        {
          id: "notifications",
          title: "Notifications",
          content:
            "Choose which email and push notifications you want to receive.",
        },
        {
          id: "privacy",
          title: "Privacy",
          content: "Control who can see your profile and activity.",
        },
      ]}
      type="single"
    />
  ),
};

export const Divided: Story = {
  tags: ["example"],
  render: () => (
    <NativeAccordion
      variant="divided"
      items={[
        {
          id: "deploy",
          title: "Deployment details",
          content:
            "Last deployed April 18, 2026 at 3:42 PM. Build duration 2m 14s.",
        },
        {
          id: "env",
          title: "Environment variables",
          content: "12 variables configured across 3 environments.",
        },
        {
          id: "logs",
          title: "Build logs",
          content: "No warnings. All checks passed.",
        },
      ]}
      type="single"
    />
  ),
};

export const Disabled: Story = {
  tags: ["example"],
  render: () => (
    <NativeAccordion
      items={[
        {
          id: "available",
          title: "Available section",
          content: "This one opens normally.",
        },
        {
          id: "soon",
          title: "Coming soon",
          content: "Not reachable yet.",
          disabled: true,
        },
        {
          id: "also",
          title: "Another section",
          content: "This one opens too.",
        },
      ]}
      type="single"
      variant="contained"
    />
  ),
};

export const KeyboardContract: Story = {
  tags: ["example"],
  render: () => (
    <NativeAccordion
      items={[
        { id: "a", title: "First section", content: "First content." },
        { id: "b", title: "Second section", content: "Second content." },
      ]}
      type="single"
      variant="contained"
    />
  ),
};

export const RichSlottedContent: Story = {
  tags: ["example"],
  render: () => (
    <NativeAccordion
      items={[
        { id: "bio", title: "About the studio" },
        { id: "stack", title: "Typical stack" },
      ]}
      type="multiple"
      variant="contained"
      slots={[
        {
          slot: "content-bio",
          content: (
            <>
              <p>
                We pair system design, front-end engineering, and content
                strategy.
              </p>
              <p>Most readers can skip this until they need the details.</p>
            </>
          ),
        },
        {
          slot: "content-stack",
          content: (
            <ul>
              <li>Design tokens</li>
              <li>React and native web components</li>
              <li>Accessibility automation</li>
            </ul>
          ),
        },
      ]}
    />
  ),
};
