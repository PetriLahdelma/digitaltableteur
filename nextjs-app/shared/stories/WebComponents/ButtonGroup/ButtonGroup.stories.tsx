import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = { label: string; attached: boolean };

function Group({ label, attached }: Args) {
  return (
    <NativeElement
      tagName="dt-button-group"
      attributes={{
        "aria-label": label,
        attached: attached ? undefined : "false",
      }}
    >
      <NativeElement tagName="dt-button" attributes={{ variant: "secondary" }}>
        Grid
      </NativeElement>
      <NativeElement tagName="dt-button" attributes={{ variant: "secondary" }}>
        List
      </NativeElement>
    </NativeElement>
  );
}

const meta = {
  title: "Web Components/Actions/ButtonGroup",
  component: Group,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: { component: "Native dt-button-group custom element." },
    },
  },
  args: { label: "View options", attached: true },
  argTypes: { attached: { control: "boolean" } },
} satisfies Meta<typeof Group>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-button-group") };
export const Playground: Story = {};
export const Spaced: Story = { ...exampleStory, args: { attached: false } };
export const WithIconButtons: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-button-group"
      attributes={{ "aria-label": "Editor actions" }}
    >
      <NativeElement
        tagName="dt-icon-button"
        attributes={{ icon: "arrow-left", label: "Back" }}
      />
      <NativeElement
        tagName="dt-icon-button"
        attributes={{ icon: "arrow-right", label: "Forward" }}
      />
    </NativeElement>
  ),
};
export const Pager: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-button-group"
      attributes={{ "aria-label": "Pagination" }}
    >
      <NativeElement tagName="dt-button" attributes={{ variant: "secondary" }}>
        Previous
      </NativeElement>
      <NativeElement tagName="dt-button" attributes={{ variant: "secondary" }}>
        Next
      </NativeElement>
    </NativeElement>
  ),
};
export const Example: Story = {
  ...exampleStory,
  args: { label: "Layout density" },
};
export const ForcedColors: Story = { ...forcedColorsStory };
