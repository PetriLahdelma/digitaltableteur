import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Footer from "./Footer";
import { ThemeProvider } from "@dt/ThemeProvider";

const meta: Meta<typeof Footer> = {
  title: "Patterns/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",// Keep WIP badge until visual + a11y verified
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div
          style={{
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1 }} />
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  name: "Default",
  render: () => <Footer />,
};

export const WithSurroundingContent: Story = {
  name: "With Surrounding Content",
  render: () => (
    <ThemeProvider>
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main style={{ flex: 1, padding: "2rem" }}>
          <h1 style={{ marginTop: 0 }}>Demo Page Content</h1>
          <p>
            Demonstrates footer placement beneath page content. Localized
            address and billing details appear below billing heading.
          </p>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  ),
};
