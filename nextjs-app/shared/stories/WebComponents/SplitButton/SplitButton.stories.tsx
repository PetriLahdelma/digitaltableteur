import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NativeElement,
  Row,
  Stack,
  assertNative,
  exampleStory,
  forcedColorsStory,
  nativeStoryParameters,
} from "../NativeStory";
import { DtSplitButtonElement } from "../../../../../packages/web-components/src/native/split-button";

if (!customElements.get("dt-split-button")) {
  customElements.define("dt-split-button", DtSplitButtonElement);
}

type SplitButtonArgs = {
  label: string;
  variant: "primary" | "secondary" | "tertiary";
  size: "sm" | "md" | "lg";
  surface: "default" | "onDark" | "onBrand";
  rounded: boolean;
  disabled: boolean;
  menuAlign: "start" | "end";
  toggleLabel?: string;
  options: string;
};

const saveOptions = JSON.stringify([
  { id: "save-as", label: "Save as", icon: "pencil" },
  { id: "save-cloud", label: "Save to cloud", icon: "cloud-arrow-up" },
  { id: "save-copy", label: "Save a copy", icon: "copy-simple" },
]);

const exportOptions = JSON.stringify([
  { id: "pdf", label: "Export PDF", trailingIcon: "file-text" },
  { id: "csv", label: "Export CSV", trailingIcon: "download" },
  {
    id: "xlsx",
    label: "Export Excel",
    disabled: true,
    trailingIcon: "file-text",
  },
]);

const submenuOptions = JSON.stringify([
  { id: "publish", label: "Publish now" },
  {
    id: "share",
    label: "Share",
    icon: "share-network",
    children: [
      { id: "email", label: "By email" },
      { id: "link", label: "By link" },
    ],
  },
]);

function NativeSplitButton(args: SplitButtonArgs) {
  return (
    <NativeElement
      tagName="dt-split-button"
      attributes={{
        label: args.label,
        variant: args.variant,
        size: args.size,
        surface: args.surface,
        rounded: args.rounded,
        disabled: args.disabled,
        "menu-align": args.menuAlign,
        "toggle-label": args.toggleLabel,
        options: args.options,
      }}
    />
  );
}

const meta = {
  title: "Web Components/Actions/SplitButton",
  component: NativeSplitButton,
  tags: ["autodocs", "stable", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    docs: {
      description: {
        component:
          "Native `dt-split-button` with separate primary and menu actions, submenu support, keyboard trapping inside the open menu, and composed `primary-click` / `option-select` events.",
      },
    },
  },
  args: {
    label: "Save",
    variant: "primary",
    size: "md",
    surface: "default",
    rounded: false,
    disabled: false,
    menuAlign: "end",
    toggleLabel: "",
    options: saveOptions,
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "tertiary"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    surface: {
      control: "inline-radio",
      options: ["default", "onDark", "onBrand"],
    },
    rounded: { control: "boolean" },
    disabled: { control: "boolean" },
    menuAlign: {
      control: "inline-radio",
      options: ["start", "end"],
    },
    options: {
      control: "select",
      options: ["save", "export", "submenu"],
      mapping: {
        save: saveOptions,
        export: exportOptions,
        submenu: submenuOptions,
      },
    },
  },
} satisfies Meta<typeof NativeSplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { play: assertNative("dt-split-button") };
export const Playground: Story = {};

export const Variants: Story = {
  ...exampleStory,
  render: () => (
    <Row>
      <NativeElement
        tagName="dt-split-button"
        attributes={{ label: "Save", options: saveOptions, variant: "primary" }}
      />
      <NativeElement
        tagName="dt-split-button"
        attributes={{
          label: "Save",
          options: saveOptions,
          variant: "secondary",
        }}
      />
      <NativeElement
        tagName="dt-split-button"
        attributes={{
          label: "Save",
          options: saveOptions,
          variant: "tertiary",
        }}
      />
    </Row>
  ),
};

export const ExportFormats: Story = {
  ...exampleStory,
  args: {
    label: "Export",
    variant: "secondary",
    toggleLabel: "Choose export format",
    options: exportOptions,
  },
};

export const WithSubmenu: Story = {
  ...exampleStory,
  args: {
    label: "Publish",
    options: submenuOptions,
  },
};

export const NestedSubmenus: Story = { ...WithSubmenu };

export const Rounded: Story = {
  ...exampleStory,
  args: {
    rounded: true,
    options: saveOptions,
  },
};

export const Disabled: Story = {
  ...exampleStory,
  args: {
    disabled: true,
    options: saveOptions,
  },
};

export const DisabledState: Story = { ...Disabled };

export const RichLabelSlot: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-split-button"
      attributes={{ options: saveOptions }}
    >
      <span slot="label">Save draft</span>
    </NativeElement>
  ),
};

export const Surfaces: Story = {
  ...exampleStory,
  render: () => (
    <Stack>
      <Row>
        <NativeElement
          tagName="dt-split-button"
          attributes={{ label: "Save", options: saveOptions }}
        />
      </Row>
      <Row>
        <div style={{ padding: "1rem", background: "#111" }}>
          <NativeElement
            tagName="dt-split-button"
            attributes={{
              label: "Save",
              options: saveOptions,
              surface: "onDark",
            }}
          />
        </div>
        <div style={{ padding: "1rem", background: "var(--color-primary)" }}>
          <NativeElement
            tagName="dt-split-button"
            attributes={{
              label: "Save",
              options: saveOptions,
              surface: "onBrand",
            }}
          />
        </div>
      </Row>
    </Stack>
  ),
};

export const Example: Story = {
  ...exampleStory,
  render: () => (
    <NativeElement
      tagName="dt-split-button"
      attributes={{
        label: "Export",
        variant: "secondary",
        "toggle-label": "Choose export format",
        options: exportOptions,
      }}
    />
  ),
};

export const ForcedColors: Story = { ...forcedColorsStory };
