import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stage,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";
import { DtTabsElement } from "../../../../../packages/web-components/src/native/tabs";

if (!customElements.get("dt-tabs")) {
  customElements.define("dt-tabs", DtTabsElement);
}

const basicTabs = [
  { key: "overview", label: "Overview" },
  { key: "details", label: "Details" },
  { key: "settings", label: "Settings" },
];

const tabsWithDisabled = [
  { key: "inbox", label: "Inbox", icon: "tray", count: 3 },
  { key: "drafts", label: "Drafts", disabled: true, icon: "folder" },
  { key: "sent", label: "Sent", icon: "paper-plane-tilt" },
];

type Args = {
  tabs: string;
  activeTab?: string;
  defaultActiveTab?: string;
  size: "sm" | "md" | "lg";
  variant: "default" | "pills" | "underline";
  orientation: "horizontal" | "vertical";
  activation: "manual" | "automatic";
  ariaLabel?: string;
};

function Panels({
  tabs,
}: {
  tabs: Array<{ key: string; label: string }>;
}) {
  return (
    <>
      {tabs.map((tab) => (
        <div key={tab.key} slot={`panel-${tab.key}`}>
          <p style={{ margin: 0 }}>{tab.label} content</p>
        </div>
      ))}
    </>
  );
}

function NativeTabs({ defaultActiveTab, tabs, ...args }: Args) {
  const parsedTabs = JSON.parse(tabs) as Array<{ key: string; label: string }>;
  return (
    <Stage width={args.orientation === "vertical" ? "24rem" : "34rem"}>
      <NativeElement
        tagName="dt-tabs"
        attributes={{
          ...args,
          tabs,
          "default-active-tab": defaultActiveTab,
          "active-tab": args.activeTab,
          "aria-label": args.ariaLabel,
        }}
      >
        <Panels tabs={parsedTabs} />
      </NativeElement>
    </Stage>
  );
}

function ControlledTabs() {
  const [activeTab, setActiveTab] = useState("overview");
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = hostRef.current?.querySelector("dt-tabs");
    const onChange = (event: Event) => {
      setActiveTab((event as CustomEvent<{ activeTab: string }>).detail.activeTab);
    };
    element?.addEventListener("tab-change", onChange);
    return () => element?.removeEventListener("tab-change", onChange);
  }, []);

  return (
    <div ref={hostRef}>
      <p style={{ marginBlock: "0 0 0.75rem" }}>
        Active tab: <strong>{activeTab}</strong>
      </p>
      <NativeTabs
        tabs={JSON.stringify(basicTabs)}
        activeTab={activeTab}
        size="md"
        variant="default"
        orientation="horizontal"
        activation="manual"
        ariaLabel="Contact views"
      />
    </div>
  );
}

const meta = {
  title: "Web Components/Navigation/Tabs",
  component: NativeTabs,
  tags: ["autodocs", "stable", "web-components"],
  parameters: { ...nativeStoryParameters, layout: "padded" },
  args: {
    tabs: JSON.stringify(basicTabs),
    defaultActiveTab: "overview",
    size: "md",
    variant: "default",
    orientation: "horizontal",
    activation: "manual",
    ariaLabel: "Navigate between tabs",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: {
      control: "inline-radio",
      options: ["default", "pills", "underline"],
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    activation: {
      control: "inline-radio",
      options: ["manual", "automatic"],
    },
  },
} satisfies Meta<typeof NativeTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-tabs") };
export const Playground: Story = {};
export const Pills: Story = {
  tags: ["example"],
  args: { variant: "pills", tabs: JSON.stringify(basicTabs) },
};
export const Underline: Story = {
  tags: ["example"],
  args: { variant: "underline", tabs: JSON.stringify(basicTabs) },
};
export const VerticalAutomatic: Story = {
  tags: ["example"],
  args: {
    orientation: "vertical",
    activation: "automatic",
    defaultActiveTab: "details",
  },
};
export const IconsAndCount: Story = {
  tags: ["example"],
  args: {
    tabs: JSON.stringify(tabsWithDisabled),
    variant: "underline",
    defaultActiveTab: "inbox",
  },
};
export const Controlled: Story = {
  tags: ["example"],
  render: () => <ControlledTabs />,
};
export const Example: Story = {
  tags: ["example"],
  render: () => (
    <Stage width="34rem">
      <NativeElement
        tagName="dt-tabs"
        attributes={{
          tabs: JSON.stringify(basicTabs),
          "default-active-tab": "overview",
          variant: "pills",
          size: "md",
          "aria-label": "Portfolio sections",
        }}
      >
        <span slot="tab-overview">Overview</span>
        <span slot="tab-details">Case details</span>
        <span slot="tab-settings">Delivery notes</span>
        <div slot="panel-overview">Overview panel</div>
        <div slot="panel-details">Case details panel</div>
        <div slot="panel-settings">Delivery notes panel</div>
      </NativeElement>
    </Stage>
  ),
};
export const ForcedColors: Story = {
  tags: ["example"],
  globals: { forcedColors: "active" },
};
