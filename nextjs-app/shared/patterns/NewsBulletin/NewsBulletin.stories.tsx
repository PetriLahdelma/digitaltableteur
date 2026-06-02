import type { Meta, StoryObj } from "@storybook/react-vite";
import { NewsBulletin } from "./NewsBulletin";
import { NEWS_BULLETIN_ITEMS } from "@/nextjs-app/shared/data/news-bulletin";

const meta: Meta<typeof NewsBulletin> = {
  title: "Patterns/NewsBulletin",
  component: NewsBulletin,
  tags: ["wip"],
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=503-20",
    },
  },
};

export default meta;
type Story = StoryObj<typeof NewsBulletin>;

export const Default: Story = {
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
