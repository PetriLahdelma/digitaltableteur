import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stage,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

const images = [
  { src: "https://picsum.photos/800/600?random=1", alt: "Dashboard overview" },
  {
    src: "https://picsum.photos/800/600?random=2",
    alt: "Component library grid",
  },
  {
    src: "https://picsum.photos/800/600?random=3",
    alt: "Mobile navigation drawer",
  },
];
type Args = { minColumnWidth: number; gutter: number };
function Gallery(args: Args) {
  return (
    <Stage width="min(64rem, 92vw)">
      <NativeElement
        tagName="dt-gallery"
        attributes={{
          images: JSON.stringify(images),
          "min-column-width": args.minColumnWidth,
          gutter: args.gutter,
        }}
      />
    </Stage>
  );
}
const meta = {
  title: "Web Components/Site/Gallery",
  component: Gallery,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: { description: { component: "Native dt-gallery custom element." } },
  },
  args: { minColumnWidth: 280, gutter: 24 },
} satisfies Meta<typeof Gallery>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-gallery") };
export const Playground: Story = { tags: ["beta-matrix"] };
export const Example: Story = {
  tags: ["beta-matrix"], ...exampleStory };
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
