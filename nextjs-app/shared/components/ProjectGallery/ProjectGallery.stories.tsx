import contract from "./ProjectGallery.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect } from "storybook/test";
import { ProjectGallery, type GalleryImage } from "./ProjectGallery";
import img1 from "../../assets/images/future1.webp";
import img2 from "../../assets/images/future2.webp";
import img3 from "../../assets/images/future3.webp";
import img4 from "../../assets/images/future4.webp";
import img6 from "../../assets/images/future6.webp";
import img7 from "../../assets/images/dt-studio.jpg";

const make = (src: string, alt: string, caption?: string): GalleryImage => ({
  src,
  alt,
  width: 1200,
  height: 900,
  caption,
});

const sixImages: GalleryImage[] = [
  make(img1, "Concept frame one", "Early exploration"),
  make(img2, "Concept frame two"),
  make(img3, "Concept frame three", "Colour study"),
  make(img4, "Concept frame four"),
  make(img6, "Concept frame five"),
  make(img7, "Studio shot", "Final render"),
];

const threeImages = sixImages.slice(0, 3);

const meta: Meta<typeof ProjectGallery> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/ProjectGallery",
  component: ProjectGallery,
  tags: ["stable", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-project-gallery",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  argTypes: {
    images: {
      options: ["Three", "Six"],
      mapping: { Three: threeImages, Six: sixImages },
      control: { type: "select" },
      description: "Images to display; each opens in the lightbox when enabled.",
      table: { category: "Content" },
    },
    columns: {
      options: [2, 3, 4],
      control: { type: "inline-radio" },
      description: "Column count at the widest breakpoint.",
      table: { category: "Appearance", defaultValue: { summary: "3" } },
    },
    gap: {
      options: ["sm", "md", "lg"],
      control: { type: "inline-radio" },
      description: "Gap between gallery items.",
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    aspectRatio: {
      options: ["square", "video", "mixed"],
      control: { type: "select" },
      description: "Thumbnail aspect ratio; mixed preserves each image's ratio.",
      table: { category: "Appearance", defaultValue: { summary: "mixed" } },
    },
    enableLightbox: {
      control: "boolean",
      description: "Open a fullscreen lightbox when an image is activated.",
      table: { category: "Behavior", defaultValue: { summary: "true" } },
    },
    className: {
      control: "text",
      description: "Extra class names merged onto the grid.",
      table: { category: "Appearance" },
    },
  },
  args: {
    images: sixImages,
    columns: 3,
    gap: "md",
    aspectRatio: "mixed",
    enableLightbox: true,
    className: "",
  },
};

export default meta;

type Story = StoryObj<typeof ProjectGallery>;

/** Three-column mixed-ratio gallery with clickable, lightbox-enabled thumbnails. */
export const Default: Story = {
  tags: ["beta-matrix"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("list", { name: "Project gallery" }),
    ).toBeInTheDocument();
    expect(canvas.getAllByRole("listitem").length).toBeGreaterThan(0);
  },
};

/** Four columns with a tight gap and square thumbnails. */
export const FourColumnsSquare: Story = {
  args: { columns: 4, gap: "sm", aspectRatio: "square", images: sixImages },
};

/** Lightbox disabled: thumbnails are static, non-interactive figures. */
export const StaticNoLightbox: Story = {
  args: { enableLightbox: false, images: threeImages },
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
