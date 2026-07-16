import { useEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import {
  DtComboboxElement,
  type DtComboboxOption,
} from "../../../../../packages/web-components/src/native/combobox";
import {
  NativeElement,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";

if (!customElements.get("dt-combobox")) {
  customElements.define("dt-combobox", DtComboboxElement);
}

const timelineOptions: DtComboboxOption[] = [
  { value: "asap", label: "ASAP" },
  { value: "1-2-months", label: "1–2 months" },
  { value: "flexible", label: "Flexible" },
];
const options = JSON.stringify(timelineOptions);
const optionsWithDisabled = JSON.stringify([
  ...timelineOptions,
  { value: "later", label: "Later this year", disabled: true },
]);

type Args = {
  label: string;
  options: string;
  value: string;
  defaultValue?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required: boolean;
  disabled: boolean;
  name: string;
};

function NativeCombobox({ defaultValue, helperText, ...args }: Args) {
  return (
    <div style={{ width: "22rem", maxWidth: "90vw" }}>
      <NativeElement
        tagName="dt-combobox"
        attributes={{
          ...args,
          "default-value": defaultValue,
          "helper-text": helperText,
        }}
      />
    </div>
  );
}

function AsyncCombobox() {
  const wrapper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = wrapper.current?.querySelector(
      "dt-combobox",
    ) as DtComboboxElement | null;
    const timer = window.setTimeout(() => {
      if (element) {
        element.options = timelineOptions;
        element.placeholder = "Select...";
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div ref={wrapper} style={{ width: "22rem", maxWidth: "90vw" }}>
      <NativeElement
        tagName="dt-combobox"
        attributes={{
          label: "Timeline",
          placeholder: "Loading...",
          "helper-text": "Options arrive from the network after ~1 second.",
        }}
      />
    </div>
  );
}

const meta = {
  title: "Web Components/Forms/Combobox",
  component: NativeCombobox,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: {
        component:
          "Form-associated native editable combobox with serializable options, type-ahead filtering, disabled-option skipping, and composed value-change events.",
      },
    },
  },
  args: {
    label: "Timeline",
    options,
    value: "",
    placeholder: "Select...",
    name: "timeline",
    required: false,
    disabled: false,
  },
  argTypes: {
    options: {
      control: "select",
      options: ["timeline", "withDisabled"],
      mapping: { timeline: options, withDisabled: optionsWithDisabled },
    },
  },
} satisfies Meta<typeof NativeCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: assertNative("dt-combobox"),
};

export const Playground: Story = {};

export const Example: Story = {
  ...exampleStory,
  args: {
    value: "1-2-months",
    helperText: "When should the project start?",
  },
};

export const WithError: Story = {
  ...exampleStory,
  args: { required: true, error: "Pick a timeline to continue." },
};

export const Disabled: Story = {
  ...exampleStory,
  args: {
    value: "asap",
    disabled: true,
    helperText: "Timeline is locked for this request.",
  },
};

export const AsyncOptions: Story = {
  ...exampleStory,
  render: () => <AsyncCombobox />,
};

export const KeyboardSelection: Story = {
  ...exampleStory,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector(
      "dt-combobox",
    ) as DtComboboxElement;
    const input = element.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;
    input.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await waitFor(() => {
      expect(element.value).toBe("1-2-months");
      expect(input).toHaveValue("1–2 months");
      expect(element.open).toBe(false);
    });
  },
};

export const Filtering: Story = {
  ...exampleStory,
  play: async ({ canvasElement }) => {
    const element = canvasElement.querySelector(
      "dt-combobox",
    ) as DtComboboxElement;
    const input = element.shadowRoot?.querySelector(
      "input",
    ) as HTMLInputElement;
    await userEvent.type(input, "flex");
    await waitFor(() => {
      const optionSelector = "[role='option']";
      expect(element.shadowRoot?.querySelectorAll(optionSelector)).toHaveLength(
        1,
      );
      expect(
        element.shadowRoot?.querySelector(optionSelector),
      ).toHaveTextContent("Flexible");
    });
  },
};

export const ForcedColors: Story = { ...forcedColorsStory };
