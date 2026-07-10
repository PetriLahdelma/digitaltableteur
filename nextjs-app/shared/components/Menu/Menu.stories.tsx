import contract from "./Menu.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "./Menu";
import Button from "@dt/Button";
import Icon from "@dt/Icon";

// Labeled content presets so the `children` control is an operable select
// (a JSON/object control for ReactNode is never operable in the panel).
const contentPresets = {
  actions: (
    <>
      <MenuItem onSelect={() => {}}>Edit</MenuItem>
      <MenuItem onSelect={() => {}}>Duplicate</MenuItem>
      <MenuSeparator />
      <MenuItem onSelect={() => {}}>Delete</MenuItem>
    </>
  ),
  withIcons: (
    <>
      <MenuItem
        icon={<Icon name="pencil" ariaLabel="" size="sm" />}
        trailing="⌘E"
        onSelect={() => {}}
      >
        Edit
      </MenuItem>
      <MenuItem
        icon={<Icon name="copy-simple" ariaLabel="" size="sm" />}
        trailing="⌘D"
        onSelect={() => {}}
      >
        Duplicate
      </MenuItem>
      <MenuSeparator />
      <MenuItem
        icon={<Icon name="x-circle" ariaLabel="" size="sm" />}
        onSelect={() => {}}
      >
        Delete
      </MenuItem>
    </>
  ),
  withSubmenu: (
    <>
      <MenuItem onSelect={() => {}}>Copy link</MenuItem>
      <MenuSub>
        <MenuSubTrigger icon={<Icon name="share-network" ariaLabel="" size="sm" />}>
          Invite people
        </MenuSubTrigger>
        <MenuSubContent>
          <MenuItem onSelect={() => {}}>By email</MenuItem>
          <MenuItem onSelect={() => {}}>By link</MenuItem>
        </MenuSubContent>
      </MenuSub>
    </>
  ),
} as const;

const meta = {
  title: "Actions/Menu",
  component: MenuContent,
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  tags: ["stable", "autodocs"],
  argTypes: {
    side: {
      control: { type: "select" },
      options: ["top", "right", "bottom", "left"],
      description: "Preferred side relative to the trigger; flips on collision",
      table: { defaultValue: { summary: "bottom" }, category: "Appearance" },
    },
    align: {
      control: { type: "select" },
      options: ["start", "center", "end"],
      description: "Alignment along the trigger edge",
      table: { defaultValue: { summary: "start" }, category: "Appearance" },
    },
    sideOffset: {
      control: { type: "number" },
      description: "Gap between the trigger and the content in px",
      table: { defaultValue: { summary: "6" }, category: "Appearance" },
    },
    className: {
      control: "text",
      description: "Extra class on the content surface",
      table: { category: "Advanced" },
    },
    children: {
      control: "select",
      options: ["actions", "withIcons", "withSubmenu"],
      mapping: contentPresets,
      description: "Menu contents (item preset)",
      table: { category: "Content" },
    },
  },
  args: {
    side: "bottom" as const,
    align: "start" as const,
    sideOffset: 6,
    className: "",
    children: "actions" as unknown as (typeof contentPresets)["actions"],
  },
} satisfies Meta<typeof MenuContent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The dropdown-menu composition: `MenuTrigger asChild` wraps a real Button,
 * `MenuContent` portals a `role=menu` list of `MenuItem`s with a
 * `MenuSeparator`. Shown open in the canvas (closed on the docs page) so the
 * surface is visible without a pointer; Radix owns roving focus, arrow keys,
 * typeahead, and Escape.
 */
const PlaygroundRender: Story["render"] = (args, { viewMode }) => (
  <Menu defaultOpen={viewMode !== "docs"}>
    <MenuTrigger asChild>
      <Button variant="secondary">Actions</Button>
    </MenuTrigger>
    <MenuContent {...args} />
  </Menu>
);

export const Default: Story = {
  tags: ["beta-matrix"],
  render: PlaygroundRender,
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  render: PlaygroundRender,
};

/** Leading icons sit in a fixed gutter so labels align; trailing shortcut hints stay muted. */
export const WithIcons: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Each item's glyph goes in the icon slot (a fixed 1.25rem gutter) so labels line up in a column. The trailing slot carries a muted shortcut hint or metadata.",
      },
    },
  },
  render: (_args, { viewMode }) => (
    <Menu defaultOpen={viewMode !== "docs"}>
      <MenuTrigger asChild>
        <Button variant="secondary">File</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem
          icon={<Icon name="pencil" ariaLabel="" size="sm" />}
          trailing="⌘E"
          onSelect={() => {}}
        >
          Edit
        </MenuItem>
        <MenuItem
          icon={<Icon name="copy-simple" ariaLabel="" size="sm" />}
          trailing="⌘D"
          onSelect={() => {}}
        >
          Duplicate
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          icon={<Icon name="x-circle" ariaLabel="" size="sm" />}
          onSelect={() => {}}
        >
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};

