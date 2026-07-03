import contract from "./CodeSnippet.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import {
  Controls,
  Description,
  Heading,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import CodeSnippet from "@dt/CodeSnippet";
import Text from "@dt/Text";
import schema from "./schema.json";

const sampleTs = `import { createGatewayProvider } from "@ai-sdk/gateway";

const provider = createGatewayProvider({ baseURL: process.env.AI_GATEWAY_URL,
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

export async function ask(question: string) { const model = provider("openai/gpt-4o-mini");
  const result = await model.doStuff({ prompt: question });
  return result.text;
}`;

const longMultiLineCode = `import React, { useState, useEffect } from "react";
import { Button } from "@dt/Button";
import { Card } from "@dt/Card";

// This is a longer example to demonstrate show more/less
export function DemoComponent({ title, description }: DemoProps) { const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => { console.log("Component mounted");
    return () => console.log("Component unmounted");
  }, []);
  
  const handleClick = async () => { setLoading(true);
    await someAsyncOperation();
    setCount(prev => prev + 1);
    setLoading(false);
  };
  
  return (
    <Card title={title}>
      <p>{description}</p>
      <Button onClick={handleClick} loading={loading}>
        Count: {count}
      </Button>
    </Card>
  );
}`;

const meta: Meta<typeof CodeSnippet> = {
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["inline", "single", "multi"],
      description: "Code snippet layout variant",
      table: { defaultValue: { summary: "inline" } },
    },
  },
  title: "Content/CodeSnippet",
  component: CodeSnippet,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-code-snippet",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
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
  args: {
    code: sampleTs,
    language: "typescript",
    showLineNumbers: true,
    allowCopy: true,
    variant: "multi",
  },
};

export default meta;

type Story = StoryObj<typeof CodeSnippet>;

export const Inline: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "The inline variant is for short fragments beside prose; full blocks get the copy button and line numbers." } },
  },
  args: {
    variant: "inline",
    code: "npm install @digitaltableteur/components",
    language: "bash",
    showLineNumbers: false,
  },
  render: (args) => (
    <Text>
      To install the package, run <CodeSnippet {...args} /> in your terminal.
    </Text>
  ),
};

export const Single: Story = {
  args: {
    variant: "single",
    code: "npm install @digitaltableteur/components --save",
    language: "bash",
    showLineNumbers: false,
  },
};

export const Multi: Story = {
  args: { variant: "multi", language: "typescript" },
};

export const Typescript: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Set language explicitly for real highlighting — typescript here; the supported set covers the languages the site writes about." } },
  },
  args: { variant: "multi", language: "typescript" },
};

export const Python: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Each language gets its own grammar; unhighlighted code in docs reads as a bug." } },
  },
  args: {
    variant: "multi",
    language: "python",
    code: `def greet(name: str) -> str:
    return f"Hello, {name}"

print(greet("world"))`,
  },
};

export const WithMaxLines: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "maxLines clamps tall listings behind a scroll so the surrounding prose stays reachable." } },
  },
  args: {
    variant: "multi",
    code: longMultiLineCode,
    language: "typescript",
    maxLines: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const showMoreButton = canvas.queryByRole("button", { name: /show more/i });
    if (showMoreButton) {
      await userEvent.click(showMoreButton);
    }
  },
};

export const Minimal: Story = {
  args: {
    variant: "multi",
    showLineNumbers: false,
    code: "console.log('Hello');",
  },
};

export const Default = { tags: ["beta-matrix"] };
export const Playground = { tags: ["beta-matrix"] };
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
