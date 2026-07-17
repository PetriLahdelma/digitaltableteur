import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { DtListItemElement } from "../../../../../packages/web-components/src/native/list-item";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

if (!customElements.get("dt-list-item")) {
  customElements.define("dt-list-item", DtListItemElement);
}

type Args = {
  label: string;
  tone: "neutral" | "destructive";
  selected: boolean;
  disabled: boolean;
  highlighted: boolean;
};

function NativeListItem(args: Args) {
  return (
    <NativeElement
      tagName="dt-list-item"
      attributes={{
        label: args.label,
        tone: args.tone === "neutral" ? undefined : args.tone,
        selected: args.selected || undefined,
        disabled: args.disabled || undefined,
        highlighted: args.highlighted || undefined,
      }}
    />
  );
}

const meta = {
  title: "Web Components/Content/ListItem",
  component: NativeListItem,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native dt-list-item presentational row. Consumers own semantics; dt-menu and dt-split-button compose it inside their panels.",
      },
    },
  },
  args: {
    label: "Rename",
    tone: "neutral",
    selected: false,
    disabled: false,
    highlighted: false,
  },
  argTypes: {
    tone: { control: "inline-radio", options: ["neutral", "destructive"] },
  },
} satisfies Meta<typeof NativeListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const column: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  inlineSize: "16rem",
};

export const Default: Story = { play: assertNative("dt-list-item") };

export const Playground: Story = {};

export const Slots: Story = {
  ...exampleStory,
  render: () => (
    <div style={column}>
      <NativeElement
        tagName="dt-list-item"
        attributes={{ icon: "pencil", label: "Rename" }}
      />
      <NativeElement
        tagName="dt-list-item"
        attributes={{ meta: "⌘K", label: "Search" }}
      />
      <NativeElement tagName="dt-list-item" attributes={{ label: "Save" }}>
        <NativeElement
          tagName="dt-kbd"
          slot="meta"
          attributes={{ size: "sm", content: "⌘S" }}
        />
      </NativeElement>
      <NativeElement tagName="dt-list-item" attributes={{ label: "Inbox" }}>
        <NativeElement
          tagName="dt-badge"
          slot="meta"
          attributes={{ size: "sm", tone: "info", label: "New" }}
        />
      </NativeElement>
      <NativeElement tagName="dt-list-item" attributes={{ label: "Server" }}>
        <NativeElement
          tagName="dt-status-dot"
          slot="meta"
          attributes={{ tone: "success", label: "Online" }}
        />
      </NativeElement>
      <NativeElement
        tagName="dt-list-item"
        attributes={{ meta: "1.4 GB", label: "Storage" }}
      />
      <NativeElement
        tagName="dt-list-item"
        attributes={{ "trailing-icon": "caret-right", label: "Share" }}
      />
      <NativeElement
        tagName="dt-list-item"
        attributes={{ selected: true, label: "Finnish" }}
      />
    </div>
  ),
};

export const Destructive: Story = {
  ...exampleStory,
  render: () => (
    <div style={column}>
      <NativeElement
        tagName="dt-list-item"
        attributes={{
          tone: "destructive",
          icon: "trash",
          label: "Delete project",
        }}
      />
      <NativeElement
        tagName="dt-list-item"
        attributes={{
          tone: "destructive",
          highlighted: true,
          icon: "trash",
          label: "Delete project",
        }}
      />
    </div>
  ),
};

export const States: Story = {
  ...exampleStory,
  parameters: {
    docs: {
      description: {
        story:
          "States are visual only; the interactive wrapper owns the semantics. Here each row sits in a menuitem wrapper and the disabled rows carry aria-disabled on it, per the consumer contract.",
      },
    },
  },
  render: () => (
    <div style={column} role="menu" aria-label="States">
      <div role="menuitem">
        <NativeElement
          tagName="dt-list-item"
          attributes={{ label: "Default" }}
        />
      </div>
      <div role="menuitem">
        <NativeElement
          tagName="dt-list-item"
          attributes={{ highlighted: true, label: "Highlighted" }}
        />
      </div>
      <div role="menuitem" aria-disabled="true">
        <NativeElement
          tagName="dt-list-item"
          attributes={{ disabled: true, label: "Disabled" }}
        />
      </div>
      <div role="menuitem" aria-disabled="true">
        <NativeElement
          tagName="dt-list-item"
          attributes={{
            disabled: true,
            meta: "⌘X",
            label: "Disabled with meta",
          }}
        />
      </div>
    </div>
  ),
};

export const Example: Story = {
  ...exampleStory,
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={column}>
      <NativeElement
        tagName="dt-list-item"
        attributes={{ icon: "pencil", label: "Rename" }}
      >
        <NativeElement
          tagName="dt-kbd"
          slot="meta"
          attributes={{ size: "sm", content: "⌘R" }}
        />
      </NativeElement>
      <NativeElement
        tagName="dt-list-item"
        attributes={{ icon: "copy-simple", label: "Duplicate" }}
      />
      <NativeElement
        tagName="dt-list-item"
        attributes={{
          icon: "share-network",
          "trailing-icon": "caret-right",
          label: "Share",
        }}
      />
      <NativeElement
        tagName="dt-list-item"
        attributes={{ selected: true, label: "English" }}
      />
      <NativeElement
        tagName="dt-list-item"
        attributes={{ label: "Workspace" }}
      >
        <NativeElement
          tagName="dt-status-dot"
          slot="meta"
          attributes={{ tone: "success", label: "Synced" }}
        />
      </NativeElement>
      <NativeElement
        tagName="dt-list-item"
        attributes={{ tone: "destructive", icon: "trash", label: "Delete" }}
      />
    </div>
  ),
};

export const ForcedColors: Story = {
  ...forcedColorsStory,
  ...Example,
};
