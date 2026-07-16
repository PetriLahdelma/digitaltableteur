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
import { DtMenuElement } from "../../../../../packages/web-components/src/native/menu";

if (!customElements.get("dt-menu")) {
  customElements.define("dt-menu", DtMenuElement);
}

type MenuArgs = {
  side: "top" | "right" | "bottom" | "left";
  align: "start" | "center" | "end";
  sideOffset: number;
  modal: boolean;
  items: string;
};

const actions = JSON.stringify([
  { id: "edit", label: "Edit" },
  { id: "duplicate", label: "Duplicate" },
  { separator: true },
  { id: "delete", label: "Delete" },
]);

const withIcons = JSON.stringify([
  { id: "edit", label: "Edit", icon: "pencil", trailing: "⌘E" },
  { id: "duplicate", label: "Duplicate", icon: "copy-simple", trailing: "⌘D" },
  { separator: true },
  { id: "delete", label: "Delete", icon: "x-circle" },
]);

const withSubmenu = JSON.stringify([
  { id: "copy-link", label: "Copy link" },
  {
    id: "invite",
    label: "Invite people",
    icon: "share-network",
    children: [
      { id: "email", label: "By email" },
      { id: "link", label: "By link" },
    ],
  },
  { separator: true },
  { id: "export", label: "Export" },
]);

const asLinks = JSON.stringify([
  { id: "profile", label: "Profile", href: "/profile", icon: "user" },
  { id: "settings", label: "Settings", href: "/settings", icon: "gear" },
  { separator: true },
  { id: "billing", label: "Billing", href: "/billing" },
]);

const disabledItems = JSON.stringify([
  { id: "rename", label: "Rename" },
  { id: "archive", label: "Archive (unavailable)", disabled: true },
  { id: "delete", label: "Delete" },
]);

function NativeMenu(args: MenuArgs) {
  return (
    <NativeElement
      tagName="dt-menu"
      attributes={{
        side: args.side,
        align: args.align,
        "side-offset": args.sideOffset,
        modal: args.modal,
        items: args.items,
      }}
    >
      <button slot="trigger" type="button">
        Actions
      </button>
    </NativeElement>
  );
}

const meta = {
  title: "Web Components/Actions/Menu",
  component: NativeMenu,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native `dt-menu` menu-button primitive with slotted trigger, serializable items, submenu support, roving focus, and composed selection events.",
      },
    },
  },
  args: {
    side: "bottom",
    align: "start",
    sideOffset: 6,
    modal: false,
    items: actions,
  },
  argTypes: {
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
    },
    align: {
      control: "inline-radio",
      options: ["start", "center", "end"],
    },
    sideOffset: { control: "number" },
    modal: { control: "boolean" },
    items: {
      control: "select",
      options: ["actions", "withIcons", "withSubmenu", "asLinks", "disabled"],
      mapping: {
        actions,
        withIcons,
        withSubmenu,
        asLinks,
        disabled: disabledItems,
      },
    },
  },
} satisfies Meta<typeof NativeMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-menu") };
export const Playground: Story = {};

export const WithIcons: Story = {
  ...exampleStory,
  args: { items: withIcons },
};

export const WithSubmenu: Story = {
  ...exampleStory,
  args: { items: withSubmenu },
  render: (args) => (
    <NativeElement
      tagName="dt-menu"
      attributes={{
        side: args.side,
        align: args.align,
        "side-offset": args.sideOffset,
        items: withSubmenu,
      }}
    >
      <button slot="trigger" type="button">
        Share
      </button>
    </NativeElement>
  ),
};

export const Disabled: Story = {
  ...exampleStory,
  args: { items: disabledItems },
};

export const AsLinks: Story = {
  ...exampleStory,
  args: { items: asLinks },
  render: (args) => (
    <NativeElement
      tagName="dt-menu"
      attributes={{
        side: args.side,
        align: args.align,
        "side-offset": args.sideOffset,
        items: asLinks,
      }}
    >
      <button slot="trigger" type="button">
        Account
      </button>
    </NativeElement>
  ),
};

export const DeclarativeItems: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement tagName="dt-menu">
      <button slot="trigger" type="button">
        Account
      </button>
      <button data-id="profile" type="button">
        Profile
      </button>
      <div data-separator="true" />
      <button data-value="sign-out" type="button">
        Sign out
      </button>
    </NativeElement>
  ),
};

export const Alignments: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      <Row>
        <NativeElement
          tagName="dt-menu"
          attributes={{ align: "start", items: actions }}
        >
          <button slot="trigger" type="button">
            Start
          </button>
        </NativeElement>
        <NativeElement
          tagName="dt-menu"
          attributes={{ align: "center", items: actions }}
        >
          <button slot="trigger" type="button">
            Center
          </button>
        </NativeElement>
        <NativeElement
          tagName="dt-menu"
          attributes={{ align: "end", items: actions }}
        >
          <button slot="trigger" type="button">
            End
          </button>
        </NativeElement>
      </Row>
    </Stack>
  ),
};

export const Example: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement tagName="dt-menu" attributes={{ items: withIcons }}>
      <button slot="trigger" type="button">
        File
      </button>
    </NativeElement>
  ),
};

export const ForcedColors: Story = { ...forcedColorsStory };
