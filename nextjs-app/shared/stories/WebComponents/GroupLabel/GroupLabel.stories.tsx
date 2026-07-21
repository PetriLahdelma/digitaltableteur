import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";
import { DtGroupLabelElement } from "../../../../../packages/web-components/src/native/group-label";

if (!customElements.get("dt-group-label")) {
  customElements.define("dt-group-label", DtGroupLabelElement);
}

type Args = {
  content: string;
  htmlFor: string;
  tooltipText?: string;
  required: boolean;
  disabled: boolean;
};

function NativeGroupLabel({ content, htmlFor, tooltipText, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-group-label"
      attributes={{ ...args, content, for: htmlFor, "tooltip-text": tooltipText }}
    />
  );
}

const meta = {
  title: "Web Components/Forms/GroupLabel",
  component: NativeGroupLabel,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native `dt-group-label` group label. It can name a real fieldset or a `role=\"group\"` container and forwards clicks to the target or its first focusable descendant.",
      },
    },
  },
  args: {
    content: "Notification preferences",
    htmlFor: "newsletter-options",
    required: false,
    disabled: false,
  },
} satisfies Meta<typeof NativeGroupLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-group-label") };

export const Playground: Story = { tags: ["beta-matrix"] };

export const Basic: Story = {
  ...exampleStory,
  args: { content: "Delivery address", htmlFor: "delivery-street" },
};

export const RequiredMarker: Story = {
  ...exampleStory,
  args: {
    content: "Billing address",
    htmlFor: "billing-street",
    required: true,
  },
};

export const AboveCompoundWidget: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      <NativeElement
        tagName="dt-group-label"
        attributes={{ content: "Price range", for: "native-price-range" }}
      />
      <div
        id="native-price-range"
        role="group"
        style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
      >
        <input aria-label="Minimum price" style={{ width: "6rem" }} />
        <span aria-hidden="true">-</span>
        <input aria-label="Maximum price" style={{ width: "6rem" }} />
      </div>
    </Stack>
  ),
};

// Replica of the React Example (same markup, classes, and padded canvas);
// the rendered-parity gate compares them 1:1.
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  parameters: { layout: "padded" },
  render: () => (
    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
      <NativeElement
        tagName="dt-group-label"
        attributes={{
          content: "What can we help with?",
          for: "native-contact-topic",
        }}
      />
      <div
        id="native-contact-topic"
        role="group"
        aria-labelledby="contact-topic-label"
      >
        <p className="text-sm text-muted-foreground">
          Checkbox group slots here
        </p>
      </div>
    </fieldset>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
