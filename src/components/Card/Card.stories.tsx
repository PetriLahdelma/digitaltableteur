import React from "react";
import Card from "./Card";

export default {
  title: "DesignSystem/Card",
  component: Card,
  parameters: { wip: { disabled: false } },
};

export const Default = {
  args: { title: "Default Card", body: "Body content" },
};

export const Hoverable = {
  args: { title: "Hoverable", body: "Interactive elevation", hoverable: true },
};

export const Loading = {
  args: { title: "Loading", loading: true, body: "Will be hidden" },
};

export const WithCover = {
  args: {
    title: "With Cover",
    cover: <img alt="Placeholder" src="https://via.placeholder.com/600x240" />,
    body: "Image cover at top",
  },
};

export const WithActions = {
  render: () => {
    const actions = [
      { key: "save", label: "Save" },
      { key: "cancel", label: "Cancel" },
    ];
    return <Card title="Actions" body="Footer actions" actions={actions} />;
  },
};

const TabbedStoryComponent = () => {
  const tabs = [
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

export const Tabbed = {
  render: () => <TabbedStoryComponent />,
};
