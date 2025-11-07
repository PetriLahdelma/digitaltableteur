import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Card, { CardAction, CardTab } from "./Card";

const meta: Meta<typeof Card> = {
  title: "DesignSystem/Card",
  component: Card,
  parameters: { wip: { disabled: false } },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: { title: "Default Card", body: "Body content" },
};

export const Hoverable: Story = {
  args: { title: "Hoverable", body: "Interactive elevation", hoverable: true },
};

export const Loading: Story = {
  args: { title: "Loading", loading: true, body: "Will be hidden" },
};

export const WithCover: Story = {
  args: {
    title: "With Cover",
    cover: <img alt="Placeholder" src="https://via.placeholder.com/600x240" />,
    body: "Image cover at top",
  },
};

export const WithActions: Story = {
  render: () => {
    const actions: CardAction[] = [
      { key: "save", label: "Save" },
      { key: "cancel", label: "Cancel" },
    ];
    return <Card title="Actions" body="Footer actions" actions={actions} />;
  },
};

const TabbedStoryComponent: React.FC = () => {
  const tabs: CardTab[] = [
    { key: "overview", label: "Overview" },
    { key: "details", label: "Details" },
    { key: "disabled", label: "Disabled", disabled: true },
  ];
  const [active, setActive] = React.useState("overview");
  return (
    <Card
      title="Tabbed"
      tabs={tabs}
      activeTabKey={active}
      onTabChange={setActive}
      body={`Active tab: ${active}`}
    />
  );
};

export const Tabbed: Story = {
  render: () => <TabbedStoryComponent />,
};
