import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { DtMultiComboboxElement } from "../../../../../packages/web-components/src/native/multi-combobox";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

if (!customElements.get("dt-multi-combobox")) {
  customElements.define("dt-multi-combobox", DtMultiComboboxElement);
}

const options = JSON.stringify([
  { value: "research", label: "Research" },
  { value: "design", label: "Design" },
  { value: "frontend", label: "Frontend" },
  { value: "accessibility", label: "Accessibility" },
]);

const optionsWithDisabled = JSON.stringify([
  { value: "research", label: "Research" },
  { value: "design", label: "Design" },
  { value: "operations", label: "DesignOps", disabled: true },
]);

type Args = {
  label: string;
  name: string;
  options: string;
  value: string;
  placeholder: string;
  helperText?: string;
  error?: string;
  required: boolean;
  disabled: boolean;
};

function NativeMultiCombobox({ helperText, ...args }: Args) {
  return (
    <div style={{ inlineSize: "min(34rem, 90vw)" }}>
      <NativeElement
        tagName="dt-multi-combobox"
        attributes={{ ...args, "helper-text": helperText }}
      />
    </div>
  );
}

function ControlledMultiCombobox({
  initialValue = [],
  maxItems,
}: {
  initialValue?: string[];
  maxItems?: number;
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = wrapper.current?.querySelector("dt-multi-combobox");
    const update = (event: Event) => {
      const next = (event as CustomEvent<{ value: string[] }>).detail.value;
      if (maxItems !== undefined && next.length > maxItems) {
        setError(`Limit reached — choose up to ${maxItems}.`);
        return;
      }
      setError(
        next.length === maxItems
          ? "Limit reached — remove one to add another."
          : "",
      );
      setValue(next);
    };
    element?.addEventListener("value-change", update);
    return () => element?.removeEventListener("value-change", update);
  }, [maxItems]);

  return (
    <div ref={wrapper} style={{ inlineSize: "min(34rem, 90vw)" }}>
      <NativeElement
        tagName="dt-multi-combobox"
        attributes={{
          label: maxItems ? `Disciplines (max ${maxItems})` : "Disciplines",
          name: "disciplines",
          options,
          value: JSON.stringify(value),
          placeholder: "Add disciplines…",
          "helper-text": maxItems ? `Pick up to ${maxItems}.` : undefined,
          error: error || undefined,
          controlled: true,
        }}
      />
    </div>
  );
}

const meta = {
  title: "Web Components/Forms/MultiCombobox",
  component: NativeMultiCombobox,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: {
        component:
          "Native form-associated multi-select combobox with filterable options, removable chips, repeated-name form submission, controlled and uncontrolled values, and composed change events.",
      },
    },
  },
  args: {
    label: "Disciplines",
    name: "disciplines",
    options,
    value: "[]",
    placeholder: "Add disciplines…",
    required: false,
    disabled: false,
  },
  argTypes: {
    options: {
      control: "select",
      options: ["disciplines", "withDisabled"],
      mapping: { disciplines: options, withDisabled: optionsWithDisabled },
    },
    value: {
      control: "select",
      options: ["none", "one", "two", "all"],
      mapping: {
        none: "[]",
        one: "[\"research\"]",
        two: "[\"research\",\"design\"]",
        all: "[\"research\",\"design\",\"frontend\",\"accessibility\"]",
      },
    },
  },
} satisfies Meta<typeof NativeMultiCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ControlledMultiCombobox />,
  play: assertNative("dt-multi-combobox"),
};

export const Playground: Story = {};

export const Example: Story = {
  ...exampleStory,
  render: () => (
    <ControlledMultiCombobox initialValue={["design", "accessibility"]} />
  ),
};

export const MaxItems: Story = {
  ...exampleStory,
  render: () => (
    <ControlledMultiCombobox initialValue={["research"]} maxItems={2} />
  ),
};

export const Overflow: Story = {
  ...exampleStory,
  render: () => (
    <ControlledMultiCombobox
      initialValue={["research", "design", "frontend", "accessibility"]}
    />
  ),
};

export const KeyboardMultiSelect: Story = {
  ...exampleStory,
  render: () => <ControlledMultiCombobox />,
  play: async ({ canvasElement }) => {
    const element =
      canvasElement.querySelector<DtMultiComboboxElement>("dt-multi-combobox");
    let input = element?.shadowRoot?.querySelector<HTMLInputElement>("input");
    expect(input).toBeTruthy();
    await userEvent.type(input!, "acc");
    await waitFor(() => {
      const option =
        element?.shadowRoot?.querySelector<HTMLElement>("[role=\"option\"]");
      expect(option).toHaveTextContent("Accessibility");
    });
    input = element?.shadowRoot?.querySelector<HTMLInputElement>("input");
    await userEvent.type(input!, "{Enter}");
    await waitFor(() => {
      expect(
        element?.shadowRoot?.querySelector("[role=\"option\"]"),
      ).toHaveAttribute("aria-selected", "true");
    });
  },
};

export const ForcedColors: Story = {
  ...forcedColorsStory,
  render: () => <ControlledMultiCombobox initialValue={["design"]} />,
};
