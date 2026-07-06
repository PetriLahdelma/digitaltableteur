import contract from "./List.contract.json";
import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import List from "@dt/List";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import { useTranslation } from "react-i18next";
import schema from "./schema.json";


const meta: Meta<typeof List> = {
  title: "Content/List",
  component: List,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-list",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    items: {
      control: {
        type: "select",
        labels: { three: "3 items", four: "4 items" },
      },
      options: ["three", "four"],
      mapping: {
        three: ["storyListItem1", "storyListItem2", "storyListItem3"],
        four: ["storyListItem1", "storyListItem2", "storyListItem3", "storyListItem4"],
      },
      description:
        "Array of list items (strings or React nodes). Presets here; pass your own array in code.",
      table: { type: { summary: "ReactNode[]" } },
    },

    as: {
      control: { type: "select" },
      options: ["ul", "ol"],
      description: "List element type",
    },

    size: {
      control: { type: "select" },
      options: ["xxs", "xs", "s", "m", "l", "xl", "xxl"],
      description: "Text size variant",
      table: { defaultValue: { summary: "s" } },
    },

    lineHeight: {
      control: { type: "select" },
      options: ["tight", "snug", "normal", "relaxed", "loose"],
      description: "Line height variant",
    },

    spacing: {
      control: { type: "select" },
      options: ["compact", "normal", "relaxed"],
      description: "Spacing between list items",
    },

    listStyleType: {
      control: { type: "select" },
      options: [
        "disc",
        "circle",
        "square",
        "decimal",
        "decimal-leading-zero",
        "lower-alpha",
        "upper-alpha",
        "lower-roman",
        "upper-roman",
        "none",
      ],
      description: "CSS list-style-type",
    },

    className: { control: "text", description: "Custom class name" },

    role: {
      control: { type: "inline-radio", labels: { undefined: "none" } },
      options: [undefined, "list", "menu", "listbox", "presentation"],
      description: "ARIA role override",
      table: { type: { summary: "string" }, defaultValue: { summary: "undefined" } },
    },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
};

export default meta;


const ListStory: React.FC<React.ComponentProps<typeof List>> = (args) => {
  const { t } = useTranslation();
  const translatedItems =
    typeof args.items[0] === "string"
      ? args.items.map((item) => t(item as string))
      : args.items;
  return <List {...args} items={translatedItems} />;
};

const Template: StoryFn<typeof List> = (
  args: React.ComponentProps<typeof List>,
) => <ListStory {...args} />;

export const UnorderedList = Template.bind({});
UnorderedList.tags = ["example"];
UnorderedList.parameters = {
  controls: { disable: true },
  docs: { description: { story: "The default voice: ul semantics, text-ladder sizing, markers from listStyleType." } },
};
UnorderedList.args = {
  as: "ul",
  items: ["storyListItem1", "storyListItem2", "storyListItem3"],
};
UnorderedList.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const list = canvas.getByRole("list");
  expect(list.tagName).toBe("UL");
};

export const OrderedList = Template.bind({});
OrderedList.tags = ["example"];
OrderedList.parameters = {
  controls: { disable: true },
  docs: { description: { story: "as ol when sequence matters — steps, rankings, anything where number two depends on number one." } },
};
OrderedList.args = {
  as: "ol",
  items: ["storyListItem1", "storyListItem2", "storyListItem3"],
};
OrderedList.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const list = canvas.getByRole("list");
  expect(list.tagName).toBe("OL");
};

export const DifferentSizes: StoryFn = () => {
  const { t } = useTranslation();
  const items = [t("storyListItem1"), t("storyListItem2"), t("storyListItem3")];

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>XXS</p>
        <List items={items} size="xxs" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>XS</p>
        <List items={items} size="xs" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>S</p>
        <List items={items} size="s" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>M (Default)</p>
        <List items={items} size="m" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>L</p>
        <List items={items} size="l" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>XL</p>
        <List items={items} size="xl" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>XXL</p>
        <List items={items} size="xxl" />
      </div>
    </div>
  );
};

export const DifferentSpacing: StoryFn = () => {
  const { t } = useTranslation();
  const items = [
    t("storyListItem1"),
    t("storyListItem2"),
    t("storyListItem3"),
    t("storyListItem4"),
  ];

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
          Compact Spacing
        </p>
        <List items={items} spacing="compact" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
          Normal Spacing (Default)
        </p>
        <List items={items} spacing="normal" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
          Relaxed Spacing
        </p>
        <List items={items} spacing="relaxed" />
      </div>
    </div>
  );
};
DifferentSpacing.tags = ["example"];
DifferentSpacing.parameters = {
  controls: { disable: true },
  docs: { description: { story: "spacing sets the rhythm between items: compact for dense reference, relaxed for scannable marketing lists. Never margins on items." } },
};

export const DifferentListStyles: StoryFn = () => {
  const { t } = useTranslation();
  const items = [t("storyListItem1"), t("storyListItem2"), t("storyListItem3")];

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Disc</p>
        <List items={items} listStyleType="disc" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Circle</p>
        <List items={items} listStyleType="circle" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Square</p>
        <List items={items} listStyleType="square" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Decimal</p>
        <List items={items} as="ol" listStyleType="decimal" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Lower Alpha</p>
        <List items={items} as="ol" listStyleType="lower-alpha" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Upper Roman</p>
        <List items={items} as="ol" listStyleType="upper-roman" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>None</p>
        <List items={items} listStyleType="none" />
      </div>
    </div>
  );
};
DifferentListStyles.tags = ["example"];
DifferentListStyles.parameters = {
  controls: { disable: true },
  docs: { description: { story: "listStyleType styles or removes the marker; none plus a class is the hook for custom marker treatments while keeping list semantics." } },
};

export const WithComplexItems: StoryFn = () => {
  const { t } = useTranslation();
  const complexItems = [
    <span key="1">
      <strong>{t("storyListBold")}</strong> {t("storyListText")}
    </span>,
    <span key="2">
      <em>{t("storyListItalic")}</em> {t("storyListText")}
    </span>,
    <span key="3">
      <Icon name="check" /> {t("storyListWithIcon")}
    </span>,
  ];

  return <List items={complexItems} />;
};

export const WithLineHeights: StoryFn = () => {
  const { t } = useTranslation();
  const longText =
    t("storyListLongText") ||
    "This is a longer list item that demonstrates the effect of different line heights on text readability and visual density.";
  const items = [longText, longText, longText];

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Tight</p>
        <List items={items} lineHeight="tight" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Snug</p>
        <List items={items} lineHeight="snug" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Normal</p>
        <List items={items} lineHeight="normal" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Relaxed</p>
        <List items={items} lineHeight="relaxed" />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: "600" }}>Loose</p>
        <List items={items} lineHeight="loose" />
      </div>
    </div>
  );
};

const defaultListArgs = {
  as: "ul" as const,
  // "three" resolves through the items control mapping to three list items.
  items: "three" as unknown as React.ReactNode[],
  className: "",
};

export const Default = {
  tags: ["beta-matrix"],
  render: Template,
  args: defaultListArgs,
};
export const Playground = {
  tags: ["beta-matrix"],
  render: Template,
  args: defaultListArgs,
};
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  render: Template,
  args: defaultListArgs,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: Template,
  args: defaultListArgs,
};
