import type { Meta, StoryObj } from "@storybook/react-vite";
import { ServicesLedger } from "./ServicesLedger";
import contract from "./ServicesLedger.contract.json";

const services = [
  {
    index: "01",
    machineKey: "BUILD_THE_SYSTEM",
    title: "Build the system",
    description: "Design systems that hold up in production: tokens, component architecture and governance.",
    capabilities: ["Tokens", "Component architecture", "Governance"],
    href: "#system",
  },
  {
    index: "02",
    machineKey: "IMPROVE_HOW_TEAMS_SHIP",
    title: "Improve how teams ship",
    description: "DesignOps and AI workflows your team keeps running after the engagement.",
    capabilities: ["Agent-ready components", "Accessibility checks"],
    href: "#ship",
  },
  {
    index: "03",
    machineKey: "DESIGN_THE_PRODUCT",
    title: "Design the product",
    description: "Research, product strategy and UX, carried through to interfaces and code.",
    capabilities: ["Research", "Product strategy", "UX"],
    href: "#product",
  },
];

const labels = {
  view: "View",
  human: "Human",
  machine: "Machine",
  machineTitle: "Studio :: Services",
  machineComment: "# What the studio does, machine-readable.",
  copy: "Copy as Markdown",
  copied: "Copied",
};

const meta = {
  title: "Patterns/ServicesLedger",
  component: ServicesLedger,
  tags: ["alpha", "autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    design: { type: "figma", url: contract.figma },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    title: {
      control: "text",
      description: "Section heading (h2); also names the section landmark",
      table: { category: "Content" },
    },
    description: {
      control: "text",
      description: "Optional intro line under the heading",
      table: { category: "Content" },
    },
    services: {
      description: "Offers in order: index, machine key, title, description, capabilities and link",
      table: { category: "Content", type: { summary: "ServicesLedgerItem[]" } },
    },
    machineLinks: {
      description: "Machine-readable endpoints listed at the top of the machine view",
      table: { category: "Content", type: { summary: "ServicesLedgerLink[]" } },
    },
    labels: {
      description: "Switch, machine view and copy-button copy, translated by the page",
      table: { category: "Content", type: { summary: "ServicesLedgerLabels" } },
    },
    id: {
      control: "text",
      description: "Section id; the heading and panel ids derive from it",
      table: { category: "Advanced", defaultValue: { summary: "services" } },
    },
    donnyTarget: {
      control: "text",
      description: "Donny site action target id for this section",
      table: { category: "Advanced", defaultValue: { summary: "home.services" } },
    },
    className: { table: { disable: true } },
  },
  args: {
    title: "Services",
    description: "",
    id: "services",
    donnyTarget: "home.services",
    services,
    labels,
    machineLinks: [
      { label: "LLMS", href: "/llms.txt" },
      { label: "MCP", href: "/mcp" },
    ],
  },
} satisfies Meta<typeof ServicesLedger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ["beta-matrix"] };

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (homepage services)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
