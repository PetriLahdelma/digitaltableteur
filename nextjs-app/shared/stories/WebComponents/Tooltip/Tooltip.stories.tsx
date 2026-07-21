import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  Stage,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";
import { DtTooltipElement } from "../../../../../packages/web-components/src/native/tooltip";

if (!customElements.get("dt-tooltip")) {
  customElements.define("dt-tooltip", DtTooltipElement);
}

type TooltipArgs = {
  content: string;
  placement: "top" | "right" | "bottom" | "left";
  delay: number;
  offset: number;
  defaultOpen: boolean;
};

function NativeTooltip(args: TooltipArgs) {
  return (
    <NativeElement
      tagName="dt-tooltip"
      attributes={{
        content: args.content,
        placement: args.placement,
        delay: args.delay,
        offset: args.offset,
        "default-open": args.defaultOpen,
      }}
    >
      <NativeElement
        tagName="dt-button"
        attributes={{ variant: "secondary", label: "Hover or focus me" }}
      />
    </NativeElement>
  );
}

const meta = {
  title: "Web Components/Feedback/Tooltip",
  component: NativeTooltip,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native `dt-tooltip` custom element that preserves the slotted trigger element and wires supplementary hint text through `aria-describedby`.",
      },
    },
  },
  args: {
    content: "Helpful hint about this action.",
    placement: "top",
    delay: 0,
    offset: 4,
    defaultOpen: true,
  },
  argTypes: {
    placement: {
      control: "inline-radio",
      options: ["top", "right", "bottom", "left"],
    },
    delay: { control: "number" },
    offset: { control: "number" },
    defaultOpen: { control: "boolean" },
  },
} satisfies Meta<typeof NativeTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-tooltip") };

export const Playground: Story = { tags: ["beta-matrix"] };

export const Placements: Story = {
  ...exampleStory,
  render: () => (
    <Stage width="30rem">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, auto)",
          gap: "4rem 6rem",
          padding: "4rem",
          justifyContent: "center",
        }}
      >
        {(["top", "right", "bottom", "left"] as const).map((placement) => (
          <NativeElement
            key={placement}
            tagName="dt-tooltip"
            attributes={{
              placement,
              content: `Placed ${placement}.`,
              "default-open": true,
            }}
          >
            <NativeElement
              tagName="dt-button"
              attributes={{
                variant: "secondary",
                size: "sm",
                label: placement,
              }}
            />
          </NativeElement>
        ))}
      </div>
    </Stage>
  ),
};

export const WithIconButton: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeElement
        tagName="dt-tooltip"
        attributes={{ content: "Add to favorites", "default-open": true }}
      >
        <NativeElement
          tagName="dt-icon-button"
          attributes={{ icon: "star", label: "Favorite", variant: "tertiary" }}
        />
      </NativeElement>
      <NativeElement
        tagName="dt-tooltip"
        attributes={{ content: "Share this page", "default-open": true }}
      >
        <NativeElement
          tagName="dt-icon-button"
          attributes={{
            icon: "share-network",
            label: "Share",
            variant: "tertiary",
          }}
        />
      </NativeElement>
    </Row>
  ),
};

export const Delay: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      {[0, 200, 700].map((delay) => (
        <NativeElement
          key={delay}
          tagName="dt-tooltip"
          attributes={{
            delay,
            content: `Opened after ${delay}ms.`,
            "default-open": true,
          }}
        >
          <NativeElement
            tagName="dt-button"
            attributes={{
              variant: "secondary",
              size: "sm",
              label: `${delay}ms`,
            }}
          />
        </NativeElement>
      ))}
    </Row>
  ),
};

export const Example: Story = {
  tags: ["beta-matrix"],
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-tooltip"
      attributes={{ content: "Visible on focus, gone on Escape.", delay: 0 }}
    >
      <NativeElement
        tagName="dt-button"
        attributes={{ variant: "secondary", label: "Focus me" }}
      />
    </NativeElement>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"], ...forcedColorsStory };
