import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  label: string;
  value?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  animateResize: boolean;
  minRows: number;
  maxRows: number;
  disabled: boolean;
  required: boolean;
};
function NativeTextArea({
  helperText,
  animateResize,
  minRows,
  maxRows,
  ...args
}: Args) {
  return (
    <div style={{ width: "20rem", maxWidth: "90vw" }}>
      <NativeElement
        tagName="dt-text-area"
        attributes={{
          ...args,
          "helper-text": helperText,
          "animate-resize": animateResize,
          "min-rows": minRows,
          "max-rows": maxRows,
        }}
      />
    </div>
  );
}
const meta = {
  title: "Web Components/Forms/TextArea",
  component: NativeTextArea,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: {
        component: "Form-associated native dt-text-area custom element.",
      },
    },
  },
  args: {
    label: "Message",
    placeholder: "Share more details...",
    animateResize: false,
    minRows: 4,
    maxRows: 8,
    disabled: false,
    required: false,
  },
} satisfies Meta<typeof NativeTextArea>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-text-area") };
export const WithHelperCopy: Story = {
  ...exampleStory,
  args: { helperText: "Maximum 500 characters." },
};
export const WithError: Story = {
  ...exampleStory,
  args: { error: "Tell us how we can help." },
};
export const AnimatedResize: Story = {
  ...exampleStory,
  args: { animateResize: true, value: "First line\nSecond line\nThird line" },
};
export const KeyboardEntry: Story = {
  ...exampleStory,
  args: { value: "Use Tab and Shift+Tab to move between fields." },
};
export const Playground: Story = {};
export const Example: Story = {
  ...exampleStory,
  args: {
    label: "Project brief",
    required: true,
    placeholder: "Goals, constraints, and timing",
  },
};
export const ForcedColors: Story = { ...forcedColorsStory };
