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
  { path: "/work/helsinki-design-system" },
  { path: "/work/new-things-co" },
  { path: "/work/illustrations" },
];

type Args = { currentPath: string; disabled: boolean };
function WorkNav(args: Args) {
  return (
    <Stage width="44rem">
      <NativeElement
        tagName="dt-work-nav"
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
  title: "Web Components/Site/WorkNav",
  component: WorkNav,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: { description: { component: "Native dt-work-nav element." } },
  },
  args: { currentPath: pages[1].path, disabled: false },
} satisfies Meta<typeof WorkNav>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-work-nav") };
export const FirstPage: Story = { args: { currentPath: pages[0].path } };
export const LastPage: Story = { args: { currentPath: pages[2].path } };
export const Playground: Story = {};
export const Example: Story = { ...exampleStory };
export const ForcedColors: Story = { ...forcedColorsStory };
