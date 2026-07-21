import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";

type AspectRatioArgs = {
  ratio: "1:1" | "4:3" | "16:9" | "21:9" | "3:2" | "2:3";
  children: string;
};

function isRegistered(tagName: string) {
  return (
    typeof customElements !== "undefined" &&
    Boolean(customElements.get(tagName))
  );
}

const fallbackCss = `
  .dt-aspect-ratio-fallback dt-aspect-ratio {
    position: relative;
    display: block;
    inline-size: 100%;
    overflow: hidden;
  }
  .dt-aspect-ratio-fallback dt-aspect-ratio[ratio="1:1"] { aspect-ratio: 1 / 1; }
  .dt-aspect-ratio-fallback dt-aspect-ratio[ratio="4:3"] { aspect-ratio: 4 / 3; }
  .dt-aspect-ratio-fallback dt-aspect-ratio[ratio="16:9"] { aspect-ratio: 16 / 9; }
  .dt-aspect-ratio-fallback dt-aspect-ratio[ratio="21:9"] { aspect-ratio: 21 / 9; }
  .dt-aspect-ratio-fallback dt-aspect-ratio[ratio="3:2"] { aspect-ratio: 3 / 2; }
  .dt-aspect-ratio-fallback dt-aspect-ratio[ratio="2:3"] { aspect-ratio: 2 / 3; }
  .dt-aspect-ratio-fallback dt-aspect-ratio > * {
    position: absolute;
    inset: 0;
  }
`;

const dataUriHero =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%20640%20360%27%3E%3Cdefs%3E%3ClinearGradient%20id=%27g%27%20x1=%270%27%20x2=%271%27%20y1=%270%27%20y2=%271%27%3E%3Cstop%20offset=%270%25%27%20stop-color=%27%23dbeafe%27/%3E%3Cstop%20offset=%27100%25%27%20stop-color=%27%23bfdbfe%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width=%27640%27%20height=%27360%27%20fill=%27url(%23g)%27/%3E%3Crect%20x=%2740%27%20y=%2740%27%20width=%27560%27%20height=%27280%27%20rx=%2728%27%20fill=%27%23eff6ff%27/%3E%3Ccircle%20cx=%27184%27%20cy=%27146%27%20r=%2750%27%20fill=%27%2393c5fd%27/%3E%3Cpath%20d=%27M132%20240c34-46%2092-46%20126%200%27%20fill=%27none%27%20stroke=%27%233b82f6%27%20stroke-width=%2718%27%20stroke-linecap=%27round%27/%3E%3Crect%20x=%27296%27%20y=%27118%27%20width=%27220%27%20height=%2718%27%20rx=%279%27%20fill=%27%233b82f6%27/%3E%3Crect%20x=%27296%27%20y=%27154%27%20width=%27176%27%20height=%2718%27%20rx=%279%27%20fill=%27%2360a5fa%27/%3E%3Crect%20x=%27296%27%20y=%27190%27%20width=%22136%22%20height=%2218%22%20rx=%229%22%20fill=%22%2393c5fd%22/%3E%3C/svg%3E";

const squareSource =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27240%27%20height=%27240%27%3E%3Crect%20width=%27240%27%20height=%27240%27%20fill=%27%23e2e8f0%27/%3E%3Crect%20width=%27240%27%20height=%2736%27%20fill=%27%2364748b%27/%3E%3Crect%20y=%27204%27%20width=%27240%27%20height=%2736%27%20fill=%27%2364748b%27/%3E%3Ccircle%20cx=%27120%27%20cy=%27120%27%20r=%2756%27%20fill=%27%2394a3b8%27/%3E%3Ctext%20x=%27120%27%20y=%2725%27%20fill=%27%23ffffff%27%20font-family=%27sans-serif%27%20font-size=%2716%27%20text-anchor=%27middle%27%3Etop%20edge%3C/text%3E%3Ctext%20x=%27120%27%20y=%27226%27%20fill=%27%23ffffff%27%20font-family=%27sans-serif%27%20font-size=%2716%27%20text-anchor=%27middle%27%3Ebottom%20edge%3C/text%3E%3C/svg%3E";

