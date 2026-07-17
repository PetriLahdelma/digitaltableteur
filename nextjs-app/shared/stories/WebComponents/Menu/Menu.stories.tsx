import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  Stage,
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
  { id: "edit", label: "Edit", meta: "⌘E" },
  { id: "duplicate", label: "Duplicate" },
  { separator: true },
  { id: "delete", label: "Delete", tone: "destructive" },
]);

const withIcons = JSON.stringify([
  { id: "edit", label: "Edit", icon: "pencil", meta: "⌘E" },
  { id: "duplicate", label: "Duplicate", icon: "copy-simple", meta: "⌘D" },
  { separator: true },
  { id: "delete", label: "Delete", icon: "trash", tone: "destructive" },
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

function NativeMenu(args: MenuArgs & { defaultOpen?: boolean }) {
  // The open panel is position:absolute (out of flow); the Stage reserves its
  // space so docs canvases don't clip it mid-item. Trigger mirrors the
  // canonical React PlaygroundRender: secondary Button labelled "Actions",
  // open in canvas view.
  return (
    <Stage height="17rem">
      <NativeElement
        tagName="dt-menu"
        attributes={{
          side: args.side,
          align: args.align,
          "side-offset": args.sideOffset,
          modal: args.modal,
          items: args.items,
          "default-open": args.defaultOpen,
        }}
      >
        <NativeElement
          tagName="dt-button"
          slot="trigger"
          attributes={{ label: "Actions", variant: "secondary" }}
        />
      </NativeElement>
    </Stage>
  );
}

const meta = {
  title: "Web Components/Actions/Menu",
  component: NativeMenu,
  tags: ["autodocs", "beta", "web-components"],
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

export const Default: Story = {
  render: (args, { viewMode }) => (
    <NativeMenu {...args} defaultOpen={viewMode !== "docs"} />
  ),
  play: assertNative("dt-menu"),
};
export const Playground: Story = {
  render: (args, { viewMode }) => (
    <NativeMenu {...args} defaultOpen={viewMode !== "docs"} />
  ),
};

export const WithIcons: Story = {
  ...exampleStory,
  args: { items: withIcons },
};

export const WithSubmenu: Story = {
  ...exampleStory,
  args: { items: withSubmenu },
  render: (args) => (
    <Stage height="17rem" width="26rem">
      <NativeElement
        tagName="dt-menu"
        attributes={{
          side: args.side,
          align: args.align,
          "side-offset": args.sideOffset,
          items: withSubmenu,
        }}
      >
        <NativeElement
          tagName="dt-button"
          slot="trigger"
          attributes={{ label: "Share" }}
        />
      </NativeElement>
    </Stage>
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
    <Stage height="17rem">
      <NativeElement
        tagName="dt-menu"
        attributes={{
          side: args.side,
          align: args.align,
          "side-offset": args.sideOffset,
          items: asLinks,
        }}
      >
        <NativeElement
          tagName="dt-button"
          slot="trigger"
          attributes={{ label: "Account" }}
        />
      </NativeElement>
    </Stage>
  ),
};

export const DeclarativeItems: Story = {
  ...exampleStory,
  render: () => (
    <Stage height="14rem">
      <NativeElement tagName="dt-menu">
        <NativeElement
          tagName="dt-button"
          slot="trigger"
          attributes={{ label: "Account" }}
        />
        <button data-id="profile" type="button">
          Profile
        </button>
        <div data-separator="true" />
        <button data-value="sign-out" type="button">
          Sign out
        </button>
      </NativeElement>
    </Stage>
  ),
};

export const Alignments: Story = {
  ...exampleStory,
  render: () => (
    <Stage height="17rem">
      <Stack>
        <Row>
          <NativeElement
            tagName="dt-menu"
            attributes={{ align: "start", items: actions }}
          >
            <NativeElement
          tagName="dt-button"
          slot="trigger"
          attributes={{ label: "Start" }}
        />
          </NativeElement>
          <NativeElement
            tagName="dt-menu"
            attributes={{ align: "center", items: actions }}
          >
            <NativeElement
          tagName="dt-button"
          slot="trigger"
          attributes={{ label: "Center" }}
        />
          </NativeElement>
          <NativeElement
            tagName="dt-menu"
            attributes={{ align: "end", items: actions }}
          >
            <NativeElement
          tagName="dt-button"
          slot="trigger"
          attributes={{ label: "End" }}
        />
          </NativeElement>
        </Row>
      </Stack>
    </Stage>
  ),
};

export const Example: Story = {
  ...exampleStory,
  render: () => (
    <Stage height="17rem">
      <NativeElement
        tagName="dt-menu"
        attributes={{
          items: JSON.stringify([
            { id: "first", label: "First" },
            { id: "second", label: "Second" },
            { id: "third", label: "Third" },
          ]),
        }}
      >
        <NativeElement
          tagName="dt-button"
          slot="trigger"
          attributes={{ label: "Open menu", variant: "secondary" }}
        />
      </NativeElement>
    </Stage>
  ),
};

export const ForcedColors: Story = { ...forcedColorsStory };
