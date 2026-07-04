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
  tags: ["beta", "!autodocs"],
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
  argTypes: {
    title: { control: "text", description: "Project title" },
    slug: { control: "text", description: "Detail page slug" },
    thumbnail: { control: "text", description: "Poster image URL" },
    videoThumbnail: {
      control: "text",
      description: "Optional hover video URL",
    },
    description: { control: "text", description: "Short description on hover" },
    category: { control: "text", description: "Category label" },
    tags: { control: "object", description: "Tag list" },
    aspectRatio: {
      control: "select",
      options: ["square", "video", "portrait", "landscape"],
      description: "Media aspect ratio",
      table: { defaultValue: { summary: "video" } },
    },
    showCategory: {
      control: "boolean",
      description: "Show category in caption",
    },
    showDescription: {
      control: "boolean",
      description: "Reveal description on hover",
    },
    autoPlayVideo: {
      control: "boolean",
      description: "Autoplay video thumbnail loop",
    },
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
} satisfies Meta<typeof EnhancedProjectCard>;

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
