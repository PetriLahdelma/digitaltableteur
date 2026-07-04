import type { Meta, StoryObj } from "@storybook/react-vite";
import { NewsBulletin } from "./NewsBulletin";
import { NEWS_BULLETIN_ITEMS } from "@/nextjs-app/shared/data/news-bulletin";
import contract from "./NewsBulletin.contract.json";

const meta = {
  title: "Patterns/NewsBulletin",
  component: NewsBulletin,
  tags: ["beta", "autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=503-20",
    },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite items slot keeps a mapping preset.
  argTypes: {
    items: {
      control: { type: "select" },
      options: ["site", "mixedLinks"],
      mapping: {
        site: NEWS_BULLETIN_ITEMS,
        mixedLinks: [
          {
            ...NEWS_BULLETIN_ITEMS[0],
            link: { kind: "internal", href: "/work" },
          },
          {
            ...NEWS_BULLETIN_ITEMS[1],
            link: { kind: "external", href: "https://www.grandone.fi/" },
          },
          NEWS_BULLETIN_ITEMS[2],
        ],
      },
      description:
        "Bulletin items (defaults to NEWS_BULLETIN_ITEMS). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "NewsBulletinItem[]" } },
    },
  },
} satisfies Meta<typeof NewsBulletin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  // items arg is a mapping key resolved by the preset above.
  args: {
    items: "site" as unknown as typeof NEWS_BULLETIN_ITEMS,
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  name: "Example (homepage bulletin)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <NewsBulletin />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: () => <NewsBulletin />,
};

export const MixedLinks: Story = {
  render: () => (
    <NewsBulletin
      items={[
        {
          ...NEWS_BULLETIN_ITEMS[0],
          link: { kind: "internal", href: "/work" },
        },
        {
          ...NEWS_BULLETIN_ITEMS[1],
          link: { kind: "external", href: "https://www.grandone.fi/" },
        },
        NEWS_BULLETIN_ITEMS[2],
      ]}
    />
  ),
};
