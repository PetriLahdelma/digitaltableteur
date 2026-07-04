import { Container } from "./Container";
import Text from "@dt/Text";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./Container.contract.json";

const defaultArgs = {
  size: "lg" as const,
  center: true,
  children: (
    <Text as="p" terminals="sans">
      Content constrained to the production max-width with responsive padding.
    </Text>
  ),
};

const meta = {
  title: "Layout/Container",
  component: Container,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-container",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: {
      control: false,
      description: "Page content inside the width constraint",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Max-width token",
      table: { defaultValue: { summary: "lg" } },
    },
    center: {
      control: "boolean",
      description: "Center the container horizontally",
    },
    className: {
      control: "text",
      description: "Wrapper class names",
      table: { disable: true },
    },
    as: {
      control: "text",
      description: "Polymorphic element",
      table: { disable: true },
    },
      asChild: { table: { disable: true } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
  args: defaultArgs,
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  tags: ["beta-matrix"],
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <Container size="lg">
      <Text as="p" terminals="sans">
        Canonical page gutter — matches marketing and app shells.
      </Text>
    </Container>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};

/** Each size clamps to a fixed measure: sm 640 for prose, md 960, lg 1200 (the page default), xl 1440 for dashboard density. */
export const SizeLadder: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Each size clamps to a fixed measure: sm 640 for prose, md 960, lg 1200 (the page default), xl 1440 for dashboard density. The dashed outline shows the clamp." } },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Container key={size} size={size}>
          <div style={{ border: "1px dashed var(--color-border, #999)", padding: "0.5rem", textAlign: "center" }}>
            size {size}
          </div>
        </Container>
      ))}
    </div>
  ),
};

/** The as prop lets the container double as the landmark — one element serves both the clamp and the semantics, instead of a div wrapping a main. */
export const AsLandmark: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "The as prop lets the container double as the landmark — one element serves both the clamp and the semantics, instead of a div wrapping a main." } },
  },
  render: () => (
    <Container as="main" size="md">
      <div style={{ border: "1px dashed var(--color-border, #999)", padding: "0.5rem" }}>
        This container IS the main landmark.
      </div>
    </Container>
  ),
};

/** The canonical pairing: Section owns the vertical band (spacing, background), Container owns the horizontal clamp inside it. */
export const WithSection: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "The canonical pairing: Section owns the vertical band (spacing, background), Container owns the horizontal clamp inside it." } },
  },
  render: () => (
    <div style={{ border: "1px dashed var(--color-border, #999)" }}>
      <div style={{ paddingBlock: "2rem", background: "var(--color-light-bg, #f5f5f5)" }}>
        <Container size="sm">
          <div style={{ border: "1px dashed var(--color-border, #999)", padding: "0.5rem", textAlign: "center" }}>
            Section band, Container clamp, content
          </div>
        </Container>
      </div>
    </div>
  ),
};
