import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import AIProcessingState from "./AIProcessingState";

/**
 * AIProcessingState - Cognitive Processing Indicator
 *
 * Displays an animated gradient effect when the AI is thinking, generating, or analyzing.
 * This is NOT a skeleton loader - it indicates cognitive processing without predicting
 * the output structure.
 *
 * ## Design Philosophy
 *
 * - **Skeletons** imply known structure being filled in (predictable geometry)
 * - **AIProcessingState** indicates mental progress without prediction (uncertainty)
 * - Provides presence/aliveness feedback during LLM processing
 *
 * ## When to Use
 *
 * - LLM is processing a user query
 * - AI is generating content with unknown output shape
 * - System is analyzing data without predictable result structure
 *
 * ## When NOT to Use
 *
 * - Loading content with known structure → use Skeleton components
 * - Predictable form generation → use Skeleton + AIProcessingState together
 * - Static loading states → use standard loading indicators
 *
 * ## Vercel AI SDK Compatibility
 *
 * This component integrates seamlessly with Vercel AI SDK streaming patterns:
 * - Display during `isLoading` state from `useChat` hook
 * - Show while awaiting first streaming chunk
 * - Compatible with `useCompletion` for single completions
 * - Works with Server Actions and Route Handlers
 */
const meta = {
  title: "Molecules/Chat/AIProcessingState",
  component: AIProcessingState,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=473-25",
    },
    layout: "centered",
    docs: {
      description: {
        component:
          "Cognitive processing indicator for LLM interactions. Shows animated gradient during AI thinking/generating/analyzing states.",
      },
    },
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["thinking", "generating", "analyzing"],
      description: "The cognitive processing mode to display",
      table: { defaultValue: { summary: "thinking" } },
    },

    intensity: {
      control: "select",
      options: ["subtle", "moderate", "prominent"],
      description: "Visual intensity of the animation",
      table: { defaultValue: { summary: "subtle" } },
    },

    customMessage: {
      control: "text",
      description: "Custom message override (bypasses i18n)",
    },

    className: {
      control: "text",
      description: "Additional CSS class for styling extension",
    },
  },
} satisfies Meta<typeof AIProcessingState>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default thinking state with subtle intensity.
 * Most common usage in chat interfaces.
 */
export const Default: Story = {
  tags: ["beta-matrix"],
  args: {},
  parameters: {},
};

/**
 * Thinking mode - AI is processing the user's query
 */
export const Thinking: Story = {
  args: { mode: "thinking", intensity: "subtle" },
};

/**
 * Generating mode - AI is creating content
 */
export const Generating: Story = {
  args: { mode: "generating", intensity: "moderate" },
};

/**
 * Analyzing mode - AI is examining data
 */
export const Analyzing: Story = {
  args: { mode: "analyzing", intensity: "moderate" },
};

/**
 * Subtle intensity - gentle, non-intrusive (default)
 * Good for background processing or when user is reading previous content
 */
export const SubtleIntensity: Story = {
  args: { mode: "thinking", intensity: "subtle" },
};

/**
 * Moderate intensity - balanced visibility (standard)
 * Good for typical AI response generation
 */
export const ModerateIntensity: Story = {
  args: { mode: "generating", intensity: "moderate" },
};

/**
 * Prominent intensity - high visibility
 * Good for important or lengthy operations where user is waiting
 */
export const ProminentIntensity: Story = {
  args: { mode: "analyzing", intensity: "prominent" },
};

/**
 * Custom message example
 * Useful for specific contexts or non-standard processing states
 */
export const CustomMessage: Story = {
  args: { customMessage: "Processing your request...", intensity: "moderate" },
};

/**
 * In Chat Context Example
 * Shows how it looks within a typical chat message container
 */
