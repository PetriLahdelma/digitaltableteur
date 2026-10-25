import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import CodeCopyButton from "@dt/CodeCopyButton";
import contract from "./CodeCopyButton.contract.json";

const meta = {
  title: "Actions/CodeCopyButton",
  component: CodeCopyButton,
  tags: ["beta", "autodocs"],
  parameters: {
    design: { type: "figma", url: contract.figma },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: { value: "npm install @digitaltableteur/react" },
} satisfies Meta<typeof CodeCopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
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
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Copy code" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    // The live region reports the outcome whether or not the browser grants
    // clipboard access to the Storybook frame.
    // (The WIP badge is a status too, so look beside the button.)
    const status = within(button.parentElement as HTMLElement).getByRole("status");
    await waitFor(() => expect(status).not.toBeEmptyDOMElement());
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
