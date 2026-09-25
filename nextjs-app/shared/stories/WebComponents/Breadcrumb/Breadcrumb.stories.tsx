import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  Stage,
  Stack,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";
import { DtBreadcrumbElement } from "../../../../../packages/web-components/src/native/breadcrumb";

if (!customElements.get("dt-breadcrumb")) {
  customElements.define("dt-breadcrumb", DtBreadcrumbElement);
}

const site = JSON.stringify([
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Article" },
]);

const deep = JSON.stringify([
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Design systems", href: "/work/design-systems" },
  { label: "DSharp case study" },
]);

const linklessMiddle = JSON.stringify([
  { label: "Home", href: "/" },
  { label: "2026" },
  { label: "July" },
  { label: "Weekly notes" },
]);

const longTrail = JSON.stringify([
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Overlays", href: "/components/overlays" },
  { label: "Menu", href: "/components/overlays/menu" },
  { label: "Dropdown", href: "/components/overlays/menu/dropdown" },
  { label: "Button" },
]);

type Args = {
  items: string;
  ariaLabel?: string;
  underline: "always" | "hover" | "none";
  maxItems?: number;
  collapseLabel?: string;
  homeIcon: boolean;
};

function NativeBreadcrumb({
  ariaLabel,
  maxItems,
  collapseLabel,
  ...args
}: Args) {
  return (
    <NativeElement
      tagName="dt-breadcrumb"
      attributes={{
        items: args.items,
        underline: args.underline,
        "aria-label": ariaLabel,
        "max-items": maxItems,
        "collapse-label": collapseLabel,
        "home-icon": args.homeIcon,
      }}
    />
  );
}

const meta = {
  title: "Web Components/Navigation/Breadcrumb",
  component: NativeBreadcrumb,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native `dt-breadcrumb` custom element with Link-based trail items, responsive or static middle collapse, a shared `dt-menu` ellipsis menu, and optional home-icon rendering.",
      },
    },
  },
  args: {
    items: site,
    underline: "always",
    homeIcon: false,
  },
  argTypes: {
    items: {
      control: "select",
      options: ["site", "deep", "linklessMiddle"],
      mapping: { site, deep, linklessMiddle },
    },
    underline: {
      control: "inline-radio",
      options: ["always", "hover", "none"],
    },
    homeIcon: { control: "boolean" },
  },
} satisfies Meta<typeof NativeBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-breadcrumb") };
export const Playground: Story = { tags: ["beta-matrix"] };

export const Example: Story = {
  tags: ["beta-matrix", "example"],
  args: {
    items: JSON.stringify([
      { label: "Home", href: "/" },
      { label: "Contact", href: "/contact" },
    ]),
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix", "example"],
  globals: { forcedColors: "active" },
};

export const UnderlineModes: Story = {
  tags: ["example"],
  render: () => (
    <Stack>
      <NativeBreadcrumb items={site} underline="always" ariaLabel="Always" homeIcon={false} />
      <NativeBreadcrumb items={site} underline="hover" ariaLabel="Hover" homeIcon={false} />
      <NativeBreadcrumb items={site} underline="none" ariaLabel="None" homeIcon={false} />
    </Stack>
  ),
};

export const HomeIcon: Story = {
  tags: ["example"],
  args: {
    items: site,
    homeIcon: true,
  },
};

export const Collapsed: Story = {
  tags: ["example"],
  args: {
    items: longTrail,
    maxItems: 4,
  },
};

export const Responsive: Story = {
  tags: ["example"],
  render: (args) => (
    <Stage width="340px">
      <div
        style={{
          maxWidth: 340,
          border: "1px dashed var(--color-border)",
          padding: "0.75rem",
          resize: "horizontal",
          overflow: "auto",
        }}
      >
        <NativeBreadcrumb {...args} items={longTrail} homeIcon={false} />
      </div>
    </Stage>
  ),
};

export const DeepTrail: Story = {
  tags: ["example"],
  args: { items: deep },
};

export const LinklessMiddle: Story = {
  tags: ["example"],
  args: { items: linklessMiddle },
};

export const CustomLabel: Story = {
  tags: ["example"],
  args: {
    ariaLabel: "Archive location",
    items: JSON.stringify([
      { label: "Archive", href: "/archive" },
      { label: "Projects", href: "/archive/projects" },
      { label: "2025" },
    ]),
  },
};

export const Comparison: Story = {
  tags: ["example"],
  render: () => (
    <Row>
      {/* Distinct labels keep the two nav landmarks distinguishable
          (axe landmark-unique), same as UnderlineModes above. */}
      <NativeBreadcrumb
        items={site}
        underline="always"
        ariaLabel="Site trail"
        homeIcon={false}
      />
      <NativeBreadcrumb
        items={deep}
        underline="hover"
        ariaLabel="Deep trail"
        homeIcon={true}
      />
    </Row>
  ),
};
