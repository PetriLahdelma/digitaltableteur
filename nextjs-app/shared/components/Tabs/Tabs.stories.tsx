import contract from "./Tabs.contract.json";
import React from "react";
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import Tabs, { TabsProps, getTabPanelProps } from "@dt/Tabs";
import { expect, userEvent, waitFor, within } from "storybook/test";
import schema from "./schema.json";
import styles from "./Tabs.stories.module.css";

type Story = StoryObj<typeof Tabs>;

/**
 * Story wrapper that pairs the Tabs component with the tabpanels it controls.
 * Without panels, `aria-controls` references would be invalid (axe will flag
 * `aria-valid-attr-value`), so every story must render panels too.
 */
function TabsWithPanels(args: TabsProps) {
  // The Controls panel seeds free strings as "" — treat that as absent so the
  // seeded Playground still has an active tab.
  const initial =
    args.activeTab || args.defaultActiveTab || args.tabs[0]?.key || "";
  const [active, setActive] = React.useState(initial);
  React.useEffect(() => {
    if (args.activeTab) {
      setActive(args.activeTab);
    }
  }, [args.activeTab]);
  return (
    <div>
      <Tabs
        {...args}
        activeTab={args.activeTab || active}
        onTabChange={(key) => {
          if (!args.activeTab) setActive(key);
          args.onTabChange?.(key);
        }}
      />
      {args.tabs.map((tab) => (
        <div key={tab.key} {...getTabPanelProps(tab.key, tab.key === active)}>
          <p>{tab.label} content</p>
        </div>
      ))}
    </div>
  );
}

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=381-5",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite tabs slot keeps an authored mapping preset.
  argTypes: {
    tabs: {
      control: { type: "select" },
      options: ["basic", "withDisabled"],
      mapping: {
        basic: [
          { key: "tab1", label: "Tab 1" },
          { key: "tab2", label: "Tab 2" },
          { key: "tab3", label: "Tab 3" },
        ],
        withDisabled: [
          { key: "tab1", label: "Active" },
          { key: "tab2", label: "Disabled", disabled: true },
          { key: "tab3", label: "Active" },
        ],
      },
      description:
        "Array of tab items with key, label, and optional disabled state. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "TabItem[]" } },
    },
  },
};
export default meta;

const Template: StoryFn<TabsProps> = (args) => <TabsWithPanels {...args} />;

export const Default = Template.bind({});
Default.args = {
  tabs: [
    { key: "tab1", label: "Tab 1" },
    { key: "tab2", label: "Tab 2" },
    { key: "tab3", label: "Tab 3" },
  ],
  variant: "default",
  size: "md",
};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const tabs = canvas.getAllByRole("tab");

  // Click second tab
  await userEvent.click(tabs[1]);
  await waitFor(() => expect(tabs[1]).toHaveAttribute("aria-selected", "true"));

  // Click third tab
  await userEvent.click(tabs[2]);
  await waitFor(() => expect(tabs[2]).toHaveAttribute("aria-selected", "true"));

  // Keyboard navigation
  tabs[0].focus();
  await userEvent.keyboard("{ArrowRight}");
};

export const Pills = Template.bind({});
Pills.args = {
  tabs: [
    { key: "tab1", label: "Overview" },
    { key: "tab2", label: "Details" },
    { key: "tab3", label: "Settings" },
  ],
  variant: "pills",
};
Pills.tags = ["example"];
Pills.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        "pills is a soft segmented group: a raised thumb slides behind the selected tab on a tinted track. Best for top-of-card view switches.",
    },
  },
};
Pills.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const tabs = canvas.getAllByRole("tab");
  await userEvent.click(tabs[1]);
  await userEvent.click(tabs[2]);
};

export const Underline = Template.bind({});
Underline.args = {
  tabs: [
    { key: "tab1", label: "Home" },
    { key: "tab2", label: "Profile" },
    { key: "tab3", label: "Messages" },
  ],
  variant: "underline",
};
Underline.tags = ["example"];
Underline.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        "underline is the quietest variant: a 2px indicator slides along the bottom rail as selection moves. Suits dense pages where pills would shout.",
    },
  },
};
Underline.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const tabs = canvas.getAllByRole("tab");
  await userEvent.click(tabs[2]);
};

