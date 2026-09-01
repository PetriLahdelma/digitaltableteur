import contract from "./SiteHeader.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SiteHeader } from "./SiteHeader";

const meta: Meta<typeof SiteHeader> = {
  title: "Patterns/SiteHeader",
  component: SiteHeader,
  tags: ["stable", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=476-2",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite navItems slot keeps a mapping preset.
  argTypes: {
    navItems: {
      control: { type: "select" },
      options: ["site", "twoItems"],
      mapping: {
        site: undefined,
        twoItems: [
          { href: "/", label: "Home", exact: true },
          { href: "/work", label: "Work" },
        ],
      },
      description:
        "Navigation items (href, label, exact); the site default when unset. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "NavItem[]" } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SiteHeader>;

// Axe runs here, and only here, on purpose. Every story in this file used to
// opt out, which left a `stable` contract claiming axe evidence that could
// never be produced — a July backfill had been recording passes for stories
// that are never checked. Default is the canonical composition, so it is the
// one that carries the claim; the others stay opted out because they render
// the same chrome and would only duplicate the findings.
export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
};
export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => <SiteHeader />,
};
export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
