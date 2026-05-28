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
  title: "Atoms/NavLink",
  component: NavLink,
  tags: ["beta", "!autodocs"],
  parameters: {
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

export const Default: Story = {};
export const Playground: Story = {};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
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
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
