import contract from "./SecureCVDownload.contract.json";
import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import SecureCVDownload, { SecureCVDownloadProps } from "@dt/SecureCVDownload";
import Icon from "@dt/Icon";
import { userEvent, waitFor, within } from "storybook/test";

const meta: Meta<typeof SecureCVDownload> = {
  title: "Site/SecureCVDownload",
  component: SecureCVDownload,
  tags: ["stable", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-secure-cvdownload",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
};
export default meta;

const Template: StoryFn<SecureCVDownloadProps> = (args) => (
  <SecureCVDownload {...args} />
);

export const Default = Template.bind({});
Default.args = {};
Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  // Click the download button to open modal
  const downloadButton = canvas.getByRole("button", { name: /download/i });
  await userEvent.click(downloadButton);

  // Wait for modal to appear (modal renders in portal, so check document.body)
  const body = within(document.body);
  await waitFor(() => body.getByRole("dialog"), { timeout: 3000 });

  // Assert the password input is present but do NOT type into it: typing
  // arms a 500ms debounce that validates against a LIVE remote endpoint, so
  // the settled UI state (Download disabled/enabled, error copy) depends on
  // real network timing — nondeterministic AT snapshots. The empty-input
  // modal state is fully deterministic.
  body.getByLabelText(/password/i);
};

export const CustomText = Template.bind({});
CustomText.args = { buttonText: "Download My CV" };
CustomText.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  // Click the custom text button
  const downloadButton = canvas.getByRole("button", {
    name: /download my cv/i,
  });
  await userEvent.click(downloadButton);

  // Wait for modal (modal renders in portal, so check document.body)
  const body = within(document.body);
  await waitFor(() => body.getByRole("dialog"), { timeout: 3000 });
};

export const Secondary = Template.bind({});
Secondary.args = { buttonVariant: "secondary" };
Secondary.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Test secondary variant button
  const downloadButton = canvas.getByRole("button", { name: /download/i });
  await userEvent.click(downloadButton);
};

export const Inverse = Template.bind({});
Inverse.args = { inverse: true };
Inverse.parameters = { backgrounds: { default: "dark" } };
Inverse.decorators = [
  (Story) => (
    <div
      style={{
        backgroundColor: "var(--color-primary)",
        padding: "2rem",
        borderRadius: "8px",
      }}
    >
      <Story />
    </div>
  ),
];
Inverse.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Test inverse variant button
  const downloadButton = canvas.getByRole("button", { name: /download/i });
  await userEvent.click(downloadButton);
};

// No play (Default's play opens the modal and its autofocused password input
// blinks a caret, which reads as an unstable canvas in the effects audit).
// Resting on the trigger button lets buttonVariant/buttonText/inverse be probed.
export const Playground = Template.bind({});
Playground.args = {};
Playground.tags = ["beta-matrix"];
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
