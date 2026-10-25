import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import CodeBlock from "@dt/CodeBlock";
import { codeBlockFixtures } from "../CodeBlockWindow/codeBlockFixtures";
import { renderCodeBlockFixtureNode } from "../CodeBlockWindow/CodeBlockFixtureRenderer";
import contract from "./CodeBlock.contract.json";
import storyStyles from "./CodeBlock.stories.module.css";

const demoButton = `type Props = {
  label: string;
};

export function DemoButton({ label }: Props) {
  return (
    <button type="button" aria-label={label}>
      {label}
    </button>
  );
}`;

const nextConfigDiff = `module.exports = {
-  experimental: {
-    appDir: true,
-  },
+  reactStrictMode: true,
 }`;

/* The production use: Rhythmguard's install steps on the case study. */
const rhythmguardSetup = `npm i -D stylelint stylelint-plugin-rhythmguard

# .stylelintrc.json
{
  "extends": ["stylelint-plugin-rhythmguard/configs/strict"]
}

npx stylelint "src/**/*.css"`;

const longFile = Array.from(
  { length: 40 },
  (_, index) => `export const token${index + 1} = "var(--space-internal-${(index % 8) * 4})";`,
).join("\n");

const meta = {
  title: "Content/CodeBlock",
  component: CodeBlock,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: contract.figma,
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: {
    code: demoButton,
    language: "tsx",
    filename: "DemoButton.tsx",
    header: true,
    theme: "light",
    addedLines: "",
    removedLines: "",
  },
  argTypes: {
    children: { table: { disable: true } },
    highlightLines: {
      control: { type: "text" },
      description: "Lines to highlight, as a range string such as \"2-3,7\".",
    },
    addedLines: {
      control: { type: "text" },
      description: "Lines to mark as added, as a range string such as \"4\".",
    },
    removedLines: {
      control: { type: "text" },
      description: "Lines to mark as removed, as a range string such as \"5\".",
    },
  },
  decorators: [
    (Story) => (
      <div className={storyStyles.column}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  args: {
    lineNumbers: true,
    highlightLines: "5-6",
    removedLines: "7",
    addedLines: "8",
    caption: "Caption",
  },
};

export const Highlighted: Story = {
  tags: ["example"],
  args: { lineNumbers: true, highlightLines: [6, 7, 8] },
  parameters: {
    docs: {
      description: {
        story:
          "Highlight only the lines under discussion; the 2px bar carries the callout where the tint is faint.",
      },
    },
  },
};

export const Diff: Story = {
  tags: ["example"],
  args: {
    code: nextConfigDiff,
    language: "diff",
    filename: "next.config.js",
    lineNumbers: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "With language=\"diff\" the leading +/- become added and removed rows with a sign column. Copy leaves removed lines out, so the clipboard holds the code after the change.",
      },
    },
  },
};

export const Headerless: Story = {
  tags: ["example"],
  args: {
    filename: undefined,
    header: false,
    code: "npm run build:tokens\nnpm run check:contract-props",
    language: "bash",
  },
};

export const Terminal: Story = {
  tags: ["example"],
  args: {
    code: rhythmguardSetup,
    language: "bash",
    filename: undefined,
    header: false,
    theme: "terminal",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Terminal renders the block in the dark theme on any page. In the high-contrast themes it follows the page.",
      },
    },
  },
};

export const Scrollable: Story = {
  tags: ["example"],
  args: { code: longFile, language: "ts", filename: "tokens.ts", lineNumbers: true, maxHeight: 240 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = await canvas.findByRole("region", { name: "tokens.ts" });
    await userEvent.tab();
    await userEvent.tab();
    await expect(region).toHaveFocus();
  },
};

export const ShikiTree: Story = {
  tags: ["example"],
  args: { code: undefined, language: undefined, filename: "DemoButton.tsx" },
  render: (args) => (
    <CodeBlock {...args}>
      {renderCodeBlockFixtureNode(codeBlockFixtures.tsx.pre)}
    </CodeBlock>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A pre-highlighted Shiki tree, as the MDX pipeline (rehype-pretty-code) hands it over. The language comes from the tree.",
      },
    },
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  args: {
    code: rhythmguardSetup,
    language: "bash",
    filename: undefined,
    header: false,
    theme: "terminal",
    caption: "One install, one extends line.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const copy = canvas.getByRole("button", { name: "Copy code" });
    await userEvent.tab();
    await expect(copy).toHaveFocus();
  },
  parameters: {
    docs: {
      description: {
        story:
          "In production: the install steps on the Rhythmguard case study, as a terminal block.",
      },
    },
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: (args) => (
    <div className={storyStyles.stack}>
      <CodeBlock {...args} lineNumbers highlightLines={[2]} />
      <CodeBlock code={nextConfigDiff} language="diff" filename="next.config.js" />
      <CodeBlock code={rhythmguardSetup} language="bash" theme="terminal" />
    </div>
  ),
};
