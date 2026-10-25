import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import {
  NativeElement,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";

type Args = {
  value: string;
  label?: string;
  disabled?: boolean;
};

function NativeCodeCopyButton(args: Args) {
  return <NativeElement tagName="dt-code-copy-button" attributes={args} />;
}

const meta = {
  title: "Web Components/Actions/CodeCopyButton",
  component: NativeCodeCopyButton,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    contractStatus: "beta",
    docs: {
      description: {
        component:
          "Native `dt-code-copy-button`: 28px copy control; the glyph turns to a check and a live region announces the result.",
      },
    },
  },
  args: { value: "npm install @digitaltableteur/react" },
} satisfies Meta<typeof NativeCodeCopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  play: assertNative("dt-code-copy-button"),
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const CustomLabel: Story = {
  tags: ["example"],
  args: { label: "Copy install command" },
};

export const Disabled: Story = {
  tags: ["example"],
  args: { disabled: true },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector("dt-code-copy-button") as HTMLElement;
    const button = host.shadowRoot?.querySelector("button") as HTMLButtonElement;
    // user-event's tab order does not enter shadow roots; focus directly.
    button.focus();
    await expect(host.shadowRoot?.activeElement).toBe(button);
    await userEvent.keyboard("{Enter}");
    // The live region reports the outcome whether or not the browser grants
    // clipboard access to the Storybook frame.
    const status = host.shadowRoot?.querySelector("[role=\"status\"]") as HTMLElement;
    await waitFor(() => expect(status.textContent).not.toBe(""));
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
