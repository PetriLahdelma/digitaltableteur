import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "./AspectRatio";
import contract from "./AspectRatio.contract.json";

const defaultArgs = {
  ratio: "16:9" as const,
  children: (
    <div className="flex h-full w-full items-center justify-center bg-primary/20 text-sm text-muted-foreground">
      16:9 media slot
    </div>
  ),
};

const meta = {
  title: "Layout/AspectRatio",
  component: AspectRatio,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-aspect-ratio",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // children keeps an authored text control (content slot).
  argTypes: {
    children: {
      control: "text",
      description: "Media or placeholder content inside the ratio box",
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ width: 320 }}>
      <AspectRatio ratio="16:9">
        <img
          src="https://picsum.photos/640/360"
          alt="Case study hero frame"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};

/** The preset ratios: 16:9 for video, 1:1 for thumbnails, 3:2 for editorial photography. */
export const RatioGallery: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "The preset ratios: 16:9 for video, 1:1 for thumbnails, 3:2 for editorial photography. The child fills and clips." } },
  },
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
      {(["16:9", "1:1", "3:2"] as const).map((ratio) => (
        <AspectRatio key={ratio} ratio={ratio}>
          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", border: "1px dashed var(--color-border, #999)" }}>
            {ratio}
          </div>
        </AspectRatio>
      ))}
    </div>
  ),
};

/** Media inside should fill the box: width and height 100% with object-fit cover, so any source crops to the frame instead of distorting. */
export const MediaFill: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Media inside should fill the box: width and height 100% with object-fit cover, so any source crops to the frame instead of distorting." } },
  },
  render: () => (
    <div style={{ maxWidth: "20rem" }}>
      <AspectRatio ratio="16:9">
        <img
          src="data:image/svg+xml;utf8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27300%27%3E%3Crect width=%27400%27 height=%27300%27 fill=%27%23e2e8f0%27/%3E%3Ccircle cx=%27200%27 cy=%27120%27 r=%2760%27 fill=%27%2394a3b8%27/%3E%3C/svg%3E"
          alt="Placeholder illustration cropped to a 16:9 frame"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AspectRatio>
    </div>
  ),
};

/** Because the height comes from the ratio, the frame reserves space before media loads — no layout shift; pair with Skeleton for the placeholder. */
export const ReservedSpace: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Because the height comes from the ratio, the frame reserves space before media loads — no layout shift; pair with Skeleton for the placeholder." } },
  },
  render: () => (
    <div style={{ maxWidth: "20rem" }}>
      <AspectRatio ratio="16:9">
        <div style={{ width: "100%", height: "100%", background: "var(--color-light-bg, #eee)", display: "grid", placeItems: "center" }}>
          loading…
        </div>
      </AspectRatio>
    </div>
  ),
};
