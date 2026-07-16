import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stage,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

const pages = [
  { path: "/blog/petri-lahdelma-bio" },
  { path: "/blog/digital-craftsmanship" },
  { path: "/blog/future-design-systems" },
];

type Args = { currentPath: string; disabled: boolean };
function BlogNav(args: Args) {
  return (
    <Stage width="44rem">
      <NativeElement
        tagName="dt-blog-nav"
        attributes={{
          "current-path": args.currentPath,
          pages: JSON.stringify(pages),
          disabled: args.disabled,
        }}
      />
    </Stage>
  );
}

const meta = {
  title: "Web Components/Site/BlogNav",
  component: BlogNav,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: { description: { component: "Native dt-blog-nav element." } },
  },
  args: { currentPath: pages[1].path, disabled: false },
} satisfies Meta<typeof BlogNav>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-blog-nav") };
export const FirstArticle: Story = { args: { currentPath: pages[0].path } };
export const LastArticle: Story = { args: { currentPath: pages[2].path } };
export const Playground: Story = {};
export const Example: Story = { ...exampleStory };
export const ForcedColors: Story = { ...forcedColorsStory };
