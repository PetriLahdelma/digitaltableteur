import type { Meta, StoryObj } from "@storybook/react-vite";
import Layout from "./Layout";
import contract from "./Layout.contract.json";

const sampleMain = (
  <div style={{ padding: "var(--space-layout-24)" }}>
    <h1 className="font-heading text-title-l">Page content</h1>
    <p className="text-sm text-muted-foreground">
      Vite-era shell with skip link, header, main landmark, footer, and chat widget.
    </p>
  </div>
);

const meta = {
  title: "Patterns/Layout",
  component: Layout,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: {
      control: false,
      description: "Route page content rendered inside <main>",
    },
  },
  args: { children: sampleMain },
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Layout>{args.children}</Layout>,
};
export const Playground: Story = { ...Default };

export const Example: Story = {
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <Layout>{sampleMain}</Layout>,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: { children: sampleMain },
  render: (args) => <Layout>{args.children}</Layout>,
};
