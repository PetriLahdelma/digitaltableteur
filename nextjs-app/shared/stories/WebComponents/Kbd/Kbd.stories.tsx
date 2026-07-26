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
  content: string;
  size: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
};
function NativeKbd(args: Args) {
  return <NativeElement tagName="dt-kbd" attributes={args} />;
}
const meta = {
  title: "Web Components/Content/Kbd",
  component: NativeKbd,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    contractStatus: "beta",
    docs: { description: { component: "Native semantic keyboard keycap." } },
  },
  args: { content: "Esc", size: "md" },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    variant: {
      control: "radio",
      options: ["primary", "secondary"],
      description: "Filled keycap (primary) or flat outlined chip (secondary)",
      table: { defaultValue: { summary: "primary" } },
    },
  },
} satisfies Meta<typeof NativeKbd>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-kbd") };
export const Playground: Story = { tags: ["beta-matrix"] };
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  render: () => (
    <Row>
      <NativeKbd content="Command" size="md" /> +
      <NativeKbd content="K" size="md" />
    </Row>
  ),
};
export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeKbd key={size} content="Shift" size={size} />
      ))}
    </Row>
  ),
};
export const Variants: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeKbd content="Esc" size="md" variant="primary" />
      <NativeKbd content="Esc" size="md" variant="secondary" />
    </Row>
  ),
};
export const KeyNames: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["Esc", "Enter", "Space", "Tab"] as const).map((content) => (
        <NativeKbd key={content} content={content} size="md" />
      ))}
    </Row>
  ),
};
export const InInstruction: Story = {
  ...exampleStory,
  render: () => (
    <p style={{ margin: 0 }}>
      Press <NativeKbd content="Esc" size="md" /> to close or{" "}
      <NativeKbd content="⌘" size="md" /> +
      <NativeKbd content="Enter" size="md" /> to submit.
    </p>
  ),
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