export const WithDisabled = Template.bind({});
WithDisabled.args = {
  tabs: [
    { key: "tab1", label: "Active" },
    { key: "tab2", label: "Disabled", disabled: true },
    { key: "tab3", label: "Active" },
  ],
};
WithDisabled.tags = ["example"];
WithDisabled.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        "Disable a tab with disabled on its item instead of removing it: the set stays stable, the tab is skipped by the roving arrow-key focus, and clicks are inert.",
    },
  },
};
WithDisabled.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const tabs = canvas.getAllByRole("tab");

  // Try clicking disabled tab (should not activate)
  await userEvent.click(tabs[1]);

  // Click active tab
  await userEvent.click(tabs[2]);
  await waitFor(() => expect(tabs[2]).toHaveAttribute("aria-selected", "true"));
};

export const IconsAndCount = Template.bind({});
IconsAndCount.args = {
  variant: "underline",
  tabs: [
    { key: "inbox", label: "Inbox", icon: "tray", count: 3 },
    { key: "starred", label: "Starred", icon: "star" },
    { key: "sent", label: "Sent", icon: "paper-plane-tilt" },
    { key: "drafts", label: "Drafts", icon: "folder", disabled: true },
  ],
};
IconsAndCount.tags = ["example"];
IconsAndCount.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        "Each tab item takes an optional leading icon (Phosphor name or node) and a trailing count pill. The icon is decorative; the count joins the tab's accessible name (e.g. “Inbox 3”).",
    },
  },
};
IconsAndCount.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const tabs = canvas.getAllByRole("tab");
  await userEvent.click(tabs[1]);
};

export const Sizes: StoryFn = () => (
  <div className={styles.sizesColumn}>
    {(["sm", "md", "lg"] as const).map((size) => (
      <TabsWithPanels
        key={size}
        size={size}
        tabs={[
          { key: `${size}-one`, label: `Tab (${size})` },
          { key: `${size}-two`, label: "Second" },
          { key: `${size}-three`, label: "Third" },
        ]}
      />
    ))}
  </div>
);
Sizes.tags = ["example"];
Sizes.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        "sm, md (default), and lg adjust label size and hit area together. Pick one per page; mixing densities inside one view reads as a bug.",
    },
  },
};

export const ControlledTabs: StoryFn = () => {
  const [activeTab, setActiveTab] = React.useState("tab1");
  const tabs = [
    { key: "tab1", label: "First" },
    { key: "tab2", label: "Second" },
    { key: "tab3", label: "Third" },
  ];
  return (
    <div>
      <p className={styles.demoText}>
        Active tab (v1.1.0): <strong>{activeTab}</strong>
      </p>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      {tabs.map((tab) => (
        <div
          key={tab.key}
          {...getTabPanelProps(tab.key, tab.key === activeTab)}
        >
          <p>{tab.label} content</p>
        </div>
      ))}
    </div>
  );
};

ControlledTabs.tags = ["example"];
ControlledTabs.parameters = {
  controls: { disable: true },
  docs: {
    description: {
      story:
        "Controlled mode: pass activeTab + onTabChange and the parent owns selection — the pattern used by the contact form's Personal/Company switch and the CV page's rendered-vs-source toggle. Panels pair up via getTabPanelProps.",
    },
  },
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  // defaultActiveTab is mount-only state; keying the wrapper on it remounts so
  // panel edits actually drive the canvas. tabs arg is a mapping key.
  render: (args) => (
    <TabsWithPanels key={`default-${args.defaultActiveTab}`} {...args} />
  ),
  args: {
    ...Default.args,
    tabs: "basic" as unknown as TabsProps["tabs"],
  },
};

export const Example = {
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: Template,
  args: Default.args,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: Template,
  args: Default.args,
};
