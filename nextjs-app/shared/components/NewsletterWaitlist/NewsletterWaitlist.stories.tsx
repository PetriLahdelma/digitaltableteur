import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import NewsletterWaitlist from "@dt/NewsletterWaitlist";
import { within, userEvent, waitFor } from "@storybook/testing-library";

const meta: Meta<typeof NewsletterWaitlist> = {
  title: "Components/NewsletterWaitlist",
  component: NewsletterWaitlist,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NewsletterWaitlist>;

export const Default: Story = {
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

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

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
