import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef } from "react";
import ReadingProgress from "./ReadingProgress";
import contract from "./ReadingProgress.contract.json";

const meta = {
  title: "Site/ReadingProgress",
  component: ReadingProgress,
  tags: ["!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-reading-progress",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: { showPercentage: false },
} satisfies Meta<typeof ReadingProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({
  showPercentage,
  className,
}: {
  showPercentage?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <ReadingProgress
        targetRef={ref}
        showPercentage={showPercentage}
        className={className}
      />
      <div
        ref={ref}
        style={{
          maxInlineSize: "40rem",
          margin: "6rem auto 4rem",
          paddingInline: "var(--space-layout-16)",
          fontFamily: "var(--font-text)",
          lineHeight: 1.6,
        }}
      >
        <h1 style={{ fontFamily: "var(--font-title)" }}>Long article</h1>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i}>
            Paragraph {i + 1}. Scroll to see the reading progress bar at the top
            of the viewport.
          </p>
        ))}
      </div>
    </>
  );
}

export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => (
    <Demo showPercentage={args.showPercentage} className={args.className} />
  ),
};
export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <Demo showPercentage={args.showPercentage} />,
};
export const WithPercentage: Story = { render: () => <Demo showPercentage /> };
export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  render: () => <Demo />,
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  parameters: { controls: { disable: true } },
  render: () => <Demo showPercentage />,
};
