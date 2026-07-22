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
  src: string;
  size: number;
  animated: boolean;
  background: boolean;
  title: string;
  decorative: boolean;
};

function Logo({ title, ...rest }: Args) {
  return (
    <NativeElement
      tagName="dt-logo"
      attributes={{ ...rest, "accessible-title": title }}
    />
  );
}

const meta = {
  title: "Web Components/Content/Logo",
  component: Logo,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native dt-logo atom: the Digitaltableteur brand mark by default, or any custom PNG/JPEG/SVG logo via src.",
      },
    },
  },
  args: {
    src: "",
    size: 24,
    animated: false,
    background: false,
    title: "Digitaltableteur",
    decorative: false,
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-logo") };
export const Playground: Story = { tags: ["beta-matrix"] };
export const Example: Story = {
  tags: ["beta-matrix"],
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
export const Background: Story = {
  render: () => (
    <Row>
      <Logo {...meta.args} background size={40} />
      <Logo {...meta.args} background animated size={40} />
    </Row>
  ),
};
export const CustomImage: Story = {
  render: () => (
    <Row>
      <Logo {...meta.args} src="/logos/clients/dsharp.svg" title="DSharp" size={64} />
      <Logo {...meta.args} src="/logos/clients/finnair.svg" title="Finnair" size={64} />
    </Row>
  ),
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
