import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Controls,
  Description,
  Heading,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import HelperText from "@dt/HelperText";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";

const meta: Meta<typeof HelperText> = {
  title: "Components/HelperText",
  component: HelperText,
  tags: ["autodocs"],
  parameters: {
    llm: {
      schema,
    },
    docs: {
      page: () => (
        <>
          <Primary />
          <Title />
          <Subtitle />
          <Description />
          <Controls />
          <Stories />
          <Heading>LLM Schema</Heading>
          <CodeSnippet
            code={JSON.stringify(schema, null, 2)}
            language="json"
            variant="multi"
            maxLines={20}
            showLineNumbers={true}
            allowCopy={true}
          />
        </>
      ),
    },
  },
  argTypes: {
    state: {
      control: "select",
      options: ["error", "warning", "success", "info", undefined],
      description: "Semantic state of the helper text",
    },
    children: {
      control: "text",
      description: "The helper text content",
    },
    id: {
      control: "text",
      description: "Optional ID for aria-describedby association",
    },
    className: {
      control: "text",
      description: "Additional CSS class name",
    },
  },
};

export default meta;

type Story = StoryObj<typeof HelperText>;

export const Default: Story = {
  args: {
    children: "This is helper text providing additional context.",
  },
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
  render: () => (
    <div>
      <label htmlFor="username-input" style={{ display: "block", marginBottom: "0.5rem" }}>
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