function NativeAspectRatio({
  ratio = "16:9",
  children,
  width = 400,
  content,
}: AspectRatioArgs & { width?: number | string; content?: ReactNode }) {
  const registered = isRegistered("dt-aspect-ratio");

  return (
    <>
      {!registered ? <style>{fallbackCss}</style> : null}
      <div
        className={!registered ? "dt-aspect-ratio-fallback" : undefined}
        style={{ width, maxWidth: "100%" }}
      >
        <NativeElement tagName="dt-aspect-ratio" attributes={{ ratio }}>
          {content ?? (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "color-mix(in srgb, var(--color-primary, #2563eb) 20%, transparent)",
                color: "var(--color-primary, #0b2533)",
                fontSize: "0.875rem",
              }}
            >
              {children}
            </div>
          )}
        </NativeElement>
      </div>
    </>
  );
}

const meta = {
  title: "Web Components/Layout/AspectRatio",
  component: NativeAspectRatio,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: { component: "Native dt-aspect-ratio media frame." },
    },
  },
  args: {
    ratio: "16:9",
    children: "16:9 media slot",
  },
  argTypes: {
    ratio: {
      control: "inline-radio",
      options: ["1:1", "4:3", "16:9", "21:9", "3:2", "2:3"],
    },
  },
} satisfies Meta<typeof NativeAspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <NativeAspectRatio {...args} />,
  play: assertNative("dt-aspect-ratio"),
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <NativeAspectRatio {...args} />,
};

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <NativeAspectRatio
      ratio="16:9"
      width={320}
      children="Case study hero frame"
      content={
        <img
          src={dataUriHero}
          alt="Case study hero frame"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      }
    />
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix", "example"],
  globals: { forcedColors: "active" },
  render: (args) => <NativeAspectRatio {...args} />,
};

export const RatioGallery: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "1rem",
        width: "min(48rem, 90vw)",
      }}
    >
      {(["16:9", "1:1", "3:2"] as const).map((ratio) => (
        <NativeAspectRatio
          key={ratio}
          ratio={ratio}
          width="100%"
          children={ratio}
          content={
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                border: "1px dashed var(--color-border, #999)",
              }}
            >
              {ratio}
            </div>
          }
        />
      ))}
    </div>
  ),
};

export const MediaFill: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => {
    const captionStyle = {
      margin: "0 0 0.375rem",
      fontSize: "0.75rem",
      color: "var(--color-muted, #64748b)",
    } as const;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          width: "min(28rem, 90vw)",
        }}
      >
        <figure style={{ margin: 0 }}>
          <figcaption style={captionStyle}>
            object-fit: contain — whole 1:1 source, letterboxed
          </figcaption>
          <NativeAspectRatio
            ratio="16:9"
            children="contain"
            content={
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "var(--color-light-bg, #f1f5f9)",
                }}
              >
                <img
                  src={squareSource}
                  alt="Square source shown whole inside a 16:9 frame, with visible top and bottom bands"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            }
          />
        </figure>
        <figure style={{ margin: 0 }}>
          <figcaption style={captionStyle}>
            object-fit: cover — fills the frame, top and bottom cropped
          </figcaption>
          <NativeAspectRatio
            ratio="16:9"
            children="cover"
            content={
              <img
                src={squareSource}
                alt="Square source cropped to fill a 16:9 frame; the top and bottom bands are clipped"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            }
          />
        </figure>
      </div>
    );
  },
};

export const ReservedSpace: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <NativeAspectRatio
      ratio="16:9"
      width={320}
      children="loading…"
      content={
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "var(--color-light-bg, #eee)",
            display: "grid",
            placeItems: "center",
          }}
        >
          loading…
        </div>
      }
    />
  ),
};
