import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  direction: "row" | "row-reverse" | "column" | "column-reverse";
  wrap: "nowrap" | "wrap" | "wrap-reverse";
  justify: string;
  align: string;
  gap: string;
  rowGap?: string;
  columnGap?: string;
};
const Items = () => (
  <>
    {["Alpha", "Beta", "Gamma"].map((label) => (
      <span
        key={label}
        style={{
          marginBlock: "0 var(--space-layout-16, 1rem)",
          fontFamily: "var(--font-text)",
          fontSize: "var(--font-size-text-m)",
          lineHeight: 1.6,
        }}
      >
        {label}
      </span>
    ))}
  </>
);
function NativeFlexBox({ rowGap, columnGap, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-flex-box"
      attributes={{ ...args, "row-gap": rowGap, "column-gap": columnGap }}
    >
      <Items />
    </NativeElement>
  );
}
const meta = {
  title: "Web Components/Layout/FlexBox",
  component: NativeFlexBox,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native flexbox layout primitive." } },
  },
  args: {
    direction: "row",
    wrap: "nowrap",
    justify: "flex-start",
    align: "center",
    gap: "",
  },
} satisfies Meta<typeof NativeFlexBox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-flex-box") };
export const Playground: Story = {
  args: { gap: "1rem", rowGap: "1rem", columnGap: "1rem" },
};
export const Example: Story = {
  ...exampleStory,
  args: { direction: "column", align: "stretch", gap: "0.75rem" },
};
export const ForcedColors: Story = { ...forcedColorsStory };
export const InlineCluster: Story = {
  ...exampleStory,
  args: { align: "center", gap: "var(--space-internal-8, 0.5rem)" },
};
export const SpaceBetween: Story = {
  ...exampleStory,
  args: { justify: "space-between", align: "center" },
};
export const ColumnWithTokenGap: Story = {
  ...exampleStory,
  args: { direction: "column", gap: "var(--space-internal-16, 1rem)" },
};
