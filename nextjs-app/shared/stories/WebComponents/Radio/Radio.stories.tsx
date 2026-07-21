import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  defaultChecked: boolean;
  disabled: boolean;
  showLabel: boolean;
  required: boolean;
  size: "sm" | "md" | "lg";
};
function NativeRadio({ defaultChecked, showLabel, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-radio"
      attributes={{
        ...args,
        "default-checked": defaultChecked,
        "show-label": showLabel,
      }}
    />
  );
}
const meta = {
  title: "Web Components/Forms/Radio",
  component: NativeRadio,
  tags: ["autodocs", "beta", "web-components"],
  parameters: { ...nativeStoryParameters },
  args: {
    label: "Email updates",
    name: "contact-pref",
    value: "email",
    checked: true,
    defaultChecked: false,
    disabled: false,
    showLabel: true,
    required: false,
    size: "md",
  },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof NativeRadio>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ["beta-matrix"] };
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-radio") };
export const InAnExclusiveSet: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      <NativeRadio {...meta.args} label="Design" value="design" />
      <NativeRadio {...meta.args} label="Engineering" value="engineering" />
      <NativeRadio {...meta.args} label="Research" value="research" />
    </Stack>
  ),
};
export const Sizes: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeRadio
          key={size}
          {...meta.args}
          label={size}
          name={`size-${size}`}
          size={size}
          checked
        />
      ))}
    </Row>
  ),
};
export const DisabledOptions: Story = {
  ...exampleStory,
  args: { disabled: true, checked: true },
};
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  args: { label: "Email", value: "email", checked: true },
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
