import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { expect, userEvent } from "storybook/test";
import {
  DtCommandPaletteElement,
  type DtCommandPaletteItem,
} from "../../../../../packages/web-components/src/native/command-palette";
import {
  exampleStory,
  forcedColorsStory,
  NativeElement,
  nativeStoryParameters,
  TriggerButton,
} from "../NativeStory";

if (!globalThis.customElements?.get("dt-command-palette")) {
  globalThis.customElements?.define(
    "dt-command-palette",
    DtCommandPaletteElement,
  );
}

const commands: DtCommandPaletteItem[] = [
  {
    id: "home",
    label: "Go to Home",
    keywords: ["start", "index"],
    icon: "arrow-right",
  },
  {
    id: "blog",
    label: "Go to Blog",
    keywords: ["articles", "posts"],
    icon: "newspaper",
  },
  {
    id: "work",
    label: "Go to Work",
    keywords: ["projects", "portfolio"],
    icon: "file-text",
  },
  {
    id: "contact",
    label: "Go to Contact",
    keywords: ["email", "reach"],
    icon: "paper-plane-tilt",
  },
  {
    id: "new-post",
    label: "New blog post",
    keywords: ["create", "write"],
    icon: "plus",
  },
];

type Args = {
  open: boolean;
  items: "full" | "minimal";
  label: string;
  placeholder: string;
  emptyText: string;
};

function CommandPaletteHarness(args: Args) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(args.open);
  const selectedItems =
    args.items === "minimal" ? commands.slice(0, 2) : commands;

  useLayoutEffect(() => {
    const palette = rootRef.current?.querySelector(
      "dt-command-palette",
    ) as DtCommandPaletteElement | null;
    if (!palette) return;
    palette.items = selectedItems;
  }, [selectedItems]);

  useEffect(() => {
    const palette = rootRef.current?.querySelector(
      "dt-command-palette",
    ) as DtCommandPaletteElement | null;
    if (!palette) return;
    const close = () => setOpen(false);
    palette.addEventListener("dismiss-request", close);
    return () => palette.removeEventListener("dismiss-request", close);
  }, []);

  return (
    <div ref={rootRef} style={{ minHeight: "60vh", padding: "1rem" }}>
      <TriggerButton onClick={() => setOpen(true)}>
        Open command palette
      </TriggerButton>
      <NativeElement
        tagName="dt-command-palette"
        attributes={{
          open,
          controlled: true,
          label: args.label,
          placeholder: args.placeholder,
          "empty-text": args.emptyText,
        }}
      />
    </div>
  );
}

const meta = {
  title: "Web Components/Navigation/CommandPalette",
  component: CommandPaletteHarness,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Native `dt-command-palette` modal combobox. Assign commands through the `items` property (or JSON attribute), listen for `item-select` and `dismiss-request`, and drive `open` when using `controlled`. React node icons map to native icon names. Shadow parts replace React-only `className` styling.",
      },
    },
  },
  args: {
    open: true,
    items: "full",
    label: "Command palette",
    placeholder: "Search commands…",
    emptyText: "No results",
  },
  argTypes: {
    open: { control: "boolean" },
    items: { control: "inline-radio", options: ["full", "minimal"] },
    label: { control: "text" },
    placeholder: { control: "text" },
    emptyText: { control: "text" },
  },
} satisfies Meta<typeof CommandPaletteHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector(
      "dt-command-palette",
    ) as DtCommandPaletteElement | null;
    const input =
      host?.shadowRoot?.querySelector<HTMLInputElement>("[role=combobox]");
    expect(customElements.get("dt-command-palette")).toBeDefined();
    expect(input).toBeTruthy();
    if (!input) return;
    await userEvent.type(input, "articles");
    await userEvent.keyboard("{ArrowDown}{ArrowUp}");
    expect(host?.shadowRoot?.querySelectorAll("[role=option]")).toHaveLength(1);
    expect(host?.shadowRoot?.querySelector("[role=dialog]")).toHaveAttribute(
      "aria-modal",
      "true",
    );
  },
};

export const Playground: Story = {};

export const Example: Story = {
  ...exampleStory,
  args: { placeholder: "Type a command…" },
};

export const ForcedColors: Story = { ...forcedColorsStory };
