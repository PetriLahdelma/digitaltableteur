import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import ProjectList, { type ProjectListItem } from "@dt/ProjectList";
import contract from "./ProjectList.contract.json";
import storyStyles from "./ProjectList.stories.module.css";

/* The production use: the /work index list view (credits as in the project records). */
const workItems: ProjectListItem[] = [
  {
    id: "dsharp",
    title: "DSharp Design System",
    href: "/work/dsharp-design-system",
    thumbnail: "/images/portfolio/dsharp-design-system/dsharp-thumbnail-logo.png",
    client: "DSharp",
    discipline: "Design systems",
    year: "2026–Present",
    tag: "Embedded partnership",
  },
  {
    id: "vr",
    title: "VR Design System",
    thumbnail: "/images/portfolio/vr-design-system/thumbnail.png",
    client: "VR Group",
    discipline: "Design systems",
    year: "2026",
    comingSoon: true,
  },
  {
    id: "hds",
    title: "Helsinki Design System",
    href: "/work/helsinki-design-system",
    thumbnail: "/images/portfolio/helsinki-design-system/HDS_logo.png",
    client: "City of Helsinki",
    discipline: "Design systems",
    year: "2020–2022",
    tag: "Embedded partnership",
  },
  {
    id: "sap",
    title: "SAP Build Apps Design System",
    href: "/work/sap-build-apps",
    thumbnail: "/images/portfolio/sap-build-apps/Build Product Icon_1000px.png",
    client: "SAP",
    discipline: "Design systems",
    year: "Mar 2022 – Feb 2026",
    tag: "Embedded partnership",
  },
  {
    id: "rhythmguard",
    title: "Rhythmguard",
    href: "/work/rhythmguard",
    thumbnail: "/images/portfolio/rhythmguard/thumbnail.png",
    discipline: "Tools and OSS",
    year: "Dec 2025 – Present",
  },
];

const defaultArgs = {
  items: workItems,
  ariaLabel: "Projects",
  comingSoonLabel: "Coming soon",
  contentLanguage: "",
};

const meta = {
  title: "Content/ProjectList",
  component: ProjectList,
  tags: ["beta", "autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
} satisfies Meta<typeof ProjectList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Narrow: Story = {
  tags: ["example"],
  decorators: [
    (Story) => (
      <div className={storyStyles.phone}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Under 40rem of its own width each row is a thumbnail, the title and one meta line: the client (or the discipline when the record names no client), then the period. The whole row is one tap target.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getAllByRole("link")[0]!;
    await userEvent.tab();
    await expect(first).toHaveFocus();
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: {
    docs: {
      description: {
        story:
          "In production: the list view of the /work index, the default on phones. Wide containers align project, client, discipline and period in columns.",
      },
    },
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: (args) => (
    <div className={storyStyles.stack}>
      <ProjectList {...args} />
      <div className={storyStyles.phone}>
        <ProjectList {...args} />
      </div>
    </div>
  ),
};
