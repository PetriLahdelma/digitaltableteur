import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { DtCodeBlockWindowElement } from "../../../../../packages/web-components/src/native/code-block-window";
import { DtCodeSnippetElement } from "../../../../../packages/web-components/src/native/code-snippet";
import {
  NativeElement,
  Stage,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";
import { codeBlockFixtures } from "../../../components/CodeBlockWindow/codeBlockFixtures";
import { renderCodeBlockFixtureNode } from "../../../components/CodeBlockWindow/CodeBlockFixtureRenderer";

if (!customElements.get("dt-code-block-window")) {
  customElements.define("dt-code-block-window", DtCodeBlockWindowElement);
}
if (!customElements.get("dt-code-snippet")) {
  customElements.define("dt-code-snippet", DtCodeSnippetElement);
}

const fixtureMap = {
  tsx: renderCodeBlockFixtureNode(codeBlockFixtures.tsx.pre),
  bash: renderCodeBlockFixtureNode(codeBlockFixtures.bash.pre),
  json: renderCodeBlockFixtureNode(codeBlockFixtures.json.pre),
  longLine: renderCodeBlockFixtureNode(codeBlockFixtures.longLine.pre),
};

type FixtureKey = keyof typeof fixtureMap;

type Args = {
  title?: string;
  caption?: string;
  language?: string;
  showLineNumbers: boolean;
  context: "default" | "article";
  fixture: FixtureKey;
};

function windowAttributes(args: Args) {
  return {
    title: args.title,
    caption: args.caption,
    language: args.language,
    context: args.context,
    "show-line-numbers": args.showLineNumbers ? "true" : "false",
  };
}

function NativeCodeBlockWindow(args: Args) {
  return (
    <Stage width="min(56rem, 95vw)">
      <NativeElement
        tagName="dt-code-block-window"
        attributes={windowAttributes(args)}
      >
        {fixtureMap[args.fixture]}
      </NativeElement>
    </Stage>
  );
}

const meta = {
  title: "Web Components/Content/CodeBlockWindow",
  component: NativeCodeBlockWindow,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: {
        component:
          "Native `dt-code-block-window` frames highlighted `pre/code` content with filename, language, caption, copy feedback, article-scroll behavior, and composition support for a child `dt-code-snippet` source.",
      },
    },
  },
  args: {
    title: "components/DemoButton.tsx",
    language: "tsx",
    caption: "",
    showLineNumbers: true,
    context: "default",
    fixture: "tsx",
  },
  argTypes: {
    fixture: {
      control: "select",
      options: ["tsx", "bash", "json", "longLine"],
    },
    context: { control: "inline-radio", options: ["default", "article"] },
  },
} satisfies Meta<typeof NativeCodeBlockWindow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-code-block-window") };
export const Playground: Story = {};
export const NoTitle: Story = {
  tags: ["example"],
  args: { title: "", language: "bash", fixture: "bash" },
};
export const JsonExample: Story = {
  tags: ["example"],
  args: { title: "payload.json", language: "json", fixture: "json" },
};
export const LongLine: Story = {
  tags: ["example"],
  args: {
    title: "long-line.ts",
    language: "ts",
    fixture: "longLine",
    context: "article",
  },
};
export const DarkPreview: Story = {
  tags: ["example"],
  render: (args) => (
    <div className="themeDark">
      <NativeCodeBlockWindow {...args} />
    </div>
  ),
  args: {
    title: "theme-dark.tsx",
    language: "tsx",
    showLineNumbers: true,
    fixture: "tsx",
  },
};
export const ComposedSnippet: Story = {
  tags: ["example"],
  render: () => (
    <Stage width="min(56rem, 95vw)">
      <NativeElement
        tagName="dt-code-block-window"
        attributes={{
          title: "scripts/install.sh",
          language: "bash",
          caption: "The window consumes the snippet source and keeps a single copy affordance.",
        }}
      >
        <NativeElement
          tagName="dt-code-snippet"
          attributes={{
            code: "npm install @digitaltableteur/components --save-dev",
            language: "bash",
            variant: "single",
            "show-line-numbers": "false",
            "allow-copy": "true",
          }}
        />
      </NativeElement>
    </Stage>
  ),
};
export const Example: Story = {
  tags: ["example"],
  args: {
    title: "tokens.config.ts",
    language: "tsx",
    caption: "Filename plus language orients the reader before they scan the code.",
    fixture: "tsx",
  },
};
export const ForcedColors: Story = {
  tags: ["example"],
  globals: { forcedColors: "active" },
  args: {
    title: "components/DemoButton.tsx",
    language: "tsx",
    showLineNumbers: true,
    fixture: "tsx",
  },
};
