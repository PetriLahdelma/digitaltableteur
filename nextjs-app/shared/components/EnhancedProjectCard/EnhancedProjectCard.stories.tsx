import { userEvent, within } from "storybook/test";
import { EnhancedProjectCard } from "./EnhancedProjectCard";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./EnhancedProjectCard.contract.json";

const defaultArgs = {
  title: "SAP Build Apps Design System",
  slug: "sap-build-apps",
  thumbnail: "/images/portfolio/sap-build-apps/Build Product Icon_1000px.png",
  category: "Design Systems",
  tags: ["Enterprise", "Low-Code"],
  aspectRatio: "video" as const,
  showCategory: true,
  showDescription: true,
};

const meta = {
  title: "Site/EnhancedProjectCard",
  component: EnhancedProjectCard,
  tags: ["stable", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-enhanced-project-card",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
} satisfies Meta<typeof EnhancedProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
// description seeded so showDescription has something to toggle. videoThumbnail
// is left unset so the static thumbnail image (thumbnail prop) stays visible
// and probeable; autoPlayVideo only sets the <video> autoPlay attribute, which
// is gated by !prefers-reduced-motion (the audit emulates reduced-motion) —
// effect-exempt.
export const Playground: Story = {
  tags: ["beta-matrix"],
  args: {
    description:
      "An enterprise low-code design system spanning tokens, components, and governance.",
  },
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (work grid card)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <EnhancedProjectCard {...defaultArgs} />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};

// Non-interactive teaser: no link wrapper, badge overlaid on the media.
export const ComingSoon: Story = {
  args: {
    title: "Precedent",
    slug: "precedent",
    thumbnail: "/images/portfolio/precedent/thumbnail.webp",
    category: "Tools",
    tags: ["Product Design", "macOS App", "Local-first"],
    description:
      "A local-first desktop workspace that turns saved interface references into traceable design decisions.",
    aspectRatio: "square" as const,
    comingSoon: true,
    comingSoonLabel: "Coming soon",
  },
};
