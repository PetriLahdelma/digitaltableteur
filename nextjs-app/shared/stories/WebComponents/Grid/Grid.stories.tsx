import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  columns: string;
  tabletColumns?: string;
  desktopColumns?: string;
  wideColumns?: string;
  ultraColumns?: string;
  rows?: string;
  gap: string;
  tabletGap?: string;
  desktopGap?: string;
  wideGap?: string;
  ultraGap?: string;
  rowGap?: string;
  colGap?: string;
};
const Cells = ({ count = 4 }: { count?: number }) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <div key={index}>
        <p
          style={{
            marginBlock: "0 var(--space-layout-16, 1rem)",
            fontFamily: "var(--font-text)",
            fontSize: "var(--font-size-text-m)",
            lineHeight: 1.6,
          }}
        >
          Cell {String.fromCharCode(65 + index)}
        </p>
      </div>
    ))}
  </>
);
function NativeGrid(args: Args) {
  const attributes = Object.fromEntries(
    Object.entries(args).map(([name, value]) => [
      name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
      value,
    ]),
  );
  return (
    <NativeElement tagName="dt-grid" attributes={attributes}>
      <Cells />
    </NativeElement>
  );
}
const meta = {
  title: "Web Components/Layout/Grid",
  component: NativeGrid,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "centered",
    docs: {
      description: { component: "Native responsive CSS grid primitive." },
    },
  },
  args: { columns: "2", gap: "1rem" },
} satisfies Meta<typeof NativeGrid>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-grid") };
export const Playground: Story = {
  tags: ["beta-matrix"],
  args: { rows: "2", rowGap: "1rem", colGap: "1rem" },
};
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  args: { columns: "3", gap: "1.5rem" },
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
export const EqualTracks: Story = {
  ...exampleStory,
  render: () => <NativeGrid columns="3" gap="1rem" />,
};
export const SpannedFeature: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement tagName="dt-grid" attributes={{ columns: 3, gap: "1rem" }}>
      <div
        {...{ span: "2" }}
        style={{ border: "2px solid currentColor", padding: "1rem" }}
      >
        Featured (span 2)
      </div>
      <Cells count={4} />
    </NativeElement>
  ),
};
export const ResponsiveColumns: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-grid"
      attributes={{
        columns: 1,
        "tablet-columns": 2,
        "desktop-columns": 3,
        "wide-columns": 4,
        "ultra-columns": 6,
        gap: "1.25rem",
        "tablet-gap": "2rem",
        "desktop-gap": "2.5rem",
        "wide-gap": "3rem",
        "ultra-gap": "4rem",
      }}
    >
      <Cells count={6} />
    </NativeElement>
  ),
};
export const CustomTemplate: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-grid"
      attributes={{ columns: "200px 1fr", gap: "1rem" }}
    >
      <div>Sidebar</div>
      <div>Content</div>
    </NativeElement>
  ),
};
