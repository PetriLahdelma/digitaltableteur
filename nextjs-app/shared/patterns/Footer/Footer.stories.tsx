import contract from "./Footer.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Footer from "./Footer";
import { ThemeProvider } from "@dt/ThemeProvider";

const meta: Meta<typeof Footer> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Patterns/Footer",
  component: Footer,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-footer",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "fullscreen", // Keep WIP badge until visual + a11y verified
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
  tags: ["beta-matrix"],
  render: () => <Footer />,
};

export const WithSurroundingContent: Story = {
  render: () => (
    <ThemeProvider>
      <div
        style={{ minHeight: "80vh", display: "flex", flexDirection: "column" }}
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

// Auto-render (no args-ignoring closure) so the derived className control
// actually drives the canvas.
export const Playground: Story = {
  tags: ["beta-matrix"],
};
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
