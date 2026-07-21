import type { Meta, StoryObj } from "@storybook/react-vite";
import photo from "../../../assets/images/dt-studio.jpg";
import {
  NativeElement,
  Stage,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  src: string;
  alt: string;
  fill: boolean;
  width: number;
  height: number;
  priority: boolean;
  sizes: string;
  fit: "cover" | "contain";
  fluid: boolean;
};

function BlogMediaImage(args: Args) {
  return <NativeElement tagName="dt-blog-media-image" attributes={args} />;
}

const meta = {
  title: "Web Components/Site/BlogMediaImage",
  component: BlogMediaImage,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: { component: "Native dt-blog-media-image element." },
    },
  },
  args: {
    src: photo,
    alt: "Inside the Digitaltableteur studio",
    fill: false,
    width: 800,
    height: 450,
    priority: false,
    sizes: "",
    fit: "cover",
    fluid: false,
  },
  argTypes: {
    fit: { control: "inline-radio", options: ["cover", "contain"] },
  },
} satisfies Meta<typeof BlogMediaImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  play: assertNative("dt-blog-media-image"),
};
export const Fluid: Story = { args: { fluid: true } };
export const FillContain: Story = {
  args: { fill: true, fit: "contain" },
  decorators: [
    (Story) => (
      <Stage width="30rem" height="17rem">
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <Story />
        </div>
      </Stage>
    ),
  ],
};
export const Playground: Story = { tags: ["beta-matrix"] };
export const Example: Story = {
  tags: ["beta-matrix"], ...exampleStory };
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
