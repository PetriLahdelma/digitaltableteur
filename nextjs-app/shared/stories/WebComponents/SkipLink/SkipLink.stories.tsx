import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import {
  NativeElement,
  Stage,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = { label: string; href: string };
function NativeSkipLink(args: Args) {
  return <NativeElement tagName="dt-skip-link" attributes={args} />;
}
const meta = {
  title: "Web Components/Navigation/SkipLink",
  component: NativeSkipLink,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component: "Native dt-skip-link keyboard bypass control.",
      },
    },
  },
  args: { label: "Skip to main content", href: "#main-content" },
} satisfies Meta<typeof NativeSkipLink>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async (context) => {
    await assertNative("dt-skip-link")(context);
    const host = context.canvasElement.querySelector("dt-skip-link");
    const link = host?.shadowRoot?.querySelector("a");
    link?.focus();
    expect(host).toHaveFocus();
    expect(host?.shadowRoot?.activeElement).toBe(link);
  },
};
export const Playground: Story = {};
export const FocusReveal: Story = { ...exampleStory, play: Default.play };
export const InLayout: Story = {
  ...exampleStory,
  render: (args) => (
    <Stage width="30rem">
      <NativeSkipLink {...args} />
      <main id="main-content" tabIndex={-1}>
        <h2>Page content</h2>
        <p>The bypass target follows the link.</p>
      </main>
    </Stage>
  ),
};
export const CustomTarget: Story = {
  ...exampleStory,
  args: { label: "Skip to project list", href: "#projects" },
};
export const Example: Story = { ...exampleStory };
export const ForcedColors: Story = { ...forcedColorsStory, play: Default.play };
