import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect } from "storybook/test";
import {
  NativeElement,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";
import { codeBlockFixtures } from "../../../components/CodeBlockWindow/codeBlockFixtures";
import { renderCodeBlockFixtureNode } from "../../../components/CodeBlockWindow/CodeBlockFixtureRenderer";

/* Same sources as the React CodeBlock stories, so the pairs compare. */
const demoButton = `type Props = {
  label: string;
};

export function DemoButton({ label }: Props) {
  return (
    <button type="button" aria-label={label}>
      {label}
    </button>
  );
}`;

const nextConfigDiff = `module.exports = {
-  experimental: {
-    appDir: true,
-  },
+  reactStrictMode: true,
 }`;

const rhythmguardSetup = `npm i -D stylelint stylelint-plugin-rhythmguard

# .stylelintrc.json
{
  "extends": ["stylelint-plugin-rhythmguard/configs/strict"]
}

npx stylelint "src/**/*.css"`;

const longFile = Array.from(
  { length: 40 },
  (_, index) => `export const token${index + 1} = "var(--space-internal-${(index % 8) * 4})";`,
).join("\n");

type Args = {
  code?: string;
  language?: string;
  filename?: string;
  header?: boolean;
  lineNumbers?: boolean;
  highlightLines?: string;
  addedLines?: string;
  removedLines?: string;
  caption?: string;
  theme?: "light" | "terminal";
  wrap?: boolean;
  maxHeight?: string;
  copyable?: boolean;
  copyLabel?: string;
};

function attributesFor(args: Args) {
  return {
    code: args.code,
    language: args.language,
    filename: args.filename,
    header: args.header === undefined ? undefined : String(args.header),
    "line-numbers": args.lineNumbers ? "true" : undefined,
    "highlight-lines": args.highlightLines,
    "added-lines": args.addedLines,
    "removed-lines": args.removedLines,
    caption: args.caption,
    theme: args.theme,
    wrap: args.wrap,
    "max-height": args.maxHeight,
    copyable: args.copyable === false ? "false" : undefined,
    "copy-label": args.copyLabel,
  };
}

function Column({ children }: { children: React.ReactNode }) {
  return <div style={{ maxInlineSize: "var(--size-width-form)" }}>{children}</div>;
}

function NativeCodeBlock(args: Args & { children?: React.ReactNode }) {
  const { children, ...rest } = args;
  return (
    <NativeElement tagName="dt-code-block" attributes={attributesFor(rest)}>
      {children}
    </NativeElement>
  );
}

const meta = {
  title: "Web Components/Content/CodeBlock",
  component: NativeCodeBlock,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    contractStatus: "beta",
    docs: {
      description: {
        component:
          "Native `dt-code-block`: filename header or floating copy, line numbers, highlighted/added/removed rows, caption, light or terminal theme. Takes `code` or a host-highlighted Shiki `pre`.",
      },
    },
  },
  args: {
    code: demoButton,
    language: "tsx",
    filename: "DemoButton.tsx",
    header: true,
    theme: "light",
  },
  argTypes: {
    theme: { control: "inline-radio", options: ["light", "terminal"] },
  },
  decorators: [
    (Story) => (
      <Column>
        <Story />
      </Column>
    ),
  ],
} satisfies Meta<typeof NativeCodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  play: assertNative("dt-code-block"),
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  args: {
    lineNumbers: true,
    highlightLines: "5-6",
    removedLines: "7",
    addedLines: "8",
    caption: "Caption",
  },
};

export const Highlighted: Story = {
  tags: ["example"],
  args: { lineNumbers: true, highlightLines: "6-8" },
};

export const Diff: Story = {
  tags: ["example"],
  args: {
    code: nextConfigDiff,
    language: "diff",
    filename: "next.config.js",
    lineNumbers: true,
  },
};

export const Headerless: Story = {
  tags: ["example"],
  args: {
    filename: undefined,
    header: false,
    code: "npm run build:tokens\nnpm run check:contract-props",
    language: "bash",
  },
};

export const Terminal: Story = {
  tags: ["example"],
  args: {
    code: rhythmguardSetup,
    language: "bash",
    filename: undefined,
    header: false,
    theme: "terminal",
  },
};

export const Scrollable: Story = {
  tags: ["example"],
  args: {
    code: longFile,
    language: "ts",
    filename: "tokens.ts",
    lineNumbers: true,
    maxHeight: "240",
  },
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector("dt-code-block") as HTMLElement;
    const body = host.shadowRoot?.querySelector(".body") as HTMLElement;
    await expect(body.getAttribute("role")).toBe("region");
    await expect(body.getAttribute("aria-label")).toBe("tokens.ts");
    await expect(body.tabIndex).toBe(0);
    // user-event's tab order does not enter shadow roots; focus directly.
    body.focus();
    await expect(host.shadowRoot?.activeElement).toBe(body);
  },
};

export const ShikiTree: Story = {
  tags: ["example"],
  args: { code: undefined, language: undefined, filename: "DemoButton.tsx" },
  render: (args) => (
    <NativeCodeBlock {...args}>
      {renderCodeBlockFixtureNode(codeBlockFixtures.tsx.pre)}
    </NativeCodeBlock>
  ),
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  args: {
    code: rhythmguardSetup,
    language: "bash",
    filename: undefined,
    header: false,
    theme: "terminal",
    caption: "One install, one extends line.",
  },
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector("dt-code-block") as HTMLElement;
    const copy = host.shadowRoot?.querySelector("button") as HTMLButtonElement;
    await expect(copy.getAttribute("aria-label")).toBe("Copy code");
    copy.focus();
    await expect(host.shadowRoot?.activeElement).toBe(copy);
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--space-internal-24)" }}>
      <NativeCodeBlock {...args} lineNumbers highlightLines="2" />
      <NativeCodeBlock code={nextConfigDiff} language="diff" filename="next.config.js" />
      <NativeCodeBlock code={rhythmguardSetup} language="bash" theme="terminal" />
    </div>
  ),
};
