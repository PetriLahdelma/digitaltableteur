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
  size: number;
  animated: boolean;
  badge: boolean;
  title: string;
  decorative: boolean;
};

function Logo(args: Args) {
  return <NativeElement tagName="dt-logo" attributes={args} />;
}

const meta = {
  title: "Web Components/Site/Logo",
  component: Logo,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-logo brand mark." } },
  },
  args: {
    size: 24,
    animated: false,
    badge: false,
    title: "Digitaltableteur",
    decorative: false,
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-logo") };
export const Playground: Story = {};
export const Example: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <Logo {...meta.args} size={28} />
      <strong>Digitaltableteur</strong>
    </Row>
  ),
};
export const Sizes: Story = {
  render: () => (
    <Row>
      {[16, 24, 40, 64].map((size) => (
        <Logo key={size} {...meta.args} size={size} />
      ))}
    </Row>
  ),
};
export const Animated: Story = { args: { animated: true, size: 64 } };
export const Badge: Story = {
  render: () => (
    <Row>
      <Logo {...meta.args} badge size={40} />
      <Logo {...meta.args} badge animated size={40} />
    </Row>
  ),
};
export const ForcedColors: Story = { ...forcedColorsStory };
