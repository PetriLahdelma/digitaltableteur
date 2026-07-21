import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = { content: string; as: "span" | "div" | "p" | "h2" };
function NativeVisuallyHidden(args: Args) {
  return <NativeElement tagName="dt-visually-hidden" attributes={args} />;
}
const meta = {
  title: "Web Components/Site/VisuallyHidden",
  component: NativeVisuallyHidden,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    contractStatus: "beta",
    docs: { description: { component: "Native screen-reader-only content." } },
  },
  args: { content: "Additional context for screen readers", as: "span" },
  argTypes: { as: { control: "select", options: ["span", "div", "p", "h2"] } },
} satisfies Meta<typeof NativeVisuallyHidden>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ["beta-matrix"] };
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-visually-hidden") };
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  // Mirror the React VisuallyHidden Example byte-for-byte: the same bare
  // <button> (identical inline style) wrapping the component under test. The
  // rendered-parity gate compares this pair; TriggerButton's own chrome
  // (padding/border/radius) diverged from React's plain button.
  render: () => (
    <button
      type="button"
      style={{
        fontFamily: "var(--font-text)",
        padding: "var(--space-internal-12)",
      }}
    >
      Save
      <NativeElement tagName="dt-visually-hidden">
        {" — saves your profile changes"}
      </NativeElement>
    </button>
  ),
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
