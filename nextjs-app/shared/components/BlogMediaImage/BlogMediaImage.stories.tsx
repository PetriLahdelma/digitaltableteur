import contract from "./BlogMediaImage.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, expect } from "storybook/test";
import { BlogMediaImage } from "./BlogMediaImage";
import photo from "../../assets/images/dt-studio.jpg";

const meta: Meta<typeof BlogMediaImage> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/BlogMediaImage",
  component: BlogMediaImage,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-blog-media-image",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  argTypes: {
    src: {
      control: "text",
      description: "Image source.",
      table: { category: "Content" },
    },
    alt: {
      control: "text",
      description: "Alt text for the image.",
      table: { category: "Content" },
    },
    fit: {
      options: ["cover", "contain"],
      control: { type: "inline-radio" },
      description:
        "object-fit in fill mode; contain for diagrams, cover for photos.",
      table: { category: "Appearance", defaultValue: { summary: "cover" } },
    },
    fluid: {
      control: "boolean",
      description: "Span the container full-bleed (ignore the width cap).",
      table: { category: "Appearance", defaultValue: { summary: "false" } },
    },
    fill: {
      control: "boolean",
      description: "Absolutely fill the nearest positioned ancestor.",
      table: { category: "Appearance", defaultValue: { summary: "false" } },
    },
    width: {
      control: "number",
      description: "Intrinsic width (raster).",
      table: { category: "Appearance" },
    },
    height: {
      control: "number",
      description: "Intrinsic height (raster).",
      table: { category: "Appearance" },
    },
    priority: {
      control: "boolean",
      description: "Load eagerly (above-the-fold heroes).",
      table: { category: "Behavior", defaultValue: { summary: "false" } },
    },
    sizes: {
      control: "text",
      description: "next/image responsive sizes hint.",
      table: { category: "Behavior" },
    },
    className: {
      control: "text",
      description: "Extra class names on the image.",
      table: { category: "Appearance" },
    },
    onLoad: { table: { disable: true } },
    onError: { table: { disable: true } },
  },
  args: {
    src: photo,
    alt: "Inside the Digitaltableteur studio",
    fit: "cover",
    fluid: false,
    fill: false,
    width: 800,
    height: 450,
    priority: false,
    sizes: "",
    className: "",
  },
};

export default meta;

type Story = StoryObj<typeof BlogMediaImage>;

/** Inline raster image sized to the prose measure. */
export const Default: Story = {
  tags: ["beta-matrix"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("img", { name: "Inside the Digitaltableteur studio" }),
    ).toBeInTheDocument();
  },
};

/** Fluid full-bleed image that spans its container. */
export const Fluid: Story = {
  args: { fluid: true },
};

/** Fill mode inside a fixed 16:9 frame, using contain for a diagram-style asset. */
export const FillContain: Story = {
  args: { fill: true, fit: "contain" },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", width: 480, aspectRatio: "16 / 9" }}>
        <Story />
      </div>
    ),
  ],
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
