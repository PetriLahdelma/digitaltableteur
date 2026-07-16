import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = { label: string; size: "sm" | "md" | "lg" };
function NativeSpinner(args: Args) {
  return <NativeElement tagName="dt-spinner" attributes={args} />;
}
const meta = {
  title: "Web Components/Feedback/Spinner",
  component: NativeSpinner,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-spinner custom element." } },
  },
  args: { label: "Loading portfolio", size: "md" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof NativeSpinner>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-spinner") };
export const Playground: Story = {};
export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeElement
          key={size}
          tagName="dt-spinner"
          attributes={{ label: `Loading ${size}`, size }}
        />
      ))}
    </Row>
  ),
};
export const WithVisibleLabel: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeElement tagName="dt-spinner" attributes={{ label: "Loading" }} />
      <span>Loading case studies...</span>
    </Row>
  ),
};
export const Example: Story = {
  ...exampleStory,
  args: { label: "Publishing changes", size: "lg" },
};
export const ForcedColors: Story = { ...forcedColorsStory };
