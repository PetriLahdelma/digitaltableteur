import contract from "./HelperText.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import HelperText from "@dt/HelperText";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";

const meta: Meta<typeof HelperText> = {
  title: "Forms/HelperText",
  component: HelperText,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=371-17",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
};

export default meta;

type Story = StoryObj<typeof HelperText>;

export const Default: Story = {
  parameters: { a11y: { disable: true } },
  tags: ["beta-matrix"],
  args: { children: "This is helper text providing additional context." },
};

export const Error: Story = {
  args: {
    state: "error",
    children: "This field is required and cannot be left empty.",
  },
};

export const Warning: Story = {
  args: {
    state: "warning",
    children: "This action cannot be undone. Please proceed with caution.",
  },
};

export const Success: Story = {
  args: {
    state: "success",
    children: "Your changes have been saved successfully.",
  },
};

export const Info: Story = {
  args: {
    state: "info",
    children: "Password must be at least 8 characters long.",
  },
};

export const AllStates: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "The neutral hint plus the four semantic states; each state resolves its icon automatically and error adds role=alert.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <strong>Default (Neutral)</strong>
        <HelperText>
          This is helper text providing additional context.
        </HelperText>
      </div>
      <div>
        <strong>Error</strong>
        <HelperText state="error">
          This field is required and cannot be left empty.
        </HelperText>
      </div>
      <div>
        <strong>Warning</strong>
        <HelperText state="warning">
          This action cannot be undone. Please proceed with caution.
        </HelperText>
      </div>
      <div>
        <strong>Success</strong>
        <HelperText state="success">
          Your changes have been saved successfully.
        </HelperText>
      </div>
      <div>
        <strong>Info</strong>
        <HelperText state="info">
          Password must be at least 8 characters long.
        </HelperText>
      </div>
    </div>
  ),
};

export const WithAriaDescribedby: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "Manual composition: pass an id and reference it from the control's aria-describedby. The system inputs do this wiring automatically via their helperText/error props.",
      },
    },
  },
  render: () => (
    <div>
      <label
        htmlFor="username-input"
        style={{ display: "block", marginBottom: "0.5rem" }}
      >
        Username
      </label>
      <input
        id="username-input"
        type="text"
        aria-describedby="username-helper"
        style={{
          padding: "0.5rem",
          border: "1px solid #ccc",
          borderRadius: "4px",
          width: "100%",
          marginBottom: "0.5rem",
        }}
      />
      <HelperText id="username-helper" state="info">
        Username must be 3-20 characters and contain only letters and numbers.
      </HelperText>
    </div>
  ),
};
export const ErrorTakesOver: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "Hint versus failure: the same field shows one line at a time; when error is set it replaces the hint and announces immediately.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 360 }}>
      <HelperText id="pw-hint">At least 8 characters.</HelperText>
      <HelperText id="pw-error" state="error">
        Password is too short.
      </HelperText>
    </div>
  ),
};

export const Playground = Default;

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <HelperText state="error">This field is required.</HelperText>
      <HelperText>Neutral helper copy below a form control.</HelperText>
    </div>
  ),
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
