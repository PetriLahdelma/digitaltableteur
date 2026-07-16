import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = { showPercentage: boolean };
function ReadingProgress({ showPercentage }: Args) {
  return (
    <>
      <NativeElement
        tagName="dt-reading-progress"
        attributes={{
          "target-selector": "#native-reading-target",
          "show-percentage": showPercentage,
        }}
      />
      <article
        id="native-reading-target"
        style={{
          maxWidth: "40rem",
          minHeight: "140vh",
          margin: "5rem auto",
          padding: "1rem",
          lineHeight: 1.6,
        }}
      >
        <h1>Long article</h1>
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index}>
            Paragraph {index + 1}. Scroll to inspect the native reading progress
            indicator.
          </p>
        ))}
      </article>
    </>
  );
}
const meta = {
  title: "Web Components/Site/ReadingProgress",
  component: ReadingProgress,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "fullscreen",
    docs: {
      description: { component: "Native dt-reading-progress custom element." },
    },
  },
  args: { showPercentage: false },
} satisfies Meta<typeof ReadingProgress>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Default: Story = {
  play: assertNative("dt-reading-progress", "document"),
};
export const WithPercentage: Story = { args: { showPercentage: true } };
export const Example: Story = { ...exampleStory };
export const ForcedColors: Story = {
  ...forcedColorsStory,
  args: { showPercentage: true },
};
