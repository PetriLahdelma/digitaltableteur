import contract from "./NewsletterWaitlist.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import NewsletterWaitlist from "@dt/NewsletterWaitlist";
import { userEvent, waitFor, within } from "storybook/test";
const meta: Meta<typeof NewsletterWaitlist> = {
  title: "Site/NewsletterWaitlist",
  component: NewsletterWaitlist,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=471-21",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
};

export default meta;
type Story = StoryObj<typeof NewsletterWaitlist>;

export const Default: Story = {
  parameters: { a11y: { disable: true } },
  tags: ["beta-matrix"],
  args: {},
};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Test submit button is present and clickable
  const submitButton = canvas.getByRole("button", {
    name: /subscribe|sign up|join|waitlist/i,
  });
  await userEvent.click(submitButton);
};

export const Disabled: Story = { args: { disabled: true } };

export const WithCallbacks: Story = {
  args: {
    onSuccess: (email: string) => {
      console.log("Newsletter signup successful:", email);
    },
    onError: (error: Error) => {
      console.error("Newsletter signup failed:", error);
    },
  },
};
WithCallbacks.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Test button with callbacks
  const submitButton = canvas.getByRole("button", {
    name: /subscribe|sign up|join|waitlist/i,
  });
  await userEvent.click(submitButton);
};

export const KitchenSink: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div>
        <h3 style={{ marginBottom: "1rem" }}>Default State</h3>
        <NewsletterWaitlist />
      </div>
      <div>
        <h3 style={{ marginBottom: "1rem" }}>Disabled</h3>
        <NewsletterWaitlist disabled />
      </div>
    </div>
  ),
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => <NewsletterWaitlist />,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
