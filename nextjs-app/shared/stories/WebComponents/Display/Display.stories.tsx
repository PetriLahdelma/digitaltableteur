import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = { content: string; as: "h1" | "h2" | "p" | "span" | "div" };
function NativeDisplay(args: Args) {
  return <NativeElement tagName="dt-display" attributes={args} />;
}

const meta = {
  title: "Web Components/Content/Display",
  component: NativeDisplay,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    contractStatus: "beta",
    docs: { description: { component: "Native hero-scale typography." } },
  },
  args: { content: "Design systems that ship", as: "h1" },
  argTypes: {
    as: { control: "select", options: ["h1", "h2", "p", "span", "div"] },
  },
} satisfies Meta<typeof NativeDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-display") };
export const Playground: Story = { tags: ["beta-matrix"] };
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  args: { content: "Clarity at marketing scale" },
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
export const HeroMoment: Story = {
  ...exampleStory,
  render: () => (
    <div style={{ maxWidth: "36rem" }}>
      <NativeDisplay content="Design systems, shipped." as="h1" />
      <p>Supporting copy returns to the text ladder immediately.</p>
    </div>
  ),
};
export const SemanticVariants: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      <NativeDisplay content="As a section hero (h2)" as="h2" />
      <NativeDisplay content="As a decorative tagline (p)" as="p" />
    </Stack>
  ),
};
export const ConstrainedMeasure: Story = {
  ...exampleStory,
  render: () => (
    <div style={{ maxWidth: "36rem" }}>
      <NativeElement
        tagName="dt-display"
        attributes={{
          as: "p",
          content: "A hero line that wraps with intent, not by accident.",
        }}
      />
    </div>
  ),
};
