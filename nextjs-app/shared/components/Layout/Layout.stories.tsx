import type { Meta, StoryObj } from "@storybook/react-vite";
import Layout from "./Layout";
import contract from "./Layout.contract.json";

const sampleMain = (
  <div style={{ padding: "var(--space-layout-24)" }}>
    <h1 className="font-heading text-title-l">Page content</h1>
    <p className="text-sm text-muted-foreground">
      Vite-era shell with skip link, header, main landmark, footer, and chat
      widget.
    </p>
  </div>
);

const meta = {
  title: "Patterns/Layout",
  component: Layout,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-layout",
    },
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
  tags: ["beta-matrix"],
  render: (args) => <Layout>{args.children}</Layout>,
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  ...Default,
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <Layout>{sampleMain}</Layout>,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: { children: sampleMain },
  render: (args) => <Layout>{args.children}</Layout>,
};
