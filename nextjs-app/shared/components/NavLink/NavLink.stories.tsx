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
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=516-3146",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // children keeps an authored text control (label-like ReactNode slot).
  // exact and activeClassName are effect-exempt in audit:controls (the stub
  // pathname "/" keeps this link inactive; both are unit-tested).
  argTypes: {
    children: {
      control: "text",
      description: "Navigation link label",
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

/** The canonical placement: a labelled nav landmark in the site header. */
export const PrimaryNav: Story = {
  tags: ["example"],
  globals: { forcedColors: "none" },
  parameters: {
    controls: { disable: true },
    layout: "padded",
    docs: {
      description: {
        story:
          "NavLinks live inside a labelled navigation landmark. Each link derives its active state from the route and reflects it as aria-current=\"page\" — in this preview no route matches, so all render inactive.",
      },
    },
  },
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

/** exact opts a link out of prefix matching. */
export const ExactMatching: Story = {
  tags: ["example"],
  globals: { forcedColors: "none" },
  parameters: {
    controls: { disable: true },
    layout: "padded",
    docs: {
      description: {
        story:
          "Active state is a prefix match by default: /work also marks /work/case-study active. Short roots need exact — without it, href=\"/\" would be active on every page of the site.",
      },
    },
  },
  render: () => (
    <nav aria-label="Docs" style={{ display: "flex", gap: "1.25rem" }}>
      <NavLink href="/" exact>
        Home (exact)
      </NavLink>
      <NavLink href="/work">Work (prefix)</NavLink>
    </nav>
  ),
};

/** Per-surface styling through the className contract. */
export const CustomStyling: Story = {
  tags: ["example"],
  globals: { forcedColors: "none" },
  parameters: {
    controls: { disable: true },
    layout: "padded",
    docs: {
      description: {
        story:
          "Styling is deliberately className-driven: each surface (header, drawer, footer) passes its own class trio while the route-tracking and aria-current contract stays shared.",
      },
    },
  },
  render: () => (
    <nav aria-label="Footer" style={{ display: "flex", gap: "1.25rem" }}>
      <NavLink
        href="/privacy"
        className="font-body text-text-s uppercase tracking-widest"
      >
        Privacy
      </NavLink>
      <NavLink
        href="/terms"
        className="font-body text-text-s uppercase tracking-widest"
      >
        Terms
      </NavLink>
    </nav>
  ),
};
