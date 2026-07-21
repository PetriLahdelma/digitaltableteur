import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  content: string;
  spacing: "none" | "sm" | "md" | "lg" | "xl" | "hero" | "follow";
  background: "default" | "muted" | "accent" | "inverse";
  spotlightTarget?: string;
};

function NativeSection({ content, spotlightTarget, ...args }: Args) {
  return (
    <NativeElement
      tagName="dt-section"
      attributes={{ ...args, "spotlight-target": spotlightTarget }}
    >
      <NativeElement tagName="dt-text" attributes={{ as: "p", content }} />
    </NativeElement>
  );
}

const meta = {
  title: "Web Components/Layout/Section",
  component: NativeSection,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "centered",
    docs: { description: { component: "Native dt-section layout band." } },
  },
  args: {
    content: "Semantic section with tokenized vertical spacing.",
    spacing: "md",
    background: "default",
  },
  argTypes: {
    spacing: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl", "hero", "follow"],
    },
    background: {
      control: "inline-radio",
      options: ["default", "muted", "accent", "inverse"],
    },
  },
} satisfies Meta<typeof NativeSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-section") };
export const Playground: Story = { tags: ["beta-matrix"] };
export const SpacingBands: Story = {
  ...exampleStory,
  render: () => (
    <div style={{ border: "1px dashed var(--color-border)" }}>
      {(["sm", "md", "lg"] as const).map((spacing) => (
        <NativeElement
          key={spacing}
          tagName="dt-section"
          attributes={{ spacing, content: `spacing ${spacing}` }}
        />
      ))}
    </div>
  ),
};
export const HeroFollowPair: Story = {
  ...exampleStory,
  render: () => (
    <div style={{ border: "1px dashed var(--color-border)" }}>
      <NativeElement
        tagName="dt-section"
        attributes={{ spacing: "hero", content: "Hero band" }}
      />
      <NativeElement
        tagName="dt-section"
        attributes={{ spacing: "follow", content: "First content band" }}
      />
    </div>
  ),
};
export const Backgrounds: Story = {
  ...exampleStory,
  render: () => (
    <div>
      {(["default", "muted", "accent", "inverse"] as const).map(
        (background) => (
          <NativeElement
            key={background}
            tagName="dt-section"
            attributes={{
              spacing: "sm",
              background,
              content: `background ${background}`,
            }}
          />
        ),
      )}
    </div>
  ),
};
export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  args: {
    content: "Used across marketing patterns for vertical rhythm.",
    spacing: "lg",
    background: "muted",
    spotlightTarget: "example-section",
  },
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
