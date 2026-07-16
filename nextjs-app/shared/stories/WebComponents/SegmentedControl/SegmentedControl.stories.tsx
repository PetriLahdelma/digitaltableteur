import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Stage,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";
import { DtSegmentedControlElement } from "../../../../../packages/web-components/src/native/segmented-control";

if (!customElements.get("dt-segmented-control")) {
  customElements.define("dt-segmented-control", DtSegmentedControlElement);
}

const defaultItems = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
  { value: "board", label: "Board" },
];

type Args = {
  items: string;
  value?: string;
  defaultValue?: string;
  size: "sm" | "md" | "lg";
  orientation: "horizontal" | "vertical";
  ariaLabel: string;
  disabled: boolean;
};

function NativeSegmentedControl({ defaultValue, ...args }: Args) {
  return (
    <Stage width={args.orientation === "vertical" ? "18rem" : undefined}>
      <NativeElement
        tagName="dt-segmented-control"
        attributes={{
          ...args,
          items: args.items,
          value: args.value,
          disabled: args.disabled,
          "default-value": defaultValue,
          "aria-label": args.ariaLabel,
        }}
      />
    </Stage>
  );
}

function ControlledSegmentedControl() {
  const [value, setValue] = useState("list");
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element =
      wrapperRef.current?.querySelector("dt-segmented-control");
    const onChange = (event: Event) =>
      setValue((event as CustomEvent<{ value: string }>).detail.value);
    element?.addEventListener("value-change", onChange);
    return () => element?.removeEventListener("value-change", onChange);
  }, []);

  return (
    <div ref={wrapperRef}>
      <p style={{ marginBlock: "0 0 0.75rem" }}>
        Selected view: <strong>{value}</strong>
      </p>
      <NativeSegmentedControl
        items={JSON.stringify(defaultItems)}
        value={value}
        size="md"
        orientation="horizontal"
        ariaLabel="View mode"
        disabled={false}
      />
    </div>
  );
}

const meta = {
  title: "Web Components/Navigation/SegmentedControl",
  component: NativeSegmentedControl,
  tags: ["autodocs", "beta", "web-components"],
  parameters: { ...nativeStoryParameters, layout: "centered" },
  args: {
    items: JSON.stringify(defaultItems),
    defaultValue: "list",
    size: "md",
    orientation: "horizontal",
    ariaLabel: "View",
    disabled: false,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof NativeSegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-segmented-control") };
export const Playground: Story = {};
export const Controlled: Story = {
  tags: ["example"],
  render: () => <ControlledSegmentedControl />,
};
export const Vertical: Story = {
  tags: ["example"],
  args: { orientation: "vertical" },
};
export const WithDisabledOption: Story = {
  tags: ["example"],
  args: {
    items: JSON.stringify([
      { value: "day", label: "Day" },
      { value: "week", label: "Week" },
      { value: "month", label: "Month", disabled: true },
    ]),
    defaultValue: "day",
    ariaLabel: "Time range",
  },
};
export const Example: Story = {
  tags: ["example"],
  render: () => (
    <Stage>
      <NativeElement
        tagName="dt-segmented-control"
        attributes={{
          items: JSON.stringify(defaultItems),
          "default-value": "grid",
          size: "md",
          "aria-label": "Layout mode",
        }}
      >
        <span slot="segment-list">List</span>
        <span slot="segment-grid">Grid</span>
        <span slot="segment-board">Board</span>
      </NativeElement>
    </Stage>
  ),
};
export const ForcedColors: Story = {
  tags: ["example"],
  globals: { forcedColors: "active" },
};
