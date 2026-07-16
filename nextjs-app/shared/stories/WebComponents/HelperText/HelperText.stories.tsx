import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type State = "error" | "warning" | "success" | "info";
type Args = { content: string; state?: State; id?: string };
function NativeHelperText({ content, ...attributes }: Args) {
  return (
    <NativeElement tagName="dt-helper-text" attributes={attributes}>
      {content}
    </NativeElement>
  );
}

const meta = {
  title: "Web Components/Forms/HelperText",
  component: NativeHelperText,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: { component: "Native dt-helper-text status message." },
    },
  },
  args: { content: "This is helper text providing additional context." },
  argTypes: {
    state: {
      control: "inline-radio",
      options: [undefined, "error", "warning", "success", "info"],
    },
  },
} satisfies Meta<typeof NativeHelperText>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-helper-text") };
export const Error: Story = {
  ...exampleStory,
  args: { state: "error", content: "This field is required." },
};
export const Warning: Story = {
  ...exampleStory,
  args: { state: "warning", content: "This action may be irreversible." },
};
export const Success: Story = {
  ...exampleStory,
  args: { state: "success", content: "Changes saved." },
};
export const Info: Story = {
  ...exampleStory,
  args: { state: "info", content: "Visible to your project team." },
};
export const AllStates: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(["error", "warning", "success", "info"] as const).map((state) => (
        <NativeHelperText
          key={state}
          state={state}
          content={`${state} message`}
        />
      ))}
    </Stack>
  ),
};
export const WithAriaDescribedby: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      <input aria-label="Password" aria-describedby="password-help" />
      <NativeHelperText
        id="password-help"
        content="Use at least eight characters."
      />
    </Stack>
  ),
};
export const ErrorTakesOver: Story = {
  ...exampleStory,
  args: { state: "error", content: "Enter a valid email address." },
};
export const Playground: Story = {};
export const Example: Story = {
  ...exampleStory,
  args: { state: "info", content: "We only use this for project updates." },
};
export const ForcedColors: Story = { ...forcedColorsStory };
