import type { Meta, StoryObj } from "@storybook/react-vite";
import peteVaultBoy from "../../../assets/images/pete-vault-boy.jpg";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  name: string;
  imageUrl?: string;
  clickable: boolean;
  destinationUrl?: string;
  size: string;
  loading: "lazy" | "eager";
  decoding: "auto" | "sync" | "async";
  menuLabel?: string;
  variant: "image" | "initials";
};

function NativeAvatar({ imageUrl, destinationUrl, menuLabel, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-avatar"
      attributes={{
        ...args,
        "image-url": imageUrl,
        "destination-url": destinationUrl,
        "menu-label": menuLabel,
      }}
    />
  );
}

const meta = {
  title: "Web Components/Content/Avatar",
  component: NativeAvatar,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: { description: { component: "Native dt-avatar identity visual." } },
  },
  args: {
    name: "Petri Lahdelma",
    imageUrl: peteVaultBoy,
    clickable: false,
    size: "2.5rem",
    loading: "lazy",
    decoding: "async",
    variant: "image",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["image", "initials"] },
    loading: { control: "inline-radio", options: ["lazy", "eager"] },
    decoding: {
      control: "inline-radio",
      options: ["auto", "sync", "async"],
    },
  },
} satisfies Meta<typeof NativeAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultVariant: Story = { play: assertNative("dt-avatar") };
export const WithImage: Story = { ...exampleStory };
export const WithInitials: Story = {
  ...exampleStory,
  args: { imageUrl: undefined, variant: "initials" },
};
export const Default: Story = { play: assertNative("dt-avatar") };
export const Playground: Story = {};
export const Example: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-avatar"
      attributes={{
        name: "Petri Lahdelma",
        "image-url": peteVaultBoy,
        "menu-label": "Open avatar menu",
        "menu-items": JSON.stringify([
          { id: "profile", label: "Profile", icon: "User" },
          { id: "settings", label: "Settings", icon: "Settings" },
          { id: "help", label: "Help", icon: "Help" },
          { id: "sign-out", label: "Sign out", icon: "Sign out" },
        ]),
        variant: "image",
      }}
    />
  ),
};
export const ForcedColors: Story = { ...forcedColorsStory };
