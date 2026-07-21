import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";

type ContainerArgs = {
  children: string;
  size: "sm" | "md" | "lg" | "xl" | "full";
  center: boolean;
  as:
    | "div"
    | "section"
    | "article"
    | "aside"
    | "nav"
    | "main"
    | "header"
    | "footer"
    | "figure"
    | "form";
};

function NativeContainer({
  children,
  size = "lg",
  center = true,
  as = "div",
  childStyle,
}: ContainerArgs & {
  childStyle?: CSSProperties;
}) {
  return (
    <NativeElement
      tagName="dt-container"
      attributes={{ size, center: center ? "true" : "false", as }}
    >
      <NativeElement tagName="dt-text" attributes={{ as: "p" }}>
        <span style={childStyle}>{children}</span>
      </NativeElement>
    </NativeElement>
  );
}

const meta = {
  title: "Web Components/Layout/Container",
  component: NativeContainer,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: { description: { component: "Native dt-container width clamp." } },
  },
  args: {
    size: "lg",
    center: true,
    as: "div",
    children:
      "Content constrained to the production max-width with responsive padding.",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "xl", "full"],
    },
    center: { control: "boolean" },
    as: {
      control: "select",
      options: [
        "div",
        "section",
        "article",
        "aside",
        "nav",
        "main",
        "header",
        "footer",
        "figure",
        "form",
      ],
    },
  },
} satisfies Meta<typeof NativeContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <NativeContainer {...args} />,
  play: assertNative("dt-container"),
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <NativeContainer {...args} />,
};

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <NativeContainer
      size="lg"
      center
      as="div"
      children="Canonical page gutter — matches marketing and app shells."
    />
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix", "example"],
  globals: { forcedColors: "active" },
  render: (args) => <NativeContainer {...args} />,
};

export const SizeLadder: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "min(90vw, 72rem)",
      }}
    >
      {(["sm", "md", "lg"] as const).map((size) => (
        <NativeContainer
          key={size}
          size={size}
          center
          as="div"
          children={`size ${size}`}
          childStyle={{
            display: "block",
            border: "1px dashed var(--color-border, #999)",
            padding: "0.5rem",
            textAlign: "center",
          }}
        />
      ))}
    </div>
  ),
};

export const AsLandmark: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <NativeContainer
      size="md"
      center
      as="main"
      children="This container IS the main landmark."
      childStyle={{
        display: "block",
        border: "1px dashed var(--color-border, #999)",
        padding: "0.5rem",
      }}
    />
  ),
};

export const WithSection: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        border: "1px dashed var(--color-border, #999)",
        width: "min(90vw, 72rem)",
      }}
    >
      <div
        style={{
          paddingBlock: "2rem",
          background: "var(--color-light-bg, #f5f5f5)",
        }}
      >
        <NativeContainer
          size="sm"
          center
          as="div"
          children="Section band, Container clamp, content"
          childStyle={{
            display: "block",
            border: "1px dashed var(--color-border, #999)",
            padding: "0.5rem",
            textAlign: "center",
          }}
        />
      </div>
    </div>
  ),
};
