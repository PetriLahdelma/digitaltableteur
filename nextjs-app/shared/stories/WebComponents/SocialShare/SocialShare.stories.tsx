import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stage,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Channel =
  | "linkedin"
  | "twitter"
  | "facebook"
  | "reddit"
  | "whatsapp"
  | "instagram";
type Args = {
  url: string;
  title: string;
  channels: Channel[];
  variant: "inline" | "article";
  showHeading: boolean;
  heading: string;
};

const allChannels: Channel[] = [
  "linkedin",
  "twitter",
  "facebook",
  "reddit",
  "whatsapp",
  "instagram",
];

function SocialShare(args: Args) {
  return (
    <NativeElement
      tagName="dt-social-share"
      attributes={{
        url: args.url,
        "share-title": args.title,
        channels: JSON.stringify(args.channels),
        variant: args.variant,
        "show-heading": args.showHeading,
        heading: args.heading,
      }}
    />
  );
}

const meta = {
  title: "Web Components/Site/SocialShare",
  component: SocialShare,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-social-share element." } },
  },
  args: {
    url: "https://digitaltableteur.com",
    title: "Digitaltableteur - Portfolio",
    channels: allChannels,
    variant: "inline",
    showHeading: false,
    heading: "",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["inline", "article"] },
  },
} satisfies Meta<typeof SocialShare>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { play: assertNative("dt-social-share") };
export const BlogPost: Story = {
  args: {
    url: "https://digitaltableteur.com/blog/workflow-tips",
    title: "Workflow Tips for Developers",
    variant: "article",
    showHeading: true,
  },
  parameters: { layout: "padded" },
};
export const MobileView: Story = {
  args: { title: "Mobile Social Share Test" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
export const WithNativeShare: Story = {
  args: { title: "Native Share API Test" },
  beforeEach: () => {
    const previous = Object.getOwnPropertyDescriptor(navigator, "share");
    Object.defineProperty(navigator, "share", {
      configurable: true,
      writable: true,
      value: () => Promise.resolve(),
    });
    return () => {
      if (previous) Object.defineProperty(navigator, "share", previous);
      else delete (navigator as { share?: unknown }).share;
    };
  },
};
export const Playground: Story = {
  args: { channels: ["linkedin", "twitter"] },
};
export const Example: Story = { ...exampleStory };
export const ForcedColors: Story = { ...forcedColorsStory };
