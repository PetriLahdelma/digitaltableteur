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
      description: "Diagram color overrides",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Mermaid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {
  args: {
    ...defaultArgs,
    caption: "A simple three-step request flow.",
  },
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => <Mermaid {...defaultArgs} />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
