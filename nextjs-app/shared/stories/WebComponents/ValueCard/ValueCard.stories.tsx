import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  title: string;
  description: string;
  variant: "default" | "bordered" | "elevated";
};
function ValueCard(args: Args) {
  return (
    <div style={{ width: "min(22rem, 90vw)" }}>
      <NativeElement tagName="dt-value-card" attributes={args}>
        <NativeElement
          tagName="dt-icon"
          slot="icon"
          attributes={{ name: "sparkle", size: "lg", "aria-hidden": "true" }}
        />
      </NativeElement>
    </div>
  );
}
const meta = {
  title: "Web Components/Site/ValueCard",
  component: ValueCard,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: { component: "Native dt-value-card custom element." },
    },
  },
  args: {
    title: "Accessible by default",
    description:
      "Semantics, keyboard support, and forced-colors behavior are built in.",
    variant: "bordered",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "bordered", "elevated"],
    },
  },
} satisfies Meta<typeof ValueCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-value-card") };
export const Playground: Story = {};
export const Example: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <ValueCard
        title="Clarity first"
        description="Interfaces should explain themselves before they decorate."
        variant="bordered"
      />
      <ValueCard
        title="Accessible by default"
        description="Keyboard, contrast, and semantics are part of the definition of done."
        variant="bordered"
      />
    </Row>
  ),
};
export const ForcedColors: Story = { ...forcedColorsStory };
