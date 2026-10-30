import type { Meta, StoryObj } from "@storybook/react-vite";
import { Mermaid } from "./Mermaid";
import contract from "./Mermaid.contract.json";

const defaultArgs = {
  chart: `flowchart LR
    browser("Browser") --> app("Application server")
    app --> database("Database")`,
  title: "Application request flow",
  description:
    "The browser sends a request to the application server, which reads from the database.",
  detailsLabel: "Diagram text alternative",
  caption: "",
  accessibleDetails: (
    <ol>
      <li>The browser sends a request to the application server.</li>
      <li>The application server reads the required data from the database.</li>
      <li>The application server returns the response to the browser.</li>
    </ol>
  ),
};

const meta = {
  title: "Media/Mermaid",
  component: Mermaid,
  tags: ["alpha", "wip", "autodocs"],
  parameters: {
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    chart: {
      control: "text",
      description: "Mermaid diagram source",
      table: { category: "Content" },
    },
    title: {
      control: "text",
      description: "Concise meaningful name announced for the diagram",
      table: { category: "Accessibility" },
    },
    description: {
      control: "text",
      description: "Short prose summary announced with the diagram",
      table: { category: "Accessibility" },
    },
    accessibleDetails: {
      description: "Complete structured or prose text equivalent",
      table: { disable: true },
    },
    detailsLabel: {
      control: "text",
      description: "Visible label for the text-alternative disclosure",
      table: { category: "Content" },
    },
    caption: {
      control: "text",
      description: "Optional visible figure caption",
      table: { category: "Content" },
    },
    className: {
      description: "Additional className for the figure",
      table: { disable: true },
    },
    themeColors: {
      description:
        "Diagram color overrides: CSS colours or var(--token) references. Defaults to --color-text and --color-border, so diagrams follow the theme.",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Mermaid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ["beta-matrix"] };

export const Playground: Story = {
  tags: ["beta-matrix"],
  args: {
    ...defaultArgs,
    caption: "A simple three-step request flow.",
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => <Mermaid {...defaultArgs} />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
