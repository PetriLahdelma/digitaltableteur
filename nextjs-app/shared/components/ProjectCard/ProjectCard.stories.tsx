import contract from "./ProjectCard.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect } from "storybook/test";
import { ProjectCard } from "./ProjectCard";
import thumbnail from "../../assets/images/dt-studio.jpg";

const tagPresets = {
  Few: ["Figma", "React"],
  Many: ["Figma", "React", "Design tokens", "Storybook"],
  None: [],
};

const meta: Meta<typeof ProjectCard> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/ProjectCard",
  component: ProjectCard,
  tags: ["stable", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-project-card",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "centered",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Project title, rendered as the card heading and image alt text.",
      table: { category: "Content" },
    },
    slug: {
      control: "text",
      description: "URL slug; the whole card links to /work/{slug}.",
      table: { category: "Content" },
    },
    thumbnail: {
      control: "text",
      description: "Thumbnail image source.",
      table: { category: "Content" },
    },
    category: {
      control: "text",
      description: "Optional category eyebrow shown above the title.",
      table: { category: "Content" },
    },
    tags: {
      options: Object.keys(tagPresets),
      mapping: tagPresets,
      control: { type: "select" },
      description: "Up to three tags are rendered.",
      table: { category: "Content" },
    },
    aspectRatio: {
      options: ["video", "square", "portrait", "landscape"],
      control: { type: "select" },
      description: "Aspect ratio of the thumbnail frame.",
      table: { category: "Appearance", defaultValue: { summary: "video" } },
    },
    titlePosition: {
      options: ["overlay", "below"],
      control: { type: "inline-radio" },
      description: "Whether the title sits over the image or beneath it.",
      table: { category: "Appearance", defaultValue: { summary: "overlay" } },
    },
    comingSoon: {
      control: "boolean",
      description:
        "Render as a non-interactive teaser with a badge over the media instead of a link.",
      table: { category: "Behavior", defaultValue: { summary: "false" } },
    },
    comingSoonLabel: {
      control: "text",
      description:
        "Visible badge label for the coming-soon overlay (pass a translated string).",
      table: { category: "Content", defaultValue: { summary: "Coming soon" } },
    },
    className: {
      control: "text",
      description: "Extra class names merged onto the card link.",
      table: { category: "Appearance" },
    },
  },
  args: {
    title: "Helsinki Design System",
    slug: "helsinki-design-system",
    thumbnail,
    category: "Design systems",
    tags: tagPresets.Few as unknown as string[],
    aspectRatio: "video",
    titlePosition: "overlay",
    comingSoon: false,
    comingSoonLabel: "Coming soon",
    className: "",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ProjectCard>;

/** Overlay title over the thumbnail, with category and tags. */
export const Default: Story = {
  tags: ["beta-matrix"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("link")).toHaveAttribute(
      "href",
      "/work/helsinki-design-system",
    );
    expect(
      canvas.getByRole("heading", { name: "Helsinki Design System" }),
    ).toBeInTheDocument();
  },
};

/** Title and metadata rendered below the thumbnail. */
export const TitleBelow: Story = {
  args: { titlePosition: "below" },
};

/** Square thumbnail frame. */
export const SquareRatio: Story = {
  args: { aspectRatio: "square" },
};

/** Non-interactive teaser: no link wrapper, badge overlaid on the media. */
export const ComingSoon: Story = {
  args: {
    title: "Precedent",
    slug: "precedent",
    category: "Tools",
    tags: tagPresets.Few as unknown as string[],
    comingSoon: true,
    comingSoonLabel: "Coming soon",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("link")).not.toBeInTheDocument();
    expect(canvas.getByText("Coming soon")).toBeInTheDocument();
  },
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
