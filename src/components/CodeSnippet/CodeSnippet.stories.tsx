import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import CodeSnippet from "./CodeSnippet";

const sampleTs = `import { createGatewayProvider } from "@ai-sdk/gateway";

const provider = createGatewayProvider({
  baseURL: process.env.AI_GATEWAY_URL,
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

export async function ask(question: string) {
  const model = provider("openai/gpt-4o-mini");
  const result = await model.doStuff({ prompt: question });
  return result.text;
}`;

const meta: Meta<typeof CodeSnippet> = {
  title: "Components/CodeSnippet",
  component: CodeSnippet,
  args: {
    code: sampleTs,
    language: "typescript",
    showLineNumbers: true,
    allowCopy: true,
  },
};

export default meta;

type Story = StoryObj<typeof CodeSnippet>;

export const Typescript: Story = {
  args: {
    language: "typescript",
  },
};

export const Python: Story = {
  args: {
    language: "python",
    code: `def greet(name: str) -> str:
    return f"Hello, {name}"

print(greet("world"))`,
  },
};

export const Minimal: Story = {
  args: {
    showLineNumbers: false,
    code: "console.log('Hello');",
  },
};