/** Nested choices open in a second-level menu via MenuSub (ArrowRight / hover). */
export const WithSubmenu: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "MenuSub nests a second-level menu. The MenuSubTrigger shows a trailing caret and opens on ArrowRight or hover; ArrowLeft/Escape closes it. Reserve submenus for genuinely nested choices.",
      },
    },
  },
  render: (_args, { viewMode }) => (
    <Menu defaultOpen={viewMode !== "docs"}>
      <MenuTrigger asChild>
        <Button variant="secondary">Share</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem onSelect={() => {}}>Copy link</MenuItem>
        <MenuSub>
          <MenuSubTrigger
            icon={<Icon name="share-network" ariaLabel="" size="sm" />}
          >
            Invite people
          </MenuSubTrigger>
          <MenuSubContent>
            <MenuItem onSelect={() => {}}>By email</MenuItem>
            <MenuItem onSelect={() => {}}>By link</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSeparator />
        <MenuItem onSelect={() => {}}>Export</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

/** Disabled items are dimmed, announced disabled, and skipped by keyboard navigation. */
export const Disabled: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A disabled MenuItem is dimmed, exposes the disabled state to assistive tech, and is skipped when arrowing through the menu.",
      },
    },
  },
  render: (_args, { viewMode }) => (
    <Menu defaultOpen={viewMode !== "docs"}>
      <MenuTrigger asChild>
        <Button variant="secondary">Actions</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem onSelect={() => {}}>Rename</MenuItem>
        <MenuItem disabled onSelect={() => {}}>
          Archive (unavailable)
        </MenuItem>
        <MenuItem onSelect={() => {}}>Delete</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

/** Navigation items use href, so they render as anchors: middle-click and open-in-new-tab work. */
export const AsLinks: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Items with an href render as real anchors, so they support middle-click, open-in-new-tab, and copy-link — use them for navigation and onSelect for actions.",
      },
    },
  },
  render: (_args, { viewMode }) => (
    <Menu defaultOpen={viewMode !== "docs"}>
      <MenuTrigger asChild>
        <Button variant="secondary">Account</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem
          icon={<Icon name="user" ariaLabel="" size="sm" />}
          href="/profile"
        >
          Profile
        </MenuItem>
        <MenuItem
          icon={<Icon name="gear" ariaLabel="" size="sm" />}
          href="/settings"
        >
          Settings
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          icon={<Icon name="sign-out" ariaLabel="" size="sm" />}
          onSelect={() => {}}
        >
          Sign out
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};

/** Keyboard contract driven end to end: open, arrow to an item, select, Escape. */
export const Example: Story = {
  tags: ["beta-matrix", "example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The a11y contract, asserted by the play function in a real browser: the trigger exposes aria-haspopup, keyboard opens the menu, ArrowDown moves the roving focus, Enter selects and closes, and focus returns to the trigger.",
      },
    },
  },
  render: () => {
    return (
      <Menu>
        <MenuTrigger asChild>
          <Button variant="secondary">Open menu</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={() => {}}>First</MenuItem>
          <MenuItem onSelect={() => {}}>Second</MenuItem>
          <MenuItem onSelect={() => {}}>Third</MenuItem>
        </MenuContent>
      </Menu>
    );
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector(
      "button",
    ) as HTMLButtonElement;
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    // Keyboard opens the menu — no pointer involved.
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(screen.getByRole("menu")).toBeInTheDocument(),
    );
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(3);

    // Roving focus lands on an item as we arrow through the menu.
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() =>
      expect(items.some((item) => item.hasAttribute("data-highlighted"))).toBe(
        true,
      ),
    );

    // Enter selects and closes, returning focus to the trigger.
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix", "forced-colors"],
  parameters: { a11y: { disable: true, test: "off" } },
  globals: { forcedColors: "active" },
  render: () => (
    <Menu defaultOpen>
      <MenuTrigger asChild>
        <Button variant="secondary">Actions</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem icon={<Icon name="pencil" ariaLabel="" size="sm" />} onSelect={() => {}}>
          Edit
        </MenuItem>
        <MenuItem onSelect={() => {}}>Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem disabled onSelect={() => {}}>
          Delete (unavailable)
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};
