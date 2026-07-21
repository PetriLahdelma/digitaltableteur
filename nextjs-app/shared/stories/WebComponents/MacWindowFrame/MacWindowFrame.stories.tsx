import { useLayoutEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import {
  NativeElement,
  Stage,
  TriggerButton,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";
import { DtMacWindowFrameElement } from "../../../../../packages/web-components/src/native/mac-window-frame";

if (!customElements.get("dt-mac-window-frame")) {
  customElements.define("dt-mac-window-frame", DtMacWindowFrameElement);
}

type Args = {
  titleKey?: string;
  actionLabelKey?: string;
  density: "comfortable" | "compact";
  children: string;
  onAction?: () => void;
};

const sampleContent = `You are a poet that creates short poems.

User: Write a poem about autumn.
AI: The leaves fall gently to the ground, painting the earth in hues profound.
The crisp air whispers through the trees, a symphony of nature's ease.`;

function NativeMacWindowFrame({
  titleKey,
  actionLabelKey,
  density,
  children,
  onAction,
}: Args) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = rootRef.current?.querySelector(
      "dt-mac-window-frame",
    ) as DtMacWindowFrameElement | null;
    if (!frame) return;
    frame.onAction = onAction ?? null;
  }, [onAction]);

  return (
    <Stage width="min(44rem, 90vw)">
      <div ref={rootRef}>
        <NativeElement
          tagName="dt-mac-window-frame"
          attributes={{
            "title-key": titleKey,
            "action-label-key": actionLabelKey,
            density,
          }}
        >
          {children}
        </NativeElement>
      </div>
    </Stage>
  );
}

const meta = {
  title: "Web Components/Layout/MacWindowFrame",
  component: NativeMacWindowFrame,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: {
        component:
          "Native `dt-mac-window-frame` decorative macOS-style showcase chrome with title, toolbar, and content slots. It stays presentational: no dialog or window semantics are implied.",
      },
    },
  },
  args: {
    titleKey: "macWindowFrame.title",
    density: "comfortable",
    children: sampleContent,
  },
  argTypes: {
    children: {
      control: "text",
      description: "Content rendered in the default content slot.",
    },
    density: {
      control: "inline-radio",
      options: ["comfortable", "compact"],
    },
  },
} satisfies Meta<typeof NativeMacWindowFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-mac-window-frame") };

export const Playground: Story = {
  tags: ["beta-matrix"],
  args: { actionLabelKey: "macWindowFrame.action", onAction: fn() },
};

export const ShowcaseFrame: Story = {
  ...exampleStory,
  args: { children: sampleContent },
};

export const WithAction: Story = {
  ...exampleStory,
  args: {
    children: sampleContent,
    actionLabelKey: "macWindowFrame.action",
    onAction: fn(),
  },
};

export const Compact: Story = {
  ...exampleStory,
  args: { density: "compact", children: sampleContent },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  render: () => (
    <Stage width="min(44rem, 90vw)">
      <NativeElement tagName="dt-mac-window-frame" attributes={{ density: "comfortable" }}>
        <span slot="title">Showcase transcript</span>
        <TriggerButton slot="toolbar">Download</TriggerButton>
        <pre
          slot="content"
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
          }}
        >
          {sampleContent}
        </pre>
      </NativeElement>
    </Stage>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