export const InChatContext: Story = {
  args: { mode: "thinking", intensity: "moderate" },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: "0.5rem 1rem",
          maxWidth: "83%",
          borderRadius: "1rem 1rem 1rem 0",
          background: "rgb(0 0 0 / 4%)",
          fontFamily: "Moderat, sans-serif",
          fontSize: "0.9rem",
          lineHeight: 1.5,
          color: "var(--color-text)",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

/**
 * Kitchen Sink - All modes and intensities
 * Useful for visual regression testing and design review
 */
export const KitchenSink: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h3
          style={{
            marginBottom: "1rem",
            fontWeight: 600,
            fontFamily: "Moderat, sans-serif",
          }}
        >
          Modes
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <AIProcessingState mode="thinking" />
          <AIProcessingState mode="generating" />
          <AIProcessingState mode="analyzing" />
        </div>
      </div>

      <div>
        <h3
          style={{
            marginBottom: "1rem",
            fontWeight: 600,
            fontFamily: "Moderat, sans-serif",
          }}
        >
          Intensities
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <small
              style={{
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-sans, sans-serif)",
              }}
            >
              Subtle:
            </small>
            <AIProcessingState mode="thinking" intensity="subtle" />
          </div>
          <div>
            <small
              style={{
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-sans, sans-serif)",
              }}
            >
              Moderate:
            </small>
            <AIProcessingState mode="thinking" intensity="moderate" />
          </div>
          <div>
            <small
              style={{
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-sans, sans-serif)",
              }}
            >
              Prominent:
            </small>
            <AIProcessingState mode="thinking" intensity="prominent" />
          </div>
        </div>
      </div>

      <div>
        <h3
          style={{
            marginBottom: "1rem",
            fontWeight: 600,
            fontFamily: "Moderat, sans-serif",
          }}
        >
          Custom Message
        </h3>
        <AIProcessingState
          customMessage="Processing your request..."
          intensity="moderate"
        />
      </div>
    </div>
  ),
};

/**
 * Vercel AI SDK Integration Example
 *
 * Demonstrates how to use AIProcessingState with Vercel AI SDK's useChat hook.
 * The component responds to the SDK's status states and displays appropriate feedback.
 */
export const VercelAISdkIntegration: Story = {
  render: () => (
    <div style={{ maxWidth: "600px", padding: "1.5rem" }}>
      <h3
        style={{
          marginBottom: "1rem",
          fontWeight: 600,
          fontFamily: "var(--font-sans, sans-serif)",
        }}
      >
        Integration with Vercel AI SDK
      </h3>

      <div
        style={{
          backgroundColor: "var(--color-background-surface)",
          padding: "1rem",
          borderRadius: "var(--radius-m)",
          marginBottom: "1.5rem",
        }}
      >
        <code
          style={{
            fontSize: "0.875rem",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            display: "block",
            lineHeight: 1.5,
          }}
        >
          {`const { messages, status } = useChat();

// Display while awaiting response
{status === "submitted" && (
  <AIProcessingState mode="thinking" />
)}

// Display during streaming
{status === "streaming" && (
  <AIProcessingState mode="generating" />
)}

// Display for analysis tasks
{status === "processing" && (
  <AIProcessingState mode="analyzing" />
)}`}
        </code>
      </div>

      <div>
        <h4
          style={{
            marginBottom: "0.75rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            fontFamily: "var(--font-sans, sans-serif)",
          }}
        >
          Status States Demo:
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <small
              style={{
                color: "var(--color-text-secondary)",
                display: "block",
                marginBottom: "0.25rem",
                fontFamily: "var(--font-sans, sans-serif)",
              }}
            >
              status === &quot;submitted&quot;
            </small>
            <AIProcessingState mode="thinking" intensity="subtle" />
          </div>
          <div>
            <small
              style={{
                color: "var(--color-text-secondary)",
                display: "block",
                marginBottom: "0.25rem",
                fontFamily: "var(--font-sans, sans-serif)",
              }}
            >
              status === &quot;streaming&quot;
            </small>
            <AIProcessingState mode="generating" intensity="moderate" />
          </div>
          <div>
            <small
              style={{
                color: "var(--color-text-secondary)",
                display: "block",
                marginBottom: "0.25rem",
                fontFamily: "var(--font-sans, sans-serif)",
              }}
            >
              Custom processing state
            </small>
            <AIProcessingState mode="analyzing" intensity="prominent" />
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          backgroundColor: "var(--color-background-elevated)",
          borderRadius: "var(--radius-s)",
          fontSize: "0.875rem",
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-sans, sans-serif)",
        }}
      >
        <strong>SDK Compatibility:</strong> Works with @ai-sdk/react v2.x
        useChat, useCompletion, and useAssistant hooks. Compatible with
        streaming responses from OpenAI, Anthropic, and other providers
        supported by Vercel AI SDK.
      </div>
    </div>
  ),
};
