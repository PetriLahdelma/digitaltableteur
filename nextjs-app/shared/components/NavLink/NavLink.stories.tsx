import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { NavLink } from "./NavLink";
import contract from "./NavLink.contract.json";

const defaultArgs = {
  href: "/work",
  children: "Work",
  exact: false,
};

const meta = {
  title: "Navigation/NavLink",
  component: NavLink,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-nav-link",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    href: {
      control: "text",
      description: "Route path for next/link",
    },
    children: {
      control: "text",
      description: "Navigation link label",
    },
    exact: {
      control: "boolean",
      description: "Match href exactly for aria-current='page'",
    },
    className: {
      control: "text",
      description: "Base CSS class names",
      table: { disable: true },
    },
    activeClassName: {
      control: "text",
      description: "Class when route is active",
      table: { disable: true },
    },
    inactiveClassName: {
      control: "text",
      description: "Class when route is inactive",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;

// Standalone NavLink stories are not embedded in body copy. axe's
// `link-in-text-block` rule fires anyway because the iframe `<body>` carries
// the global text color through CSS variables — that color counts as the
// "surrounding text" for a bare-component preview even when no actual prose
// surrounds the link. The Example story (real `<nav>` with multiple links)
// remains gated. Disabling the rule on the bare stories keeps the test signal
// honest without papering over a real component issue.
const linkInTextBlockOverride = {
  a11y: {
    config: {
      rules: [{ id: "link-in-text-block", enabled: false }],
    },
  },
};

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: linkInTextBlockOverride,
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: linkInTextBlockOverride,
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <nav aria-label="Primary" style={{ display: "flex", gap: "1.25rem" }}>
      <NavLink href="/" exact>
        Home
      </NavLink>
      <NavLink href="/work">Work</NavLink>
      <NavLink href="/about">About</NavLink>
      <NavLink href="/contact">Contact</NavLink>
    </nav>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
  parameters: linkInTextBlockOverride,
};
