import contract from "./Card.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import Card from "@dt/Card";
import Badge from "@dt/Badge";
import Button from "@dt/Button";
import Divider from "@dt/Divider";
import FlexBox from "@dt/FlexBox";
import Grid from "@dt/Grid";
import Text from "@dt/Text";

const meta = {
  title: "Layout/Card",
  component: Card,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=377-26",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // authored entries cover judgment: children text control, mapping presets
  // for the composite titleProps/descriptionProps/extra slots.
  argTypes: {
    children: { control: "text", description: "Card body content" },
    titleProps: {
      control: { type: "select" },
      options: ["default", "h2Outline", "largeSerif"],
      mapping: {
        default: undefined,
        h2Outline: { level: 2 },
        largeSerif: { size: "m", terminals: "serif" },
      },
      description:
        "Heading configuration (level for the document outline). Pick a preset here; compose your own in code.",
      table: { category: "Advanced", type: { summary: "CardTitleProps" } },
    },
    descriptionProps: {
      control: { type: "select" },
      options: ["default", "largeSpan"],
      mapping: {
        default: undefined,
        largeSpan: { size: "m", as: "span" },
      },
      description:
        "Description configuration. Pick a preset here; compose your own in code.",
      table: { category: "Advanced", type: { summary: "CardDescriptionProps" } },
    },
    extra: {
      control: { type: "select" },
      options: ["none", "draftBadge"],
      mapping: {
        none: undefined,
        draftBadge: (
          <Badge tone="info" size="sm">
            Draft
          </Badge>
        ),
      },
      description:
        "Right-aligned header slot (badge, timestamp, small action). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },
  },
  args: {
    title: "Design tokens",
    description: "Layer 0 of the system: DTCG JSON, transformed per platform.",
    variant: "default" as const,
    padding: "md" as const,
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The surface at rest: hairline border, quiet background, xxs heading,
 * body on the text ladder. The container adds nothing else.
 */
export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => (
    <Card {...args} style={{ maxWidth: "20rem" }}>
      <Text size="s">
        Colors, spacing, and type ship as platform-agnostic JSON before any
        component exists.
      </Text>
    </Card>
  ),
};

// No hardcoded JSX children: they would override args.children and turn the
// panel's body control into a liar. link seeded so linkLabel has an anchor
// to name.
export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <Card {...args} style={{ maxWidth: "20rem" }} />,
  args: {
    children: "Body content flows in the card rhythm.",
    link: "/work/dsharp-design-system",
  },
};

/** Background swaps only — the border never moves. */
export const Variants: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "variant swaps the background: default keeps the hairline, muted recedes for de-emphasised siblings, transparent groups content without visual weight. Every variant keeps a transparent border so switching never causes layout jitter.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "1rem" }}>
      {(["default", "muted", "transparent"] as const).map((variant) => (
        <Card key={variant} variant={variant} style={{ width: "13rem" }}>
          <Text size="s" as="strong">
            {variant}
          </Text>
          <Text size="xs">The same surface, a different weight.</Text>
        </Card>
      ))}
    </div>
  ),
};

/** One padding step per surface; siblings match. */
export const PaddingScale: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "padding picks a step on the internal space scale: sm 12, md 16 (default), lg 24. Pick one per surface — sibling cards with mixed padding read as a bug.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      {(["sm", "md", "lg"] as const).map((padding) => (
        <Card key={padding} padding={padding} style={{ width: "12rem" }}>
          <Text size="s">padding {padding}</Text>
        </Card>
      ))}
    </div>
  ),
};

/** Structure is composition: header row, divider, footer actions. */
export const Structured: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The card contributes the surface; structure comes from composition. Here: the title/extra header row, a meaningful Divider, body text, and a FlexBox footer with actions — no card-specific props involved.",
      },
    },
  },
  render: () => (
    <Card
      title="Quarterly review"
      extra={<Badge tone="info" size="sm">Draft</Badge>}
      style={{ maxWidth: "22rem" }}
    >
      <Divider />
      <Text size="s">
        Q2 numbers are in: token adoption up 40%, three new consumers, zero
        contract drift incidents.
      </Text>
      <FlexBox justify="space-between" align="center">
        <Button variant="tertiary" size="sm">
          Discard
        </Button>
        <Button size="sm">Publish</Button>
      </FlexBox>
    </Card>
  ),
};

/** The whole card is one link; the ring draws around the frame. */
export const AsLink: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "link stretches the title's anchor across the surface — one link in the accessibility tree, named by linkLabel ?? title, focus ring around the card frame, hairline darkens on hover. Never nest other interactive controls inside; the play function asserts the single-anchor contract.",
      },
    },
  },
  render: () => (
    <Card
      title="DSharp design system"
      description="AI-first component architecture for a multi-app suite."
      link="/work/dsharp-design-system"
      linkLabel="Read the DSharp design system case study"
      style={{ maxWidth: "20rem" }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const links = canvas.getAllByRole("link");
    await expect(links).toHaveLength(1);
    await expect(links[0]).toHaveAccessibleName(
      "Read the DSharp design system case study",
    );
    await userEvent.tab();
    await expect(links[0]).toHaveFocus();
  },
};

/** Loading is a quiet skeleton, announced once. */
export const Loading: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "loading renders skeleton lines and announces via role=status + aria-busy. The card keeps its footprint, so content pops in without layout shift.",
      },
    },
  },
  render: () => (
    <Card loading style={{ width: "20rem" }}>
      <Text size="s">Replaced by skeleton lines while loading.</Text>
    </Card>
  ),
};

/** Cards in a Grid: consistent padding, equal surfaces. */
export const CardGrid: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    layout: "padded",
    docs: {
      description: {
        story:
          "The natural habitat: a Grid of equal surfaces with one padding step and per-card links. Cards fill their grid cells — no size prop needed.",
      },
    },
  },
  render: () => (
    <Grid columns={3} gap="1rem">
      {[
        ["Design tokens", "DTCG JSON as the source of truth."],
        ["Components", "Contract-driven, four files each."],
        ["Patterns", "Composed surfaces for product flows."],
      ].map(([title, blurb]) => (
        <Card key={title} title={title} link={`#${title}`}>
          <Text size="xs">{blurb}</Text>
        </Card>
      ))}
    </Grid>
  ),
};

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  render: () => (
    <Card
      title="Design tokens"
      description="Layer 0 of the system: DTCG JSON, transformed per platform."
      extra={<Badge tone="success" size="sm">Stable</Badge>}
      style={{ maxWidth: "20rem" }}
    >
      <Text size="s">
        Colors, spacing, and type ship as platform-agnostic JSON before any
        component exists.
      </Text>
    </Card>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true, test: "off" } },
  globals: { forcedColors: "active" },
  render: (args) => (
    <Card {...args} style={{ maxWidth: "20rem" }}>
      <Text size="s">The physical border keeps the frame in forced colors.</Text>
    </Card>
  ),
};
