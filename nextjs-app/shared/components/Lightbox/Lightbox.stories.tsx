import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Lightbox } from "./Lightbox";
import contract from "./Lightbox.contract.json";

const IMAGES = [
  {
    src: "https://placehold.co/1200x800/1a1a1a/ffffff.png?text=One",
    alt: "Placeholder one: a dark rectangle labelled One.",
    caption: "First image in the set.",
  },
  {
    src: "https://placehold.co/1200x800/2b2b2b/ffffff.png?text=Two",
    alt: "Placeholder two: a dark rectangle labelled Two.",
    caption: "Second image in the set.",
  },
  {
    src: "https://placehold.co/1200x800/3c3c3c/ffffff.png?text=Three",
    alt: "Placeholder three: a dark rectangle labelled Three.",
  },
];

const meta = {
  title: "Content/Lightbox",
  component: Lightbox,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
    contractStatus: contract.status,
    docs: {
      description: {
        component: contract.description,
      },
    },
  },
  // Custom MDX docs pages exist for all catalog entries; do not also enable autodocs
  // or Storybook will treat it as conflicting sources of truth for the docs page.
  tags: ["alpha", "!autodocs"],
  argTypes: {
    images: {
      description: "The image set. Every entry needs a real alt.",
      table: { category: "Content" },
    },
    initialIndex: {
      control: "number",
      description: "Index opened first, so the viewer starts on the clicked thumbnail.",
      table: { defaultValue: { summary: "0" }, category: "Behavior" },
    },
    open: {
      control: "boolean",
      description: "Controlled open state. Keep the component mounted and drive this.",
      table: { category: "Behavior" },
    },
    onOpenChange: {
      description: "Called with the next open state on Escape, backdrop click, or close.",
      table: { category: "Behavior" },
    },
  },
} satisfies Meta<typeof Lightbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Trigger + viewer, wired the way a consumer should wire it: always mounted. */
function LightboxHarness(args: React.ComponentProps<typeof Lightbox>) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: "2rem", minBlockSize: "50vh" }}>
      <button type="button" onClick={() => setOpen(true)}>
        Open gallery
      </button>
      <Lightbox {...args} open={open} onOpenChange={setOpen} />
    </div>
  );
}

export const Default: Story = {
  args: { images: IMAGES },
  render: (args) => <LightboxHarness {...args} />,
};

export const Playground: Story = {
  args: { images: IMAGES, initialIndex: 0 },
  render: (args) => <LightboxHarness {...args} />,
};

/** Opening from a specific thumbnail, which is the real gallery flow. */
export const Example: Story = {
  args: { images: IMAGES },
  render: (args) => {
    function Gallery() {
      const [open, setOpen] = useState(false);
      const [index, setIndex] = useState(0);
      return (
        <div style={{ padding: "2rem" }}>
          <ul
            style={{
              display: "flex",
              gap: "0.5rem",
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {args.images.map((img, i) => (
              <li key={img.src}>
                <button
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setOpen(true);
                  }}
                  style={{ padding: 0, border: 0, background: "none", cursor: "pointer" }}
                >
                  <img src={img.src} alt={img.alt} width={160} height={107} />
                </button>
              </li>
            ))}
          </ul>
          <Lightbox
            images={args.images}
            initialIndex={index}
            open={open}
            onOpenChange={setOpen}
          />
        </div>
      );
    }
    return <Gallery />;
  },
};

/**
 * Forced-colors verification story. A backdrop-heavy overlay is the shape most likely to
 * fail here: the panel can lose its boundary once author colours are dropped.
 */
export const ForcedColors: Story = {
  args: { images: IMAGES },
  parameters: {
    docs: {
      description: {
        story:
          "Open the viewer in a real browser under forced-colors: active. The panel must keep a visible boundary against the backdrop, and the close and navigation controls must stay distinguishable.",
      },
    },
  },
  render: (args) => <LightboxHarness {...args} />,
};
