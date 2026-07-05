import contract from "./Avatar.contract.json";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
/* stylelint-disable value-keyword-case */
import React from "react";
import { StoryFn, Meta } from "@storybook/react-vite";
import Avatar from "@dt/Avatar";
import peteVaultBoy from "../../assets/images/pete-vault-boy.jpg";
import Icon from "@dt/Icon";
import schema from "./schema.json";

export default {
  title: "Content/Avatar",
  component: Avatar,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=369-8",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    variant: {
      control: { type: "inline-radio" },
      options: ["image", "initials"],
      description: "Select whether the avatar prefers an image or initials.",
      table: { defaultValue: { summary: "image" } },
    },

    name: {
      control: { type: "text" },
      description:
        "Full name used for fallback initials (e.g., 'First Last' -> 'FL').",
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      className: { table: { disable: true } },
      clickable: { control: "boolean", description: "Wraps the avatar in a link to destinationUrl.", table: { category: "Content" } },
      decoding: { control: { type: "inline-radio" }, options: ["auto", "sync", "async"], description: "Native img decoding hint for the photo.", table: { category: "Content" } },
      destinationUrl: { control: "text", description: "Link target when clickable is set.", table: { category: "Content" } },
      id: { table: { disable: true } },
      imageUrl: { control: "text", description: "Photo source; falls back to initials from name when absent.", table: { category: "Content" } },
      loading: { control: { type: "inline-radio" }, options: ["lazy", "eager"], description: "Native img loading strategy; keep lazy in lists, eager above the fold.", table: { category: "Content", defaultValue: { summary: "lazy" } } },
      menuItems: {
        control: { type: "select", labels: { none: "none", profile: "profile menu (2 items)", admin: "admin menu (3 items)" } },
        options: ["none", "profile", "admin"],
        mapping: {
          none: undefined,
          profile: [{ label: "Profile" }, { label: "Sign out" }],
          admin: [{ label: "Profile" }, { label: "Settings" }, { label: "Sign out" }],
        },
        description:
          "When provided, renders an in-place dropdown menu triggered by the avatar. Pick a preset to try it; pass your own AvatarMenuItem[] in code.",
        table: { category: "Content", type: { summary: "AvatarMenuItem[]" }, defaultValue: { summary: "undefined" } },
      },
      menuLabel: { control: "text", description: "Accessible label announced for the avatar menu trigger", table: { category: "Accessibility" } },
      ref: { table: { disable: true } },
      size: { control: { type: "inline-radio" }, options: ["sm", "md", "lg", "xl"], description: "Avatar size step.", table: { category: "Appearance", defaultValue: { summary: "md" } } },
      sizes: { control: "text", description: "Native img sizes attribute for responsive photos.", table: { category: "Content" } },
      srcSet: { control: "text", description: "Native img srcSet for responsive photo densities.", table: { category: "Content" } },
      style: { table: { disable: true } }
},
  // Seeded so every text/boolean/number/object control renders an operable
  // widget; each value matches the component's no-op default.
  args: {
    clickable: false,
    destinationUrl: "",
    srcSet: "",
    sizes: "",
    menuLabel: "",
  },
} as Meta<typeof Avatar>;

type AvatarStoryArgs = React.ComponentProps<typeof Avatar>;

const Template: StoryFn<AvatarStoryArgs> = (args) => <Avatar {...args} />;

export const DefaultVariant = Template.bind({});
DefaultVariant.args = {
  imageUrl: peteVaultBoy,
  name: "Petri Lahdelma",
  variant: "image",
};
DefaultVariant.parameters = {
  docs: {
    description: {
      story:
        "Default avatar that can switch between image/initials via controls.",
    },
  },
};

export const WithImage = Template.bind({});
WithImage.tags = ["example"];
WithImage.parameters = {
  controls: { disable: true },
  docs: { description: { story: "Photographic avatar: imageUrl renders the image; still pass name in real use — it is the fallback and the accessible name." } },
};
WithImage.args = { imageUrl: peteVaultBoy, name: undefined, variant: "image" };

export const WithInitials = Template.bind({});
WithInitials.tags = ["example"];
WithInitials.parameters = {
  controls: { disable: true },
  docs: { description: { story: "No image, no problem: initials derive from name. This is the honest fallback, not a style choice for broken pipelines." } },
};
WithInitials.args = { name: "Petri Lahdelma", variant: "initials" };

export const WithMenu = Template.bind({});
WithMenu.tags = ["example"];
WithMenu.parameters = {
  controls: { disable: true },
  docs: { description: { story: "menuItems + menuLabel turn the avatar into an account-menu trigger. The dropdown is the shared Menu primitive (Radix): aligned rows, collision-aware placement, and full keyboard support. The label names the menu, not the person." } },
};
WithMenu.args = {
  imageUrl: peteVaultBoy,
  name: "Petri Lahdelma",
  menuLabel: "Open avatar menu",
  variant: "image",
  menuItems: [
    { label: "Profile", icon: <Icon name="user" aria-hidden="true" /> },
    { label: "Settings", icon: <Icon name="gear" aria-hidden="true" /> },
    { label: "Help", icon: <Icon name="question-mark" aria-hidden="true" /> },
    { label: "Sign out", icon: <Icon name="sign-out" aria-hidden="true" /> },
  ],
};

WithImage.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByRole("img");
};

WithInitials.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  // Check for initials "PL" instead of full name
  await canvas.findByText("PL");
};

WithMenu.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const user = userEvent.setup();

  // The trigger lives in the canvas; the menu portals to the document body.
  const trigger = canvas.getByRole("button", { name: /avatar menu/i });
  await user.click(trigger);

  await waitFor(() => {
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  expect(
    screen.getByRole("menuitem", { name: /profile/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("menuitem", { name: /settings/i }),
  ).toBeInTheDocument();
  expect(screen.getByRole("menuitem", { name: /help/i })).toBeInTheDocument();
  expect(
    screen.getByRole("menuitem", { name: /sign out/i }),
  ).toBeInTheDocument();

  // Selecting an item closes the menu.
  await user.click(screen.getByRole("menuitem", { name: /profile/i }));
  await waitFor(() => {
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
};

DefaultVariant.play = WithImage.play;

export const Default = DefaultVariant;
export const Playground = DefaultVariant;

export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  // WithMenu.args last: controls are disabled here, and the meta-level seeded
  // args (menuLabel: "" etc.) must not override the curated example props.
  render: (args: AvatarStoryArgs) => <Avatar {...args} {...WithMenu.args} />,
};

export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
