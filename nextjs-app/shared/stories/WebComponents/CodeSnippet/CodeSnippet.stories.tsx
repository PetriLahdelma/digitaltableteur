import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import {
  DtCodeSnippetElement,
  type DtCodeSnippetLanguage,
  type DtCodeSnippetVariant,
} from "../../../../../packages/web-components/src/native/code-snippet";
import {
  NativeElement,
  Stage,
  assertNative,
  nativeStoryParameters,
} from "../NativeStory";

if (!customElements.get("dt-code-snippet")) {
  customElements.define("dt-code-snippet", DtCodeSnippetElement);
}

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

type Args = {
  code: string;
  language: DtCodeSnippetLanguage;
  showLineNumbers: boolean;
  allowCopy: boolean;
  variant: DtCodeSnippetVariant;
  maxLines: number;
  ariaLabel?: string;
};

function snippetAttributes(args: Args) {
  return {
    code: args.code,
    language: args.language,
    variant: args.variant,
    "aria-label": args.ariaLabel,
    "show-line-numbers": args.showLineNumbers ? "true" : "false",
    "allow-copy": args.allowCopy ? "true" : "false",
    "max-lines": String(args.maxLines),
  };
}

function NativeCodeSnippet(args: Args) {
  if (args.variant === "inline") {
    return (
      <p style={{ margin: 0, fontFamily: "var(--font-text)" }}>
        To install the package, run{" "}
        <NativeElement
          tagName="dt-code-snippet"
          attributes={snippetAttributes(args)}
        />{" "}
        in your terminal.
      </p>
    );
  }

  return (
    <Stage width="min(46rem, 95vw)">
      <NativeElement
        tagName="dt-code-snippet"
        attributes={snippetAttributes(args)}
      />
    </Stage>
  );
}

const meta = {
  title: "Web Components/Content/CodeSnippet",
  component: NativeCodeSnippet,
  tags: ["autodocs", "beta", "web-components"],
  parameters: {
    ...nativeStoryParameters,
    layout: "padded",
    docs: {
      description: {
        component:
          "Native `dt-code-snippet` renders Prism-highlighted inline, single-line, and multi-line code with copy feedback, a comment-stripping copy option, and a no-React shadow DOM implementation.",
      },
    },
  },
  args: {
    code: sampleTs,
    language: "typescript",
    showLineNumbers: true,
    allowCopy: true,
    variant: "multi",
    maxLines: 0,
    ariaLabel: "Code snippet in TypeScript",
  },
  argTypes: {
    language: {
      control: "select",
      options: [
        "javascript",
        "typescript",
        "html",
        "xml",
        "python",
        "go",
        "rust",
        "json",
        "bash",
        "markdown",
      ],
    },
    variant: { control: "inline-radio", options: ["inline", "single", "multi"] },
  },
} satisfies Meta<typeof NativeCodeSnippet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"], play: assertNative("dt-code-snippet") };
export const Playground: Story = { tags: ["beta-matrix"] };
export const Inline: Story = {
  tags: ["example"],
  args: {
    variant: "inline",
    code: "npm install @digitaltableteur/components",
    language: "bash",
    showLineNumbers: false,
  },
};
export const Single: Story = {
  tags: ["example"],
  args: {
    variant: "single",
    code: "npm install @digitaltableteur/components --save",
    language: "bash",
    showLineNumbers: false,
  },
};
export const Multi: Story = {
  tags: ["example"],
  args: { variant: "multi", language: "typescript" },
};
export const Typescript: Story = {
  tags: ["example"],
  args: { variant: "multi", language: "typescript" },
};
export const Python: Story = {
  tags: ["example"],
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
  args: {
    variant: "multi",
    code: longMultiLineCode,
    language: "typescript",
    maxLines: 10,
  },
  play: async ({ canvasElement }) => {
    await assertNative("dt-code-snippet")({ canvasElement });
    const element = canvasElement.querySelector<DtCodeSnippetElement>(
      "dt-code-snippet",
    );
    const expandButton =
      element?.shadowRoot?.querySelector<HTMLButtonElement>(".expandButton");
    await userEvent.click(expandButton!);
    await waitFor(() => {
      // Re-query: the toggle re-renders the shadow tree, so the pre-click
      // node reference goes stale (same trap as WC Pagination, #1239).
      const toggled =
        element?.shadowRoot?.querySelector<HTMLButtonElement>(".expandButton");
      expect(toggled?.textContent).toMatch(/show less/i);
    });
  },
};
export const Minimal: Story = {
  tags: ["example"],
  args: {
    variant: "multi",
    showLineNumbers: false,
    code: "console.log('Hello');",
  },
};
export const Example: Story = {
  tags: ["beta-matrix", "example"],
  args: {
    variant: "multi",
    language: "typescript",
    ariaLabel: "Gateway provider example",
  },
};
export const ForcedColors: Story = {
  tags: ["beta-matrix", "example"],
  globals: { forcedColors: "active" },
  args: {
    variant: "multi",
    language: "typescript",
  },
};
