import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";

type CenterArgs = {
  children: string;
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

function isRegistered(tagName: string) {
  return (
    typeof customElements !== "undefined" &&
    Boolean(customElements.get(tagName))
  );
}

const fallbackCss = `
  .dt-center-stage > dt-center {
    display: block;
    inline-size: 100%;
    block-size: 100%;
  }
  .dt-center-fallback > dt-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

function NativeCenter({
  children,
  as = "div",
  boxStyle,
  childStyle,
}: CenterArgs & {
  boxStyle?: CSSProperties;
  childStyle?: CSSProperties;
}) {
  const registered = isRegistered("dt-center");

  return (
    <>
      <style>{fallbackCss}</style>
      {!registered ? (
        <style>
          {".dt-center-fallback > dt-center { min-block-size: inherit; }"}
        </style>
      ) : null}
      <div
        className={`dt-center-stage${!registered ? " dt-center-fallback" : ""}`}
        style={{
          width: "min(32rem, 90vw)",
          ...boxStyle,
        }}
      >
        <NativeElement tagName="dt-center" attributes={{ as }}>
          <span
            className="rounded bg-muted px-4 py-2 text-sm"
            style={{
              ...childStyle,
            }}
          >
            {children}
          </span>
        </NativeElement>
      </div>
    </>
  );
}

const framedBox = {
  minHeight: "10rem",
  border: "1px solid var(--color-border, #d7dde5)",
  borderRadius: "1rem",
  background:
    "color-mix(in srgb, var(--color-light-bg, #f8fafc) 75%, transparent)",
  padding: "1rem",
} satisfies CSSProperties;

const meta = {
  title: "Web Components/Layout/Center",
  component: NativeCenter,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: { component: "Native dt-center flex-centering primitive." },
    },
  },
  args: {
    children: "Centered content",
    as: "div",
  },
  argTypes: {
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
} satisfies Meta<typeof NativeCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <NativeCenter {...args} />,
  play: assertNative("dt-center"),
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <NativeCenter {...args} boxStyle={{ minHeight: "8rem" }} />,
};

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <NativeCenter
      children="Empty-state slot"
      as="div"
      boxStyle={framedBox}
      childStyle={{
        background: "transparent",
        padding: 0,
        color: "var(--color-muted, #64748b)",
      }}
    />
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix", "example"],
  globals: { forcedColors: "active" },
  render: (args) => <NativeCenter {...args} />,
};

export const FocalContent: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <NativeCenter
      children="⟳"
      as="div"
      boxStyle={{ minHeight: "12rem" }}
      childStyle={{
        width: "3rem",
        height: "3rem",
        padding: 0,
        border: "1px dashed var(--color-border, #999)",
        background: "transparent",
        borderRadius: "999px",
        fontSize: "1.5rem",
      }}
    />
  ),
};

export const EmptyView: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => {
    const registered = isRegistered("dt-center");

    return (
      <>
        <style>
          {
            "dt-center [data-empty-view] { text-align: center; } dt-center [data-empty-view] p { margin: 0; }"
          }
        </style>
        <div
          className={`dt-center-stage${!registered ? " dt-center-fallback" : ""}`}
          style={{ width: "min(32rem, 90vw)", minHeight: "12rem" }}
        >
          <NativeElement tagName="dt-center">
            <div data-empty-view>
              <strong>No results</strong>
              <p>Try a broader search.</p>
            </div>
          </NativeElement>
        </div>
      </>
    );
  },
};

export const NeedsABox: Story = {
  tags: ["example"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <NativeCenter
        children="sized: centered"
        as="div"
        boxStyle={{ minHeight: "8rem", width: "15rem" }}
        childStyle={{
          background: "transparent",
          border: "1px dashed var(--color-border, #999)",
          borderRadius: "0.375rem",
          padding: "0.25rem 0.5rem",
        }}
      />
      <NativeCenter
        children="auto: no-op"
        as="div"
        boxStyle={{ width: "15rem" }}
        childStyle={{
          background: "transparent",
          border: "1px dashed var(--color-border, #999)",
          borderRadius: "0.375rem",
          padding: "0.25rem 0.5rem",
        }}
      />
    </div>
  ),
};
