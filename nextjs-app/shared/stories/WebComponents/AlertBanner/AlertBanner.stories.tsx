import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stage,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  titleText: string;
  description: string;
  tone: "info" | "success" | "warning" | "error";
  showIcon: boolean;
  dismissible: boolean;
  ariaLive: "polite" | "assertive" | "off";
  withAction: boolean;
};
function NativeAlertBanner({
  titleText,
  showIcon,
  ariaLive,
  withAction,
  ...args
}: Args) {
  return (
    <Stage width="34rem">
      <NativeElement
        tagName="dt-alert-banner"
        attributes={{
          ...args,
          "title-text": titleText,
          "show-icon": showIcon ? undefined : "false",
          "aria-live": ariaLive,
        }}
      >
        {withAction ? (
          <NativeElement
            tagName="dt-button"
            slot="action"
            attributes={{ variant: "tertiary", size: "sm" }}
          >
            Review settings
          </NativeElement>
        ) : null}
      </NativeElement>
    </Stage>
  );
}
const meta = {
  title: "Web Components/Feedback/AlertBanner",
  component: NativeAlertBanner,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native dt-alert-banner custom element with action and dismiss slots.",
      },
    },
  },
  args: {
    titleText: "Review required",
    description: "Check the deployment settings.",
    tone: "warning",
    showIcon: true,
    dismissible: false,
    ariaLive: "polite",
    withAction: false,
  },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["info", "success", "warning", "error"],
    },
    ariaLive: {
      control: "inline-radio",
      options: ["polite", "assertive", "off"],
    },
    showIcon: { control: "boolean" },
    dismissible: { control: "boolean" },
    withAction: { control: "boolean" },
  },
} satisfies Meta<typeof NativeAlertBanner>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-alert-banner") };
export const Playground: Story = { tags: ["beta-matrix"] };
export const Info: Story = {
  ...exampleStory,
  args: {
    titleText: "Information",
    description: "A useful update.",
    tone: "info",
  },
};
export const Warning: Story = {
  ...exampleStory,
  args: {
    titleText: "Review required",
    description: "Check these settings.",
    tone: "warning",
  },
};
export const Tones: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      {(["info", "success", "warning", "error"] as const).map((tone) => (
        <NativeElement
          key={tone}
          tagName="dt-alert-banner"
          attributes={{
            "title-text": tone,
            description: `A ${tone} message.`,
            tone,
          }}
        />
      ))}
    </Stack>
  ),
};
export const Dismissible: Story = {
  ...exampleStory,
  args: { dismissible: true },
};
export const WithAction: Story = {
  ...exampleStory,
  args: { withAction: true },
};
export const TextOnly: Story = {
  ...exampleStory,
  args: { showIcon: false, titleText: "Scheduled maintenance", tone: "info" },
};
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  args: {
    titleText: "Changes saved",
    description: "Your profile is up to date.",
    tone: "success",
  },
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
