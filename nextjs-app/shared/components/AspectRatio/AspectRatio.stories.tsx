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
  // AspectRatio derives its height from its width via `aspect-ratio`; it has no
  // intrinsic width. Storybook's `layout: "centered"` wrapper is shrink-to-fit,
  // so without a definite-width ancestor the box collapses to 0x0 and nothing
  // renders. This decorator gives every story a real width to size against.
  decorators: [
    (Story) => (
      <div style={{ width: 400, maxWidth: "100%" }}>
        <Story />
      </div>
    ),
  ],
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

/** Media fills the frame with width/height 100% and object-fit cover, so a source of any ratio crops to the frame instead of distorting. The same 1:1 source is shown letterboxed (contain) then cropped (cover) in identical 16:9 frames so the clipped top/bottom edges are visible. */
export const MediaFill: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Media fills the frame with width/height 100% and object-fit cover, so a source of any ratio crops to the frame instead of distorting. The same square (1:1) source is shown two ways in identical 16:9 frames — contain reveals the whole source (note the top/bottom bands), cover fills the frame and clips those bands away." } },
  },
  render: () => {
    // 1:1 source with labeled top/bottom bands, so the crop is visible when the
    // square is fitted into a 16:9 frame. Data URI keeps it network-free and
    // deterministic for snapshots.
    const src =
      "data:image/svg+xml;utf8,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27240%27%20height=%27240%27%3E%3Crect%20width=%27240%27%20height=%27240%27%20fill=%27%23e2e8f0%27/%3E%3Crect%20width=%27240%27%20height=%2736%27%20fill=%27%2364748b%27/%3E%3Crect%20y=%27204%27%20width=%27240%27%20height=%2736%27%20fill=%27%2364748b%27/%3E%3Ccircle%20cx=%27120%27%20cy=%27120%27%20r=%2756%27%20fill=%27%2394a3b8%27/%3E%3Ctext%20x=%27120%27%20y=%2725%27%20fill=%27%23ffffff%27%20font-family=%27sans-serif%27%20font-size=%2716%27%20text-anchor=%27middle%27%3Etop%20edge%3C/text%3E%3Ctext%20x=%27120%27%20y=%27226%27%20fill=%27%23ffffff%27%20font-family=%27sans-serif%27%20font-size=%2716%27%20text-anchor=%27middle%27%3Ebottom%20edge%3C/text%3E%3C/svg%3E";
    const caption = {
      margin: "0 0 0.375rem",
      fontSize: "0.75rem",
      color: "var(--color-muted, #64748b)",
    } as const;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <figure style={{ margin: 0 }}>
          <figcaption style={caption}>object-fit: contain — whole 1:1 source, letterboxed</figcaption>
          <AspectRatio ratio="16:9">
            <div style={{ width: "100%", height: "100%", background: "var(--color-light-bg, #f1f5f9)" }}>
              <img
                src={src}
                alt="Square source shown whole inside a 16:9 frame, with visible top and bottom bands"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </AspectRatio>
        </figure>
        <figure style={{ margin: 0 }}>
          <figcaption style={caption}>object-fit: cover — fills the frame, top and bottom cropped</figcaption>
          <AspectRatio ratio="16:9">
            <img
              src={src}
              alt="Square source cropped to fill a 16:9 frame; the top and bottom bands are clipped"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AspectRatio>
        </figure>
      </div>
    );
  },
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
