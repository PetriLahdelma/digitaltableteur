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
export const Playground: Story = {};
export const Default: Story = { play: assertNative("dt-visually-hidden") };
export const Example: Story = {
  ...exampleStory,
  render: () => (
    <button type="button">
      Save
      <NativeElement tagName="dt-visually-hidden">
        Saves your profile changes
      </NativeElement>
    </button>
  ),
};
export const ForcedColors: Story = { ...forcedColorsStory };
