import contract from "./NavMenuList.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import NavMenuList from "@dt/NavMenuList";
import { MemoryRouter, useInRouterContext } from "react-router-dom";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import Icon from "@dt/Icon";

const navMenuListComplianceRules: ComplianceRule[] = [
  { title: "CSS Modules only (no inline styles)", status: "pass" },
  { title: "Design tokens for spacing/colors", status: "pass" },
  { title: "Logical CSS properties", status: "pass" },
  { title: "TypeScript strict mode", status: "pass" },
  { title: "Accessibility (aria-current, role)", status: "pass" },
  { title: "i18n for labels", status: "pass" },
  { title: "Unit tests present", status: "pass" },
  { title: "Storybook stories", status: "pass" },
  { title: "Font token compliance (--font-text)", status: "pass" },
  { title: "Proper active state detection", status: "pass" },
  { title: "No hardcoded values", status: "pass" },
];

const meta: Meta<typeof NavMenuList> = {
  argTypes: {},
  title: "Molecules/NavMenuList",
  component: NavMenuList,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-nav-menu-list",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  decorators: [
    (Story) => {
      // If a parent preview already provides a router, don't nest another
      const Guard: React.FC = () => {
        const inRouter = useInRouterContext();
        if (inRouter) return <Story />;
        return (
          <MemoryRouter initialEntries={["/work/client"]}>
            <Story />
          </MemoryRouter>
        );
      };
      return <Guard />;
    },
  ],
};
export default meta;

type Story = StoryObj<typeof NavMenuList>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: () => (
    <NavMenuList
      items={[
        { to: "/", label: "Home", exact: true },
        { to: "/work", label: "Work" },
        { to: "/about", label: "About" },
        { to: "/blog", label: "Blog" },
        { to: "/contact", label: "Contact" },
      ]}
    />
  ),
};

export const CustomActiveClass: Story = {
  render: () => (
    <NavMenuList
      items={[
        { to: "/", label: "Home", exact: true },
        { to: "/work", label: "Work" },
        { to: "/about", label: "About" },
      ]}
      activeClassName="demoActive"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates overriding the active class. In production, supply a class that applies brand-specific styling.",
      },
    },
  },
};

export const Z_NavMenuListCompliance: Story = {
  parameters: { docs: { disable: true } },
  render: () => (
    <ComplianceCard
      title="Compliance: 11/11"
      titleIcon={
        <Icon name="check-fat" color="var(--color-success)" weight="fill" />
      }
      rules={navMenuListComplianceRules}
    />
  ),
};

export const Playground = Default;
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
