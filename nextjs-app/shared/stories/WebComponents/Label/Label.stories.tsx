import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  content: string;
  htmlFor: string;
  tooltipText?: string;
  required: boolean;
  disabled: boolean;
};

function NativeLabel({ content, htmlFor, tooltipText, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-label"
      attributes={{ ...args, for: htmlFor, "tooltip-text": tooltipText }}
    >
      {content}
    </NativeElement>
  );
}

const meta = {
  title: "Web Components/Forms/Label",
  component: NativeLabel,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-label form label." } },
  },
  args: {
    content: "Default Label",
    htmlFor: "field",
    required: false,
    disabled: false,
  },
} satisfies Meta<typeof NativeLabel>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-label") };
export const Playground: Story = { tags: ["beta-matrix"] };
export const WithTooltip: Story = {
  ...exampleStory,
  args: { tooltipText: "Used in proposals and invoices." },
};
export const Required: Story = { ...exampleStory, args: { required: true } };
export const Disabled: Story = {
  ...exampleStory,
  args: { disabled: true },
  // Documented axe exemption (see Label.spec.md): same rationale as the
  // React Label Disabled story — WCAG 1.4.3 inactive-control exemption.
  parameters: {
    ...exampleStory.parameters,
    a11y: { options: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
};
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  render: () => (
    <Stack>
      <NativeLabel
        content="Email address"
        htmlFor="native-label-email"
        required
        disabled={false}
      />
      <input id="native-label-email" type="email" aria-label="Email address" />
    </Stack>
  ),
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
