import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import Gallery from "./Gallery";
import contract from "./Gallery.contract.json";

const sampleImages = [
  {
    src: "https://picsum.photos/800/600?random=1",
    alt: "Dashboard overview",
  },
  {
    src: "https://picsum.photos/800/600?random=2",
    alt: "Component library grid",
  },
  {
    src: "https://picsum.photos/800/600?random=3",
    alt: "Mobile navigation drawer",
  },
];

const defaultArgs = {
  images: sampleImages,
  minColumnWidth: 280,
  gutter: 24,
};

const meta = {
  title: "Site/Gallery",
  component: Gallery,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-gallery",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  argTypes: {
    images: {
      control: { type: "select" },
      options: ["sample", "two"],
      mapping: {
        sample: sampleImages,
        two: sampleImages.slice(0, 2),
      },
      description:
        "Gallery images (src, alt). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "GalleryImage[]" } },
    },
  },
  args: {
    images: "sample" as never,
  },
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Gallery gutter={24} minColumnWidth={280} images={sampleImages} />
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
